#!/usr/bin/env node
/* Local preview server that follows the same rules as Netlify:
   real files are served as-is, then _redirects is applied (301s + SPA
   fallback). No dependencies.   node tools/serve.mjs [port]            */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 8080);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain",
};

const rules = (await readFile(join(root, "_redirects"), "utf8"))
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  .map((l) => { const [from, to, code] = l.split(/\s+/); return { from, to, code: Number(code || 301) }; });

async function fileFor(p) {
  const f = normalize(join(root, decodeURIComponent(p)));
  if (!f.startsWith(root)) return null;
  try { const s = await stat(f); return s.isFile() ? f : null; } catch { return null; }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  let p = url.pathname;
  let file = p !== "/" && (await fileFor(p));
  let status = 200;
  if (!file) {
    for (const r of rules) {
      const hit = r.from.endsWith("/*") ? p.startsWith(r.from.slice(0, -1)) : p === r.from;
      if (!hit) continue;
      if (r.code === 301 || r.code === 302) { res.writeHead(r.code, { Location: r.to }); return res.end(); }
      file = await fileFor(r.to); status = r.code; break;
    }
  }
  if (!file) { res.writeHead(404); return res.end("Not found"); }
  const body = await readFile(file);
  res.writeHead(status, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
  res.end(body);
}).listen(port, () => console.log(`Bodaq Deco preview → http://localhost:${port}`));
