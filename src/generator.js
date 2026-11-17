// Setter sammen en oppskrift ut fra ønsket karakter.
//
// Hver avgjørelse peker til kortet i kunnskap.js som begrunner den, slik at
// ingen tall står uforklart. Der forskningen og folkevisdommen er uenige,
// følger generatoren forskningen.
//
// Temperatur er med vilje ikke en spak: ved fast styrke og ekstraksjon hadde
// 87, 90 og 93 °C ingen målbar sensorisk forskjell. Se kortet «temperatur».

// Snittkarakter per modus, målt på de 14 oppskriftene i samlingen.
const MODUS_PROFIL = {
  "åpen": { syre: 3.2, sodme: 3.4, fylde: 2.4, klarhet: 4.2 },
  lukket: { syre: 2.0, sodme: 4.0, fylde: 4.5, klarhet: 2.8 },
  hybrid: { syre: 2.8, sodme: 4.2, fylde: 3.4, klarhet: 4.0 },
}

// Ytterpunktene er samlingens egne, ikke oppdiktede grenser.
const RATIO = { svak: 16.7, sterk: 12.0 }
const ZP6 = { grov: 6.5, fin: 4.8 }
const TEMP = "93 °C"

// Egen formatering i stedet for import, slik at modulen kan kjøres og testes
// utenfor Vite.
const tall = (n) => String(n).replace(".", ",")
const klem = (v, lav, hoy) => Math.min(hoy, Math.max(lav, v))
const mellom = (a, b, t) => a + (b - a) * klem(t, 0, 1)
// Vekter rundes til naermeste 5 g. Ingen heller 131 g for hand.
const rund5 = (v) => Math.round(v / 5) * 5
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`

export const MAAL_STANDARD = { syre: 3, sodme: 4, fylde: 3, klarhet: 4, bitterhet: 2 }

export const AKSER = [
  ["syre", "Syre", "Friskt og fruktig"],
  ["sodme", "Sødme", "Rundt og modent"],
  ["fylde", "Fylde", "Tyngde i munnen"],
  ["klarhet", "Klarhet", "Rent og te-aktig"],
  ["bitterhet", "Bitterhet", "Hvor mye du tåler"],
]

function velgModus(maal) {
  let best = null
  for (const [modus, p] of Object.entries(MODUS_PROFIL)) {
    const d = Math.hypot(
      p.syre - maal.syre,
      p.sodme - maal.sodme,
      p.fylde - maal.fylde,
      p.klarhet - maal.klarhet
    )
    if (!best || d < best.d) best = { modus, d, profil: p }
  }
  return best
}

// Hellingsplanen bygges av modus. Lukket har per definisjon én fylling, så
// antall hellinger er bare en spak i de to andre modusene.
function byggSteg(modus, hellinger, vann) {
  const g = (andel) => rund5(vann * andel)
  const steg = []

  if (modus === "lukket") {
    steg.push({ tid: "0:00", tekst: `Switch **lukket**. Hell opp til **${vann} g**` })
    steg.push({ tid: "2:00", tekst: "**Åpne** Switch" })
    steg.push({ tid: "2:45", ca: true, tekst: "Ferdig når alt vannet har rent gjennom" })
    return steg
  }

  if (modus === "hybrid") {
    steg.push({ tid: "0:00", tekst: `Switch **lukket**, hell opp til **${g(0.25)} g** og la det trekke` })
    steg.push({ tid: "0:40", tekst: "**Åpne** Switch" })
    const resten = hellinger - 1
    for (let i = 1; i <= resten; i++) {
      const andel = 0.25 + (0.75 * i) / resten
      steg.push({ tid: mmss(50 + (i - 1) * 35), tekst: `Hell opp til **${g(andel)} g**` })
    }
    steg.push({ tid: mmss(50 + resten * 35 + 50), ca: true, tekst: "Ferdig når alt vannet har rent gjennom" })
    return steg
  }

  steg.push({ tid: "0:00", tekst: `**Bloom**: hell opp til **${g(0.2)} g**` })
  const resten = hellinger - 1
  for (let i = 1; i <= resten; i++) {
    const andel = 0.2 + (0.8 * i) / resten
    steg.push({ tid: mmss(45 + (i - 1) * 30), tekst: `Hell opp til **${g(andel)} g**` })
  }
  steg.push({ tid: mmss(45 + resten * 30 + 45), ca: true, tekst: "Ferdig når alt vannet har rent gjennom" })
  return steg
}

export function lagOppskrift(maal, kopper = 1) {
  const begrunnelser = []
  const { modus, profil } = velgModus(maal)

  begrunnelser.push({
    felt: "Modus",
    verdi: modus,
    hvorfor: `Snittprofilen for ${modus} i samlingen ligger nærmest det du ba om. ` +
      `Den gir fylde ${tall(profil.fylde)} og klarhet ${tall(profil.klarhet)}.`,
    kort: "egne-moduser",
  })

  // Fylde og bitterhet drives begge av TDS, så de slås sammen til ett
  // styrkeønske. Det er også grunnen til at de ikke kan styres hver for seg.
  const tdsMaal = (maal.fylde + maal.bitterhet) / 2
  const ratio = mellom(RATIO.svak, RATIO.sterk, (tdsMaal - 1) / 4)

  begrunnelser.push({
    felt: "Ratio",
    verdi: `1:${tall(ratio.toFixed(1))}`,
    hvorfor: `Bitterhet og fylde øker begge med styrken på brygget, ikke med ` +
      `ekstraksjonen. Fylde ${maal.fylde} og bitterhet ${maal.bitterhet} gir dette styrkenivået.`,
    kort: "bitterhet",
  })

  const spenn = maal.klarhet - maal.fylde
  const onsketHellinger = Math.round(mellom(2, 6, (spenn + 4) / 8))
  const hellinger = modus === "lukket" ? 1 : klem(onsketHellinger, 2, modus === "hybrid" ? 4 : 6)

  if (modus !== "lukket") {
    begrunnelser.push({
      felt: "Hellinger",
      verdi: String(hellinger),
      hvorfor: `Antall hellinger korrelerer −0,74 med fylde og +0,56 med klarhet i ` +
        `samlingen. Blandingen drives av at kornene raser i sengen, så flere hellinger ` +
        `betyr mer omrøring, mer klarhet og mindre kropp.`,
      kort: "helling",
    })
  }

  const ekstraksjon = (maal.sodme + maal.klarhet) / 2
  const malegrad = mellom(ZP6.grov, ZP6.fin, (ekstraksjon - 1) / 4)

  begrunnelser.push({
    felt: "Malegrad",
    verdi: `ZP6 ${tall(malegrad.toFixed(1))}`,
    hvorfor: modus === "lukket"
      ? `Utgangspunkt, men i immersion er malegrad en svak spak: 579 til 1311 mikron ` +
        `ga bare 19–23 % ekstraksjon. Dial den inn mot bønnen.`
      : `Finere maling øker ekstraksjonen, som er det sødme og klarhet trenger. ` +
        `I åpen modus styrer den også gjennomstrømningen. Dial den inn mot bønnen.`,
    kort: modus === "lukket" ? "malegrad-immersion" : "finstoff",
  })

  begrunnelser.push({
    felt: "Temperatur",
    verdi: TEMP,
    hvorfor: `Ikke en spak. Med styrke og ekstraksjon holdt fast hadde 87, 90 og 93 °C ` +
      `ingen målbar sensorisk forskjell på 33 attributter.`,
    kort: "temperatur",
  })

  const kaffe = Math.round(15 * kopper * 2) / 2
  const vann = rund5(kaffe * ratio)

  // Fylde og bitterhet deler spak. Ber man om mye av det ene og lite av det
  // andre, kan ikke generatoren innfri begge, og da sier den det.
  const konflikt = maal.fylde - maal.bitterhet >= 3
    ? `Du ba om fylde ${maal.fylde} og bitterhet ${maal.bitterhet}. Begge følger ` +
      `styrken på brygget, så de trekker i hver sin retning på samme spak. ` +
      `Forslaget her prioriterer å holde bitterheten nede, og henter heller kropp ` +
      `fra ${modus === "lukket" ? "immersion" : "modusvalget"}. Vil du ha mer kropp, ` +
      `må du godta mer bitterhet.`
    : null

  const steg = byggSteg(modus, hellinger, vann)
  const sisteTid = steg[steg.length - 1].tid

  return {
    slug: "generert",
    navn: "Ditt forslag",
    niva: hellinger >= 5 ? "avansert" : hellinger >= 3 ? "middels" : "lett",
    modus,
    brygger: `Hario Switch (${modus})`,
    beskrivelse: `Satt sammen ut fra ønsket karakter. Modus og ratio er utledet av ` +
      `samlingen og forskningen; malegrad er et utgangspunkt som må dial-es inn.`,
    kaffe,
    vann,
    temp: TEMP,
    malegrad: Number(malegrad.toFixed(1)),
    tid: sisteTid,
    karakter: {
      syre: klem(Math.round(maal.syre), 1, 5),
      sodme: klem(Math.round(maal.sodme), 1, 5),
      fylde: klem(Math.round(maal.fylde), 1, 5),
      klarhet: klem(Math.round(maal.klarhet), 1, 5),
    },
    hue: { "åpen": 198, lukket: 216, hybrid: 288 }[modus],
    steg,
    begrunnelser,
    konflikt,
  }
}
