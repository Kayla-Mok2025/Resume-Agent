import React, { useState, useEffect } from 'react';

const ORANGE = '#FC7D36';
const YELLOW = '#F4E097';

const STEPS = [
  { label: '简历解析', activeFrom: 0,  doneAt: 33 },
  { label: '岗位解析', activeFrom: 33, doneAt: 66 },
  { label: '生成回复', activeFrom: 66, doneAt: 100 },
];

function getStepStatus(step, progress, isDone) {
  if (isDone || progress >= step.doneAt) return 'done';
  if (progress >= step.activeFrom)       return 'active';
  return 'pending';
}

function StepCircle({ label, status }) {
  const isDone   = status === 'done';
  const isActive = status === 'active';

  const bg     = isDone ? ORANGE : isActive ? '#FEF0D5' : '#F0EDE8';
  const border = isActive ? `2px solid ${ORANGE}` : 'none';
  const labelColor = isDone ? ORANGE : isActive ? ORANGE : '#999';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
        style={{ background: bg, border }}>
        {isDone ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : isActive ? (
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#FDDCB8" strokeWidth="3" />
            <path d="M12 3a9 9 0 019 9" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ccc' }} />
        )}
      </div>
      <span className="text-xs font-medium transition-colors duration-500" style={{ color: labelColor }}>
        {label}
      </span>
    </div>
  );
}

function StepConnector({ leftStatus }) {
  const filled = leftStatus === 'done';
  return (
    <div className="flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all duration-500"
      style={{ background: filled ? ORANGE : '#E8E4DF' }} />
  );
}

export default function AnalysisProgressPanel({
  analysisState, progress, startTime, apiDoneTime, diagnosisCount,
}) {
  if (analysisState === 'idle') return null;

  const isDone = analysisState === 'done';

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (analysisState !== 'analyzing') return;
    const t = setInterval(() => {
      setElapsed(startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : 0);
    }, 100);
    return () => clearInterval(t);
  }, [analysisState, startTime]);

  const [processElapsed, setProcessElapsed] = useState(0);
  useEffect(() => {
    if (analysisState !== 'done' || !apiDoneTime) return;
    const t = setInterval(() => {
      setProcessElapsed(((Date.now() - apiDoneTime) / 1000).toFixed(1));
    }, 100);
    return () => clearInterval(t);
  }, [analysisState, apiDoneTime]);

  const apiSec = apiDoneTime && startTime
    ? ((apiDoneTime - startTime) / 1000).toFixed(1)
    : null;

  const hintText = diagnosisCount === 0
    ? '正在努力读懂你的简历和岗位要求，首次诊断会稍慢一些，请耐心等一小会儿～'
    : '正在飞速生成最新结果！';

  return (
    <div className="mt-10 animate-fade-in">
      <div className="max-w-2xl mx-auto rounded-3xl px-10 py-9"
        style={{ background: '#FFF9EE', boxShadow: '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)' }}>

        <div className="flex items-start mb-8">
          {STEPS.map((step, i) => {
            const status = getStepStatus(step, progress, isDone);
            return (
              <React.Fragment key={step.label}>
                <StepCircle label={step.label} status={status} />
                {i < STEPS.length - 1 && (
                  <StepConnector leftStatus={getStepStatus(STEPS[i], progress, isDone)} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mb-5">
          {isDone ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FC7D36, #F4A832)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#FEF0D5' }}>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#FDDCB8" strokeWidth="3" />
                <path d="M12 3a9 9 0 019 9" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-[20px] leading-tight" style={{ color: '#000000' }}>
              {isDone ? '分析完成，正在整理答案...' : '正在为你生成分析结果'}
            </p>
            {!isDone && (
              <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#666' }}>
                {hintText}
              </p>
            )}
          </div>
          <span className="text-xl font-bold flex-shrink-0 transition-colors duration-300"
            style={{ color: isDone ? '#E06020' : ORANGE }}>
            {progress}%
          </span>
        </div>

        <div className="mb-4">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#FEF0D5' }}>
            <div
              className={['h-full rounded-full transition-all duration-500 ease-out',
                isDone ? '' : 'shimmer-bar'].join(' ')}
              style={{ width: `${progress}%`, background: isDone ? ORANGE : undefined }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isDone && (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: ORANGE }} />
            )}
            <p className="text-sm" style={{ color: '#666', fontWeight: isDone ? 600 : 400 }}>
              {isDone ? '答案已返回，正在解析内容，即将跳转' : '请稍候...'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#888' }}>
            {isDone && apiSec !== null ? (
              <>
                <span>接口响应 <strong style={{ color: ORANGE }}>{apiSec}s</strong></span>
                <span style={{ color: '#ccc' }}>|</span>
                <span>整理答案 <strong style={{ color: ORANGE }}>{processElapsed}s</strong></span>
              </>
            ) : (
              <span>已用时 <strong style={{ color: ORANGE }}>{elapsed}s</strong></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
