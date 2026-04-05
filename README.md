# 西米求职 · AI 简历诊断助手

> 上传简历 + 粘贴岗位描述，一键获得岗位匹配度、简历优化建议、定制自我介绍、高频面试问题预测。

---

## 目录

- [功能演示](#功能演示)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [快速启动](#快速启动)
- [项目结构](#项目结构)
- [API 接口](#api-接口)
- [Dify Chatflow 配置](#dify-chatflow-配置)
- [智能复用机制](#智能复用机制)

---

## 功能演示

### 主页面

<img width="1287" height="1252" alt="image" src="https://github.com/user-attachments/assets/255ed833-a998-4b61-b85e-4d23f463dbc2" />


### 岗位匹配度分析

<!-- TODO: 粘贴 match_score 结果页截图 -->

### 简历优化建议

<!-- TODO: 粘贴 polish_experience 结果页截图 -->

### 定制自我介绍

<!-- TODO: 粘贴 custom_intro 结果页截图 -->

### 高频面试问题预测

<!-- TODO: 粘贴 interview_questions 结果页截图 -->

---

## 系统架构

<img width="1732" height="2302" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/f72d3dac-cc97-46ac-a17f-deaf65ecc7d4" />

```

### 前端状态机（简历 / JD 复用逻辑）

```
<img width="1069" height="3512" alt="mermaid-diagram (1)" src="https://github.com/user-attachments/assets/d8c85813-ed00-4f02-a2b4-942746f803c6" />

```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite |
| 样式 | Tailwind CSS v4 (`@tailwindcss/vite`) |
| 本地持久化 | IndexedDB（简历文件）+ localStorage（JD 文本）|
| 后端框架 | Node.js + Express |
| 文件解析 | multer（multipart/form-data）|
| AI 平台 | Dify Chatflow |
| LLM | Google Gemini（可在 Dify 内切换）|

---

## 快速启动

### 1. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env`：

```env
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_APP_MODE=chatflow          # chatflow 或 workflow
PORT=3001
```

### 2. 启动后端

```bash
cd backend
npm install
npm run dev     # nodemon 热重载
# 或
npm start       # 生产模式
```

后端运行在 `http://localhost:3001`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，Vite 自动将 `/api/*` 代理到后端。

---

## 项目结构

```
ResumeAgent2/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js                      # Express 入口，注册路由
│       └── routes/
│           └── resumeAssistant.js        # 核心路由：文件上传 + Dify 调用
│
└── frontend/
    ├── vite.config.js                    # 含 /api 反向代理配置
    ├── index.html
    └── src/
        ├── App.jsx                       # 全局状态、视图切换、提交逻辑
        ├── main.jsx
        ├── index.css                     # Tailwind + 自定义动画
        └── components/
            ├── Header.jsx                # 顶部导航栏
            ├── HeroSection.jsx           # 标题 + 副文案
            ├── ResumeUploadCard.jsx      # 简历上传（拖拽 / 点击）
            ├── JobDescriptionCard.jsx    # JD 文本输入框
            ├── FeatureOptionGrid.jsx     # 四功能 2×2 网格选择
            ├── PrimaryActionSection.jsx  # 「开始智能诊断」按钮
            ├── AnalysisProgressPanel.jsx # 分析进度面板（三步骤）
            ├── ResultPage.jsx            # 结果页外壳
            ├── DifyResultRenderer.jsx    # JSON 结果智能渲染器
            └── FontPreview.jsx           # 字体预览（开发用）
```

---

## API 接口

### `POST /api/resume-assistant`

**Content-Type**: `multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `action` | string | ✅ | 任务类型，见下表 |
| `resume` | File | 可选 | 简历文件（pdf / doc / docx / txt），首次或文件变更时传 |
| `jd` | string | 可选 | 岗位描述，首次或内容变更时传 |
| `conversation_id` | string | 可选 | Dify 会话 ID，第二轮起传入以复用上下文 |

**action 取值**：

| action | 功能 | 返回 JSON 字段 |
|--------|------|----------------|
| `match_score` | 岗位匹配度分析 | `score`, `overall_comment`, `matched_points[]`, `gaps[]`, `suggestions[]` |
| `polish_experience` | 简历优化建议 | `summary`, `items[].{section, original, optimized, reason}` |
| `custom_intro` | 定制自我介绍 | `opening`, `highlights[]`, `full_script` |
| `interview_questions` | 高频面试问题预测 | `summary`, `questions[].{question, answer}` |

**响应**：

```json
{
  "answer": "{ ... }",
  "conversation_id": "abc-123-..."
}
```

---

## Dify Chatflow 配置

在 Dify Chatflow 中需要配置以下输入变量：

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `action` | String | 任务类型，必填 |
| `jd` | String | 岗位描述，选填 |
| `resume` | File（document）| 简历文件，选填 |

Chatflow 内部根据 `action` 的值路由到不同分支，每个分支调用 LLM 并要求其返回对应结构的 JSON。`sys.conversation_id` 由 Dify 自动管理，前端通过回传 `conversation_id` 复用同一对话，使后续请求无需重复传递简历和 JD。

---

## 智能复用机制

为避免每次都将大文件和长文本重新传给 Dify，前端维护两个布尔标记：

| 标记 | 含义 | 重置时机 |
|------|------|----------|
| `resumeSentToServer` | 当前简历已被 Dify 接收 | 用户上传新文件 / 删除文件 |
| `jdSentToServer` | 当前 JD 已被 Dify 接收 | 用户编辑或删除 JD 文本 |

每次提交前：
- `sendResume = !resumeSentToServer && !!resumeFile`
- `sendJd = !jdSentToServer && jd.trim().length > 0`

标记在**发送请求前**置为 `true`（而非成功后），避免因 Dify 报错（如配额耗尽）导致无限重传。
