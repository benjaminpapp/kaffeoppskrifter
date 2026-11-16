export const KARAKTER = [
  ["syre", "Syre"],
  ["sodme", "Sødme"],
  ["fylde", "Fylde"],
  ["klarhet", "Klarhet"],
]

// Karakteren settes som på et cupping-skjema: fem hakk, ikke en fargeskala.
export function Prikker({ verdi, navn }) {
  return (
    <span className="hakk" role="img" aria-label={`${navn}: ${verdi} av 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= verdi ? "h on" : "h"} />
      ))}
    </span>
  )
}

// Switch-modus er en tilstand i ventilen, ikke en kategori — så den kodes i
// form, ikke i en ekstra farge: åpen renner, lukket står, hybrid gjør begge.
const GLYF = {
  "åpen": { strek: null, drape: true },
  lukket: { strek: [4.5, 11.5], drape: false },
  hybrid: { strek: [4.5, 8], drape: true },
}

export function ModusGlyf({ modus }) {
  const g = GLYF[modus] ?? GLYF["åpen"]
  return (
    <svg className="glyf" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M2.5 3 H13.5 L8.75 10.5 H7.25 Z" />
      {g.strek && <line x1={g.strek[0]} x2={g.strek[1]} y1="12.6" y2="12.6" />}
      {g.drape && <circle cx="8" cy="13.6" r="1.25" />}
    </svg>
  )
}
