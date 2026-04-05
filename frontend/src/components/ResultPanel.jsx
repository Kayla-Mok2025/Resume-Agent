import React from 'react';

export default function ResultPanel({ loading, error, result }) {
  if (!loading && !error && !result) return null;

  return (
    <div className="result-panel">
      {loading && (
        <div className="result-panel__loading">
          <span className="spinner" />
          <span>正在分析中，请稍候...</span>
        </div>
      )}

      {!loading && error && (
        <div className="result-panel__error">
          <strong>出错了：</strong> {error}
        </div>
      )}

      {!loading && !error && result && (
        <div className="result-panel__content">
          <h3 className="result-panel__title">分析结果</h3>
          <div className="result-panel__text">{result}</div>
        </div>
      )}
    </div>
  );
}
