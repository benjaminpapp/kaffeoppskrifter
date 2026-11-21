import { oppskrifter, tall } from "./data"
import { faser, bloomvekt, dose, FASE_NAVN, TYPER, BLOOM, DOSER } from "./faser"

const ENKELT = [
  ["Bloom", ["Skarp syre", "Ingen aroma", "Bitter", "Veldig tykk kropp", "Flat avslutning"]],
  ["Midt", ["Sødme", "God tekstur", "God ettersmak", "Lav syre", "Smaken kommer ikke fram"]],
  ["Siste", ["Veldig flat", "Ingen syre", "Som vann med kaffebønner i", "Kraftig aroma på slutten"]],
]

const PAR = [
  ["Bloom + midt", ["Delikat syre", "Tydelig sødme", "God tekstur", "Smaksnotene kommer bedre fram", "Ikke klar", "Rund kropp"]],
  ["Bloom + siste", ["Flat syre", "Søt", "Dempet smak", "Litt intens aroma", "Veldig lett kropp"]],
  ["Midt + siste", ["Et hint av syre", "Sødme", "Aroma som dveler", "Veldig flat foran", "Veldig kraftig bak", "Smaken bare som et hint"]],
]

const EKSEMPLER = [
  {
    navn: "Balansert",
    hva: "Subtil syre, aroma og sødme, balanse i koppen",
    regel: "Bloom < midt = siste",
    rader: [
      [10, 150, [40, 55, 55], "40 – 95 – 150"],
      [15, 225, [50, 87.5, 87.5], "50 – 138 – 225"],
    ],
  },
  {
    navn: "Intens",
    hva: "Intens syre og aroma, sødme som dveler",
    regel: "Bloom = midt < siste",
    rader: [
      [10, 150, [40, 40, 70], "40 – 80 – 150"],
      [15, 225, [50, 50, 125], "50 – 100 – 225"],
    ],
  },
]

const g = (n) => String(n).replace(".", ",")

// Tre segmenter i én stolpe, i rekkefølgen vannet helles. Bredden er andelen
// av totalvannet, så to oppskrifter med ulik dose kan sammenlignes direkte.
export function FaseStolpe({ deler, lukket = [] }) {
  const sum = deler.bloom + deler.midt + deler.siste
  return (
    <div className="fase-stolpe" role="img"
      aria-label={`Bloom ${g(deler.bloom)} g, midt ${g(deler.midt)} g, siste ${g(deler.siste)} g`}>
      {["bloom", "midt", "siste"].map((f) =>
        deler[f] > 0 ? (
          <span key={f} className={`fase-del fase-${f}${lukket.includes(f) ? " fase-lukket" : ""}`}
            style={{ flexGrow: deler[f] / sum }}>
            <span className="fase-del-navn">{FASE_NAVN[f]}</span>
            <span className="fase-del-gram">{g(Math.round(deler[f]))} g</span>
          </span>
        ) : null
      )}
    </div>
  )
}

function LukketMerknad({ lukket }) {
  if (!lukket.length) return null
  const hvilke = lukket.map((f) => FASE_NAVN[f].toLowerCase()).join(" og ")
  return (
    <p className="fase-merknad">
      Switchen står lukket i {lukket.length > 1 ? "fasene" : "fasen"} <strong>{hvilke}</strong> (skravert).
      Modellen er laget for perkolering, så den delen blir mer som immersion: rundere og
      mindre lagdelt enn modellen tilsier.
    </p>
  )
}

