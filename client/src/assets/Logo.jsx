import React from 'react';

export default function Logo({ size = 22, text = true }) {
  return (
    <div className="d-inline-flex align-items-center">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="url(#g)"/>
        <path d="M20 36c8 0 8-8 16-8 7 0 8 6 8 10" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="36" r="3" fill="#fff"/>
        <circle cx="40" cy="38" r="3" fill="#fff"/>
      </svg>
      {text && <span className="ms-2 fw-bold">FlexiTime</span>}
    </div>
  );
}
