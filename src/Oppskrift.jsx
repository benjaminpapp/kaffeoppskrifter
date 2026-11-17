import { useEffect, useMemo, useRef, useState } from "react"
import { ratio, tall, sekunder, mmss, basiskopper, skaler, MAKS_VANN, MAKS_KOPPER } from "./data"
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

// Porsjonsteller. Starter alltid på det oppskriften opprinnelig er laget
// for, så standardvisningen er originalen og ikke en avrunding av den.
function Porsjoner({ basis, kopper, sett }) {
  const juster = (d) => sett(Math.min(MAKS_KOPPER, Math.max(1, kopper + d)))
  return (
    <div className="porsjoner">
      <span className="stempel">Porsjoner</span>
      <div className="porsjoner-styr">
        <button className="porsjoner-knapp" onClick={() => juster(-1)} disabled={kopper <= 1} aria-label="Én kopp mindre">−</button>
        <span className="porsjoner-tall" aria-live="polite">{kopper} {kopper === 1 ? "kopp" : "kopper"}</span>
        <button className="porsjoner-knapp" onClick={() => juster(1)} disabled={kopper >= MAKS_KOPPER} aria-label="Én kopp mer">+</button>
      </div>
      {kopper !== basis && (
        <button className="bryter porsjoner-nullstill" onClick={() => sett(basis)}>
          Tilbake til originalen
        </button>
      )}
    </div>
  )
}

export default function Oppskrift({ o, visTilbake = true }) {
  const basis = basiskopper(o)
  const [kopper, setKopper] = useState(basis)
  useEffect(() => setKopper(basiskopper(o)), [o])

  const vist = useMemo(() => skaler(o, kopper), [o, kopper])
  const skalert = kopper !== basis

  // Bare kaffe og vann skaleres. Ratio er uendret per definisjon, og temp,
  // malegrad og tid står urørt — de må ikke markeres som om de endret seg.
  const params = [
    ["Kaffe", `${tall(vist.kaffe)} g`, true],
    ["Vann", `${vist.vann} g`, true],
    ["Ratio", ratio(vist), false],
    ["Temp", o.temp, false],
    ["ZP6", tall(o.malegrad.toFixed(1)), false],
    ["Tid", o.tid, false],
  ]
  return (
    <article className="oppskrift">
      {visTilbake && <a className="tilbake" href="#/">Alle oppskriftene</a>}

      <header className="opp-topp">
        <p className="stempel">{o.niva} · {o.brygger}</p>
        <h1>{o.navn}</h1>
        <p className="lead">{o.beskrivelse}</p>
        <span className="modus modus-stor">
          <ModusGlyf modus={o.modus} />
          {o.modus}
        </span>
      </header>

      <Porsjoner basis={basis} kopper={kopper} sett={setKopper} />

      <dl className="params">
        {params.map(([k, v, skalerbar]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className={skalert && skalerbar ? "skalert" : undefined}>{v}</dd>
          </div>
        ))}
      </dl>

      {vist.vann > MAKS_VANN && (
        <p className="advarsel" role="status">
          Switch 02 rommer rundt {MAKS_VANN} g. <strong>{vist.vann} g</strong> renner over kanten,
          så brygg heller i to omganger.
        </p>
      )}
      {skalert && (
        <p className="skalanotis">
          Tidene står som i originalen. Større dose gir lengre avrenning, ikke lengre bryggeforløp.
          Malegraden er heller ikke regnet om — en større dose vil som regel ha litt grovere maling.
        </p>
      )}

      <Profil o={vist} />

      <div className="karakter">
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

      <Tidtaker steg={vist.steg} />

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
