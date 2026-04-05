import React from 'react';

export default function JdInput({ value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor="jd-input" className="form-label">
        目标岗位 JD
      </label>
      <textarea
        id="jd-input"
        className="textarea"
        rows={8}
        placeholder="请粘贴目标岗位的职位描述（JD）..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
