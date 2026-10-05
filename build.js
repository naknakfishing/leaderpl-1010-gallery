// 우리 반 사이트 갤러리 — sites/*.md 를 읽어 public/index.html 을 만든다.
// 패키지 설치 없이 Node 만으로 동작한다. Vercel 빌드 명령: node build.js
const fs = require('node:fs');
const path = require('node:path');

const SITES = path.join(__dirname, 'sites');
const OUT = path.join(__dirname, 'public');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s || '').trim().slice(0, n);

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    meta[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  let url = clip(meta.url, 200);
  try { const u = new URL(url); if (u.protocol !== 'https:') url = ''; else url = u.href; } catch { url = ''; }
  const card = {
    id: path.basename(file, '.md'),
    title: clip(meta.title, 30),
    oneline: clip(meta.oneline, 60),
    category: clip(meta.category, 15),
    url,
    sample: meta.sample === 'true',
  };
  if (!card.title || !card.url) return null;
  return card;
}

const files = fs.existsSync(SITES) ? fs.readdirSync(SITES).filter((f) => /^[a-z0-9-]+\.md$/.test(f)) : [];
const cards = files.map((f) => parse(path.join(SITES, f))).filter(Boolean);
cards.sort((a, b) => (a.sample === b.sample ? a.title.localeCompare(b.title, 'ko') : a.sample ? -1 : 1));
const real = cards.filter((c) => !c.sample).length;

const cardHtml = cards.map((c) => {
  const host = new URL(c.url).host;
  return `<a class="card${c.sample ? ' sample' : ''}" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">
  <div class="chips">${c.category ? `<span class="cat">${esc(c.category)}</span>` : ''}${c.sample ? '<span class="cat ex">예시</span>' : ''}</div>
  <h2>${esc(c.title)}</h2>
  ${c.oneline ? `<p>${esc(c.oneline)}</p>` : ''}
  <span class="host">${esc(host)} ↗</span>
</a>`;
}).join('\n');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>우리 반 사이트 갤러리 · 리더플 AI 스쿨 실습실</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
:root{--bg:#F6F7F1;--paper:#fff;--ink:#1D2118;--ink2:#5B6352;--line:#DCE1D2;--acc:#3A8F00;--neon:#C6F24E}
@media (prefers-color-scheme:dark){:root{--bg:#141711;--paper:#1C2018;--ink:#E8ECE0;--ink2:#A2AA95;--line:#30362A;--acc:#9BE05C;--neon:#3D5A16}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Pretendard,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;word-break:keep-all}
.wrap{max-width:1080px;margin:0 auto;padding:40px 16px 64px}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.04em;color:var(--acc)}
h1{font-size:clamp(28px,6vw,44px);line-height:1.2;margin:.25em 0 .2em}
h1 b{background:linear-gradient(transparent 62%,var(--neon) 62%)}
.lead{color:var(--ink2);margin:0 0 28px;font-size:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.card{display:flex;flex-direction:column;gap:6px;min-width:0;background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:18px;color:inherit;text-decoration:none;transition:transform .15s,border-color .15s}
.card:hover,.card:focus-visible{transform:translateY(-2px);border-color:var(--acc);outline:none}
.card.sample{border-style:dashed}
.chips{display:flex;flex-wrap:wrap;gap:4px;min-height:22px}
.cat{font-size:12px;font-weight:700;color:var(--acc);border:1px solid var(--acc);border-radius:999px;padding:2px 9px}
.cat.ex{color:var(--ink2);border-color:var(--line)}
.card h2{font-size:19px;margin:4px 0 0;overflow-wrap:anywhere}
.card p{margin:0;color:var(--ink2);font-size:14.5px;line-height:1.55}
.host{margin-top:auto;padding-top:8px;font-size:12.5px;color:var(--ink2);overflow-wrap:anywhere}
.empty{color:var(--ink2);padding:24px;border:1px dashed var(--line);border-radius:16px;text-align:center}
footer{margin-top:40px;font-size:13px;color:var(--ink2)}
</style>
</head>
<body>
<div class="wrap">
  <div class="eyebrow">리더플 AI 스쿨 실습실 01 · 2026.10.10</div>
  <h1>우리 반 사이트 <b>${real}곳</b></h1>
  <p class="lead">오늘 밤 클로드와 함께 만든 사이트들이에요. 카드를 누르면 새 창에서 열려요.</p>
  <div class="grid">
${cardHtml || '<p class="empty">아직 올라온 사이트가 없어요.</p>'}
  </div>
  <footer>리더플AI · 이 페이지는 검색에 노출되지 않아요 · 수업 후 30일 동안 열어 둡니다</footer>
</div>
</body>
</html>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`갤러리 생성: 카드 ${cards.length}개 (예시 제외 ${real}곳), 건너뛴 파일 ${files.length - cards.length}개`);
