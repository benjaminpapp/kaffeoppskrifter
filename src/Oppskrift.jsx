import { useEffect, useRef, useState } from "react"
import { ratio, tall, sekunder, mmss } from "./data"
import { Prikker, ModusGlyf, KARAKTER } from "./ui"
import Profil from "./Profil"

// **fet** → <strong>
function Tekst({ children }) {
  return String(children)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((del, i) => (del.startsWith("**") ? <strong key={i}>{del.slice(2, -2)}</strong> : del))
}

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
        <div className="tt-venstre">
          <div className="tt-tid" aria-live="off">{mmss(naa)}</div>
          <div className="tt-neste" aria-live="polite">
            {!gaar && "Start når du heller første vann"}
            {gaar && !ferdig && `Neste steg om ${Math.ceil(neste - naa)} s`}
            {ferdig && "Siste steg"}
          </div>
        </div>
        {!gaar ? (
          <button className="knapp" onClick={() => { setNaa(0); setStart(performance.now()) }}>Start</button>
        ) : (
          <button className="knapp sekundaer" onClick={() => { setStart(null); setNaa(0) }}>Nullstill</button>
        )}
      </div>
      <ol className="steg">
        {steg.map((s, i) => (
          <li key={i} className={i === aktiv ? "aktiv" : i < aktiv ? "ferdig" : ""} aria-current={i === aktiv ? "step" : undefined}>
            <span className="steg-tid">{s.ca ? "ca. " : ""}{s.tid}</span>
            <span className="steg-tekst"><Tekst>{s.tekst}</Tekst></span>
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
      <a className="tilbake" href="#/">Alle oppskriftene</a>

      <header className="opp-topp">
        <p className="stempel">{o.niva} · {o.brygger}</p>
        <h1>{o.navn}</h1>
        <p className="lead">{o.beskrivelse}</p>
        <span className="modus modus-stor">
          <ModusGlyf modus={o.modus} />
          {o.modus}
        </span>
      </header>

      <dl className="params">
        {params.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <Profil o={o} />

      <div className="karakter">
        <span className="stempel">Karakter</span>
        <div className="karakter-rader">
          {KARAKTER.map(([k, navn]) => (
            <div key={k}>
              <span className="karakter-navn">{navn}</span>
              <Prikker verdi={o.karakter[k]} navn={navn} />
              <span className="karakter-tall">{o.karakter[k]}</span>
            </div>
          ))}
        </div>
      </div>

      <Tidtaker steg={o.steg} />

      {o.notater && (
        <section className="notater">
          <h2 className="stempel">Notater</h2>
          <p>{o.notater}</p>
        </section>
      )}
      {o.kilde && (
        <p className="kilde">
          Kilde: <a href={o.kilde.url} target="_blank" rel="noreferrer noopener">{o.kilde.navn}</a>
        </p>
      )}
    </article>
  )
}
