// Publiserer dist/ til gh-pages-grenen.
//
// Normalt publiseres siden av GitHub Actions ved push til main. Så lenge
// Actions er utilgjengelig, er dette veien utenom: vi bygger lokalt og
// dytter resultatet til gh-pages, som Pages bygger uten Actions.
//
// Kjøres av `npm run publiser`, som bygger først.
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROT = fileURLToPath(new URL("..", import.meta.url))
const DIST = join(ROT, "dist")
const GREN = "gh-pages"

const git = (args, cwd = ROT) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim()

const stopp = (melding) => {
  console.error(`\n✗ ${melding}\n`)
  process.exit(1)
}

if (!existsSync(join(DIST, "index.html"))) {
  stopp("dist/index.html finnes ikke. Kjør «npm run build» først.")
}

const fjern = git(["remote", "get-url", "origin"])
const kilde = git(["rev-parse", "--short", "HEAD"])
const skittent = git(["status", "--porcelain"])

if (skittent) {
  console.warn(
    "! Arbeidstreet har ucommitede endringer. Du publiserer dem nå, men de\n" +
    "  ligger ikke i historikken. Commit dem gjerne etterpå.\n"
  )
}

// Grenen bygges fra bunnen hver gang: den inneholder bare bygget, aldri
// kildekode, så det er ingen historikk verdt å ta vare på der.
const midl = mkdtempSync(join(tmpdir(), "kaffe-ghp-"))
try {
  git(["init", "-q"], midl)
  git(["checkout", "-q", "-b", GREN], midl)
  cpSync(DIST, midl, { recursive: true })
  // Uten denne hopper Pages over filer og mapper som starter med _.
  writeFileSync(join(midl, ".nojekyll"), "")
  git(["add", "-A"], midl)
  git(["-c", "core.safecrlf=false", "commit", "-q", "-m", `Bygget nettside fra ${kilde}`], midl)
  git(["remote", "add", "origin", fjern], midl)
  git(["push", "-f", "-q", "origin", GREN], midl)
  console.log(`✓ dyttet bygget fra ${kilde} til ${GREN}`)
} catch (e) {
  stopp(`klarte ikke å publisere – ${String(e.message).split("\n")[0]}`)
} finally {
  rmSync(midl, { recursive: true, force: true })
}

// Push til gh-pages trigger normalt et Pages-bygg. Vi ber om ett eksplisitt
// også, siden GitHub av og til lar være. Krever gh, og er ikke kritisk.
const slug = fjern.replace(/^.*github\.com[/:]/, "").replace(/\.git$/, "")
try {
  execFileSync("gh", ["api", "-X", "POST", `repos/${slug}/pages/builds`], { stdio: "ignore" })
  console.log("✓ ba om Pages-bygg")
} catch {
  console.log("! fikk ikke bedt om Pages-bygg (mangler gh?). Pushen trigger som regel ett selv.")
}

console.log(`\nSiden oppdateres om et par minutter: https://${slug.split("/")[0]}.github.io/${slug.split("/")[1]}/\n`)
