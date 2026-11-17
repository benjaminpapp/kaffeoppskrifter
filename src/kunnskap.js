// Oppslagskort med forskningsgrunnlaget bak oppskriftene og generatoren.
//
// Hvert kort oppgir hvor sterkt det står:
//   forsok     kontrollert forsøk med sensorikkpanel eller måling
//   modell     måling eller modell uten sensorisk validering
//   mekanisme  teori som forklarer hvorfor, men som ingen har målt smaken av
//   egne-data  utledet av oppskriftene på denne siden, n = 14
//
// Det siste nivået er med vilje skilt ut: fem av karakterene i samlingen er
// anslag, ikke smakt, så korrelasjonene derfra er pekepinner og ikke bevis.

export const SIKKERHET = {
  forsok: { navn: "Kontrollert forsøk", vekt: 4 },
  modell: { navn: "Måling uten smakstest", vekt: 3 },
  mekanisme: { navn: "Mekanisme, ikke målt", vekt: 2 },
  "egne-data": { navn: "Egne oppskrifter, n=14", vekt: 1 },
}

export const BRYGGING = [
  {
    id: "bitterhet",
    tittel: "Bitterhet følger styrke, ikke overekstraksjon",
    sikkerhet: "forsok",
    hva: `Bitter, snerp, viskositet, gummi og jordaktig økte alle lineært med TDS,
      altså hvor sterkt brygget er, uten statistisk sammenheng med ekstraksjonsgrad.
      Forfatterne påpeker selv at dette avviker fra det klassiske brewing control-kartet,
      som antyder at bitterhet toppes ved høy ekstraksjon.`,
    praksis: `Vil du ha bort bitterhet, tynn ut brygget med mer vann per gram kaffe.
      Å male grovere er det vanlige rådet, men det treffer feil spak.`,
    kilde: {
      navn: "Batali, Ristenpart & Guinard",
      hvor: "Scientific Reports 10:16450",
      aar: 2020,
      url: "https://www.nature.com/articles/s41598-020-73341-4",
    },
  },
  {
    id: "temperatur",
    tittel: "Temperatur betyr nesten ingenting i seg selv",
    sikkerhet: "forsok",
    hva: `87, 90 og 93 °C ble testet mot et trent sensorikkpanel på 33 attributter,
      med TDS og ekstraksjonsgrad holdt fast. Konklusjonen var at temperatur hadde
      «negligible impact on the perceptible sensory quality».`,
    praksis: `Temperatur virker gjennom ekstraksjonen, ikke ved siden av den. Treffer du
      styrke og ekstraksjon, er et par grader fra eller til uten betydning. Unntaket er
      oppskrifter som bruker temperatur som en aktiv spak, slik Devil's Recipe gjør
      med 70 °C på andre halvdel.`,
    kilde: {
      navn: "Batali, Ristenpart & Guinard",
      hvor: "Scientific Reports 10:16450",
      aar: 2020,
      url: "https://www.nature.com/articles/s41598-020-73341-4",
    },
  },
  {
    id: "fylde-bitterhet",
    tittel: "Fylde og bitterhet henger sammen",
    sikkerhet: "forsok",
    hva: `Viskositet økte med TDS på samme måte som bitterhet og snerp. De deler spak.`,
    praksis: `Ber du om maksimal fylde og minimal bitterhet, ber du om to ting som
      trekker i hver sin retning på samme regulator. Vil du ha kropp uten bitterhet,
      må den komme fra immersion og lav ekstraksjon heller enn fra et sterkt brygg.`,
    kilde: {
      navn: "Batali, Ristenpart & Guinard",
      hvor: "Scientific Reports 10:16450",
      aar: 2020,
      url: "https://www.nature.com/articles/s41598-020-73341-4",
    },
  },
  {
    id: "syre-og-klarhet",
    tittel: "Syre har to spaker, klarhet har én",
    sikkerhet: "forsok",
    hva: `Surt, bær, sitrus, fermentert og brunbrent svarte på både TDS og
      ekstraksjonsgrad. Svart te skilte seg ut ved å svare på ekstraksjonsgrad alene.`,
    praksis: `Syre kan justeres både med styrke og med ekstraksjon. Den tynne,
      te-aktige klarheten styres derimot bare av ekstraksjon, så den må hentes
      gjennom maling, kontakttid og hellemønster — ikke gjennom ratio.`,
    kilde: {
      navn: "Batali, Ristenpart & Guinard",
      hvor: "Scientific Reports 10:16450",
      aar: 2020,
      url: "https://www.nature.com/articles/s41598-020-73341-4",
    },
  },
  {
    id: "ingen-fasit",
    tittel: "Det finnes ingen fasitkopp",
    sikkerhet: "forsok",
    hva: `Et nytt brewing control-kart koblet sensorikk og forbrukerpreferanse til
      styrke, ekstraksjon og ratio. Preferansene klumpet seg ikke i én ideell sone,
      men i to adskilte grupper: én som foretrakk svakere brygg med moderat
      ekstraksjon, og én som foretrakk høyere ekstraksjon.`,
    praksis: `Den gylne sonen er en konvensjon, ikke en naturlov. Derfor velger du
      profil selv her, i stedet for at siden sikter mot ett punkt.`,
    kilde: {
      navn: "Guinard m.fl.",
      hvor: "Journal of Food Science 88(4)",
      aar: 2023,
      url: "https://doi.org/10.1111/1750-3841.16531",
    },
  },
  {
    id: "malegrad-immersion",
    tittel: "Malegrad er en svak spak i immersion",
    sikkerhet: "modell",
    hva: `I full immersion ga en spredning i mediankorn fra 579 til 1311 mikron bare
      19–23 % ekstraksjon, med TDS rundt 1,36 % gjennom hele spennet. Finere korn ga
      litt høyere verdier, men utslaget var lite over et enormt spenn.`,
    praksis: `I lukket Switch flytter malegraden mindre enn du tror. I åpen modus,
      der vannet renner gjennom, betyr den mer fordi den styrer gjennomstrømningen.
      Det forklarer hvorfor malegrad ikke korrelerer med noe i en samling som
      blander begge modusene.`,
    kilde: {
      navn: "Scientific Reports",
      hvor: "An equilibrium desorption model for full immersion brewed coffee",
      aar: 2021,
      url: "https://www.nature.com/articles/s41598-021-85787-1",
    },
  },
  {
    id: "finstoff",
    tittel: "Finstoff bremser sengen",
    sikkerhet: "modell",
    hva: `Andelen partikler under 100 mikron senker permeabiliteten i kaffesengen.
      To kverner med samme medianstørrelse kan gi ulik andel finstoff, og dermed
      ulik gjennomstrømning og kontakttid.`,
    praksis: `Derfor lar ikke malegrad seg oversette rent mellom kverner. Et ZP6-tall
      og et Comandante-tall med samme mikronmål oppfører seg ikke likt i trakten.`,
    kilde: {
      navn: "Using ground coffee particle size and distribution to remodel beverage properties",
      hvor: "partikkelfordeling og permeabilitet",
      aar: 2023,
      url: "https://www.researchgate.net/publication/368332753",
    },
  },
  {
    id: "helling",
    tittel: "Det er skred i sengen som blander, ikke strålen",
    sikkerhet: "modell",
    hva: `Forskere byttet ut kaffen med silikagel i en glasstrakt og filmet innsiden
      med laserark og høyhastighetskamera. Blandingen drives av at kornene raser i
      koordinerte skred, ikke av vannstrålen direkte. Effekten oppstod selv ved myk
      helling. Et flytende lag korn på toppen hindret ikke blandingen nevneverdig.`,
    praksis: `Hellehøyde og flyt er reelle spaker. Artikkelen viser at samme styrke
      kan nås med mindre kaffe ved å helle bedre, ved å forlenge blandetiden med
      langsommere, men mer effektive hellinger.`,
    kilde: {
      navn: "Physics of Fluids 37, 043332",
      hvor: "Mixing by a water jet impinging on a granular bed",
      aar: 2025,
      url: "https://pubs.aip.org/aip/pof/article/37/4/043332/3342795/",
    },
  },
  {
    id: "immersion-perkolering",
    tittel: "Perkolering trekker med rent vann, immersion med mettet",
    sikkerhet: "mekanisme",
    hva: `I perkolering erstattes slurryen hele tiden av friskt vann, så
      uttrekkshastigheten holdes oppe. I immersion blir vannet gradvis mettet, og
      uttrekket bremser etter Noyes-Whitney. Konsekvensen er at perkolering
      overrepresenterer stoffer som trekkes ut raskt, mens immersion ligner mer på
      bønnens faktiske sammensetning.`,
    praksis: `Dette forklarer hvorfor lukket Switch gir kropp og åpen gir klarhet.
      Men forfatteren sier selv at han ikke vet om mekanismen står for 1 % eller
      50 % av smaksforskjellen — den er ikke sensorisk målt.`,
    kilde: {
      navn: "Jonathan Gagné",
      hvor: "Coffee ad Astra",
      aar: 2019,
      url: "https://coffeeadastra.com/2019/07/16/why-do-percolation-and-immersion-coffee-taste-so-different/",
    },
  },
  {
    id: "egne-moduser",
    tittel: "Modus er den sterkeste prediktoren i denne samlingen",
    sikkerhet: "egne-data",
    hva: `Snittkarakteren per modus i de 14 oppskriftene her: åpen gir klarhet 4,2 og
      fylde 2,4, lukket gir fylde 4,5 og klarhet 2,8, hybrid ligger mellom med
      høyest sødme på 4,2. Antall hellinger korrelerer −0,74 med fylde og +0,56 med
      klarhet. Ratio korrelerer −0,53 med fylde.`,
    praksis: `Generatoren velger modus ved å måle avstanden fra ønsket profil til
      disse tre snittene.`,
    kilde: {
      navn: "Denne samlingen",
      hvor: "14 oppskrifter, hvorav 5 karakterer er anslag og ikke smakt",
      aar: 2026,
      url: null,
    },
  },
]

