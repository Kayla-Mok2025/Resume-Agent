import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ResumeUploadCard from './components/ResumeUploadCard';
import JobDescriptionCard from './components/JobDescriptionCard';
import FeatureOptionGrid from './components/FeatureOptionGrid';
import PrimaryActionSection from './components/PrimaryActionSection';
import AnalysisProgressPanel from './components/AnalysisProgressPanel';
import ResultPage from './components/ResultPage';
import FontPreview from './components/FontPreview';

// ── IndexedDB 工具 ────────────────────────────────────────────
const DB_NAME = 'resume-assistant';
const DB_STORE = 'files';
const DB_KEY = 'resume';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(DB_STORE);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}
async function saveFileToDB(file) {
  const db = await openDB();
  const buf = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put({ buf, name: file.name, type: file.type }, DB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}
async function loadFileFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(DB_KEY);
    req.onsuccess = (e) => {
      const r = e.target.result;
      resolve(r ? new File([r.buf], r.name, { type: r.type }) : null);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}
async function clearFileFromDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(DB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}
// ─────────────────────────────────────────────────────────────

export default function App() {
  // ── 页面视图 ──────────────────────────────────────────────
  const [view, setView] = useState('input');

  // ── 简历文件状态 ──────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle');   // 'idle'|'uploading'|'success'
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadTimerRef = useRef(null);

  // ── JD 状态 ───────────────────────────────────────────────
  const [jd, setJd] = useState(() => localStorage.getItem('resume-assistant-jd') || '');
  const jdSaveTimer = useRef(null);

  // ── 功能选择（单选）────────────────────────────────────────
  const [selectedAction, setSelectedAction] = useState(null);

  // ── 错误高亮状态 ──────────────────────────────────────────
  const [errors, setErrors] = useState({ resume: false, jd: false, feature: false });
  const [shaking, setShaking] = useState({ resume: false, jd: false, feature: false });


  // ── 分析状态 ──────────────────────────────────────────────
  const [analysisState, setAnalysisState] = useState('idle'); // 'idle'|'analyzing'|'done'|'error'
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [timings, setTimings] = useState(null);
  const analysisTimerRef = useRef(null);
  const progressPanelRef = useRef(null);
  const startTimeRef = useRef(null);
  const apiDoneTimeRef = useRef(null);

  // ── 恢复 IndexedDB 文件 ───────────────────────────────────
  useEffect(() => {
    loadFileFromDB()
      .then((file) => {
        if (file) {
          setResumeFile(file);
          setUploadState('success');
          setUploadProgress(100);
        }
      })
      .catch(() => {});
  }, []);

  // ── JD 防抖写入 localStorage ──────────────────────────────
  const handleJdChange = (val) => {
    setJd(val);
    if (val.trim()) setErrors((e) => ({ ...e, jd: false }));
    clearTimeout(jdSaveTimer.current);
    jdSaveTimer.current = setTimeout(() => {
      localStorage.setItem('resume-assistant-jd', val);
    }, 500);
  };

  // ── 删除 JD ───────────────────────────────────────────────
  const handleJdDelete = () => {
    setJd('');
    localStorage.removeItem('resume-assistant-jd');
  };

  // ── 文件选择 / 删除 ───────────────────────────────────────
  const handleFileSelect = useCallback((file) => {
    clearInterval(uploadTimerRef.current);

    if (!file) {
      setResumeFile(null);
      setUploadState('idle');
      setUploadProgress(0);
      clearFileFromDB().catch(() => {});
      return;
    }

    setErrors((e) => ({ ...e, resume: false }));
    setResumeFile(file);
    setUploadState('uploading');
    setUploadProgress(0);

    let progress = 0;
    uploadTimerRef.current = setInterval(() => {
      progress = Math.min(progress + Math.random() * 6 + 2, 100);
      setUploadProgress(Math.floor(progress));
      if (progress >= 100) {
        clearInterval(uploadTimerRef.current);
        setUploadState('success');
        setUploadProgress(100);
        saveFileToDB(file).catch(() => {});
      }
    }, 80);
  }, []);

  // ── 功能选择 ──────────────────────────────────────────────
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setErrors((e) => ({ ...e, feature: false }));
  };

  // ── 触发抖动 ──────────────────────────────────────────────
  const triggerShake = (keys) => {
    setShaking((prev) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = true; });
      return next;
    });
    setTimeout(() => setShaking({ resume: false, jd: false, feature: false }), 500);
  };

  // ── 验证失败时触发错误提示 ────────────────────────────────
  const handleValidationFail = () => {
    const resumeOk = uploadState === 'success';
    const jdOk = jd.trim().length > 0;

    const newErrors = {
      resume: !resumeOk,
      jd: !jdOk,
      feature: !selectedAction,
    };
    setErrors(newErrors);
    const shakingKeys = Object.entries(newErrors).filter(([, v]) => v).map(([k]) => k);
    triggerShake(shakingKeys);
  };

  // ── 模拟分析进度 ──────────────────────────────────────────
  const startFakeProgress = () => {
    clearInterval(analysisTimerRef.current);
    let p = 0;
    analysisTimerRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 2 + 0.5, 92);
      setAnalysisProgress(Math.floor(p));
    }, 300);
  };

  // ── 开始分析 ──────────────────────────────────────────────
  const handleStart = async () => {
    const action = selectedAction || 'match_score';

    setAnalysisState('analyzing');
    setAnalysisProgress(0);
    setResult('');
    setError('');
    setTimings(null);
    startTimeRef.current = Date.now();
    apiDoneTimeRef.current = null;
    startFakeProgress();

    setTimeout(() => progressPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('resume', resumeFile);
      formData.append('jd', jd.trim());

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || `请求失败（${res.status}）`);

      apiDoneTimeRef.current = Date.now();
      clearInterval(analysisTimerRef.current);
      setAnalysisProgress(100);
      setAnalysisState('done');
      setResult(data.answer || '');

      const apiSec = ((apiDoneTimeRef.current - startTimeRef.current) / 1000).toFixed(1);
      setTimeout(() => {
        const processSec = ((Date.now() - apiDoneTimeRef.current) / 1000).toFixed(1);
        setTimings({ apiSec, processSec });
        setView('result');
      }, 800);
    } catch (err) {
      console.error('[分析失败]', err);
      clearInterval(analysisTimerRef.current);
      setAnalysisProgress(100);
      setAnalysisState('error');
      setError('抱歉，今日额度已用完，请明天再来～');
      setTimeout(() => setView('result'), 600);
    }
  };

  // ── 返回输入页（保留所有已填内容）────────────────────────
  const handleBack = () => {
    setView('input');
    setAnalysisState('idle');
    setAnalysisProgress(0);
    // 不清除 resumeFile / jd / selectedAction
  };

  // ── 字体预览页（临时）────────────────────────────────────
  if (view === 'fonts') {
    return <FontPreview onBack={() => setView('input')} />;
  }

  // ── 结果页 ────────────────────────────────────────────────
  if (view === 'result') {
    return (
      <ResultPage
        result={result}
        error={error}
        selectedAction={selectedAction}
        timings={timings}
        onBack={handleBack}
      />
    );
  }

  // ── 输入页 ────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans">
      <Header />
      <HeroSection />

      <main className="max-w-[1100px] mx-auto px-10 pb-32">
        {/* 双栏卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResumeUploadCard
            uploadState={uploadState}
            uploadProgress={uploadProgress}
            resumeFile={resumeFile}
            onFileSelect={handleFileSelect}
            hasError={errors.resume}
            shaking={shaking.resume}
          />
          <JobDescriptionCard
            value={jd}
            onChange={handleJdChange}
            onDelete={handleJdDelete}
            hasError={errors.jd}
            shaking={shaking.jd}
          />
        </div>

        {/* 功能选项 */}
        <FeatureOptionGrid
          selected={selectedAction}
          onSelect={handleSelectAction}
          hasError={errors.feature}
          shaking={shaking.feature}
        />

        {/* 主 CTA */}
        <PrimaryActionSection
          uploadState={uploadState}
          jd={jd}
          selectedAction={selectedAction}
          analysisState={analysisState}
          onStart={handleStart}
          onValidationFail={handleValidationFail}
        />

        {/* 分析进度面板 */}
        <div ref={progressPanelRef}>
          <AnalysisProgressPanel
            analysisState={analysisState}
            progress={analysisProgress}
            startTime={startTimeRef.current}
            apiDoneTime={apiDoneTimeRef.current}
          />
        </div>
      </main>
    </div>
  );
}
