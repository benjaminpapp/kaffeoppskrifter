// Sjekker at alle oppskrifter har riktige felt før nettsiden bygges.
// Kjøres automatisk av `npm run build`, også i GitHub Actions.
// Feiler bygget hvis noe mangler, slik at en ødelagt fil aldri publiseres.
import { readdirSync, readFileSync } from "node:fs"
import { parse } from "yaml"

const MAPPE = new URL("../oppskrifter/", import.meta.url)
const NIVAER = ["lett", "middels", "avansert"]
const MODUSER = ["åpen", "lukket", "hybrid"]
const TEKST = ["navn", "brygger", "beskrivelse", "temp", "tid"]
const TALL = ["kaffe", "vann", "malegrad"]
const KARAKTER = ["syre", "sodme", "fylde", "klarhet"]

const feil = []
const filer = readdirSync(MAPPE).filter((f) => f.endsWith(".yml") && !f.startsWith("_"))

for (const fil of filer) {
  const ut = (msg) => feil.push(`${fil}: ${msg}`)
  let o
  try {
    o = parse(readFileSync(new URL(fil, MAPPE), "utf8"))
  } catch (e) {
    ut(`ugyldig YAML – ${e.message.split("\n")[0]}`)
    continue
  }
  if (!/^[a-z0-9-]+$/.test(fil.replace(/\.yml$/, ""))) ut("filnavnet kan bare ha små bokstaver, tall og bindestrek")
  for (const k of TEKST) if (!o?.[k] || typeof o[k] !== "string" && typeof o[k] !== "number") ut(`mangler «${k}»`)
  for (const k of TALL) if (typeof o?.[k] !== "number") ut(`«${k}» må være et tall (bruk punktum, f.eks. 5.5)`)
  if (!NIVAER.includes(o?.niva)) ut(`«niva» må være ${NIVAER.join(" | ")}`)
  if (!MODUSER.includes(o?.modus)) ut(`«modus» må være ${MODUSER.join(" | ")}`)
  for (const k of KARAKTER) {
    const v = o?.karakter?.[k]
    if (!Number.isInteger(v) || v < 1 || v > 5) ut(`karakter.${k} må være et heltall 1–5`)
  }
  if (!Array.isArray(o?.steg) || o.steg.length === 0) ut("mangler «steg»")
  else
    o.steg.forEach((s, i) => {
      if (!/^\d{1,2}:\d{2}$/.test(String(s?.tid))) ut(`steg ${i + 1}: «tid» må være på formen "1:30" (med anførselstegn)`)
      if (!s?.tekst) ut(`steg ${i + 1}: mangler «tekst»`)
    })
  if (o?.kilde && (!o.kilde.navn || !/^https?:\/\//.test(o.kilde.url ?? ""))) ut("«kilde» trenger både navn og url")
}

if (feil.length) {
  console.error(`\n✗ ${feil.length} feil i oppskriftene:\n` + feil.map((f) => `  - ${f}`).join("\n") + "\n")
  process.exit(1)
}
console.log(`✓ ${filer.length} oppskrifter er gyldige`)
