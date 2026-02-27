import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
  children,
  content,
  position = 'top',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    const positions = {
      top: { top: rect.top - gap, left: rect.left + rect.width / 2 },
      bottom: { top: rect.bottom + gap, left: rect.left + rect.width / 2 },
      left: { top: rect.top + rect.height / 2, left: rect.left - gap },
      right: { top: rect.top + rect.height / 2, left: rect.right + gap },
    };

    setCoords(positions[position]);
  }, [isVisible, position]);

  const transformMap = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  };

  const tooltipContent = isVisible && (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: coords.top,
        left: coords.left,
        transform: transformMap[position],
      }}
    >
      <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-normal max-w-xs">
        {content}
      </div>
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(tooltipContent, document.body)}
    </div>
  );
}
