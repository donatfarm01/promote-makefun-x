// Promote make.fun on X: entry program (Node 22, standard library only).
//
// The entry itself is the X post. This program has one job: hand the post's
// address to the grader. It reads POST.json from the repository root,
// checks that it names a post address, and writes an identical copy to
// /output/POST.json. The house then reads the post from X and scores its
// replies plus its reposts plus its quotes. Nothing this program writes
// about the post is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(BOT_DIR, 'POST.json');
const targetPath = join(OUTPUT_DIR, 'POST.json');

// Read the address first so a malformed file fails loudly here instead of
// silently copying a bad entry through to the grader.
const raw = readFileSync(sourcePath, 'utf8');
const parsed: unknown = JSON.parse(raw);
if (typeof parsed !== 'object' || parsed === null) {
  console.error('POST.json must be a JSON object with a string "url" field.');
  process.exit(1);
}
const url = (parsed as { url?: unknown }).url;
if (typeof url !== 'string' || url.length === 0) {
  console.error('POST.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

// The address must name a real X post: x.com or twitter.com, then
// /status/ followed by the post's digits. A placeholder fails here on
// purpose, so a bad address never slips through to the grader unnoticed.
const postAddress = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+\/?(\?.*)?$/.test(url);
if (!postAddress) {
  console.error(`POST.json url does not name an X post: ${url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(sourcePath, targetPath);
console.log(`POST.json copied to ${targetPath}: ${url}`);
