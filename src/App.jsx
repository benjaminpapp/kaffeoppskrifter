import { useEffect, useMemo, useState } from "react"
import { oppskrifter, utstyr, NIVAER, MODUSER, ratio, tall } from "./data"
import Oppskrift from "./Oppskrift"
import { Prikker, KARAKTER } from "./ui"

// Enkel hash-ruting (#/o/<slug>) — fungerer på GitHub Pages uten 404-triks.
function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return hash
}

const NIVA_TEKST = { lett: "Lett", middels: "Middels", avansert: "Avansert" }
const MODUS_TEKST = { "åpen": "Åpen", lukket: "Lukket", hybrid: "Hybrid" }

function Kort({ o }) {
  return (
    <a className="card" href={`#/o/${o.slug}`}>
      <div className="cap">
        <strong>{o.navn}</strong>
        <span className={`tag modus-${o.modus === "åpen" ? "apen" : o.modus}`}>{MODUS_TEKST[o.modus]}</span>
      </div>
      <p className="beskr">{o.beskrivelse}</p>
      <div className="meta mono">
        <span>{tall(o.kaffe)} g / {o.vann} g</span>
        <span>{ratio(o)}</span>
        <span>ZP6 {tall(o.malegrad.toFixed(1))}</span>
        <span>{o.tid}</span>
      </div>
      <div className="mini">
        {KARAKTER.map(([k, navn]) => (
          <div key={k} className="mini-rad">
            <span className="mono">{navn}</span>
            <Prikker verdi={o.karakter[k]} navn={navn} />
          </div>
        ))}
      </div>
    </a>
  )
}

function Filter({ valg, aktiv, sett, tekst, etikett }) {
  return (
    <div className="filter" role="group" aria-label={etikett}>
      <button className={`pill ${aktiv === null ? "on" : ""}`} onClick={() => sett(null)} aria-pressed={aktiv === null}>
        Alle
      </button>
      {valg.map((v) => (
        <button key={v} className={`pill ${aktiv === v ? "on" : ""}`} onClick={() => sett(aktiv === v ? null : v)} aria-pressed={aktiv === v}>
          {tekst[v]}
        </button>
      ))}
    </div>
  )
}

function Oversikt() {
  const [niva, setNiva] = useState(null)
  const [modus, setModus] = useState(null)
  const synlige = useMemo(
    () => oppskrifter.filter((o) => (!niva || o.niva === niva) && (!modus || o.modus === modus)),
    [niva, modus]
  )

  return (
    <>
      <header className="hero">
        <p className="eyebrow">Hario Switch · ZP6 · {oppskrifter.length} oppskrifter</p>
        <h1>Kaffeoppskrifter</h1>
        <p className="lead">
          Alle oppskriftene brygges på Hario Switch og er sortert fra lett til avansert. Tidene er faste tidspunkt fra
          første helling, og vektene er totalvekt på vekta.
        </p>
      </header>

      <details className="utstyr">
        <summary>
          <span className="eyebrow">Utstyr</span>
          <span className="sub">{utstyr.map((u) => u.modell.split(" (")[0]).join(" · ")}</span>
        </summary>
        <dl>
          {utstyr.map((u) => (
            <div key={u.utstyr} className="utstyr-rad">
              <dt className="mono">{u.utstyr}</dt>
              <dd>
                <strong>{u.modell}</strong>
                <span>{u.tips}</span>
              </dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="filtre">
        <Filter valg={NIVAER} aktiv={niva} sett={setNiva} tekst={NIVA_TEKST} etikett="Nivå" />
        <Filter valg={MODUSER} aktiv={modus} sett={setModus} tekst={MODUS_TEKST} etikett="Switch-modus" />
      </div>

      {NIVAER.map((n) => {
        const liste = synlige.filter((o) => o.niva === n)
        if (!liste.length) return null
        return (
          <section key={n} className="gruppe" aria-labelledby={`g-${n}`}>
            <h2 id={`g-${n}`} className="eyebrow">{NIVA_TEKST[n]}</h2>
            <div className="grid">
              {liste.map((o) => <Kort key={o.slug} o={o} />)}
            </div>
          </section>
        )
      })}
      {!synlige.length && <p className="sub tom">Ingen oppskrifter passer filteret.</p>}
    </>
  )
}

export default function App() {
  const hash = useHash()
  const slug = hash.startsWith("#/o/") ? decodeURIComponent(hash.slice(4)) : null
  const valgt = slug && oppskrifter.find((o) => o.slug === slug)

  useEffect(() => {
    document.title = valgt ? `${valgt.navn} — Kaffeoppskrifter` : "Kaffeoppskrifter — Benjamin Thorsen Papp"
    window.scrollTo(0, 0)
  }, [valgt])

  return (
    <>
      <nav className="nav">
        <a className="brand mono" href="#/">kaffe<span>.</span></a>
        <a className="mono sub" href="https://benjaminpapp.github.io/portefolje/">Portefølje ↗</a>
      </nav>
      <main id="main">{valgt ? <Oppskrift o={valgt} /> : <Oversikt />}</main>
      <footer className="mono sub">Benjamin Thorsen Papp · Mandal</footer>
    </>
  )
}
