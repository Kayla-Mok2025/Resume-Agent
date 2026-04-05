import React from 'react';

const ACTIONS = [
  { label: '岗位匹配度', action: 'match_score' },
  { label: '经历润色', action: 'polish_experience' },
  { label: '定制自我介绍', action: 'custom_intro' },
  { label: '面试可能问题', action: 'interview_questions' },
];

export default function ActionButtons({ onAction, loading }) {
  return (
    <div className="action-buttons">
      {ACTIONS.map(({ label, action }) => (
        <button
          key={action}
          type="button"
          className="btn btn--primary"
          disabled={loading}
          onClick={() => onAction(action)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
