require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resumeAssistantRouter = require('./routes/resumeAssistant');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', resumeAssistantRouter);

app.listen(PORT, () => {
  console.log(`后端服务已启动，端口：${PORT}`);
});
