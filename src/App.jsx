import { useEffect, useMemo, useState } from "react"
import { oppskrifter, utstyr, NIVAER, MODUSER, ratio, tall } from "./data"
import Oppskrift from "./Oppskrift"
import { Prikker, ModusGlyf, KARAKTER } from "./ui"

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

function Rad({ o }) {
  return (
    <a className="rad" href={`#/o/${o.slug}`}>
      <div className="rad-topp">
        <h3>{o.navn}</h3>
        <span className="modus">
          <ModusGlyf modus={o.modus} />
          {MODUS_TEKST[o.modus]}
        </span>
      </div>
      <p className="rad-beskr">{o.beskrivelse}</p>
      <dl className="rad-data">
        <div><dt>Kaffe</dt><dd>{tall(o.kaffe)} g</dd></div>
        <div><dt>Vann</dt><dd>{o.vann} g</dd></div>
        <div><dt>Ratio</dt><dd>{ratio(o)}</dd></div>
        <div><dt>ZP6</dt><dd>{tall(o.malegrad.toFixed(1))}</dd></div>
        <div><dt>Tid</dt><dd>{o.tid}</dd></div>
      </dl>
      <div className="rad-karakter">
        {KARAKTER.map(([k, navn]) => (
          <span key={k}>
            <span className="rad-karakter-navn">{navn}</span>
            <Prikker verdi={o.karakter[k]} navn={navn} />
          </span>
        ))}
      </div>
    </a>
  )
}

function Filter({ valg, aktiv, sett, tekst, etikett }) {
  return (
    <div className="filter" role="group" aria-label={etikett}>
      <span className="stempel">{etikett}</span>
      <button className={`bryter ${aktiv === null ? "on" : ""}`} onClick={() => sett(null)} aria-pressed={aktiv === null}>
        Alle
      </button>
      {valg.map((v) => (
        <button key={v} className={`bryter ${aktiv === v ? "on" : ""}`} onClick={() => sett(aktiv === v ? null : v)} aria-pressed={aktiv === v}>
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
        <p className="stempel">Hario Switch · 1Zpresso ZP6 · {oppskrifter.length} oppskrifter</p>
        <h1>Bryggejournal</h1>
        <p className="lead">
          Ni pour-over-oppskrifter, sortert fra lett til avansert. Tidene er faste tidspunkt fra første helling,
          og hver vekt er totalvekt på vekta — ikke mengden du heller i det steget.
        </p>
      </header>

      <details className="utstyr">
        <summary>
          <span className="stempel">Utstyr</span>
          <span className="utstyr-liste">{utstyr.map((u) => u.modell.split(" (")[0]).join(", ")}</span>
        </summary>
        <dl>
          {utstyr.map((u) => (
            <div key={u.utstyr} className="utstyr-rad">
              <dt>{u.utstyr}</dt>
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
        <Filter valg={MODUSER} aktiv={modus} sett={setModus} tekst={MODUS_TEKST} etikett="Modus" />
      </div>

      {NIVAER.map((n) => {
        const liste = synlige.filter((o) => o.niva === n)
        if (!liste.length) return null
        return (
          <section key={n} className="gruppe" aria-labelledby={`g-${n}`}>
            <h2 id={`g-${n}`} className="stempel gruppe-tittel">
              {NIVA_TEKST[n]}<span className="gruppe-tall">{liste.length}</span>
            </h2>
            <div className="rader">
              {liste.map((o) => <Rad key={o.slug} o={o} />)}
            </div>
          </section>
        )
      })}

      {!synlige.length && (
        <div className="tom">
          <p>Ingen oppskrifter er både <strong>{NIVA_TEKST[niva]?.toLowerCase()}</strong> og <strong>{MODUS_TEKST[modus]?.toLowerCase()}</strong>.</p>
          <button className="bryter" onClick={() => { setNiva(null); setModus(null) }}>Nullstill filtrene</button>
        </div>
      )}
    </>
  )
}

function FinnesIkke({ slug }) {
  return (
    <div className="tom">
      <p className="stempel">Finner ikke</p>
      <p>Det er ingen oppskrift som heter <code>{slug}</code>. Den kan ha byttet navn.</p>
      <a className="bryter" href="#/">Se alle oppskriftene</a>
    </div>
  )
}

export default function App() {
  const hash = useHash()
  const slug = hash.startsWith("#/o/") ? decodeURIComponent(hash.slice(4)) : null
  const valgt = slug ? oppskrifter.find((o) => o.slug === slug) : null

  useEffect(() => {
    document.title = valgt ? `${valgt.navn} — Bryggejournal` : "Bryggejournal — Hario Switch"
    window.scrollTo(0, 0)
  }, [valgt, slug])

  return (
    <>
      <a className="hopp" href="#main">Hopp til innholdet</a>
      <nav className="nav">
        <a className="merke" href="#/" aria-current={slug ? undefined : "page"}>
          Bryggejournal
        </a>
        <a className="nav-ut" href="https://benjaminpapp.github.io/portefolje/">Portefølje</a>
      </nav>
      <main id="main">
        {slug && !valgt && <FinnesIkke slug={slug} />}
        {valgt && <Oppskrift o={valgt} />}
        {!slug && <Oversikt />}
      </main>
      <footer>
        <span>Benjamin Thorsen Papp</span>
        <span>Mandal</span>
      </footer>
    </>
  )
}
