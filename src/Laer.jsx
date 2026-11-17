import { useEffect, useRef, useState } from "react"
import { BRYGGING, PROSESSERING, SIKKERHET } from "./kunnskap"

const TEMA = [
  ["brygging", "Brygging", BRYGGING],
  ["prosessering", "Prosessering", PROSESSERING],
]

function Kort({ k, tema }) {
  const s = SIKKERHET[k.sikkerhet]
  return (
    <article className="kort" id={k.id}>
      <header className="kort-topp">
        <h3>{k.tittel}</h3>
        <span className={`sikkerhet sikkerhet-${k.sikkerhet}`} title="Hvor sterkt står påstanden">
          {s.navn}
        </span>
      </header>

      {k.engelsk && <p className="kort-engelsk">{k.engelsk}</p>}

      <p className="kort-hva">{k.hva}</p>

      {(k.praksis || k.kopp) && (
        <div className="kort-praksis">
          <span className="stempel">{tema === "brygging" ? "Ved vekta" : "I koppen"}</span>
          <p>{k.praksis || k.kopp}</p>
        </div>
      )}

      {k.kilde && (
        <p className="kort-kilde">
          {k.kilde.url ? (
            <a href={k.kilde.url} target="_blank" rel="noreferrer noopener">
              {k.kilde.navn}
            </a>
          ) : (
            k.kilde.navn
          )}
          <span className="kort-kilde-hvor">{k.kilde.hvor}, {k.kilde.aar}</span>
        </p>
      )}
    </article>
  )
}

// fokus kommer fra #/laer/<kort-id>. Temaet velges ut fra hvilken liste
// kortet ligger i, og kortet rulles fram og markeres.
export default function Laer({ fokus = null }) {
  const temaFor = (id) => TEMA.find(([, , liste]) => liste.some((k) => k.id === id))?.[0]
  const [tema, setTema] = useState(() => (fokus && temaFor(fokus)) || "brygging")
  const kort = TEMA.find(([id]) => id === tema)?.[2] ?? BRYGGING
  const rullet = useRef(null)

  useEffect(() => {
    if (!fokus || rullet.current === fokus) return
    const el = document.getElementById(fokus)
    if (!el) return
    rullet.current = fokus
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    el.classList.add("kort-fokus")
    const t = setTimeout(() => el.classList.remove("kort-fokus"), 2200)
    return () => clearTimeout(t)
  }, [fokus, tema])

  return (
    <article className="laer">
      <a className="tilbake" href="#/">Alle oppskriftene</a>

      <header className="laer-topp">
        <h1>Lær</h1>
        <p className="lead">
          Grunnlaget bak oppskriftene og generatoren. Hvert kort sier hvor sterkt påstanden står,
          så du ser forskjell på et kontrollert forsøk og en mekanisme ingen har målt smaken av.
        </p>
      </header>

      <div className="filtre laer-filtre">
        <span className="stempel filter-etikett">Tema</span>
        <div className="filter-valg" role="group" aria-label="Tema">
          {TEMA.map(([id, navn, liste]) => (
            <button
              key={id}
              className={`bryter ${tema === id ? "on" : ""}`}
              onClick={() => setTema(id)}
              aria-pressed={tema === id}
            >
              {navn} <span className="gruppe-tall">{liste.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="kort-liste">
        {kort.map((k) => <Kort key={k.id} k={k} tema={tema} />)}
      </div>

      {tema === "brygging" && (
        <p className="laer-fot">
          Der forskningen og det vanlige rådet er uenige, følger denne siden forskningen.
          To steder gjelder det: temperatur betyr lite i seg selv, og bitterhet kommer fra
          styrke og ikke fra overekstraksjon.
        </p>
      )}
    </article>
  )
}
