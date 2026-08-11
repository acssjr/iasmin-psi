type ContextTrailProps = {
  className?: string
  motionTarget: 'care' | 'hero'
}

export function ContextTrail({ className, motionTarget }: ContextTrailProps) {
  const isCareTrail = motionTarget === 'care'

  return (
    <svg
      aria-hidden="true"
      className={className}
      data-motion-target={motionTarget}
      data-testid={`${motionTarget}-context-trail`}
      fill="none"
      preserveAspectRatio={isCareTrail ? 'none' : undefined}
      viewBox={isCareTrail ? '0 0 180 500' : '0 0 500 180'}
    >
      {isCareTrail ? (
        <>
          <path
            className="contextTrailPath"
            d="M94 44C91 102 39 148 40 250"
            data-care-trail-segment
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            className="contextTrailPath"
            d="M40 250c1 102 51 148 54 206"
            data-care-trail-segment
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="94" cy="44" data-care-trail-node fill="currentColor" r="5" />
          <circle cx="40" cy="250" data-care-trail-node fill="currentColor" r="5" />
          <circle cx="94" cy="456" data-care-trail-node fill="currentColor" r="5" />
        </>
      ) : (
        <>
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
        </>
      )}
    </svg>
  )
}