// Seksjonen på oppskriftssiden: hvordan modellene leser akkurat denne
// oppskriften, og hva man flytter på for å endre den. Får den skalerte
// oppskriften, så dosen følger porsjonstelleren.
export function FaseVurdering({ o }) {
  const f = faser(o)
  const b = bloomvekt(o, f)
  const d = dose(o)
  return (
    <section className="fase-vurdering" aria-labelledby="fase-tittel">
      <div className="fase-hode">
        <h2 id="fase-tittel" className="stempel">Fasene</h2>
        <span className="fase-type">{f.navn}</span>
      </div>
      {f.deler && <FaseStolpe deler={f.deler} lukket={f.lukket} />}
      <p className="fase-smak">{f.smak}</p>
      <LukketMerknad lukket={f.lukket} />
      {f.juster && <p className="fase-juster"><span className="stempel">Juster</span> {f.juster}</p>}

      <dl className="fase-tillegg">
        {b && (
          <div>
            <dt>Bloomvekt <strong>{b.navn}</strong></dt>
            <dd>
              {g(Math.round(f.deler.bloom))} g vann på {tall(o.kaffe)} g kaffe
              ({tall(b.ganger.toFixed(1))}x). {b.kort}
            </dd>
          </div>
        )}
        <div>
          <dt>Dose <strong>{tall(d.gram)} g</strong></dt>
          <dd>I klassen {d.navn.toLowerCase()}, {d.bruk.toLowerCase()}. {d.kort}</dd>
        </div>
      </dl>

      <p className="fase-lenker">
        <a className="fase-lenke" href="#/faser">Slik leses fasene</a>
        <a className="fase-lenke" href="#/faser/surt">Smaker det for surt?</a>
      </p>
    </section>
  )
}

