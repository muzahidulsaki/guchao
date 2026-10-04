import React from 'react';

export const BUG_VIEWBOX = '0 4 146 66';
export const BUG_RINGS = [22, 50, 78, 106];
export const BUG_RING_CY = 46;
export const BUG_RING_R = 17;
export const BUG_ANTENNAE = [
  'M110 29.5 C112 21 116 14 122 11 C126 9 130 12 128 16 C127 18.5 124 18.5 123.5 16.5',
  'M118 33 C122 26 128 22 134 22 C138 22 140 26 137.5 29 C136 31 133 30.5 133 28.5',
];

type BugMarkProps = {
  className?: string;
  title?: string;
};

export function BugMark({ className = 'h-6 w-auto text-brand-400', title = 'Heiseenbug' }: BugMarkProps) {
  return (
    <svg
      viewBox={BUG_VIEWBOX}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {BUG_RINGS.map((cx) => (
        <circle key={cx} cx={cx} cy={BUG_RING_CY} r={BUG_RING_R} />
      ))}
      <g>
        {BUG_ANTENNAE.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
