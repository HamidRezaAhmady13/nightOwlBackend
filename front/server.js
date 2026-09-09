// server.js
require("dotenv").config();
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const CERT =
  process.env.SSL_CRT_FILE || path.join(__dirname, "..", "localhost+2.pem");
const KEY =
  process.env.SSL_KEY_FILE || path.join(__dirname, "..", "localhost+2-key.pem");

const httpsOptions = { key: fs.readFileSync(KEY), cert: fs.readFileSync(CERT) };

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, "127.0.0.1", () => {
    console.log("> Next (HTTPS) ready on https://127.0.0.1:3000");
  });
});
