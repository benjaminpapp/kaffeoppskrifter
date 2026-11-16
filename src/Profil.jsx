import { useEffect, useMemo, useRef, useState } from "react"
import { profil, mmss, tall } from "./data"

const PAD = { topp: 18, hoyre: 52, bunn: 30, venstre: 46 }
const PLOT = 150

// Hellekurve: totalvekt på vekta mot tid. Én serie, så ingen legend —
// tittelen navngir den. Hver verdi står også i stegllista under, så
// tooltipen utvider og er aldri eneste vei til tallet.
export default function Profil({ o }) {
  const boks = useRef(null)
  const [bredde, setBredde] = useState(0)
  const [aktiv, setAktiv] = useState(null)

  useEffect(() => {
    const el = boks.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([e]) => setBredde(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pkt = useMemo(() => profil(o), [o])
  const hellinger = useMemo(() => pkt.filter((p) => p.helling), [pkt])

  const tmax = Math.max(...pkt.map((p) => p.t), 1)
  const vmax = Math.max(...pkt.map((p) => p.vekt), 1)
  const hoyde = PLOT + PAD.topp + PAD.bunn
  const pw = Math.max(bredde - PAD.venstre - PAD.hoyre, 10)

  const X = (t) => PAD.venstre + (t / tmax) * pw
  const Y = (v) => PAD.topp + PLOT - (v / vmax) * PLOT

  // Trappeform: vekta hopper ved hellingen og står stille til neste.
  const { linje, flate } = useMemo(() => {
    let d = `M ${X(0)} ${Y(0)}`
    let forrige = 0
    for (const p of pkt) {
      d += ` L ${X(p.t)} ${Y(forrige)} L ${X(p.t)} ${Y(p.vekt)}`
      forrige = p.vekt
    }
    d += ` L ${X(tmax)} ${Y(forrige)}`
    return { linje: d, flate: `${d} L ${X(tmax)} ${Y(0)} Z` }
  }, [pkt, bredde, tmax, vmax])

  // X-merker: hellingene pluss slutttidspunktet, så høyre halvdel ikke står
  // umerket når brygget ender med trekk i stedet for en helling. Merker som
  // ikke får plass dropper ut, ellers kolliderer tidene på mobil — men det
  // siste beholdes alltid, siden det er der brygget er ferdig.
  const merker = useMemo(() => {
    const kandidater = [...hellinger]
    const slutt = pkt[pkt.length - 1]
    if (slutt && !kandidater.some((p) => p.t === slutt.t)) kandidater.push(slutt)

    const ut = []
    for (const p of kandidater) {
      if (ut.length && X(p.t) - X(ut[ut.length - 1].t) < 44) {
        if (p !== kandidater[kandidater.length - 1]) continue
        ut.pop()
      }
      ut.push(p)
    }
    return ut
  }, [hellinger, pkt, bredde, tmax])

  const yMerker = [0, Math.round(vmax / 2 / 10) * 10, vmax].filter((v, i, a) => a.indexOf(v) === i)

  const fraPeker = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - r.left - PAD.venstre) / pw) * tmax
    let naermest = 0
    pkt.forEach((p, i) => { if (Math.abs(p.t - t) < Math.abs(pkt[naermest].t - t)) naermest = i })
    setAktiv(naermest)
  }

  const tast = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const steg = e.key === "ArrowRight" ? 1 : -1
    setAktiv((a) => Math.min(pkt.length - 1, Math.max(0, (a === null ? 0 : a + steg))))
  }

  const a = aktiv === null ? null : pkt[aktiv]
  // Uten peker viser avlesningen sluttilstanden, så linjen aldri står tom.
  const les = a ?? pkt[pkt.length - 1]
  const sammendrag = `Hellekurve for ${o.navn}: ${hellinger.length} hellinger opp til ${o.vann} gram vann, fra 0:00 til ${pkt[pkt.length - 1]?.tid}.`

  return (
    <figure className="profil" ref={boks}>
      <figcaption>
        <span className="profil-akse">Totalvekt mot tid</span>
      </figcaption>

      {bredde > 0 && (
        <div className="profil-plott">
          <svg
            width={bredde} height={hoyde} role="img" aria-label={sammendrag}
            tabIndex={0} onKeyDown={tast}
            onPointerDown={fraPeker} onPointerMove={fraPeker} onPointerLeave={() => setAktiv(null)}
            onFocus={() => setAktiv((v) => (v === null ? 0 : v))} onBlur={() => setAktiv(null)}
          >
            {yMerker.map((v) => (
              <g key={v}>
                <line className="rutenett" x1={PAD.venstre} x2={PAD.venstre + pw} y1={Y(v)} y2={Y(v)} />
                <text className="akse-tall" x={PAD.venstre - 9} y={Y(v)} dy="0.32em" textAnchor="end">{v}</text>
              </g>
            ))}

            <path className="profil-flate" d={flate} />
            <path className="profil-linje" d={linje} />

            {hellinger.map((p) => (
              <circle key={p.t} className="profil-punkt" cx={X(p.t)} cy={Y(p.vekt)} r="4.5" />
            ))}

            <text className="profil-slutt" x={X(tmax) + 8} y={Y(vmax)} dy="0.32em">{o.vann} g</text>

            {merker.map((p) => (
              <text key={p.t} className="akse-tall" x={X(p.t)} y={hoyde - 9} textAnchor="middle">{p.tid}</text>
            ))}

            {a && (
              <g className="profil-kryss">
                <line x1={X(a.t)} x2={X(a.t)} y1={PAD.topp} y2={PAD.topp + PLOT} />
                <circle cx={X(a.t)} cy={Y(a.vekt)} r="6.5" />
              </g>
            )}
          </svg>

        </div>
      )}

      {/* Fast avlesning under kurven i stedet for en flytende tooltip: den
          kolliderer ikke med endepunkt-etiketten, hopper ikke i layouten,
          og virker på touch der det ikke finnes hover. */}
      <div className="profil-avlesning" role="status">
        <strong>{les.ca ? "ca. " : ""}{les.tid}</strong>
        <span className="profil-les-vekt">{tall(les.vekt)} g</span>
        <span className="profil-les-tekst">{les.tekst.replace(/\*\*/g, "")}</span>
      </div>
      {bredde === 0 && <div className="profil-plott" style={{ height: `${hoyde}px` }} />}
    </figure>
  )
}
