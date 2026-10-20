/**
 * Diagnostique l'accès Google Sheets : clé, jeton, API, partage de la feuille.
 *
 * Usage : npm run sheet:test
 * Ne modifie rien — lecture seule.
 */

import { readFileSync } from "node:fs";
import {
  PRODUCT_HEADERS,
  TABS,
  ensureTabs,
  installCliGuard,
  listSheetTitles,
  readRange,
  serviceAccountPath,
} from "./lib/sheet.mjs";

installCliGuard();

const ok = (m) => console.log(`  ✓ ${m}`);
const ko = (m) => console.log(`  ✗ ${m}`);
let failed = false;

/* 1. Clé ------------------------------------------------------------------ */

console.log("\n1. Clé du compte de service");
const keyPath = serviceAccountPath();
const key = JSON.parse(readFileSync(keyPath, "utf8"));
ok(`${keyPath}`);
ok(`type = ${key.type} · project = ${key.project_id}`);
ok(`compte = ${key.client_email}`);
if (key.type !== "service_account") {
  ko("ce n'est pas un JSON de compte de service");
  failed = true;
}

/* 2. Jeton ---------------------------------------------------------------- */

console.log("\n2. Jeton d'accès");
const { GoogleAuth } = await import("google-auth-library");
const auth = new GoogleAuth({
  keyFile: keyPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
});
const client = await auth.getClient();
const res = await client.getAccessToken();
const token = typeof res === "string" ? res : res?.token;
if (!token) {
  ko("aucun jeton obtenu — clé révoquée ou API non activée");
  failed = true;
} else {
  ok(`jeton obtenu (${token.slice(0, 12)}…)`);
}

if (!failed) {
  /* 3. API Drive ---------------------------------------------------------- */
  console.log("\n3. API Google Drive");
  try {
    const r = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) ok("API Drive active et accessible");
    else {
      ko(`Drive → HTTP ${r.status} : ${(await r.json())?.error?.message ?? ""}`);
      failed = true;
    }
  } catch (e) {
    ko(`Drive → ${e.message}`);
    failed = true;
  }

  /* 4. Onglets ------------------------------------------------------------ */
  console.log("\n4. Feuille de suivi (GOOGLE_SHEETS_ID)");
  try {
    await ensureTabs();
    ok(`${(await listSheetTitles()).length} onglets présents`);
    const rows = await readRange(TABS.products, { unformatted: true });
    const refCol = PRODUCT_HEADERS.indexOf("Référence");
    const pending = rows.slice(1).filter((r) => String(r?.[refCol] ?? "").trim() === "").length;
    ok(`${Math.max(rows.length - 1, 0)} ligne(s) dans « ${TABS.products} » dont ${pending} nouvelle(s)`);
  } catch (e) {
    ko(e.message);
    failed = true;
    if (/permission|403|denied/i.test(e.message)) {
      console.log(
        `  → partage la feuille avec ${key.client_email} en accès Éditeur (étape 6).`
      );
    }
  }
}

console.log(failed ? "\n✗ accès incomplet — corrige ci-dessus\n" : "\n✓ accès Google opérationnel\n");
if (failed) process.exit(1);
