import { useMemo, useState } from "react"
import { lagOppskrift, AKSER, MAAL_STANDARD } from "./generator"
import Oppskrift from "./Oppskrift"

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
  const forslag = useMemo(() => lagOppskrift(maal, 1), [maal])
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
        {AKSER.map(([k, navn, hint]) => (
          <Skala
            key={k}
            id={k}
            navn={navn}
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
    </article>
  )
}
