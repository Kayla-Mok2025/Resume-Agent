import React from 'react';

const MAX_LENGTH = 5000;

const CARD_BG    = '#FFF9EE';
const AREA_BG    = '#F9F2D7';
const ORANGE     = '#FC7D36';
const DEEP_BROWN = '#000000';
const MUTED_BRWN = '#444444';
const YELLOW     = '#F4E097';

const CARD_SHADOW       = '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)';
const CARD_SHADOW_ERROR = '0 0 0 2px rgba(239,68,68,0.4), 0 4px 24px rgba(252,125,54,0.10)';

export default function JobDescriptionCard({ value, onChange, onDelete, hasError, shaking }) {
  const len = value.length;
  const isNearLimit = len > MAX_LENGTH * 0.9;

  return (
    <div
      className={['rounded-3xl flex flex-col gap-5 p-7',
        shaking ? 'animate-shake' : ''].join(' ')}
      style={{ background: CARD_BG, boxShadow: hasError ? CARD_SHADOW_ERROR : CARD_SHADOW }}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: YELLOW }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="font-bold text-[24px]" style={{ color: DEEP_BROWN }}>
              粘贴目标岗位描述
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-[34px]" style={{ color: '#000000' }}>
            粘贴岗位职责和任职要求，帮系统更准确地判断匹配度
          </p>
        </div>
        {hasError && (
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FEE2E2" />
              <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium" style={{ color: '#EF4444' }}>请填写岗位描述</span>
          </div>
        )}
      </div>

      {/* 输入框（× 按钮在右上角内部） */}
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          rows={8}
          placeholder="请粘贴职位名称、岗位职责、任职要求等内容..."
          className="w-full resize-none rounded-[18px] pb-8 px-5 py-4 text-sm leading-relaxed outline-none transition-all duration-200"
          style={{
            color: DEEP_BROWN,
            background: CARD_BG,
            border: `1.5px solid ${YELLOW}`,
            caretColor: ORANGE,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = ORANGE;
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(252,125,54,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = YELLOW;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {/* × 按钮：右上角悬浮在 textarea 内 */}
        {value && onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
            style={{ background: YELLOW, color: ORANGE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = YELLOW; e.currentTarget.style.color = ORANGE; }}
            title="清空岗位描述"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-3 right-4 text-xs select-none pointer-events-none"
          style={{ color: isNearLimit ? ORANGE : MUTED_BRWN }}>
          {len.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </div>
      </div>

      {/* 提示条 */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl"
        style={{ background: AREA_BG }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-px">
          <circle cx="8" cy="8" r="7" stroke={ORANGE} strokeWidth="1.5" />
          <path d="M8 7v4M8 5.5v.5" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm leading-relaxed" style={{ color: '#000000' }}>
          建议粘贴完整 JD，以获得更准确的分析结果
        </p>
      </div>
    </div>
  );
}
