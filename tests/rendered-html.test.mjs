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

test("includes the expanded three-map exploration slice", async () => {
  const [html, css, js] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("game.css", root), "utf8"),
    readFile(new URL("game.js", root), "utf8"),
  ]);
  assert.match(html, /双井地铁站/);
  assert.match(html, /日坛公园/);
  assert.match(html, /景山公园/);
  assert.match(html, /data-map="jingshan"/);
  assert.match(html, /data-map="bench"/);
  assert.match(html, /data-map="homestay"/);
  assert.match(html, /data-dir="up"/);
  assert.match(html, /id="actionBtn"/);
  assert.match(html, /couple-sprites-lite\.png/);
  assert.match(css, /\.tiles\{/);
  assert.match(css, /touch-action:none/);
  assert.match(js, /function move\(dir\)/);
  assert.match(js, /function subwayMeeting\(\)/);
  assert.match(js, /function handhold\(\)/);
  assert.match(js, /function benchScene\(\)/);
  assert.match(js, /function kissScene\(\)/);
  assert.match(js, /spriteLoader\.decoding='async'/);
  assert.match(js, /function solidCells\(\)/);
  assert.match(js, /function safePair\(gap=1\)/);
  assert.match(js, /setInterval\(\(\)=>move/);
  assert.match(js, /W=36,H=28/);
  assert.match(js, /function tileBlocked\(x,y\)/);
  assert.match(js, /function checkAutoEvent\(\)/);
  assert.match(js, /function photoMoment\(id,title,narration\)/);
  assert.match(js, /拍照 · 站好不要动/);
  assert.match(js, /REC 00:03/);
  assert.match(html, /id="photoFx"/);
  assert.match(html, /action-scene\.photo\{background-position:14\.286% 100%\}/);
  assert.match(js, /function benchMasterScene\(\)/);
  assert.match(js, /北京民宿/);
  assert.match(js, /朝日坛/);
  assert.match(js, /日坛公园 · 西门林荫区/);
  assert.match(js, /日坛公园 · 曲池胜春/);
  assert.match(js, /日坛公园 · 朝日坛古建区/);
  assert.match(js, /日坛公园 · 清晖观日/);
  assert.match(js, /function zoneShift\(name,entry\)/);
  assert.match(js, /vp\.clientWidth<760\?1\.18:1\.06/);
  assert.match(js, /宰牲亭/);
  assert.match(js, /曲池胜春/);
  assert.match(js, /玉馨园/);
  assert.match(js, /牡丹园/);
  assert.match(js, /周赏亭/);
  assert.match(js, /寿皇殿/);
  assert.match(js, /7号线换乘厅/);
  assert.match(html, /ticket-machine/);
  assert.match(html, /prop\.pond/);
  assert.match(html, /prop\.pagoda/);
  assert.match(html, /class="quickbar"/);
  assert.match(html, /ritan-bench-atlas-mobile\.webp/);
  assert.match(html, /beijing-subway-atlas\.webp/);
  assert.match(html, /beijing-home-atlas\.webp/);
  assert.match(html, /beijing-heritage-atlas\.webp/);
});
