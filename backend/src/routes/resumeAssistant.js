const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_USER = 'resume-assistant-user';

router.post('/resume-assistant', upload.single('resume'), async (req, res) => {
  const { jd, action } = req.body;
  // multer 把所有字段都解析成字符串，过滤掉 "null" / "undefined" / 空字符串
  const raw_cid = req.body.conversation_id;
  const conversation_id = (raw_cid && raw_cid !== 'null' && raw_cid !== 'undefined') ? raw_cid : null;
  const resumeFile = req.file;

  // resume 和 jd 允许为空（后续提交时复用 Dify 已有内容）
  // 只有 action 是必填的
  if (!action || !action.trim()) {
    return res.status(400).json({ error: '请指定 action' });
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 DIFY_API_KEY' });
  }

  const appMode = (process.env.DIFY_APP_MODE || 'chatflow').toLowerCase();
  const timings = {};

  const hasResume = resumeFile && resumeFile.size > 0;
  const hasJd = jd && jd.trim().length > 0;
  const isFollowUp = !!conversation_id;

  console.log(`\n========== 新请求 ${new Date().toLocaleTimeString('zh-CN', {hour12:false})} ==========`);
  console.log(`[参数] action=${action}  jd=${hasJd ? jd.trim().length + '字' : '（复用）'}  简历=${hasResume ? resumeFile.originalname : '（复用）'}  followUp=${isFollowUp}`);
  console.log(`[模式] DIFY_APP_MODE=${appMode}  目标=${DIFY_BASE_URL}`);

  try {
    // ── Step 1：上传文件（仅当有新简历时执行）────────────────
    let uploadFileId = null;

    if (hasResume) {
      const fileForm = new FormData();
      fileForm.append('file', resumeFile.buffer, {
        filename: resumeFile.originalname,
        contentType: resumeFile.mimetype,
      });
      fileForm.append('user', DIFY_USER);

      const t1 = Date.now();
      let uploadRes;
      try {
        uploadRes = await axios.post(`${DIFY_BASE_URL}/files/upload`, fileForm, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            ...fileForm.getHeaders(),
          },
        });
        timings['Step1 上传文件'] = `${Date.now() - t1}ms  ✓  upload_file_id=${uploadRes.data.id}`;
      } catch (uploadErr) {
        timings['Step1 上传文件'] = `${Date.now() - t1}ms  ✗  HTTP ${uploadErr.response?.status}`;
        const status = uploadErr.response?.status;
        const body = uploadErr.response?.data;
        console.error(`[Step 1] 失败 HTTP ${status}，响应体:`, JSON.stringify(body, null, 2));
        printTimings(timings);
        return res.status(status || 502).json({ error: `文件上传到 Dify 失败（HTTP ${status}）`, detail: body });
      }

      uploadFileId = uploadRes.data.id;
      if (!uploadFileId) {
        console.error(`[Step 1] 响应中没有 id 字段:`, JSON.stringify(uploadRes.data, null, 2));
        printTimings(timings);
        return res.status(502).json({ error: '文件上传到 Dify 失败，未获取到 upload_file_id' });
      }
    } else {
      timings['Step1 上传文件'] = '跳过（复用已有简历）';
    }

    // ── 构造 inputs ───────────────────────────────────────────
    // action 必传；jd 和 resume 是选填，只在有新内容时才传
    const inputs = { action: action.trim() };
    if (hasJd)        inputs.jd     = jd.trim();
    if (uploadFileId) inputs.resume = { transfer_method: 'local_file', upload_file_id: uploadFileId, type: 'document' };

    let answer;
    let returnedConversationId = conversation_id || null;

    if (appMode === 'workflow') {
      // Workflow 模式：每次独立运行，无 conversation_id 概念
      const workflowBody = {
        inputs,
        response_mode: 'blocking',
        user: DIFY_USER,
      };
      console.log(`[Step 2] Workflow 请求体:`, JSON.stringify(workflowBody, null, 2));

      const t2 = Date.now();
      let workflowRes;
      try {
        workflowRes = await axios.post(`${DIFY_BASE_URL}/workflows/run`, workflowBody, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        timings['Step2 调用Workflow'] = `${Date.now() - t2}ms  ✓`;
      } catch (wfErr) {
        timings['Step2 调用Workflow'] = `${Date.now() - t2}ms  ✗  HTTP ${wfErr.response?.status}`;
        const status = wfErr.response?.status;
        const body = wfErr.response?.data;
        console.error(`[Step 2] 失败 HTTP ${status}，响应体:`, JSON.stringify(body, null, 2));
        printTimings(timings);
        return res.status(status || 502).json({ error: `Dify Workflow 调用失败（HTTP ${status}）`, detail: body });
      }

      answer = workflowRes.data?.data?.outputs?.text;

    } else {
      // Chatflow 模式：传 conversation_id 复用对话历史
      const chatBody = {
        inputs,
        query: '请根据 action 执行对应任务',
        response_mode: 'blocking',
        user: DIFY_USER,
      };
      if (conversation_id) {
        chatBody.conversation_id = conversation_id;
      }
      console.log(`[Step 2] Chatflow 请求体:`, JSON.stringify(chatBody, null, 2));

      const t2 = Date.now();
      let chatRes;
      try {
        chatRes = await axios.post(`${DIFY_BASE_URL}/chat-messages`, chatBody, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        timings['Step2 调用Chatflow'] = `${Date.now() - t2}ms  ✓`;
      } catch (chatErr) {
        timings['Step2 调用Chatflow'] = `${Date.now() - t2}ms  ✗  HTTP ${chatErr.response?.status}`;
        const status = chatErr.response?.status;
        const body = chatErr.response?.data;
        console.error(`[Step 2] 失败 HTTP ${status}，响应体:`, JSON.stringify(body, null, 2));
        printTimings(timings);
        return res.status(status || 502).json({ error: `Dify Chat 调用失败（HTTP ${status}）`, detail: body });
      }

      answer = chatRes.data.answer;
      // 返回 conversation_id 给前端，供后续请求复用
      returnedConversationId = chatRes.data.conversation_id || returnedConversationId;
    }

    printTimings(timings);
    return res.json({ answer, conversation_id: returnedConversationId });

  } catch (err) {
    console.error(`[未捕获异常]`, err);
    printTimings(timings);
    return res.status(500).json({ error: `服务器内部错误：${err.message}` });
  }
});

function printTimings(timings) {
  console.log(`\n---------- 耗时汇总 ----------`);
  Object.entries(timings).forEach(([step, info]) => console.log(`  ${step}: ${info}`));
  console.log(`------------------------------\n`);
}

module.exports = router;
