import { useEffect, useMemo, useState } from "react"
import { oppskrifter, NIVAER, MODUSER, ratio, tall } from "./data"
import Oppskrift from "./Oppskrift"
import { Prikker, ModusGlyf, KARAKTER } from "./ui"
import PatternWaves from "./PatternWaves"
import Laer from "./Laer"
import Lag from "./Lag"

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

// Bakgrunnen leser både grunnfarge og aksent fra temaet i stedet for
// hardkodede verdier. Shaderen avgjør selv om den tegner lyst-på-mørkt ut
// fra grunnfargen, og prikkene kan ikke komme ut av takt med aksenten.
function useTemafarger() {
  const [farger, setFarger] = useState({ grunn: "#11161b", aksent: "#b9784a" })
  useEffect(() => {
    const les = () => {
      const s = getComputedStyle(document.documentElement)
      setFarger({
        grunn: s.getPropertyValue("--ground").trim() || "#11161b",
        aksent: s.getPropertyValue("--rust").trim() || "#b9784a",
      })
    }
    les()
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", les)
    return () => mq.removeEventListener("change", les)
  }, [])
  return farger
}

function Bakgrunn() {
  const { grunn, aksent } = useTemafarger()
  return (
    <div className="bakgrunn" aria-hidden="true">
      <PatternWaves
        preset="silk"
        color={aksent}
        backgroundColor={grunn}
        fade="center"
        interactive
        cursorSize={50}
        cursorStrength={0.6}
        pattern="dot"
        wave="silk"
        spacing={9}
        markSize={0.42}
        depth={0.95}
        light={0}
        shine={0.85}
        contrast={1.2}
        speed={0.35}
        scale={1.45}
        direction={20}
        opacity={1}
        fadeSize={0.5}
        intro
        paused={false}
      />
    </div>
  )
}

const NIVA_TEKST = { lett: "Lett", middels: "Middels", avansert: "Avansert" }
const MODUS_TEKST = { "åpen": "Åpen", lukket: "Lukket", hybrid: "Hybrid" }
const SMAKER = ["syre", "sodme", "fylde", "klarhet"]
const SMAK_TEKST = { syre: "Syre", sodme: "Sødme", fylde: "Fylde", klarhet: "Klarhet" }

function Rad({ o, fremhev, visNiva }) {
  return (
    <a className="rad" href={`#/o/${o.slug}`} style={{ "--h": `${o.hue}deg` }}>
      <div className="rad-topp">
        <h3>{o.navn}</h3>
        <span className="rad-merker">
          {visNiva && <span className="rad-niva">{NIVA_TEKST[o.niva]}</span>}
          <span className="modus">
            <ModusGlyf modus={o.modus} />
            {MODUS_TEKST[o.modus]}
          </span>
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
          <span key={k} className={k === fremhev ? "fremhevet" : ""}>
            <span className="rad-karakter-navn">{navn}</span>
            <Prikker verdi={o.karakter[k]} navn={navn} sterk={k === fremhev} />
          </span>
        ))}
      </div>
    </a>
  )
}

// Etiketten og knappene er søsken, ikke nøstet, slik at alle tre filtrene
// deler ett rutenett i .filtre og står i linje med hverandre.
function Filter({ valg, aktiv, sett, tekst, etikett, nullTekst = "Alle" }) {
  return (
    <>
      <span className="stempel filter-etikett">{etikett}</span>
      <div className="filter-valg" role="group" aria-label={etikett}>
        <button className={`bryter ${aktiv === null ? "on" : ""}`} onClick={() => sett(null)} aria-pressed={aktiv === null}>
          {nullTekst}
        </button>
        {valg.map((v) => (
          <button key={v} className={`bryter ${aktiv === v ? "on" : ""}`} onClick={() => sett(aktiv === v ? null : v)} aria-pressed={aktiv === v}>
            {tekst[v]}
          </button>
        ))}
      </div>
    </>
  )
}

