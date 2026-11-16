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
