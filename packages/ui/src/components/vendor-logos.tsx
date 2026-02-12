"use client";

import React from "react";
import { cn } from "../lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function GoogleLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn(className)}
      {...props}
    >
      <path
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        fill="#4285F4"
      />
      <path
        d="M6.3 14.7l6.6 4.8C14.7 16.2 19.1 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 7.1 29.6 5 24 5c-7.2 0-13.5 3.9-17.7 9.7z"
        fill="#EA4335"
      />
      <path
        d="M24 43c5.1 0 9.8-1.9 13.4-5l-6.8-5.6c-1.9 1.3-4.2 2.1-6.6 2.1-5.2 0-9.7-3.3-11.4-7.9l-6.9 5.3C9.5 38.3 16.2 43 24 43z"
        fill="#34A853"
      />
      <path
        d="M4.6 28.5l6.9-5.3c-.4-1.3-.6-2.7-.6-4.2 0-1.5.2-2.9.6-4.2l-6.9-5.3C3.1 12.4 2 15.6 2 19s1.1 6.6 2.6 9.5z"
        fill="#FBBC05"
      />
    </svg>
  );
}

export function GoogleDriveLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 87.3 78"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn(className)}
      {...props}
    >
      <path
        d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      <path
        d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
        fill="#00ac47"
      />
      <path
        d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
        fill="#ea4335"
      />
      <path
        d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      <path
        d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      <path
        d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  );
}

export function SquareLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn(className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M100 14.2857C100 6.39592 93.6041 0 85.7143 0H14.2857C6.39592 0 0 6.39592 0 14.2857V85.7143C0 93.6041 6.39592 100 14.2857 100H85.7143C93.6041 100 100 93.6041 100 85.7143V14.2857ZM82.1429 17.8571H17.8571V82.1429H82.1429V17.8571ZM67.8571 32.1429H32.1429V67.8571H67.8571V32.1429Z"
        fill="currentColor"
      />
    </svg>
  );
}
