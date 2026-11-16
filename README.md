# Kaffeoppskrifter

Pour-over-oppskrifter for Hario Switch, publisert på
<https://benjaminpapp.github.io/kaffeoppskrifter/>.

Hver oppskrift er én YAML-fil i [`oppskrifter/`](oppskrifter). Oppskriftene er
innholdet, ikke koden: de leses inn ved bygging, så en ny oppskrift krever ingen
endringer i `src/`.

## Publisering

```bash
npm run publiser
```

Bygger lokalt og dytter resultatet til `gh-pages`, som GitHub Pages serverer.
Valideringen kjører først, så en ødelagt oppskrift stopper publiseringen og
forrige versjon blir stående.

Dette er en midlertidig vei utenom GitHub Actions. Workflowen i
[`deploy.yml`](.github/workflows/deploy.yml) gjør det samme ved push til `main`,
men kjøringene avvises med «account is locked due to a billing issue», uten at
det finnes noe utestående på kontoen.

**Workflowen er derfor slått av** (`disabled_manually`). Den feilet ved hver
push og sendte e-post hver gang, uten å kunne publisere noe. Kjøringen
`pages-build-deployment` står fortsatt aktiv — det er den som faktisk bygger
siden fra `gh-pages`.

Slik settes alt tilbake når Actions virker igjen:

```bash
gh workflow enable deploy.yml
gh api -X PUT repos/benjaminpapp/kaffeoppskrifter/pages \
  --input - <<< '{"build_type":"workflow"}'
git push origin --delete gh-pages
```

Filnavnet er adressen: `oppskrifter/double.yml` → `#/o/double`. Filer som starter
med `_` er ikke oppskrifter — [`_mal.yml.example`](oppskrifter/_mal.yml.example)
er malen for en ny oppskrift.

Utstyr hører hjemme i oppskriften selv, ikke i en felles liste. Hver oppskrift
oppgir sin egen brygger, malegrad og temperatur, så en ny oppskrift tar med det
den trenger. [`_utstyr.yml`](oppskrifter/_utstyr.yml) leses ikke lenger av noe,
men ligger igjen fordi notatene der fortsatt er verdt å ha.

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
npm run publiser  # bygger og publiserer til gh-pages
```

## Oppbygging

React + Vite, ingen backend. Hash-ruting (`#/o/<slug>`) slik at GitHub Pages
slipper 404-omskriving.

| | |
| --- | --- |
| [`src/data.js`](src/data.js) | leser `oppskrifter/*.yml` med `import.meta.glob`, sorterer, regner ratio |
| [`src/App.jsx`](src/App.jsx) | ruting, oversikt, filtre på nivå og modus |
| [`src/Oppskrift.jsx`](src/Oppskrift.jsx) | oppskriftsvisning med tidtaker og wake lock |
| [`src/Profil.jsx`](src/Profil.jsx) | hellekurve: leser vannmassen ut av stegtekstene |
| [`scripts/valider.mjs`](scripts/valider.mjs) | feltvalidering, kjører før hvert bygg |
| [`scripts/publiser.mjs`](scripts/publiser.mjs) | dytter `dist/` til `gh-pages` og ber om Pages-bygg |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | samme publisering via Actions, ute av drift (se over) |
