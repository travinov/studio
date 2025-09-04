import type { SVGProps } from "react";

export function InstaCraftLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <rect width="256" height="256" fill="none" />
      <path
        d="M68,76H188a12,12,0,0,1,12,12V188a12,12,0,0,1-12,12H68a12,12,0,0,1-12-12V88A12,12,0,0,1,68,76Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <circle
        cx="128"
        cy="138"
        r="38"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <circle cx="178" cy="88" r="12" fill="currentColor" />
      <path
        d="M84,36h88a12,12,0,0,1,12,12V76"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}
