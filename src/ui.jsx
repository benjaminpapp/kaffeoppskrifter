export const KARAKTER = [
  ["syre", "Syre"],
  ["sodme", "Sødme"],
  ["fylde", "Fylde"],
  ["klarhet", "Klarhet"],
]

export function Prikker({ verdi, navn }) {
  return (
    <span className="prikker" role="img" aria-label={`${navn}: ${verdi} av 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= verdi ? "p on" : "p"} />
      ))}
    </span>
  )
}
