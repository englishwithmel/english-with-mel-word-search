import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m3.5 10.5 8.5-7 8.5 7" />
      <path d="M5.5 9.5v9a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-9" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3.5c.65 4.7 2.3 6.35 7 7-4.7.65-6.35 2.3-7 7-.65-4.7-2.3-6.35-7-7 4.7-.65 6.35-2.3 7-7Z" />
      <path d="M19 16.5c.25 1.85.9 2.5 2.75 2.75-1.85.25-2.5.9-2.75 2.75-.25-1.85-.9-2.5-2.75-2.75 1.85-.25 2.5-.9 2.75-2.75Z" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
    </svg>
  );
}

export function LightbulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M8.1 14.5A6 6 0 1 1 15.9 14.5c-.7.55-1.05 1.3-1.1 2.2H9.2c-.05-.9-.4-1.65-1.1-2.2Z" />
      <path d="M12 6.8v2.1" />
    </svg>
  );
}

export function ResetIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.2 9.5A8 8 0 1 1 4 14" />
      <path d="M4 4.5v5h5" />
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.5 9.5v5h3.2l4.3 3.5v-12l-4.3 3.5H4.5Z" />
      <path d="M15.5 9a4.3 4.3 0 0 1 0 6" />
      <path d="M18.2 6.5a7.8 7.8 0 0 1 0 11" />
    </svg>
  );
}

export function VolumeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.5 9.5v5h3.2l4.3 3.5v-12l-4.3 3.5H4.5Z" />
      <path d="m16 9.5 5 5M21 9.5l-5 5" />
    </svg>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.5 9.5v5h3.2l4.3 3.5v-12l-4.3 3.5H4.5Z" />
      <path d="M15.5 9a4.3 4.3 0 0 1 0 6" />
      <path d="M18.2 6.5a7.8 7.8 0 0 1 0 11" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.6 4.6" />
      <path d="M8.4 10.5h4.2M10.5 8.4v4.2" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m12 3.3 2.5 5.2 5.7.8-4.15 4.05 1 5.75L12 16.4l-5.05 2.7 1-5.75L3.8 9.3l5.7-.8L12 3.3Z" />
    </svg>
  );
}

export function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="4" fill="#F8EDD9" stroke="#D8C6A8" strokeWidth="1.4" />
      <path d="M8 4v17M3.5 8.5h4" stroke="#D8C6A8" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.5 9.2c1.2-.7 2.4-.7 3.6 0v5.6c-1.2-.7-2.4-.7-3.6 0V9.2Zm0 0v5.6" stroke="#8AAE87" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.8 8h2.7M9.8 11h2.7" stroke="#E0A48C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 4.5h10v4.2a5 5 0 0 1-10 0V4.5Z" fill="#F6D88C" stroke="#B78E3F" strokeWidth="1.4" />
      <path d="M7 5.5H4.8v1.8c0 2 1.3 3.4 3.4 3.7M17 5.5h2.2v1.8c0 2-1.3 3.4-3.4 3.7" stroke="#B78E3F" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 13.8v3.4M8.8 20h6.4l-.6-2.8H9.4L8.8 20Z" stroke="#6B7149" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m12 6.4.65 1.4 1.5.2-1.1 1.1.3 1.5-1.35-.75-1.35.75.3-1.5-1.1-1.1 1.5-.2L12 6.4Z" fill="#FFF9EA" />
    </svg>
  );
}

export function FlowerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="16" fill="#FBE3D6" />
      <g transform="translate(24 24)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-10.2"
            rx="4.6"
            ry="7.2"
            fill="#FFF9ED"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="6.2" fill="#F2CE79" />
        <circle cx="-2" cy="-0.8" r="1" fill="#5C6044" />
        <circle cx="2" cy="-0.8" r="1" fill="#5C6044" />
        <path d="M-2.1 2.1c1.2 1.3 3 1.3 4.2 0" stroke="#5C6044" strokeWidth="1.25" strokeLinecap="round" />
      </g>
    </svg>
  );
}
