import React from 'react';

export default function ScoreCircle({ score = 0, size = 44, strokeWidth = 3.5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  let color = '#16A34A'; // Green for 75-100
  let bgColor = '#DCFCE7';

  if (clamped < 40) {
    color = '#DC2626'; // Red
    bgColor = '#FEE2E2';
  } else if (clamped < 70) {
    color = '#D97706'; // Amber / Orange
    bgColor = '#FEF3C7';
  }

  return (
    <div
      className="ds-score-circle-wrapper"
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.35s ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: size <= 40 ? '13px' : '15px',
          fontWeight: 700,
          color: '#111827',
          fontFamily: 'var(--font-sans)'
        }}
      >
        {score}
      </span>
    </div>
  );
}
