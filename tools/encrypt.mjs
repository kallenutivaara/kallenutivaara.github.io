// Verschlüsselt _source/index.html mit einem Passwort und schreibt das geschützte index.html.
// Nutzung:  SITE_PASSWORD='...' node tools/encrypt.mjs
// Das Passwort wird nie gespeichert oder committet.
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto, createHash } from 'node:crypto';

const password = process.env.SITE_PASSWORD;
if (!password) { console.error('Bitte SITE_PASSWORD setzen.'); process.exit(1); }

const ITER = 600000;
// Cache-Busting: CSS/JS bekommen einen Hash, damit Browser nach einem Update nie alte Dateien mit neuem HTML mischen.
const hashOf = (rel) => createHash('sha256').update(readFileSync(new URL('../' + rel, import.meta.url))).digest('hex').slice(0, 10);
const plain = readFileSync(new URL('../_source/index.html', import.meta.url), 'utf8')
  .replace(/(href|src)="(css\/style\.css|js\/main\.js)"/g, (_, attr, rel) => `${attr}="${rel}?v=${hashOf(rel)}"`);
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
const b64 = (u) => Buffer.from(u).toString('base64');
const payload = JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(cipher), n: ITER });

const template = readFileSync(new URL('./login-template.html', import.meta.url), 'utf8');
writeFileSync(new URL('../index.html', import.meta.url), template.replace('__PAYLOAD__', () => payload));
console.log('index.html geschrieben.');
