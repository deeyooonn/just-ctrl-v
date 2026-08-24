export default function BackgroundCircuit() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden h-full w-full lg:block"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="circFade" cx="720" cy="380" r="580" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" />
          <stop offset="32%" stopColor="black" />
          <stop offset="62%" stopColor="white" />
          <stop offset="100%" stopColor="white" />
        </radialGradient>
        <mask id="circMask">
          <rect width="1440" height="900" fill="url(#circFade)" />
        </mask>
      </defs>

      <g mask="url(#circMask)" stroke="currentColor" className="text-zinc-900 dark:text-white opacity-25 dark:opacity-10" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="0,150 80,150 120,190 120,280 180,340 350,340" fill="none" strokeWidth="1.2" />
        <circle cx="350" cy="340" r="2.5" fill="none" strokeWidth="1.2" />
        <circle cx="80" cy="150" r="2" fill="none" strokeWidth="1.2" />
        <polyline points="0,320 60,320 100,280 200,280 240,240" fill="none" strokeWidth="1" />
        <circle cx="240" cy="240" r="2" fill="none" strokeWidth="1" />
        <polyline points="0,480 140,480 180,440 280,440" fill="none" strokeWidth="1.2" />
        <circle cx="280" cy="440" r="2.5" fill="none" strokeWidth="1.2" />
        <polyline points="0,620 100,620 160,680 250,680" fill="none" strokeWidth="1" />
        <circle cx="250" cy="680" r="2.5" fill="none" strokeWidth="1" />
        <polyline points="0,780 120,780 180,720 280,720 320,680 400,680" fill="none" strokeWidth="1.2" />
        <circle cx="400" cy="680" r="2" fill="none" strokeWidth="1.2" />
        <circle cx="280" cy="720" r="2" fill="none" strokeWidth="1.2" />
        <polyline points="1440,200 1320,200 1280,240 1280,320 1220,380 1050,380" fill="none" strokeWidth="1.2" />
        <circle cx="1050" cy="380" r="2.5" fill="none" strokeWidth="1.2" />
        <circle cx="1320" cy="200" r="2" fill="none" strokeWidth="1.2" />
        <polyline points="1440,360 1360,360 1320,320 1200,320 1140,260" fill="none" strokeWidth="1" />
        <circle cx="1140" cy="260" r="2" fill="none" strokeWidth="1" />
        <polyline points="1440,540 1280,540 1220,480 1100,480" fill="none" strokeWidth="1.2" />
        <circle cx="1100" cy="480" r="2.5" fill="none" strokeWidth="1.2" />
        <polyline points="1440,700 1340,700 1280,760 1150,760" fill="none" strokeWidth="1" />
        <circle cx="1150" cy="760" r="2.5" fill="none" strokeWidth="1" />
        <polyline points="1440,840 1300,840 1220,760 1100,760 1060,720 950,720" fill="none" strokeWidth="1.2" />
        <circle cx="950" cy="720" r="2" fill="none" strokeWidth="1.2" />
        <circle cx="1100" cy="760" r="2" fill="none" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
