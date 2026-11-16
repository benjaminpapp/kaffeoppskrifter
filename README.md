# Kaffeoppskrifter

Pour-over-oppskrifter for Hario Switch, publisert på
<https://benjaminpapp.github.io/kaffeoppskrifter/>.

Hver oppskrift er én YAML-fil i [`oppskrifter/`](oppskrifter). Oppskriftene er
innholdet, ikke koden: de leses inn ved bygging, så en ny oppskrift krever ingen
endringer i `src/`. Push til `main` validerer alle filene og publiserer siden på
nytt. Feiler valideringen, stopper publiseringen og forrige versjon står.

Filnavnet er adressen: `oppskrifter/double.yml` → `#/o/double`. Filer som starter
med `_` er ikke oppskrifter — [`_utstyr.yml`](oppskrifter/_utstyr.yml) er utstyret
som vises øverst på siden, [`_mal.yml.example`](oppskrifter/_mal.yml.example) er
malen for en ny oppskrift.

## Oppskriftsformat

| Felt | Type | |
| --- | --- | --- |
| `navn`, `brygger`, `beskrivelse` | tekst | |
| `niva` | `lett` \| `middels` \| `avansert` | styrer sortering og gruppering |
| `modus` | `åpen` \| `lukket` \| `hybrid` | Switch-modus, vises som tag |
| `kaffe`, `vann` | tall, gram | ratio regnes ut |
| `malegrad` | tall | ZP6 |
| `temp`, `tid` | tekst | fri form, f.eks. `92 °C`, `2:30–3:00` |
| `karakter` | `syre`, `sodme`, `fylde`, `klarhet` | heltall 1–5, alle fire kreves |
| `steg[].tid` | `"M:SS"` | tidspunkt fra første helling, må være i hermetegn |
| `steg[].tekst` | tekst | `**fet**` rendres |
| `steg[].ca` | bool | valgfri, viser «ca.» foran tiden |
| `notater` | tekst | valgfri |
| `kilde` | `navn` + `url` | valgfri, begge kreves hvis satt |

Tallfelt bruker punktum (`16.5`), ikke komma — siden formaterer til norsk selv.
`steg[].tid` er faste tidspunkt, ikke intervaller, og driver tidtakeren i
oppskriftsvisningen.

## Utvikling

```bash
npm install
npm run dev       # http://localhost:5173/kaffeoppskrifter/
npm run valider   # validerer oppskriftene
npm run build     # validerer, så bygger til dist/
```

## Oppbygging

React + Vite, ingen backend. Hash-ruting (`#/o/<slug>`) slik at GitHub Pages
slipper 404-omskriving.

| | |
| --- | --- |
| [`src/data.js`](src/data.js) | leser `oppskrifter/*.yml` med `import.meta.glob`, sorterer, regner ratio |
| [`src/App.jsx`](src/App.jsx) | ruting, oversikt, filtre på nivå og modus |
| [`src/Oppskrift.jsx`](src/Oppskrift.jsx) | oppskriftsvisning med tidtaker og wake lock |
| [`scripts/valider.mjs`](scripts/valider.mjs) | feltvalidering, kjører før hvert bygg |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | bygger og publiserer til Pages ved push til `main` |
