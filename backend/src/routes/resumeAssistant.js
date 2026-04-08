const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_USER = 'resume-assistant-user';
const VALID_ACTIONS = ['match_score', 'polish_experience', 'custom_intro', 'question_prediction'];

// ── JSON 提取：剥离 markdown 代码块后尝试解析 ──────────────────
function extractJson(raw) {
  if (!raw) return null;
  try {
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

// ── 按 action 整理 Dify 返回的 JSON ───────────────────────────
function formatResult(json, action) {
  if (!json || typeof json !== 'object') return null;

  switch (action) {
    case 'match_score':
      return {
        score: parseInt(json.score ?? json.match_score ?? 0, 10),
        overall_comment: json.overall_comment ?? json.comment ?? '',
        matched_points: Array.isArray(json.matched_points) ? json.matched_points : [],
        gaps: Array.isArray(json.gaps) ? json.gaps : [],
        suggestions: Array.isArray(json.suggestions) ? json.suggestions : [],
      };

    case 'polish_experience':
      return {
        summary: json.summary ?? json.overall ?? '',
        items: Array.isArray(json.items)
          ? json.items.map((item) => ({
              section:   item.section   ?? item.title       ?? '',
              original:  item.original  ?? item.before      ?? '',
              optimized: item.optimized ?? item.after        ?? '',
              reason:    item.reason    ?? item.explanation  ?? '',
            }))
          : [],
      };

    case 'custom_intro':
      return {
        opening:     json.opening    ?? '',
        highlights:  Array.isArray(json.highlights) ? json.highlights : [],
        full_script: json.full_script ?? json.intro ?? json.introduction ?? '',
      };

    case 'question_prediction':
      return {
        summary: json.summary ?? '',
        questions: Array.isArray(json.questions)
          ? json.questions.map((q) => ({
              question: q.question ?? q.q ?? '',
              answer:   q.answer   ?? q.a ?? '',
            }))
          : [],
      };

    default:
      return json;
  }
}

// ── POST /api/analyze ─────────────────────────────────────────
router.post('/analyze', upload.single('resume'), async (req, res) => {
  const { jd, action } = req.body;
  const resumeFile = req.file;

  // 校验输入
  if (!action || !VALID_ACTIONS.includes(action.trim())) {
    return res.status(400).json({
      error: `action 无效，必须是以下之一：${VALID_ACTIONS.join(', ')}`,
    });
  }
  if (!resumeFile || resumeFile.size === 0) {
    return res.status(400).json({ error: '请上传简历文件' });
  }
  if (!jd || !jd.trim()) {
    return res.status(400).json({ error: '请填写职位描述（JD）' });
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 DIFY_API_KEY' });
  }

  const timings = {};
  const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  console.log(`\n========== [${ts}] action=${action.trim()}  resume=${resumeFile.originalname} ==========`);

  try {
    // ── Step 1：上传简历文件到 Dify ──────────────────────────
    const fileForm = new FormData();
    fileForm.append('file', resumeFile.buffer, {
      filename:    resumeFile.originalname,
      contentType: resumeFile.mimetype,
    });
    fileForm.append('user', DIFY_USER);

    const t1 = Date.now();
    let uploadFileId;
    try {
      const uploadRes = await axios.post(`${DIFY_BASE_URL}/files/upload`, fileForm, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...fileForm.getHeaders(),
        },
      });
      uploadFileId = uploadRes.data?.id;
      if (!uploadFileId) throw new Error('响应中没有 id 字段');
      timings['Step1 上传文件'] = `${Date.now() - t1}ms  ✓  id=${uploadFileId}`;
    } catch (err) {
      timings['Step1 上传文件'] = `${Date.now() - t1}ms  ✗`;
      const status = err.response?.status;
      const body   = err.response?.data;
      console.error('[Step 1] 上传失败', body ?? err.message);
      printTimings(timings);
      return res.status(status || 502).json({
        error:  `文件上传到 Dify 失败（HTTP ${status ?? 'N/A'}）`,
        detail: body,
      });
    }

    // ── Step 2：调用 Dify 接口 ────────────────────────────────
    const inputs = {
      action: action.trim(),
      jd:     jd.trim(),
      resume: {
        transfer_method: 'local_file',
        upload_file_id:  uploadFileId,
        type:            'document',
      },
    };

    const appMode = (process.env.DIFY_APP_MODE || 'workflow').toLowerCase();
    const t2 = Date.now();
    let rawAnswer = '';

    if (appMode === 'workflow') {
      const body = { inputs, response_mode: 'blocking', user: DIFY_USER };
      console.log('[Step 2] Workflow 请求  inputs.action =', inputs.action);
      try {
        const wfRes = await axios.post(`${DIFY_BASE_URL}/workflows/run`, body, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        rawAnswer = wfRes.data?.data?.outputs?.text
                 ?? wfRes.data?.data?.outputs?.answer
                 ?? '';
        timings['Step2 调用Workflow'] = `${Date.now() - t2}ms  ✓`;
      } catch (err) {
        timings['Step2 调用Workflow'] = `${Date.now() - t2}ms  ✗`;
        const status = err.response?.status;
        const body   = err.response?.data;
        console.error('[Step 2] Workflow 失败', body ?? err.message);
        printTimings(timings);
        return res.status(status || 502).json({
          error:  `Dify Workflow 调用失败（HTTP ${status ?? 'N/A'}）`,
          detail: body,
        });
      }
    } else {
      const body = {
        inputs,
        query:         '请根据 action 执行对应任务',
        response_mode: 'blocking',
        user:          DIFY_USER,
      };
      console.log('[Step 2] Chatflow 请求  inputs.action =', inputs.action);
      try {
        const chatRes = await axios.post(`${DIFY_BASE_URL}/chat-messages`, body, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        rawAnswer = chatRes.data?.answer ?? '';
        timings['Step2 调用Chatflow'] = `${Date.now() - t2}ms  ✓`;
      } catch (err) {
        timings['Step2 调用Chatflow'] = `${Date.now() - t2}ms  ✗`;
        const status = err.response?.status;
        const body   = err.response?.data;
        console.error('[Step 2] Chatflow 失败', body ?? err.message);
        printTimings(timings);
        return res.status(status || 502).json({
          error:  `Dify Chatflow 调用失败（HTTP ${status ?? 'N/A'}）`,
          detail: body,
        });
      }
    }

    // ── Step 3：解析 JSON 并按 action 整理结果 ───────────────
    const t3 = Date.now();
    const json      = extractJson(rawAnswer);
    const formatted = formatResult(json, action.trim());
    timings['Step3 解析结果'] = `${Date.now() - t3}ms  ✓  parsed=${!!formatted}`;

    printTimings(timings);

    if (!formatted) {
      // JSON 解析失败，降级返回原始文本
      return res.json({ answer: rawAnswer, action: action.trim(), parsed: false });
    }

    return res.json({ answer: JSON.stringify(formatted), action: action.trim(), parsed: true });

  } catch (err) {
    console.error('[未捕获异常]', err);
    printTimings(timings);
    return res.status(500).json({ error: `服务器内部错误：${err.message}` });
  }
});

function printTimings(timings) {
  console.log('---------- 耗时汇总 ----------');
  Object.entries(timings).forEach(([step, info]) => console.log(`  ${step}: ${info}`));
  console.log('------------------------------\n');
}

module.exports = router;
