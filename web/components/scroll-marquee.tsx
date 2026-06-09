interface Props {
  /** Oversized phrase that scrolls horizontally. */
  text?: string | null
  /** Small disclaimer line shown below the marquee. */
  disclaimer?: string | null
}

const FALLBACK_TEXT = 'Build investor awareness with SteinbergValentino'
const FALLBACK_DISCLAIMER = 'Investing involves risk, including possible loss of capital.'

/* How many times the phrase repeats inside ONE marquee group.
   Two identical groups are rendered so the loop is seamless at translateX(-50%). */
const REPEATS_PER_GROUP = 4

/**
 * Oversized horizontal marquee band — white serif text auto-scrolls across a
 * black background, with a small disclaimer line beneath it. Two identical,
 * left-anchored groups make the CSS loop seamless.
 */
export function ScrollMarquee({ text, disclaimer }: Props) {
  const phrase = text?.trim() || FALLBACK_TEXT
  const note = disclaimer?.trim() || FALLBACK_DISCLAIMER

  const renderGroup = (groupIndex: number) => (
    <div className="sv-marquee__group" aria-hidden={groupIndex === 1 ? true : undefined}>
      {Array.from({ length: REPEATS_PER_GROUP }).map((_, i) => (
        <span className="sv-marquee__word" key={i}>
          {phrase}
        </span>
      ))}
    </div>
  )

  return (
    <section className="sv-marquee" aria-label={phrase}>
      <div className="sv-marquee__viewport" aria-hidden="true">
        <div className="sv-marquee__track">
          {renderGroup(0)}
          {renderGroup(1)}
        </div>
      </div>

      <div className="sv-container">
        <p className="sv-marquee__disclaimer">{note}</p>
      </div>
    </section>
  )
}