function Oversikt() {
  const [niva, setNiva] = useState(null)
  const [modus, setModus] = useState(null)
  const [smak, setSmak] = useState(null)

  const synlige = useMemo(
    () => oppskrifter.filter((o) => (!niva || o.niva === niva) && (!modus || o.modus === modus)),
    [niva, modus]
  )

  // Smak sorterer, den filtrerer ikke: med så få oppskrifter gir terskler fort
  // null treff (ingen har f.eks. både syre og sødme på 4+), og en tom side
  // hjelper ingen. Her flyttes det du vil ha øverst i stedet.
  const rangert = useMemo(
    () => (smak ? [...synlige].sort((a, b) => b.karakter[smak] - a.karakter[smak] || a.navn.localeCompare(b.navn, "no")) : synlige),
    [synlige, smak]
  )

  return (
    <>
      <header className="hero">
        {/* Synlig overskrift er fjernet, men siden trenger en h1 for
            dokumentstruktur og skjermlesere. */}
        <h1 className="skjult">Kaffeoppskrifter for Hario Switch</h1>
      </header>

      <nav className="snarveier" aria-label="Verktøy">
        <a className="snarvei" href="#/lag">
          <strong>Lag en oppskrift</strong>
          <span>Velg karakter, få et forslag med begrunnelse</span>
        </a>
        <a className="snarvei" href="#/laer">
          <strong>Lær</strong>
          <span>Forskningen bak, og prosessering av bønnene</span>
        </a>
      </nav>

      <div className="filtre">
        <Filter valg={NIVAER} aktiv={niva} sett={setNiva} tekst={NIVA_TEKST} etikett="Nivå" />
        <Filter valg={MODUSER} aktiv={modus} sett={setModus} tekst={MODUS_TEKST} etikett="Modus" />
        <Filter valg={SMAKER} aktiv={smak} sett={setSmak} tekst={SMAK_TEKST} etikett="Smak" nullTekst="Ingen" />
      </div>

      {smak && !!rangert.length && (
        <section className="gruppe" aria-labelledby="g-smak">
          <h2 id="g-smak" className="gruppe-tittel">
            Mest {SMAK_TEKST[smak].toLowerCase()}
            <span className="gruppe-tall">{rangert.length}</span>
          </h2>
          <div className="rader">
            {rangert.map((o) => <Rad key={o.slug} o={o} fremhev={smak} visNiva />)}
          </div>
        </section>
      )}

      {!smak && NIVAER.map((n) => {
        const liste = synlige.filter((o) => o.niva === n)
        if (!liste.length) return null
        return (
          <section key={n} className="gruppe" aria-labelledby={`g-${n}`}>
            <h2 id={`g-${n}`} className="gruppe-tittel">
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
          <p>
            Ingen oppskrifter er{" "}
            {[niva && NIVA_TEKST[niva].toLowerCase(), modus && MODUS_TEKST[modus].toLowerCase()]
              .filter(Boolean)
              .map((t, i, a) => <span key={t}>{i > 0 && " og "}<strong>{t}</strong></span>)}.
          </p>
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

// Rutene er flate: oversikt, én oppskrift, generatoren, eller lærestoffet.
// Lærestoffet kan dyplenkes til et enkelt kort med #/laer/<kort-id>.
function lesRute(hash) {
  if (hash.startsWith("#/o/")) return { type: "oppskrift", slug: decodeURIComponent(hash.slice(4)) }
  if (hash.startsWith("#/lag")) return { type: "lag" }
  if (hash.startsWith("#/laer")) return { type: "laer", kort: hash.slice(6).replace(/^\//, "") || null }
  return { type: "oversikt" }
}

const TITTEL = { lag: "Lag en oppskrift — brygg.", laer: "Lær — brygg.", oversikt: "brygg." }

export default function App() {
  const hash = useHash()
  const rute = lesRute(hash)
  const valgt = rute.type === "oppskrift" ? oppskrifter.find((o) => o.slug === rute.slug) : null

  useEffect(() => {
    document.title = valgt ? `${valgt.navn} — brygg.` : TITTEL[rute.type] ?? "brygg."
    window.scrollTo(0, 0)
  }, [valgt, hash])

  return (
    <>
      <Bakgrunn />
      <a className="hopp" href="#main">Hopp til innholdet</a>
      <nav className="nav">
        <a className="merke" href="#/" aria-current={rute.type === "oversikt" ? "page" : undefined}>
          brygg<span className="merke-punktum">.</span>
        </a>
      </nav>
      <main id="main">
        {rute.type === "oppskrift" && valgt && <Oppskrift o={valgt} />}
        {rute.type === "oppskrift" && !valgt && <FinnesIkke slug={rute.slug} />}
        {rute.type === "lag" && <Lag />}
        {rute.type === "laer" && <Laer fokus={rute.kort} />}
        {rute.type === "oversikt" && <Oversikt />}
      </main>
    </>
  )
}
