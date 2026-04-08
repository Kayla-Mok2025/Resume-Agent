import React from 'react';
import DifyResultRenderer from './DifyResultRenderer';

const ACTION_LABELS = {
  match_score: '岗位匹配度分析',
  polish_experience: '简历优化建议',
  custom_intro: '定制自我介绍',
  question_prediction: '高频面试问题预测',
};

const ERROR_CONFIG = {
  network: { emoji: '📡', color: '#C2620A', bg: '#FFF3E8' },
  quota:   { emoji: '😴', color: '#C2620A', bg: '#FFF9EE' },
  upload:  { emoji: '📄', color: '#C2620A', bg: '#FFF3E8' },
  dify:    { emoji: '🤖', color: '#C2620A', bg: '#FFF3E8' },
  server:  { emoji: '⚙️', color: '#B91C1C', bg: '#FFF5F5' },
  unknown: { emoji: '⚠️', color: '#C2620A', bg: '#FFF3E8' },
};

function ErrorCard({ error }) {
  // 兼容旧的字符串格式
  const info = typeof error === 'string'
    ? { type: 'unknown', title: '分析失败', hint: error }
    : error;

  const { emoji, color, bg } = ERROR_CONFIG[info?.type] ?? ERROR_CONFIG.unknown;

  return (
    <div className="rounded-2xl px-8 py-10 text-center"
      style={{ background: bg, boxShadow: '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)' }}>
      <div className="text-5xl mb-5">{emoji}</div>
      <p className="font-bold text-[20px] mb-3" style={{ color: '#2D1600' }}>{info?.title}</p>
      {info?.hint && (
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: '#666' }}>{info.hint}</p>
      )}
    </div>
  );
}

function CatLogo() {
  return (
    <img
      src="/logo-cat.png"
      alt="西米"
      className="w-9 h-9 rounded-full object-cover flex-shrink-0 select-none"
      style={{ mixBlendMode: 'multiply' }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling.style.display = 'flex';
      }}
    />
  );
}

export default function ResultPage({ result, error, selectedAction, onBack }) {
  return (
    <div className="min-h-screen animate-fade-in" style={{ background: '#F9F2D7' }}>
      <header className="sticky top-0 z-20"
        style={{
          background: 'rgba(249,242,215,0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 0 rgba(240,224,200,0.8)',
        }}>
        <div className="max-w-[1120px] mx-auto px-6 h-[56px] flex items-center gap-3">
          {/* 返回按钮 — 西米求职左边 */}
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200"
            style={{ background: 'rgba(252,125,54,0.12)', color: '#FC7D36', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(252,125,54,0.22)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(252,125,54,0.12)'; }}
            title="返回"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#FC7D36" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <CatLogo />
            <div className="w-9 h-9 rounded-full items-center justify-center flex-shrink-0 text-sm font-bold"
              style={{ display: 'none', background: 'linear-gradient(135deg,#F4E097,#FC7D36)', color: '#2D1600' }}>
              西
            </div>
            <span className="font-bold text-[16px] tracking-tight" style={{ color: '#2D1600' }}>
              西米求职
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1120px] mx-auto px-6 py-10 pb-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#FC7D36' }} />
            <span className="text-xs font-medium" style={{ color: '#FC7D36' }}>诊断结果</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#2D1600' }}>
            {ACTION_LABELS[selectedAction] || '分析结果'}
          </h2>
        </div>

        {error ? (
          <ErrorCard error={error} />
        ) : (
          <DifyResultRenderer result={result} action={selectedAction} />
        )}
      </main>
    </div>
  );
}
