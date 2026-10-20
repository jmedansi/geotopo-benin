/**
 * Accès Google Drive en lecture seule : dossiers d'images partagés par le
 * client, liés depuis les colonnes « Photos (Drive) » de la feuille.
 */

import { googleAccessToken } from "./sheet.mjs";

const API = "https://www.googleapis.com/drive/v3";

async function drive(path) {
  const token = await googleAccessToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let detail = await res.text();
    try {
      detail = JSON.parse(detail)?.error?.message ?? detail;
    } catch {
      /* texte brut */
    }
    if (res.status === 404) {
      throw new Error(
        `dossier ou fichier Drive introuvable — partagez-le avec le compte de service (ou activez « Toute personne disposant du lien ») : ${detail}`
      );
    }
    throw new Error(`Google Drive API ${res.status} — ${detail}`);
  }
  return res;
}

async function driveJson(path) {
  return (await drive(path)).json();
}

/**
 * Extrait l'identifiant d'un lien Drive.
 * Accepte : /folders/<id>, /file/d/<id>, ?id=<id>, ou un identifiant brut.
 * @returns {{id: string, kind: "folder"|"file"|"unknown"}|null}
 */
export function parseDriveLink(link) {
  const s = String(link ?? "").trim();
  if (!s) return null;
  const folder = s.match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (folder) return { id: folder[1], kind: "folder" };
  const file = s.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (file) return { id: file[1], kind: "file" };
  const query = s.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (query) return { id: query[1], kind: "unknown" };
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return { id: s, kind: "unknown" };
  return null;
}

/**
 * Liste les images d'un dossier Drive (ou renvoie l'image si le lien pointe
 * directement sur un fichier).
 * @param {{id: string, kind: string}} target
 * @returns {Promise<Array<{id: string, name: string, mimeType: string}>>}
 */
export async function listImages(target) {
  const meta = await driveJson(
    `/files/${target.id}?fields=id,name,mimeType&supportsAllDrives=true`
  );
  if (meta.mimeType === "application/vnd.google-apps.folder") {
    const params = new URLSearchParams({
      q: `'${target.id}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: "files(id,name,mimeType,size)",
      pageSize: "50",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    const data = await driveJson(`/files?${params}`);
    return (data.files ?? []).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "fr", { numeric: true })
    );
  }
  if (String(meta.mimeType ?? "").startsWith("image/")) return [meta];
  throw new Error(`« ${meta.name} » n'est pas une image (${meta.mimeType})`);
}

/** Télécharge le contenu binaire d'un fichier Drive. */
export async function downloadFile(id) {
  const res = await drive(`/files/${id}?alt=media&supportsAllDrives=true`);
  return Buffer.from(await res.arrayBuffer());
}
