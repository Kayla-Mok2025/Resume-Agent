require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const resumeAssistantRouter = require('./routes/resumeAssistant');

const app = express();
const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, '../public');

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', resumeAssistantRouter);

// 静态资源（Vite build 产物）
app.use(express.static(PUBLIC_DIR));

// SPA fallback：所有非 /api 路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务已启动，端口：${PORT}`);
});
