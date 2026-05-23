import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  showBg?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showBg = true, className = "", ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none ${className}`}
      {...props}
    >
      {showBg && <circle cx="50" cy="50" r="45" fill="#f7f5ee" />}
      <path d="M50 15 L65 50 L50 85 L35 50 Z" fill="#022c22" />
      <path d="M50 15 L65 50 L50 50 Z" fill="#10b981" />
    </svg>
  );
}
