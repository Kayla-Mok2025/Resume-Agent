import React, { useRef } from 'react';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt';

export default function ResumeUpload({ file, onChange }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onChange(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onChange(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="form-group">
      <label className="form-label">上传简历</label>
      <div
        className={`upload-zone ${file ? 'upload-zone--has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {file ? (
          <div className="upload-zone__file-info">
            <span className="upload-zone__file-icon">📄</span>
            <span className="upload-zone__file-name">{file.name}</span>
            <button
              type="button"
              className="upload-zone__clear-btn"
              onClick={handleClear}
              title="移除文件"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="upload-zone__placeholder">
            <span className="upload-zone__icon">⬆</span>
            <span>点击或拖拽上传简历</span>
            <span className="upload-zone__hint">支持 PDF / DOC / DOCX / TXT</span>
          </div>
        )}
      </div>
    </div>
  );
}
