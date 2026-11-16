import { useEffect, useRef, useState } from "react"
import { ratio, tall, sekunder } from "./data"
import { Prikker, KARAKTER } from "./ui"

// **fet** → <strong>
function Tekst({ children }) {
  return String(children)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((del, i) => (del.startsWith("**") ? <strong key={i}>{del.slice(2, -2)}</strong> : del))
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

// Holder skjermen våken mens tidtakeren går (der nettleseren støtter det).
function useWakeLock(aktiv) {
  useEffect(() => {
    if (!aktiv || !("wakeLock" in navigator)) return
    let lock
    navigator.wakeLock.request("screen").then((l) => (lock = l)).catch(() => {})
    return () => lock?.release().catch(() => {})
  }, [aktiv])
}

function Tidtaker({ steg }) {
  const [start, setStart] = useState(null)
  const [naa, setNaa] = useState(0)
  const raf = useRef(0)
  useWakeLock(start !== null)

  useEffect(() => {
    if (start === null) return
    const tikk = () => {
      setNaa((performance.now() - start) / 1000)
      raf.current = requestAnimationFrame(tikk)
    }
    raf.current = requestAnimationFrame(tikk)
    return () => cancelAnimationFrame(raf.current)
  }, [start])

  const tider = steg.map((s) => sekunder(s.tid))
  const gaar = start !== null
  const aktiv = gaar ? tider.reduce((acc, t, i) => (naa >= t ? i : acc), 0) : -1
  const neste = gaar ? tider.find((t) => t > naa) : undefined
  const ferdig = gaar && neste === undefined

  return (
    <section className="tidtaker" aria-label="Tidtaker">
      <div className="tt-topp">
        <div>
          <div className="tt-tid mono" aria-live="off">{mmss(naa)}</div>
          <div className="sub mono tt-neste" aria-live="polite">
            {!gaar && "Start når du heller første vann"}
            {gaar && !ferdig && `Neste steg om ${Math.ceil(neste - naa)} s`}
            {ferdig && "Siste steg"}
          </div>
        </div>
        {!gaar ? (
          <button className="btn" onClick={() => { setNaa(0); setStart(performance.now()) }}>Start</button>
        ) : (
          <button className="btn ghost" onClick={() => { setStart(null); setNaa(0) }}>Nullstill</button>
        )}
      </div>
      <ol className="steg">
        {steg.map((s, i) => (
          <li key={i} className={i === aktiv ? "aktiv" : i < aktiv ? "ferdig" : ""} aria-current={i === aktiv ? "step" : undefined}>
            <span className="mono t">{s.ca ? "ca. " : ""}{s.tid}</span>
            <span><Tekst>{s.tekst}</Tekst></span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default function Oppskrift({ o }) {
  const params = [
    ["Kaffe", `${tall(o.kaffe)} g`],
    ["Vann", `${o.vann} g`],
    ["Ratio", ratio(o)],
    ["Temp", o.temp],
    ["ZP6", tall(o.malegrad.toFixed(1))],
    ["Tid", o.tid],
  ]
  return (
    <article className="oppskrift">
      <a className="tilbake mono sub" href="#/">← Alle oppskrifter</a>
      <p className="eyebrow">{o.niva} · {o.brygger}</p>
      <h1>{o.navn}</h1>
      <p className="lead">{o.beskrivelse}</p>

      <dl className="params">
        {params.map(([k, v]) => (
          <div key={k}>
            <dt className="mono">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="karakter">
        {KARAKTER.map(([k, navn]) => (
          <div key={k}>
            <span className="mono sub">{navn}</span>
            <Prikker verdi={o.karakter[k]} navn={navn} />
          </div>
        ))}
      </div>

      <Tidtaker steg={o.steg} />

      {o.notater && (
        <section className="notater">
          <h2 className="eyebrow">Notater</h2>
          <p>{o.notater}</p>
        </section>
      )}
      {o.kilde && (
        <p className="sub kilde">
          Kilde: <a href={o.kilde.url} target="_blank" rel="noreferrer">{o.kilde.navn} ↗</a>
        </p>
      )}
    </article>
  )
}
