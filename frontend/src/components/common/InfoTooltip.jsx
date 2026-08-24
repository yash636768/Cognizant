import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({
  text,
  size = 13,
  align = 'center',
  position = 'top'
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className={`info-tooltip-container align-${align} pos-${position}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        className="info-tooltip-btn"
        aria-label="More information"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <Info size={size} />
      </button>

      <span
        className={`info-tooltip-popup ${isOpen ? 'show' : ''}`}
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
}
