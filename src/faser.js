// Fasemodellen for kjegletrakter, etter Saat Seduh Di Rumah.
//
// Bryggingen deles i tre: bloom (første helling), midt (alt mellom) og siste
// helling. Hver fase gir sin del av koppen, og forholdet mellom dem avgjør
// hvordan syre, aroma og sødme balanserer. Modellen bygger på én bryggers
// journalføring, ikke på målinger, og den er laget for perkolering: står
// Switchen lukket gjennom en fase, blandes vannet før det renner ut.

// Vannmassen står i stegteksten som **250 g** (samme regel som i data.js).
const masse = (tekst) => {
  const m = String(tekst).match(/\*\*\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*g\s*\*\*/)
  return m ? Number((m[2] ?? m[1]).replace(",", ".")) : null
}

// Switchens tilstand leses også av teksten: **lukket** / **Lukk** og
// **åpen** / **Åpne**. Endringen gjelder fra og med steget den står i, så
// «Lukk Switch, hell opp til 200 g» regnes som en lukket helling.
const lukkes = (t) => /\*\*\s*lukk(et)?\s*\*\*/iu.test(t)
const aapnes = (t) => /\*\*\s*(åpen|åpne)\s*\*\*/iu.test(t)

// To faser regnes som like når de er innenfor 20 % av hverandre. Eksemplene
// i kilden (40–55–55 og 50–87,5–87,5) har bloomen 27–43 % under midten,
// så grensen skiller «like» fra «mindre» der kilden selv gjør det.
const LIK = 0.2
const lik = (a, b) => Math.abs(a - b) <= LIK * Math.max(a, b)

export const FASE_NAVN = { bloom: "Bloom", midt: "Midt", siste: "Siste" }

export const TYPER = {
  balansert: {
    navn: "Balansert",
    regel: "Bloom < midt = siste",
    smak: `Subtil syre, aroma og sødme i balanse. Bloomen gir litt syre, midten gir
      sødme og tekstur, og siste helling gir aromaen, uten at noen av dem tar over.`,
    juster: `Vil du ha mer aroma og en sødme som dveler, flytt vann fra midten til
      siste helling.`,
  },
  intens: {
    navn: "Intens",
    regel: "Bloom = midt < siste",
    smak: `Intens syre og aroma, og en sødme som henger igjen. Siste helling er størst
      og gir den kraftige aromaen bak i koppen. Midten er liten, så kroppen blir lettere.`,
    juster: `Vil du ha en rundere og mer balansert kopp, flytt vann fra siste helling
      til midten.`,
  },
  midtvektet: {
    navn: "Midtvektet",
    regel: "Midt > siste",
    smak: `Sødme og tekstur foran, med dempet syre og rund kropp. Smaksnotene kommer
      fram, men koppen blir mindre klar. Den lille siste hellingen gir bare et hint av
      aroma.`,
    juster: `Vil du ha mer aroma og klarhet, gjør siste helling større, for eksempel ved
      å slå sammen de to siste hellingene.`,
  },
  "bloom-siste": {
    navn: "Bloom + siste",
    regel: "Ingen midtfase",
    smak: `Søt, men med flat syre og dempet smak. Aromaen er litt intens, og kroppen er
      veldig lett, siden det ikke er noen midtfase som gir tekstur.`,
    juster: `Del den siste hellingen i to, slik at det blir en midtfase. Det gir mer
      sødme, tekstur og tydeligere smak.`,
  },
  bloomtung: {
    navn: "Bloomtung",
    regel: "Bloom > midt og siste",
    smak: `Skarp syre og tykk kropp, med fare for bitterhet og en flat avslutning.
      Bloomen tar for stor del av vannet.`,
    juster: `Gjør bloomen mindre og legg vannet til midten eller siste helling.`,
  },
  jevn: {
    navn: "Jevn",
    regel: "Bloom = midt = siste",
    smak: `Alle tre fasene er med, så koppen blir komplett, men syren blir litt
      skarpere enn i en balansert kopp, siden bloomen er like stor som resten.`,
    juster: `Gjør bloomen litt mindre for en rundere kopp.`,
  },
  immersion: {
    navn: "Gjelder ikke",
    regel: "Lukket gjennom hele bryggingen",
    smak: `Alt vannet står sammen med kaffen før noe renner ut, så det finnes ingen
      faser å skille. Smaken styres av malegrad, tid og temperatur i stedet.`,
    juster: null,
  },
}

export function faser(o) {
  let lukket = o.modus === "lukket"
  let forrige = 0
  const hellinger = []
  for (const s of o.steg) {
    if (lukkes(s.tekst)) lukket = true
    if (aapnes(s.tekst)) lukket = false
    const v = masse(s.tekst)
    if (v !== null && v > forrige) {
      hellinger.push({ gram: v - forrige, lukket })
      forrige = v
    }
  }

  if (o.modus === "lukket" || hellinger.length < 2) {
    return { type: "immersion", ...TYPER.immersion, deler: null, lukket: [] }
  }

  const forste = hellinger[0]
  const siste = hellinger.at(-1)
  const midten = hellinger.slice(1, -1)
  const b = forste.gram
  const m = midten.reduce((sum, h) => sum + h.gram, 0)
  const l = siste.gram

  let type
  if (m === 0) type = "bloom-siste"
  else if (lik(b, m) && lik(m, l)) type = "jevn"
  else if (b > m && b > l) type = "bloomtung"
  else if (lik(m, l)) type = "balansert"
  else if (l > m) type = "intens"
  else type = "midtvektet"

  // Faser der Switchen står lukket (ikke bloomen; en lukket bloom er vanlig
  // og endrer lite på modellen).
  const lukketFaser = [
    midten.some((h) => h.lukket) && "midt",
    siste.lukket && "siste",
  ].filter(Boolean)

  return {
    type,
    ...TYPER[type],
    deler: { bloom: b, midt: m, siste: l },
    hellingerIMidten: midten.length,
    lukket: lukketFaser,
  }
}
