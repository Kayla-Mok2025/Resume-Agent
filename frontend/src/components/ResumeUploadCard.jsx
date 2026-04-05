import React, { useRef, useState } from 'react';

const ACCEPTED = '.pdf,.doc,.docx,.txt';

const CARD_BG    = '#FFF9EE';
const AREA_BG    = '#F9F2D7';
const ORANGE     = '#FC7D36';
const DEEP_BROWN = '#000000';
const MUTED_BRWN = '#444444';
const YELLOW     = '#F4E097';

const CARD_SHADOW       = '0 4px 24px rgba(252,125,54,0.12), 0 8px 40px rgba(0,0,0,0.08)';
const CARD_SHADOW_ERROR = '0 0 0 2px rgba(239,68,68,0.4), 0 4px 24px rgba(252,125,54,0.10)';

function FileIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UploadProgressBar({ progress, done }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: MUTED_BRWN }}>
          {done ? '上传完成' : '上传中...'}
        </span>
        <span className="text-xs font-semibold" style={{ color: ORANGE }}>{progress}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: YELLOW }}>
        <div
          className={['h-full rounded-full transition-all duration-300 ease-out',
            done ? '' : 'shimmer-bar'].join(' ')}
          style={{ width: `${progress}%`, background: done ? ORANGE : undefined }}
        />
      </div>
    </div>
  );
}

export default function ResumeUploadCard({
  uploadState, uploadProgress, resumeFile, onFileSelect, hasError, shaking,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => { if (f) onFileSelect(f); };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  };
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div
      className={['rounded-3xl flex flex-col gap-5 p-7',
        shaking ? 'animate-shake' : ''].join(' ')}
      style={{
        background: CARD_BG,
        boxShadow: hasError ? CARD_SHADOW_ERROR : CARD_SHADOW,
      }}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: YELLOW }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke={ORANGE}
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20h16" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
            <h2 className="font-bold text-[24px]" style={{ color: DEEP_BROWN }}>
              上传你的简历
            </h2>
          </div>
          <p className="text-sm leading-relaxed pl-[34px]" style={{ color: '#000000' }}>
            支持 PDF、Word、TXT，系统将自动提取并分析
          </p>
        </div>
        {hasError && (
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FEE2E2" />
              <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium" style={{ color: '#EF4444' }}>请先上传简历</span>
          </div>
        )}
      </div>

      {/* 上传区域 */}
      {uploadState === 'success' ? (
        <div className="rounded-2xl px-5 py-4 relative" style={{ background: AREA_BG }}>
          <button
            onClick={() => onFileSelect(null)}
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
            style={{ background: YELLOW, color: ORANGE }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = YELLOW; e.currentTarget.style.color = ORANGE; }}
            title="删除文件"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: YELLOW }}>
              <FileIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: DEEP_BROWN }}>
                {resumeFile?.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs" style={{ color: MUTED_BRWN }}>
                  {resumeFile?.size ? `${(resumeFile.size / 1024).toFixed(0)} KB` : ''}
                </p>
                <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: ORANGE, color: '#FFF9EE' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFF9EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  已上传
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <UploadProgressBar progress={100} done />
          </div>
        </div>
      ) : (
        <div
          onClick={() => uploadState === 'idle' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            'rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all duration-200',
            uploadState === 'uploading' ? 'p-6 cursor-default'
              : dragging ? 'p-8 cursor-pointer scale-[1.01]'
              : 'p-8 cursor-pointer',
          ].join(' ')}
          style={{
            background: AREA_BG,
            borderColor: dragging ? ORANGE : 'rgba(252,125,54,0.28)',
          }}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          {uploadState === 'uploading' ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: YELLOW }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="animate-bounce">
                  <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 20h16" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs truncate max-w-full px-4" style={{ color: MUTED_BRWN }}>{resumeFile?.name}</p>
              <div className="w-full"><UploadProgressBar progress={uploadProgress} done={false} /></div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: CARD_BG, boxShadow: '0 2px 12px rgba(252,125,54,0.18)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 12V4M12 4l-3.5 3.5M12 4l3.5 3.5" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: DEEP_BROWN }}>点击上传或拖拽文件到此处</p>
                <p className="text-xs mt-1.5" style={{ color: MUTED_BRWN }}>PDF / DOCX / TXT，不超过 20MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {uploadState === 'idle' && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
          style={{ background: YELLOW, color: DEEP_BROWN }}
          onMouseEnter={(e) => { e.currentTarget.style.background = ORANGE; e.currentTarget.style.color = '#FFF9EE'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = YELLOW; e.currentTarget.style.color = DEEP_BROWN; }}
        >
          选择简历文件
        </button>
      )}
    </div>
  );
}
