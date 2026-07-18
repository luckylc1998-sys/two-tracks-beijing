import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("renders the finished game shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /两条轨道 · 北京篇/);
  assert.match(html, /\/game\/index\.html/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("includes the two-map free exploration slice", async () => {
  const [html, css, js] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("game.css", root), "utf8"),
    readFile(new URL("game.js", root), "utf8"),
  ]);
  assert.match(html, /双井地铁站/);
  assert.match(html, /日坛公园/);
  assert.match(html, /data-dir="up"/);
  assert.match(html, /id="actionBtn"/);
  assert.match(css, /\.tiles\{/);
  assert.match(css, /touch-action:none/);
  assert.match(js, /function move\(dir\)/);
  assert.match(js, /function subwayMeeting\(\)/);
  assert.match(js, /function handhold\(\)/);
  assert.match(js, /function benchScene\(\)/);
  assert.match(js, /function kissScene\(\)/);
});
