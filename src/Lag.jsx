import { useMemo, useState } from "react"
import { lagOppskrift, tilYaml, tilSlug, AKSER, MAAL_STANDARD } from "./generator"
import Oppskrift from "./Oppskrift"

// Forslaget blir en permanent oppskrift ved å legge YAML-en i oppskrifter/.
// Utklippstavla krever sikker kontekst, så teksten vises også i et felt man
// kan merke selv om kopieringen blir avvist.
function Behold({ forslag, navn, settNavn, maal }) {
  const [vist, settVist] = useState(false)
  const [kopiert, settKopiert] = useState(false)
  const yaml = useMemo(() => tilYaml(forslag, navn.trim() || "Ny oppskrift", maal), [forslag, navn, maal])
  const fil = `oppskrifter/${tilSlug(navn.trim() || "ny oppskrift")}.yml`

  const kopier = async () => {
    try {
      await navigator.clipboard.writeText(yaml)
      settKopiert(true)
      setTimeout(() => settKopiert(false), 2500)
    } catch {
      settVist(true)
    }
  }

  return (
    <section className="behold" aria-label="Behold oppskriften">
      <span className="stempel">Behold den</span>
      <p className="behold-hjelp">
        Lagre forslaget som en vanlig oppskrift ved å legge YAML-en i en fil og kjøre{" "}
        <code>npm run publiser</code>.
      </p>

      <div className="behold-rad">
        <label className="behold-navn">
          <span className="stempel">Navn</span>
          <input
            type="text"
            value={navn}
            onChange={(e) => settNavn(e.target.value)}
            placeholder="Ny oppskrift"
            spellCheck="false"
          />
        </label>
        <code className="behold-fil">{fil}</code>
      </div>

      <div className="behold-knapper">
        <button className="knapp" onClick={kopier}>{kopiert ? "Kopiert" : "Kopier som YAML"}</button>
        <button className="bryter" onClick={() => settVist((v) => !v)}>
          {vist ? "Skjul teksten" : "Vis teksten"}
        </button>
      </div>

      {vist && <textarea className="behold-tekst" readOnly value={yaml} rows={Math.min(26, yaml.split("\n").length)} />}
    </section>
  )
}

function Skala({ id, navn, hint, verdi, sett }) {
  return (
    <div className="skala">
      <label className="skala-navn" htmlFor={`s-${id}`}>
        {navn}
        <span className="skala-hint">{hint}</span>
      </label>
      <div className="skala-knapper" role="group" aria-label={navn}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            id={n === 1 ? `s-${id}` : undefined}
            className={`skala-knapp ${n === verdi ? "on" : ""}`}
            onClick={() => sett(n)}
            aria-pressed={n === verdi}
            aria-label={`${navn} ${n} av 5`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Lag() {
  const [maal, setMaal] = useState(MAAL_STANDARD)
  const [navn, settNavn] = useState("")
  const grunn = useMemo(() => lagOppskrift(maal, 1), [maal])
  const forslag = useMemo(
    () => (navn.trim() ? { ...grunn, navn: navn.trim() } : grunn),
    [grunn, navn]
  )
  const endret = AKSER.some(([k]) => maal[k] !== MAAL_STANDARD[k])

  return (
    <article className="lag">
      <a className="tilbake" href="#/">Alle oppskriftene</a>

      <header className="lag-topp">
        <h1>Lag en oppskrift</h1>
        <p className="lead">
          Velg hva du vil ha i koppen. Forslaget settes sammen av forskning og av de
          fjorten oppskriftene her, og hver avgjørelse sier hvorfor.
        </p>
      </header>

      <div className="skalaer">
        {AKSER.map(([k, tittel, hint]) => (
          <Skala
            key={k}
            id={k}
            navn={tittel}
            hint={hint}
            verdi={maal[k]}
            sett={(n) => setMaal((m) => ({ ...m, [k]: n }))}
          />
        ))}
        {endret && (
          <button className="bryter lag-nullstill" onClick={() => setMaal(MAAL_STANDARD)}>
            Tilbake til utgangspunktet
          </button>
        )}
      </div>

      {forslag.konflikt && (
        <p className="advarsel" role="status">{forslag.konflikt}</p>
      )}

      <section className="begrunnelser" aria-label="Begrunnelser">
        <span className="stempel">Hvorfor</span>
        <dl>
          {forslag.begrunnelser.map((b) => (
            <div key={b.felt} className="begrunnelse">
              <dt>
                {b.felt}
                <strong>{b.verdi}</strong>
              </dt>
              <dd>
                {b.hvorfor}{" "}
                <a className="begrunnelse-kilde" href={`#/laer/${b.kort}`}>Les grunnlaget</a>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Oppskrift o={forslag} visTilbake={false} />

      <Behold forslag={forslag} navn={navn} settNavn={settNavn} maal={maal} />
    </article>
  )
}
