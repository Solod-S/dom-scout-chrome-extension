import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  title = ''
}) {
  return (
    <span
      className={`ds-badge ds-badge-${variant} ds-badge-${size} ${className}`}
      title={title}
    >
      {children}
    </span>
  );
}
