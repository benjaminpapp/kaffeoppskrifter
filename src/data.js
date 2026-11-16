import { parse } from "yaml"

// Alle oppskrifter leses fra oppskrifter/*.yml ved bygging.
// Filer som starter med "_" (utstyr, mal) er ikke oppskrifter.
const filer = import.meta.glob("../oppskrifter/*.yml", { query: "?raw", import: "default", eager: true })

export const NIVAER = ["lett", "middels", "avansert"]
export const MODUSER = ["åpen", "lukket", "hybrid"]

const navnFraSti = (sti) => sti.split("/").pop().replace(/\.yml$/, "")

export const oppskrifter = Object.entries(filer)
  .filter(([sti]) => !navnFraSti(sti).startsWith("_"))
  .map(([sti, raw]) => ({ slug: navnFraSti(sti), ...parse(raw) }))
  .sort((a, b) => NIVAER.indexOf(a.niva) - NIVAER.indexOf(b.niva) || a.navn.localeCompare(b.navn, "no"))

export const utstyr = parse(filer["../oppskrifter/_utstyr.yml"] ?? "[]") ?? []

export const ratio = (o) => `1:${(o.vann / o.kaffe).toFixed(1).replace(".0", "").replace(".", ",")}`
export const tall = (n) => String(n).replace(".", ",")
export const sekunder = (mmss) => {
  const [m, s] = String(mmss).split(":").map(Number)
  return m * 60 + s
}
export const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

// Vannmassen i et steg står i teksten som **250 g**. Et intervall som
// **30–45 g** leses som øvre grense, siden det er vekta man styrer etter.
const masse = (tekst) => {
  const m = String(tekst).match(/\*\*\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*g\s*\*\*/)
  return m ? Number((m[2] ?? m[1]).replace(",", ".")) : null
}

// Hellekurven: totalvekt på vekta ved hvert tidspunkt. Steg uten vekt er
// pauser, trekk eller åpning av Switchen — de arver forrige vekt, så kurven
// blir en trapp som viser når det faktisk helles og når det bare står.
export const profil = (o) => {
  let forrige = 0
  return o.steg.map((s) => {
    const v = masse(s.tekst)
    if (v !== null) forrige = v
    return { t: sekunder(s.tid), vekt: forrige, helling: v !== null, tid: s.tid, ca: !!s.ca, tekst: s.tekst }
  })
}