function Liste({ tittel, punkter }) {
  return (
    <div className="fase-kolonne">
      <h3>{tittel}</h3>
      <ul>{punkter.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>
  )
}

const FANER = [
  ["faser", "Faser"],
  ["bloom", "Bloomvekt"],
  ["dose", "Dose"],
  ["surt", "For surt"],
]

// Én rad per oppskrift: navnet til venstre, det modellen leser til høyre.
function OppskriftListe({ rader }) {
  return (
    <ul className="fase-rader">
      {rader.map(({ o, hoyre }) => (
        <li key={o.slug}>
          <a href={`#/o/${o.slug}`} className="fase-rad">
            <span className="fase-rad-navn">{o.navn}</span>
            {hoyre}
          </a>
        </li>
      ))}
    </ul>
  )
}

function Gruppe({ navn, regel, smak, rader }) {
  return (
    <div className="fase-gruppe">
      <div className="fase-gruppe-hode">
        <h3>{navn}</h3>
        {regel && <span className="fase-regel">{regel}</span>}
        <span className="gruppe-tall">{rader.length}</span>
      </div>
      {smak && <p className="fase-gruppe-smak">{smak}</p>}
      <OppskriftListe rader={rader} />
    </div>
  )
}

function Tips({ punkter }) {
  return (
    <div className="kort-praksis fase-tips">
      <span className="stempel">Tips</span>
      <ul>{punkter.map(([naar, hva]) => <li key={naar}><strong>{naar}:</strong> {hva}</li>)}</ul>
    </div>
  )
}

function FaneFaser() {
  const vurdert = oppskrifter.map((o) => ({ o, f: faser(o) }))
  const grupper = Object.keys(TYPER)
    .map((t) => [t, vurdert.filter((v) => v.f.type === t)])
    .filter(([, liste]) => liste.length)

  return (
    <>
      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Hver fase alene</h2>
        <p className="fase-ingress">Slik smaker hver fase hvis du samler den opp for seg.</p>
        <div className="fase-kolonner">
          {ENKELT.map(([t, p]) => <Liste key={t} tittel={t} punkter={p} />)}
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">To faser sammen</h2>
        <div className="fase-kolonner">
          {PAR.map(([t, p]) => <Liste key={t} tittel={t} punkter={p} />)}
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Alle tre</h2>
        <p className="fase-alle">
          Smaken kommer tydelig fram, og tekstur, lag, sødme og aroma blir komplette. Den
          fruktige og blomstrete karakteren i kaffen kommer godt fram. Kjegla gir mer klarhet,
          syre og intens aroma enn en flatbunnet trakt.
        </p>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Slik styrer du det</h2>
        <p className="fase-ingress">
          Ratioen står fast på 1:15. Det er fordelingen av vannet mellom fasene som flyttes.
          Bloomen ligger på 40–50 g i begge eksemplene.
        </p>
        <div className="fase-eksempler">
          {EKSEMPLER.map((e) => (
            <div key={e.navn} className="kort fase-eksempel">
              <header className="kort-topp">
                <h3>{e.navn}</h3>
                <span className="fase-regel">{e.regel}</span>
              </header>
              <p className="kort-hva">{e.hva}.</p>
              {e.rader.map(([dose, vann, [b, m, l], oppskrift]) => (
                <div key={dose} className="fase-eksempel-rad">
                  <div className="fase-eksempel-topp">
                    <span>{dose} g kaffe · {vann} g vann</span>
                    <strong>{oppskrift}</strong>
                  </div>
                  <FaseStolpe deler={{ bloom: b, midt: m, siste: l }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="kort-praksis fase-fire">
          <span className="stempel">Fire faser</span>
          <p>
            Vil du helle fire ganger, del midtfasen i to. Den samlede midtfasen er like stor som
            før: <strong>50 – (75 – 100) – 225</strong> er det intense eksempelet med midten
            fordelt på to hellinger. Det samme gjelder fem hellinger. Alt mellom bloomen og siste
            helling regnes som midt.
          </p>
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Oppskriftene, lest med modellen</h2>
        <p className="fase-ingress">
          Bloom er første helling, siste er siste helling, og alt imellom er midt. To faser regnes
          som like når de er innenfor 20 % av hverandre. Skraverte faser helles med lukket Switch.
        </p>
        {grupper.map(([type, liste]) => (
          <div key={type} className="fase-gruppe">
            <div className="fase-gruppe-hode">
              <h3>{TYPER[type].navn}</h3>
              <span className="fase-regel">{TYPER[type].regel}</span>
              <span className="gruppe-tall">{liste.length}</span>
            </div>
            <p className="fase-gruppe-smak">{TYPER[type].smak}</p>
            <ul className="fase-rader">
              {liste.map(({ o, f }) => (
                <li key={o.slug}>
                  <a href={`#/o/${o.slug}`} className="fase-rad">
                    <span className="fase-rad-navn">{o.navn}</span>
                    {f.deler ? <FaseStolpe deler={f.deler} lukket={f.lukket} /> : <span className="fase-rad-tom">Lukket hele veien</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="laer-fot">
          De fleste oppskriftene med mange hellinger havner som midtvektet. Det følger av
          modellen: tre like hellinger i midten blir én stor midtfase. Vil du kjenne
          forskjellen, brygg Matt Winton (fast tid) én gang som oppskriften sier, og én gang
          der de tre siste hellingene slås sammen til én helling fra 120 g til 300 g. Da går den
          fra midtvektet til intens.
        </p>
      </section>

    </>
  )
}

function FaneBloom() {
  const rader = oppskrifter
    .map((o) => ({ o, b: bloomvekt(o) }))
    .filter(({ b }) => b)
  const grupper = [2, 3, 4, 5]
    .map((t) => [t, rader.filter(({ b }) => b.trinn === t)])
    .filter(([, l]) => l.length)

  return (
    <>
      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Bloomvekt</h2>
        <p className="fase-ingress">
          Hvor mye vann bloomen får, målt i ganger kaffedosen. 15 g kaffe med 2x bloom er
          30 g vann, med 4x er det 60 g. «Lukt» er hvordan den våte kaffegruten lukter.
        </p>
        <div className="fase-kolonner">
          {Object.values(BLOOM).map((b) => (
            <div key={b.navn} className="fase-kolonne">
              <h3>{b.navn}</h3>
              <p className="fase-lukt"><span className="stempel">Lukt</span> {b.lukt}</p>
              <ul>{b.punkter.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Konklusjon</h2>
        <p className="fase-alle">
          Jo større bloom, desto klarere syre, mer intens aroma, mer komplekse lag og tydeligere
          smak. Jo mindre bloom, desto mer subtil syre, rundere kropp og søtere ettersmak, men
          smaken blir mindre tydelig og aromaen svakere.
        </p>
        <Tips punkter={Object.values(BLOOM).map((b) => [b.bruk, `bruk ${b.navn} bloom.`])} />
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Oppskriftene, lest med bloomvekten</h2>
        <p className="fase-ingress">
          Bloomen er første helling delt på kaffedosen, rundet til nærmeste hele. Oppskrifter med
          lukket Switch hele veien er ikke med, siden bloomen der ikke renner ut for seg.
        </p>
        {grupper.map(([t, liste]) => (
          <Gruppe
            key={t}
            navn={t === 5 ? "Over 4x" : BLOOM[t].navn}
            smak={t === 5 ? liste[0].b.kort : BLOOM[t].kort}
            rader={liste.map(({ o, b }) => ({
              o,
              hoyre: (
                <span className="fase-rad-tall">
                  {g(Math.round(b.ganger * o.kaffe))} g på {tall(o.kaffe)} g
                  <strong>{tall(b.ganger.toFixed(1))}x</strong>
                </span>
              ),
            }))}
          />
        ))}
      </section>
    </>
  )
}

function FaneDose() {
  const rader = oppskrifter.map((o) => ({ o, d: dose(o) }))
  const grupper = [10, 12.5, 15]
    .map((k) => [k, rader.filter(({ d }) => d.klasse === k)])
    .filter(([, l]) => l.length)

  return (
    <>
      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Dose</h2>
        <p className="fase-ingress">
          Samme ratio, tre størrelser på dosen. Det er bare mengden kaffe og vann som endres.
        </p>
        <div className="fase-kolonner">
          {Object.values(DOSER).map((d) => (
            <div key={d.navn} className="fase-kolonne">
              <h3>{d.navn}</h3>
              <p className="fase-bruk">{d.bruk}</p>
              <p className="fase-lukt"><span className="stempel">Lukt</span> {d.lukt}</p>
              <ul>{d.punkter.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Konklusjon</h2>
        <p className="fase-alle">
          En liten dose gir klarere syre, mer intens aroma, mer komplekse lag og sterkere smak.
          En stor dose gir mer subtil syre, rundere kropp, mer sødme og lengre ettersmak, men
          smaken blir mindre tydelig.
        </p>
        <p className="fase-merknad">
          Forklaringen hans er temperatur: lite vann kjøles fortere ned i hver fase, mens en stor
          dose holder varmen lenger fordi det er mer varmt vann. Det er hans tolkning, ikke målt.
        </p>
        <Tips punkter={[
          ["Når du vil ha en kopp å nyte, til arbeid eller avslapning", "bruk 15 g eller mer. Det gir en søt og balansert kopp."],
          ["Når du vil utforske hva kaffen kan", "bruk 12,5 g. Det gir et bredere spekter, og smaken kommer tydelig fram."],
          ["Når du vil vurdere detaljer som aroma, brenningsgrad og om bryggingen er godt utviklet", "bruk 10 g."],
        ]} />
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Oppskriftene, lest med dosen</h2>
        <p className="fase-ingress">
          Alle oppskriftene her bruker 14 g eller mer, så de havner i hverdagsklassen. Vil du
          prøve en mindre dose, bruk porsjonstelleren eller skaler ned selv, og hold ratioen.
        </p>
        {grupper.map(([k, liste]) => (
          <Gruppe
            key={k}
            navn={DOSER[k].navn}
            regel={DOSER[k].bruk}
            smak={DOSER[k].kort}
            rader={liste.map(({ o }) => ({
              o,
              hoyre: <span className="fase-rad-tall"><strong>{tall(o.kaffe)} g</strong></span>,
            }))}
          />
        ))}
      </section>
    </>
  )
}

const SURE_TYPER = [
  {
    navn: "Underekstrahert",
    kjenne: "Skarp, limeaktig syre, litt bitter, og gjerne en grønnsaks-, nøtte- eller treaktig smak.",
  },
  {
    navn: "Overekstrahert",
    kjenne: "Syrlig med en tydelig tørr smak og litt røyk i ettersmaken.",
  },
  {
    navn: "Som brus",
    kjenne: "En brusaktig syrlighet. Skjer særlig med nybrent kaffe som trenger mer hvile.",
  },
]

const SURE_TILTAK = [
  ["Skarp og limeaktig, med grønnsak, nøtt eller tre",
    "Bruk høyere temperatur enn sist, 92–94 °C. Det er underekstraksjon, og skjer ofte med vaskede kaffer."],
  ["Skarp syre med litt bitterhet bak",
    "Mal finere enn sist. Koppen er for aromatisk og kompleks. Eller gå over til tre faser med 2–3x bloom, så de åpne lagene temmes og koppen blir mer balansert."],
  ["For sur med røykaroma",
    "Mal grovere og bruk kortere ratio, altså mindre vann per gram kaffe. Det tyder på litt overekstraksjon."],
  ["For syrlig og tørr",
    "Mal grovere og bruk lengre ratio, eller bruk tre faser med 91–92 °C. Også det tyder på litt overekstraksjon."],
  ["Sur med brusaktig smak",
    "Vent og la bønnene hvile lenger. Det ligner underekstraksjon, men er hardere. Tørre bønner lukter litt brusende når posen åpnes."],
]

function FaneSurt() {
  return (
    <>
      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Finn ut hvilken syre det er</h2>
        <p className="fase-ingress">
          For mye syre kan ha flere årsaker, særlig i en kjegletrakt. Før du justerer noe, finn ut
          hva slags syre det er. De krever motsatte tiltak.
        </p>
        <div className="fase-kolonner">
          {SURE_TYPER.map((t) => (
            <div key={t.navn} className="fase-kolonne">
              <h3>{t.navn}</h3>
              <p className="fase-kjenne">{t.kjenne}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fase-seksjon">
        <h2 className="gruppe-tittel">Hva du gjør</h2>
        <dl className="sure-tiltak">
          {SURE_TILTAK.map(([smak, tiltak]) => (
            <div key={smak} className="kort">
              <dt>{smak}</dt>
              <dd>{tiltak}</dd>
            </div>
          ))}
        </dl>
        <p className="laer-fot">
          Rådene her er erfaringsbaserte. Kontrollerte forsøk, omtalt under <a className="fase-lenke" href="#/laer/temperatur">Lær</a>,
          fant at temperatur betyr lite i seg selv når ekstraksjonen er lik, og at <a className="fase-lenke" href="#/laer/bitterhet">bitterhet
          følger styrken</a> mer enn ekstraksjonen. Temperaturrådet virker altså gjennom ekstraksjonen,
          og er bitterheten problemet, er mer vann per gram kaffe den sikreste spaken.
        </p>
      </section>
    </>
  )
}

const FANE_INNHOLD = { faser: FaneFaser, bloom: FaneBloom, dose: FaneDose, surt: FaneSurt }

export default function Faser({ fane }) {
  const aktiv = FANE_INNHOLD[fane] ? fane : "faser"
  const Innhold = FANE_INNHOLD[aktiv]

  return (
    <article className="laer faser">
      <a className="tilbake" href="#/">Alle oppskriftene</a>

      <header className="laer-topp">
        <h1>Kjegla</h1>
        <p className="lead">
          Fire spaker i en kjegletrakt som V60 og Switch: hvordan vannet fordeles mellom
          hellingene, hvor stor bloomen er, hvor stor dosen er, og hva du gjør når koppen blir for
          sur. Hver del viser også hva den sier om oppskriftene her.
        </p>
        <p className="fase-forbehold">
          <span className="sikkerhet">Erfaring, ikke målt</span>
          Alt her kommer fra én bryggers daglige journalføring, ikke fra kontrollerte forsøk.
          Bruk det som et utgangspunkt å smake etter.
        </p>
      </header>

      <nav className="filtre laer-filtre" aria-label="Tema">
        <span className="stempel filter-etikett">Tema</span>
        <div className="filter-valg">
          {FANER.map(([id, navn]) => (
            <a
              key={id}
              href={id === "faser" ? "#/faser" : `#/faser/${id}`}
              className={`bryter ${aktiv === id ? "on" : ""}`}
              aria-current={aktiv === id ? "page" : undefined}
            >
              {navn}
            </a>
          ))}
        </div>
      </nav>

      <Innhold />

      <p className="kort-kilde fase-kilde">
        <a href="https://www.instagram.com/saatseduhdirumah/" target="_blank" rel="noreferrer noopener">
          Saat Seduh Di Rumah
        </a>
        <span className="kort-kilde-hvor">«Basic Brewing – Cone Series», Instagram, 2025–2026</span>
      </p>
    </article>
  )
}
