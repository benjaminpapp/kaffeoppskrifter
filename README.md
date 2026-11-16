# Kaffeoppskrifter

Mine pour-over-oppskrifter for Hario Switch, publisert som nettside på
<https://benjaminpapp.github.io/kaffeoppskrifter/>.

## Slik oppdaterer du

Hver oppskrift er én fil i [`oppskrifter/`](oppskrifter). Endrer du en fil og
pusher til `main`, bygger GitHub Actions siden på nytt og publiserer den
automatisk. Det tar 1–2 minutter.

- **Endre en oppskrift:** rediger fila, for eksempel direkte på github.com
  (blyant-ikonet) eller i GitHub-appen.
- **Ny oppskrift:** kopier [`oppskrifter/_mal.yml.example`](oppskrifter/_mal.yml.example)
  til `oppskrifter/<navn-med-bindestrek>.yml` og fyll inn.
- **Utstyr:** står i [`oppskrifter/_utstyr.yml`](oppskrifter/_utstyr.yml).

Bygget sjekker alle oppskriftene først. Mangler et felt, eller er det en
skrivefeil i YAML, stopper publiseringen, og du ser feilen under **Actions**
på GitHub. Da blir den gamle siden liggende til feilen er rettet.

### Feltene

| Felt | Eksempel | Merknad |
| --- | --- | --- |
| `niva` | `lett` | `lett`, `middels` eller `avansert` |
| `modus` | `hybrid` | `åpen`, `lukket` eller `hybrid` |
| `kaffe`, `vann` | `15`, `250` | gram, tall med punktum (`16.5`) |
| `malegrad` | `5.5` | ZP6 |
| `karakter` | `syre: 3` | heltall 1–5 for syre, sodme, fylde, klarhet |
| `steg[].tid` | `"1:30"` | fast tidspunkt fra første helling, med anførselstegn |
| `steg[].ca` | `true` | valgfritt, viser «ca.» foran tiden |
| `steg[].tekst` | `Hell opp til **250 g**` | `**fet**` er lov |

## Kjøre lokalt

```bash
npm install
npm run dev      # http://localhost:5173/kaffeoppskrifter/
npm run valider  # sjekk oppskriftene
npm run build    # bygger til dist/
```

## Oppsett på GitHub (én gang)

1. **Settings → Pages → Source:** velg **GitHub Actions**.
2. GitHub Pages fra et privat repo krever GitHub Pro. Selve nettsiden blir
   offentlig uansett. Bare koden og historikken er privat.
