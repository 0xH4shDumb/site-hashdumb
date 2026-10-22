// Chiffre tools/coffre.json (AES-GCM, clé PBKDF2) et l'injecte dans index.html (const COFFRE).
// Usage : node tools/scelle.mjs <motdepasse>
// Le mot de passe doit correspondre au challenge (base64 dans /etc/shadow de index.html).
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const pw = process.argv[2];
if (!pw) { console.error('usage : node tools/scelle.mjs <motdepasse>'); process.exit(1); }

const root = new URL('..', import.meta.url);
const data = readFileSync(new URL('tools/coffre.json', root), 'utf8');
JSON.parse(data); // valide le JSON avant de chiffrer

const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw.trim().toLowerCase()), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data)));
const blob = Buffer.concat([salt, iv, ct]).toString('base64');

const page = new URL('index.html', root);
const html = readFileSync(page, 'utf8');
const re = /const COFFRE = '[^']*';/;
if (!re.test(html)) { console.error('const COFFRE introuvable dans index.html'); process.exit(1); }
writeFileSync(page, html.replace(re, `const COFFRE = '${blob}';`));
console.log(`coffre scellé (${blob.length} car.) → index.html`);
