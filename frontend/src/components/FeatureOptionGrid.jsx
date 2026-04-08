import React from 'react';

const CARD_BG = '#FFF9EE';
const YELLOW  = '#F4E097';
const ORANGE  = '#FC7D36';
const BLACK   = '#000000';

const FEATURES = [
  {
    action: 'match_score',
    label: '岗位匹配度分析',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    action: 'polish_experience',
    label: '简历优化建议',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H6a2 2 0 00-2 2v13a2 2 0 002 2h11a2 2 0 002-2v-5"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L13 14l-4 1 1-4 8.5-8.5z"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    action: 'custom_intro',
    label: '定制自我介绍',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    ),
  },
  {
    action: 'question_prediction',
    label: '高频面试问题预测',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function FeatureOptionGrid({ selected, onSelect, hasError, shaking }) {
  return (
    <div className={['mt-8', shaking ? 'animate-shake' : ''].join(' ')}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h3 className="font-bold" style={{ color: BLACK, fontSize: '26px' }}>
            功能选择
          </h3>
          {hasError && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.18)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FEE2E2" />
                <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
                请选择一个分析功能
              </span>
            </div>
          )}
        </div>
        <span className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: 'rgba(255,249,238,0.2)', color: BLACK, border: '1px solid rgba(0,0,0,0.2)' }}>
          单选
        </span>
      </div>

      <div
        className="grid grid-cols-2 overflow-hidden"
        style={{
          borderRadius: '28px',
          boxShadow: '0 6px 32px rgba(252,125,54,0.16), 0 12px 48px rgba(0,0,0,0.10)',
        }}
      >
        {FEATURES.map(({ action, label, icon }, idx) => {
          const isSelected = selected === action;
          const cornerMap = ['rounded-tl-[28px]', 'rounded-tr-[28px]', 'rounded-bl-[28px]', 'rounded-br-[28px]'];
          const corner = cornerMap[idx] || '';
          const borderRight = idx % 2 === 0;
          const borderBottom = idx < 2;

          return (
            <button
              key={action}
              type="button"
              onClick={() => onSelect(action)}
              className={['h-[110px] flex flex-col items-center justify-center gap-2.5',
                'text-[14px] font-medium select-none relative transition-all duration-200',
                corner,
              ].join(' ')}
              style={{
                background: isSelected ? YELLOW : CARD_BG,
                borderRight: borderRight ? `1.5px solid rgba(252,125,54,0.15)` : 'none',
                borderBottom: borderBottom ? `1.5px solid rgba(252,125,54,0.15)` : 'none',
                color: BLACK,
                zIndex: isSelected ? 2 : 1,
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(252,125,54,0.28), 0 4px 12px rgba(0,0,0,0.10)';
                  e.currentTarget.style.background = '#FFFBF2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = CARD_BG;
                }
              }}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: ORANGE }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFF9EE" strokeWidth="3.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <span style={{ color: ORANGE }}>{icon}</span>
              <span className="font-bold leading-tight text-center px-3" style={{ color: BLACK }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
