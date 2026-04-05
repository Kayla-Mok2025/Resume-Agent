import React from 'react';

const ORANGE   = '#FC7D36';
const CREAM_WH = '#FFF9EE';

export default function PrimaryActionSection({
  uploadState, jd, selectedAction, analysisState, onStart, onValidationFail,
  resumeSentToServer, jdSentToServer,
}) {
  const resumeOk = uploadState === 'success' || resumeSentToServer;
  const jdOk = jd.trim().length > 0 || jdSentToServer;
  const isReady = resumeOk && jdOk && !!selectedAction;
  const isAnalyzing = analysisState === 'analyzing';

  const handleClick = () => {
    if (isAnalyzing) return;
    if (!isReady) { onValidationFail?.(); return; }
    onStart();
  };

  return (
    <div className="mt-10 flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={isAnalyzing}
        className="px-16 py-5 rounded-2xl text-[18px] font-semibold transition-all duration-200"
        style={isReady && !isAnalyzing ? {
          background: ORANGE,
          color: CREAM_WH,
          boxShadow: '0 4px 16px rgba(252,125,54,0.40), 0 2px 4px rgba(0,0,0,0.08)',
          cursor: 'pointer',
        } : isAnalyzing ? {
          background: ORANGE,
          color: CREAM_WH,
          cursor: 'not-allowed',
          opacity: 0.75,
          boxShadow: 'none',
        } : {
          background: '#F4E097',
          color: '#785E48',
          cursor: 'pointer',
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => {
          if (isReady && !isAnalyzing) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = '#E86C24';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(252,125,54,0.50)';
          }
        }}
        onMouseLeave={(e) => {
          if (isReady && !isAnalyzing) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = ORANGE;
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(252,125,54,0.40), 0 2px 4px rgba(0,0,0,0.08)';
          }
        }}
        onMouseDown={(e) => {
          if (isReady && !isAnalyzing) e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-2.5">
            <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,249,238,0.4)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0110 10" stroke={CREAM_WH} strokeWidth="3" strokeLinecap="round" />
            </svg>
            正在分析中...
          </span>
        ) : (
          '开始智能诊断'
        )}
      </button>
    </div>
  );
}
