// Servidor local só pra pré-visualizar a landing page: node server.mjs
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".mjs": "text/javascript" };

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(root, url === "/" ? "index.html" : url);
    if (!file.startsWith(root) || !fs.existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    const stat = fs.statSync(file);
    const type = types[path.extname(file)] ?? "application/octet-stream";
    const range = req.headers.range;
    if (range && type === "video/mp4") {
      const [s, e] = range.replace("bytes=", "").split("-");
      const start = Number(s);
      const end = e ? Number(e) : stat.size - 1;
      res.writeHead(206, { "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1, "Content-Type": type });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4173, () => console.log("http://localhost:4173"));
