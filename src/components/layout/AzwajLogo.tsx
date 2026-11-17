import { Link } from 'react-router-dom';

export function AzwajLogo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14533C]/40 rounded-md"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-[#14533C]"
      >
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          transform="rotate(45 12 12)"
          stroke="#9A7B3E"
          strokeWidth="1.3"
        />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
      <span className="font-serif text-2xl font-semibold tracking-tight text-[#1A2421] whitespace-nowrap shrink-0">
        Azwaj
      </span>
    </Link>
  );
}