export const PROSESSERING = [
  {
    id: "washed",
    tittel: "Vasket",
    engelsk: "Washed, fully washed, wet process",
    sikkerhet: "mekanisme",
    hva: `Skallet og fruktkjøttet fjernes mekanisk kort tid etter plukking. Det
      slimete laget som sitter igjen på pergamenten, mucilage, brytes ned i vann før
      bønnen vaskes ren og tørkes.`,
    kopp: `Fruktkjøttet er borte før tørking, så bønnens egen opprinnelse står igjen
      uten å bli dekket til. Regnes som den reneste og mest gjennomsiktige metoden.`,
  },
  {
    id: "naturell",
    tittel: "Naturell",
    engelsk: "Natural, dry process — bærtørket",
    sikkerhet: "forsok",
    hva: `Hele bæret tørkes med frukten på. Gjæringen skjer inne i frukten mens den
      tørker, over uker.`,
    kopp: `I et kontrollert forsøk hadde naturell høyere innhold av syrer enn pulped
      natural på alle høydelag, og fikk gjennomgående høyere cuppingscore. Beste
      enkeltprøve var naturell på 1400 meter med 88,13 poeng.`,
    kilde: {
      navn: "Fingerprinting av selvindusert anaerob fermentering",
      hvor: "PMC9777685",
      aar: 2022,
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9777685/",
    },
  },
  {
    id: "honey",
    tittel: "Honey",
    engelsk: "Honey, pulped natural, semi-washed",
    sikkerhet: "mekanisme",
    hva: `Skallet fjernes, men mucilage blir sittende igjen under tørkingen. Navnet
      kommer av hvor klebrig bønnen er, ikke av honningsmak. Gul, rød og svart honey
      beskriver hvor mye mucilage som er igjen og hvor sakte den tørkes — svart har
      mest og tørkes lengst og mest skyggefullt.`,
    kopp: `Ligger mellom vasket og naturell. Mer sødme og kropp enn vasket, mer
      struktur og mindre fruktbombe enn naturell.`,
  },
  {
    id: "anaerob",
    tittel: "Anaerob",
    engelsk: "Anaerobic, self-induced anaerobic fermentation (SIAF)",
    sikkerhet: "forsok",
    hva: `Bær eller avskallede bønner gjærer i lukket tank uten oksygen. Uten luft tar
      melkesyrebakterier over for de vanlige gjærsoppene. I et forsøk dominerte
      slekten Leuconostoc gjennom hele prosessen på alle høydelag, sammen med
      Weissella confusa, mens gjærsoppene Hanseniaspora og Pichia dominerte
      soppfloraen.`,
    kopp: `Melkesyre fantes ikke før gjæringen og dukket opp underveis — 7,14 g/kg i
      naturell mot 2,98 i pulped natural på 800 meter. Studien identifiserte 121
      flyktige forbindelser. I et annet forsøk på Geisha fikk anaerob fermentering
      høyest sensorisk score, 88,3.`,
    kilde: {
      navn: "Fingerprinting av selvindusert anaerob fermentering",
      hvor: "PMC9777685",
      aar: 2022,
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9777685/",
    },
  },
  {
    id: "carbonic",
    tittel: "Carbonic maceration",
    engelsk: "Carbonic maceration",
    sikkerhet: "mekanisme",
    hva: `En variant av anaerob der hele, uskadde bær legges i tank som spyles med
      CO₂. Metoden er lånt fra vinproduksjon, typisk over fem til ti døgn.`,
    kopp: `Beskrives gjennomgående med markert, klar syre og tydelige blomster- og
      tropisk frukt-toner. Merk at dette i hovedsak er bransjebeskrivelser, ikke
      kontrollerte forsøk med trent panel.`,
  },
  {
    id: "melkesyre",
    tittel: "Melkesyregjæret",
    engelsk: "Lactic, lactic fermentation",
    sikkerhet: "mekanisme",
    hva: `Gjæringen styres mot melkesyrebakterier, enten ved å sette til utvalgte
      kulturer eller ved å styre forholdene slik at de tar over.`,
    kopp: `Rundere og kremetere syre enn vanlig gjæring, med mindre eddiksyrepreg.
      I anaerobe forhold er etyllaktat en dominerende forbindelse, som gir et kremet
      inntrykk.`,
  },
  {
    id: "wet-hulled",
    tittel: "Wet-hulled",
    engelsk: "Wet-hulled, giling basah",
    sikkerhet: "mekanisme",
    hva: `Indonesisk metode der pergamenten fjernes mens bønnen fortsatt har høyt
      fuktinnhold, rundt 30–50 %, i stedet for de vanlige 11–12 %.`,
    kopp: `Gir lav syre, tung kropp og jordaktige, urteaktige toner. Den typiske
      Sumatra-profilen.`,
  },
  {
    id: "gjaer",
    tittel: "Podet med gjær",
    engelsk: "Yeast inoculated, co-fermentation",
    sikkerhet: "modell",
    hva: `Utvalgte gjærkulturer settes til gjæringen for å styre den, i stedet for å
      la stedets egen flora bestemme. Co-fermentation betyr at det tilsettes frukt,
      most eller andre substrater.`,
    kopp: `Forsøk med Saccharomyces cerevisiae og Lactiplantibacillus plantarum viser
      at gjæring med utvalgte kulturer kan heve kvalitet og kompleksitet i forhold
      til ukontrollert gjæring. Hvor langt det er greit å gå før kaffen smaker av
      tilsetningen og ikke av opprinnelsen, er omstridt i bransjen.`,
    kilde: {
      navn: "Martins m.fl. / Springer",
      hvor: "Podet gjæring av kaffe",
      aar: 2024,
      url: "https://link.springer.com/article/10.1007/s00217-024-04640-7",
    },
  },
]
