# 简历助手 ResumeAgent

前后端分离的简历助手应用，基于 Dify API 实现四项 AI 功能：岗位匹配度、经历润色、定制自我介绍、面试可能问题。

## 技术栈

- **前端**：React + Vite
- **后端**：Node.js + Express + Multer

## 快速启动

### 1. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env`，填写你的 Dify API Key：

```
DIFY_API_KEY=your_dify_api_key_here
DIFY_BASE_URL=https://api.dify.ai/v1
PORT=3001
```

### 2. 安装并启动后端

```bash
cd backend
npm install
npm run dev     # 开发模式（nodemon 热重载）
# 或
npm start       # 生产模式
```

后端默认运行在 `http://localhost:3001`

### 3. 安装并启动前端

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`

> 前端开发服务器通过 Vite proxy 自动将 `/api` 请求转发到后端。

## 项目结构

```
ResumeAgent/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js                    # Express 入口
│       └── routes/
│           └── resumeAssistant.js      # 核心路由逻辑
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                     # 根组件（状态管理）
        ├── main.jsx
        ├── index.css
        └── components/
            ├── JdInput.jsx             # JD 文本框
            ├── ResumeUpload.jsx        # 文件上传（支持拖拽）
            ├── ActionButtons.jsx       # 四个功能按钮
            └── ResultPanel.jsx         # 结果/loading/错误展示
```

## 接口说明

### POST /api/resume-assistant

**请求格式**：`multipart/form-data`

| 字段     | 类型   | 说明                                                    |
| -------- | ------ | ------------------------------------------------------- |
| jd       | string | 目标岗位职位描述                                         |
| action   | string | 任务类型，取值见下表                                     |
| resume   | File   | 简历文件（pdf / doc / docx / txt）                       |

**action 取值**：

| action               | 功能         |
| -------------------- | ------------ |
| `match_score`        | 岗位匹配度   |
| `polish_experience`  | 经历润色     |
| `custom_intro`       | 定制自我介绍 |
| `interview_questions`| 面试可能问题 |

**响应**：

```json
{ "answer": "AI 返回的分析内容" }
```

## Dify 工作流配置

在 Dify 工作流中需要配置以下三个输入变量：

- `jd`：string 类型
- `action`：string 类型
- `resume`：file 类型（document）
