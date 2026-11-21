import { oppskrifter } from "./data"
import { faser, FASE_NAVN, TYPER } from "./faser"

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

// Seksjonen på oppskriftssiden: hvordan fasemodellen leser akkurat denne
// oppskriften, og hva man flytter på for å endre den.
export function FaseVurdering({ o }) {
  const f = faser(o)
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
      <a className="fase-lenke" href="#/faser">Slik leses fasene</a>
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

export default function Faser() {
  const vurdert = oppskrifter.map((o) => ({ o, f: faser(o) }))
  const rekkefolge = Object.keys(TYPER)
  const grupper = rekkefolge
    .map((t) => [t, vurdert.filter((v) => v.f.type === t)])
    .filter(([, liste]) => liste.length)

  return (
    <article className="laer faser">
      <a className="tilbake" href="#/">Alle oppskriftene</a>

      <header className="laer-topp">
        <h1>Tre faser i kjegla</h1>
        <p className="lead">
          I en kjegletrakt som V60 og Switch gir hver helling sin egen del av koppen. Bloomen,
          midten og siste helling trekker ut ulike ting, og forholdet mellom dem bestemmer om
          koppen blir balansert eller intens. Her er modellen, og hva den sier om oppskriftene.
        </p>
        <p className="fase-forbehold">
          <span className="sikkerhet">Erfaring, ikke målt</span>
          Modellen kommer fra én bryggers daglige journalføring, ikke fra et kontrollert forsøk.
          Bruk den som et utgangspunkt å smake etter.
        </p>
      </header>

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

      <p className="kort-kilde fase-kilde">
        Saat Seduh Di Rumah
        <span className="kort-kilde-hvor">«How to control acidity, aroma and sweetness simultaneously with a cone-style dripper»</span>
      </p>
    </article>
  )
}
