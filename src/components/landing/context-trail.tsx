type ContextTrailProps = {
  className?: string
}

export function ContextTrail({ className }: ContextTrailProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-testid="context-trail"
      fill="none"
      viewBox="0 0 500 180"
    >
      <path
        className="contextTrailPath"
        d="M9 152C76 159 77 43 160 53c80 10 71 93 156 76 69-14 74-117 176-91"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="9" cy="152" fill="currentColor" r="5" />
      <circle cx="316" cy="129" fill="currentColor" r="5" />
      <circle cx="492" cy="38" fill="currentColor" r="5" />
    </svg>
  )
}
