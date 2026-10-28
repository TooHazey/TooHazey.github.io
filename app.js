(async () => {
const S = await fetch('content.json?v=' + Date.now()).then(r => r.json());
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isPhone = () => window.matchMedia('(max-width: 760px)').matches;
const root = document.documentElement;

// ---------- visitor preferences (saved in this browser) ----------
const prefs = (() => { try { return JSON.parse(localStorage.getItem('ryanos-prefs') || '{}'); } catch { return {}; } })();
const savePrefs = () => { try { localStorage.setItem('ryanos-prefs', JSON.stringify(prefs)); } catch {} };
const mem = {};
const store = { get: (k, d) => (k in mem ? mem[k] : d), set: (k, v) => { mem[k] = v; } };

function applyLook() {
  root.style.setProperty('--accent', prefs.accent || S.accent);
  root.style.setProperty('--desk-img', `url("${prefs.wallpaper || S.desktopWallpaper}")`);
}
root.style.setProperty('--lock-img', `url("${S.lockWallpaper}")`);
applyLook();
document.title = S.name;

// ---------- icons ----------
const ICON = {
  calendar: () => { const d = new Date(); return `<div class="ic ic-cal"><span>${d.toLocaleDateString('en-US',{weekday:'short'})}</span><b>${d.getDate()}</b></div>`; },
  photos: () => `<div class="ic ic-photos"><svg viewBox="0 0 40 40">${[0,45,90,135,180,225,270,315].map((r,i)=>`<ellipse cx="20" cy="11" rx="5" ry="9" fill="${['#f9b233','#f37021','#e5383b','#c2185b','#7b4fd6','#2a7de1','#20b07a','#9bcf3a'][i]}" opacity=".88" transform="rotate(${r} 20 20)"/>`).join('')}</svg></div>`,
  safari: () => `<div class="ic ic-safari"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>${Array.from({length:24},(_,i)=>`<line x1="20" y1="6" x2="20" y2="${i%6?7.5:9}" stroke="#fff" stroke-width="1" opacity=".8" transform="rotate(${i*15} 20 20)"/>`).join('')}<path d="M27 13 L21.5 21.5 L13 27 L18.5 18.5Z" fill="#fff"/><path d="M27 13 L21.5 21.5 L18.5 18.5Z" fill="#ff3b30"/></svg></div>`,
  notes: () => `<div class="ic ic-notes"><i></i><i></i><i></i></div>`,
  terminal: () => `<div class="ic ic-term"><span>&gt;_</span></div>`,
  guestbook: () => `<div class="ic ic-msg"><svg viewBox="0 0 40 40"><path d="M20 9c-7.2 0-13 4.7-13 10.5 0 3.3 1.9 6.2 4.8 8.1L10.5 32l5.3-2.6c1.3.4 2.7.6 4.2.6 7.2 0 13-4.7 13-10.5S27.2 9 20 9z" fill="#fff"/></svg></div>`,
  mail: () => `<div class="ic ic-mail"><svg viewBox="0 0 40 40"><rect x="7" y="11" width="26" height="18" rx="2.5" fill="#fff"/><path d="M8 12.5 L20 22 L32 12.5" fill="none" stroke="#2a7de1" stroke-width="1.8"/></svg></div>`,
  markets: () => `<div class="ic ic-mkt"><svg viewBox="0 0 40 40"><polyline points="7,28 14,21 19,25 26,14 33,18" fill="none" stroke="#34c759" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="33" cy="18" r="2.2" fill="#34c759"/></svg></div>`,
  games: () => `<div class="ic ic-games"><svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="3" y="7" width="2" height="2" fill="#fff"/><rect x="5" y="7" width="2" height="2" fill="#fff"/><rect x="7" y="7" width="2" height="2" fill="#fff"/><rect x="7" y="5" width="2" height="2" fill="#fff"/><rect x="11" y="9" width="2" height="2" fill="#ff3b30"/></svg></div>`,
  settings: () => `<div class="ic ic-set"><svg viewBox="0 0 40 40"><g fill="#d1d1d6">${Array.from({length:8},(_,i)=>`<rect x="18" y="6" width="4" height="7" rx="1" transform="rotate(${i*45} 20 20)"/>`).join('')}</g><circle cx="20" cy="20" r="9" fill="#d1d1d6"/><circle cx="20" cy="20" r="4.5" fill="#636366"/></svg></div>`,
  gh: () => `<div class="ic ic-gh"><svg viewBox="0 0 24 24"><path fill="#fff" d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg></div>`,
  dc: () => `<div class="ic ic-dc"><svg viewBox="0 0 24 24"><path fill="#fff" d="M19.5 5.3A17 17 0 0 0 15.3 4l-.5 1a15.7 15.7 0 0 0-5.6 0L8.7 4a17 17 0 0 0-4.2 1.3C1.8 9.3 1.1 13.2 1.4 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.9l.4-.3a12.2 12.2 0 0 0 11.2 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7zM8.7 14.7c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z"/></svg></div>`,
  yt: () => `<div class="ic ic-yt"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="#ff0033"/><path d="M10 9 L15.5 12 L10 15Z" fill="#fff"/></svg></div>`,
  mc: () => `<div class="ic ic-mc"><svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="#7a5230"/><rect width="16" height="5" fill="#5fae3a"/><rect y="5" width="3" height="2" fill="#5fae3a"/><rect x="7" y="5" width="2" height="1" fill="#5fae3a"/><rect x="12" y="5" width="3" height="2" fill="#5fae3a"/><rect x="4" y="9" width="2" height="2" fill="#5c3c22"/><rect x="10" y="11" width="2" height="2" fill="#5c3c22"/></svg></div>`,
  link: () => `<div class="ic ic-link"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></div>`,
};
ICON.github = ICON.gh;
const icon = k => (ICON[k] || ICON.link)();

// ---------- clock ----------
function tick() {
  const d = new Date();
  const t = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  $('#lockTime').textContent = t;
  $('#lockDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  $('#mbClock').textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + '  ' + t;
  $('#phClock').textContent = t;
}
tick(); setInterval(tick, 10000);

// ---------- lock screen ----------
const notifBox = $('#lockNotifs');
function paintNotifs() {
  notifBox.innerHTML = '';
  const guest = store.get('guestbook', []);
  const list = [
    { icon: 'guestbook', title: 'Leave me a note', body: 'Tap to say something about the site. It goes straight into the guestbook.', time: 'now', action: 'guestbook' },
    ...(S.notifications || []),
    ...(guest[0] ? [{ icon: 'notes', title: `${guest[0].name} left a note`, body: `“${guest[0].msg}”`, time: 'just now' }] : []),
  ];
  list.forEach((n, i) => {
    const c = el('button', 'notif', `${icon(n.icon)}<div class="n-body"><div class="n-row"><b>${esc(n.title)}</b><span>${esc(n.time)}</span></div><p>${esc(n.body)}</p></div>`);
    c.style.animationDelay = (400 + i * 650) + 'ms';
    c.addEventListener('click', e => { e.stopPropagation(); unlock(n.action || null); });
    notifBox.appendChild(c);
  });
}
paintNotifs();

const lock = $('#lock');
let startY = null, unlocked = false;
function unlock(openApp) {
  if (unlocked) return; unlocked = true;
  lock.classList.add('gone');
  const target = isPhone() ? $('#phone') : $('#desktop');
  target.hidden = false;
  requestAnimationFrame(() => target.classList.add('in'));
  setTimeout(() => { lock.hidden = true; }, 700);
  if (openApp) setTimeout(() => open(openApp), 450);
}
function relock() {
  closeMenus();
  unlocked = false; lock.hidden = false; paintNotifs();
  requestAnimationFrame(() => lock.classList.remove('gone'));
}
lock.addEventListener('pointerdown', e => { startY = e.clientY; lock.setPointerCapture?.(e.pointerId); });
lock.addEventListener('pointermove', e => { if (startY == null) return; lock.style.transform = `translateY(${Math.min(0, e.clientY - startY) * 0.6}px)`; });
lock.addEventListener('pointerup', e => {
  const dy = startY == null ? 0 : e.clientY - startY; startY = null;
  lock.style.transform = '';
  if (dy < -60 || Math.abs(dy) < 6) unlock();
});
lock.addEventListener('wheel', e => { if (e.deltaY > 20) unlock(); }, { passive: true });
$('#unlockBtn').addEventListener('click', e => { e.stopPropagation(); unlock(); });

// ---------- apps ----------
const APPS = {
  calendar: { name: 'Calendar', w: 380, h: 420, render: renderCalendar },
  photos:   { name: 'Photos',   w: 640, h: 300, render: renderPhotos },
  safari:   { name: 'Safari',   w: 860, h: 560, render: renderSafari },
  notes:    { name: 'Notes',    w: 720, h: 480, render: renderNotes },
  markets:  { name: 'Markets',  w: 560, h: 560, render: renderMarkets },
  github:   { name: 'GitHub',   w: 820, h: 600, render: renderGitHub },
  games:    { name: 'Snake',    w: 440, h: 540, render: renderSnake },
  terminal: { name: 'Terminal', w: 640, h: 400, render: renderTerminal },
  guestbook:{ name: 'Guestbook',w: 440, h: 540, render: renderGuestbook },
  mail:     { name: 'Mail',     w: 560, h: 480, render: renderMail },
  settings: { name: 'Settings', w: 580, h: 450, render: renderSettings },
};

function renderCalendar() {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < first; i++) cells += '<span></span>';
  for (let i = 1; i <= days; i++) cells += `<span class="${i === d.getDate() ? 'today' : ''}">${i}</span>`;
  return el('div', 'cal', `<div class="cal-head"><b>${d.toLocaleDateString('en-US',{month:'long'})}</b> ${y}</div>
    <div class="cal-grid cal-dow">${['S','M','T','W','T','F','S'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-ev"><i></i><div><b>Open to projects</b><small>Bots, addons, tools — <a href="mailto:${esc(S.email)}">get in touch</a></small></div></div>`);
}

function lightbox(src, caption) {
  const lb = el('div', 'lightbox', `<img src="${esc(src)}" alt="${esc(caption)}"><span>${esc(caption)}</span>`);
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);
}
function renderPhotos() {
  const wrap = el('div', 'photos');
  (S.photos || []).forEach(p => {
    const f = el('figure', 'ph-item', `<img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy"><figcaption>${esc(p.caption)}</figcaption>`);
    f.addEventListener('click', () => lightbox(p.src, p.caption));
    wrap.appendChild(f);
  });
  return wrap;
}

function renderSafari(startAt = 0) {
  const wrap = el('div', 'safari');
  const tabs = el('div', 'sf-tabs'), bar = el('div', 'sf-bar'), page = el('div', 'sf-page');
  wrap.append(tabs, bar, page);
  const show = i => {
    const p = S.projects[i]; if (!p) return;
    [...tabs.children].forEach((t, j) => t.classList.toggle('on', i === j));
    const host = p.url ? p.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'local project';
    bar.innerHTML = `<div class="sf-url"><svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="1" y="5" width="8" height="7" rx="1.5"/><path d="M3 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>${esc(host)}</div>${p.url ? `<a class="sf-open" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Open in new tab">↗</a>` : ''}`;
    page.innerHTML = `<div class="sf-hero"><div class="sf-num">${String(i + 1).padStart(2, '0')} / ${String(S.projects.length).padStart(2, '0')}</div><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">Visit project</a>` : ''}</div>`;
  };
  (S.projects || []).forEach((p, i) => { const t = el('button', 'sf-tab', esc(p.name)); t.onclick = () => show(i); tabs.appendChild(t); });
  wrap.show = show;
  show(typeof startAt === 'number' ? startAt : 0);
  return wrap;
}

function renderNotes(startAt = 0) {
  const wrap = el('div', 'notes');
  const list = el('div', 'nt-list'), body = el('article', 'nt-body');
  wrap.append(list, body);
  const show = i => {
    const n = S.notes[i]; if (!n) return;
    [...list.children].forEach((t, j) => t.classList.toggle('on', i === j));
    body.innerHTML = `<time>${esc(n.date)}</time><h2>${esc(n.title)}</h2>${esc(n.body).split('\n').map(l => l ? `<p>${l}</p>` : '<br>').join('')}`;
  };
  (S.notes || []).forEach((n, i) => {
    const b = el('button', 'nt-item', `<b>${esc(n.title)}</b><small>${esc(n.date)} · ${esc(n.body.slice(0, 38))}…</small>`);
    b.onclick = () => { show(i); if (isPhone()) wrap.classList.add('reading'); };
    list.appendChild(b);
  });
  body.addEventListener('click', () => isPhone() && wrap.classList.remove('reading'));
  wrap.show = show;
  show(typeof startAt === 'number' ? startAt : 0);
  return wrap;
}

// ---- Markets (live crypto prices from CoinGecko, no key needed) ----
const fmtUsd = v => v >= 1 ? '$' + v.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : '$' + v.toPrecision(3);
function spark(pts, w = 90, h = 30, up = true) {
  if (!pts?.length) return '';
  const min = Math.min(...pts), max = Math.max(...pts), step = w / (pts.length - 1);
  const d = pts.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / (max - min || 1)) * h).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><polyline points="${d}" fill="none" stroke="${up ? '#34c759' : '#ff453a'}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
}
let mktCache = null, mktAt = 0;
async function getMarkets() {
  if (mktCache && Date.now() - mktAt < 60000) return mktCache;
  const ids = (S.markets || ['bitcoin', 'ethereum']).join(',');
  const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&sparkline=true&price_change_percentage=24h`);
  if (!r.ok) throw new Error('bad');
  mktCache = await r.json(); mktAt = Date.now(); return mktCache;
}
function renderMarkets() {
  const wrap = el('div', 'mkt', `<div class="mkt-head"><div><b>Markets</b><small>Live crypto prices · updates every minute</small></div><div class="mkt-fg"></div></div><div class="mkt-big"></div><div class="mkt-list"><div class="mkt-skel"></div><div class="mkt-skel"></div><div class="mkt-skel"></div></div>`);
  const list = $('.mkt-list', wrap), big = $('.mkt-big', wrap);
  getFng().then(d => { if (d) $('.mkt-fg', wrap).innerHTML = `${gauge(d[0].v, 64)}<div><small>Fear &amp; Greed</small><b style="color:${fngColor(d[0].v)}">${d[0].v} · ${esc(d[0].label)}</b></div>`; });
  const pick = c => {
    const up = (c.price_change_percentage_24h || 0) >= 0;
    big.innerHTML = `<div class="mkt-bt"><img src="${esc(c.image)}" alt=""><b>${esc(c.name)}</b><span>${esc(c.symbol.toUpperCase())}</span></div><div class="mkt-bp">${fmtUsd(c.current_price)} <em class="${up ? 'up' : 'dn'}">${up ? '▲' : '▼'} ${Math.abs(c.price_change_percentage_24h || 0).toFixed(2)}%</em></div>${spark(c.sparkline_in_7d?.price, 500, 110, up)}<small class="mkt-cap">7-day chart · Market cap ${fmtUsd(c.market_cap)}</small>`;
    [...list.children].forEach(r => r.classList.toggle('on', r.dataset.id === c.id));
  };
  const load = async () => {
    try {
      const data = await getMarkets();
      list.innerHTML = '';
      data.forEach(c => {
        const up = (c.price_change_percentage_24h || 0) >= 0;
        const row = el('button', 'mkt-row', `<div class="mkt-n"><b>${esc(c.symbol.toUpperCase())}</b><small>${esc(c.name)}</small></div>${spark(c.sparkline_in_7d?.price, 90, 30, up)}<div class="mkt-p"><b>${fmtUsd(c.current_price)}</b><span class="pill ${up ? 'up' : 'dn'}">${up ? '+' : ''}${(c.price_change_percentage_24h || 0).toFixed(2)}%</span></div>`);
        row.dataset.id = c.id; row.onclick = () => pick(c);
        list.appendChild(row);
      });
      pick(data.find(c => c.id === big.dataset.sel) || data[0]);
    } catch {
      list.innerHTML = `<div class="mkt-err">Market data is unavailable right now. Try again in a minute.</div>`;
    }
  };
  load();
  const iv = setInterval(() => { if (!document.body.contains(wrap)) return clearInterval(iv); mktAt = 0; load(); }, 60000);
  return wrap;
}

// ---- Snake (pixel game) ----
let activeGame = null;
function renderSnake() {
  const N = 20;
  const wrap = el('div', 'snake', `<div class="sn-bar"><span>Score <b class="sn-s">0</b></span><span>Best <b class="sn-b">0</b></span></div><div class="sn-stage"><canvas width="400" height="400" aria-label="Snake game"></canvas><div class="sn-over"><b>Snake</b><small>Arrow keys or WASD · swipe on phone</small><button class="btn sn-go">Play</button></div></div><div class="sn-pad"><button data-d="0,-1" aria-label="Up">▲</button><button data-d="-1,0" aria-label="Left">◀</button><button data-d="1,0" aria-label="Right">▶</button><button data-d="0,1" aria-label="Down">▼</button></div>`);
  const cv = $('canvas', wrap), cx = cv.getContext('2d'), cell = cv.width / N;
  const over = $('.sn-over', wrap);
  let best = +(prefs.snakeBest || 0); $('.sn-b', wrap).textContent = best;
  let snake, dir, next, food, score, timer;
  const place = () => { do { food = [Math.floor(Math.random() * N), Math.floor(Math.random() * N)]; } while (snake.some(s => s[0] === food[0] && s[1] === food[1])); };
  const draw = () => {
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { cx.fillStyle = (x + y) % 2 ? '#5fae3a' : '#57a334'; cx.fillRect(x * cell, y * cell, cell, cell); }
    cx.fillStyle = '#e5383b'; cx.fillRect(food[0] * cell + 3, food[1] * cell + 3, cell - 6, cell - 6);
    cx.fillStyle = '#ffd60a'; cx.fillRect(food[0] * cell + cell / 2 - 1, food[1] * cell, 3, 5);
    snake.forEach((s, i) => { cx.fillStyle = i ? '#3b2a1a' : '#1d140c'; cx.fillRect(s[0] * cell + 1, s[1] * cell + 1, cell - 2, cell - 2); });
  };
  const step = () => {
    dir = next;
    const h = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || snake.some(s => s[0] === h[0] && s[1] === h[1])) return end();
    snake.unshift(h);
    if (h[0] === food[0] && h[1] === food[1]) { score++; $('.sn-s', wrap).textContent = score; place(); clearInterval(timer); timer = setInterval(step, Math.max(60, 130 - score * 3)); }
    else snake.pop();
    draw();
  };
  const end = () => {
    clearInterval(timer); timer = null;
    if (score > best) { best = score; prefs.snakeBest = best; savePrefs(); $('.sn-b', wrap).textContent = best; }
    over.innerHTML = `<b>Game over</b><small>Score ${score}${score && score === best ? ' · new best' : ''}</small><button class="btn sn-go">Play again</button>`;
    over.hidden = false; $('.sn-go', over).onclick = start;
  };
  const start = () => {
    snake = [[10, 10], [9, 10], [8, 10]]; dir = next = [1, 0]; score = 0; $('.sn-s', wrap).textContent = 0;
    place(); draw(); over.hidden = true; clearInterval(timer); timer = setInterval(step, 130);
    activeGame = turn;
  };
  const turn = d => { if (!timer) return; if (d[0] === -dir[0] && d[1] === -dir[1]) return; next = d; };
  $('.sn-go', over).onclick = start;
  wrap.querySelectorAll('.sn-pad button').forEach(b => b.onclick = () => turn(b.dataset.d.split(',').map(Number)));
  let tx, ty;
  cv.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
  });
  snake = [[10, 10], [9, 10], [8, 10]]; food = [15, 10]; draw();
  wrap.cleanup = () => { clearInterval(timer); timer = null; };
  return wrap;
}
document.addEventListener('keydown', e => {
  if (!activeGame) return;
  const map = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
  const d = map[e.key]; if (!d) return;
  const gw = openWins.games;
  if ((gw && gw.classList.contains('focused')) || document.querySelector('.sheet .snake')) { e.preventDefault(); activeGame(d); }
});

function renderTerminal() {
  const wrap = el('div', 'term');
  const out = el('div', 'tm-out');
  const line = el('label', 'tm-line', `<span class="tm-p">${esc(S.handle)}@site ~ %</span>`);
  const input = el('input'); input.setAttribute('aria-label', 'Terminal command'); input.autocomplete = 'off'; input.spellcheck = false;
  line.appendChild(input); wrap.append(out, line);
  const print = (txt, cls = '') => { out.appendChild(el('div', cls, txt)); wrap.scrollTop = wrap.scrollHeight; };
  const hist = []; let hi = 0;
  const cmds = {
    help: () => 'commands: <b>whoami</b>, <b>projects</b>, <b>stack</b>, <b>contact</b>, <b>btc</b>, <b>fng</b>, <b>github</b>, <b>discord</b>, <b>weather</b>, <b>open &lt;app&gt;</b>, <b>ls</b>, <b>neofetch</b>, <b>clear</b>',
    whoami: () => `${esc(S.name)} — ${esc(S.tagline)}<br>📍 ${esc(S.location)}`,
    projects: () => S.projects.map((p, i) => `<span class="tm-a">[${i + 1}]</span> ${esc(p.name)} — ${esc((p.tags || []).join(', '))}`).join('<br>'),
    stack: () => esc(S.notes.find(n => /stack/i.test(n.title))?.body || '').replace(/\n/g, '<br>'),
    contact: () => `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>`,
    clear: () => { out.innerHTML = ''; return null; },
    ls: () => Object.keys(APPS).join('  '),
    sudo: () => 'nice try.',
    edit: () => { setTimeout(() => location.href = 'admin.html', 600); return 'owner only — opening sign-in…'; },
    neofetch: () => `<pre class="tm-neo"><span class="tm-a">   ▄▄▄▄▄▄   </span>  <b>${esc(S.handle)}</b>@site
<span class="tm-a">  █ ▄▄ ▄▄ █  </span>  OS: RyanOS 3.1 (web)
<span class="tm-a">  █ ▀▀ ▀▀ █  </span>  Host: GitHub Pages
<span class="tm-a">  █  ▄▄▄  █  </span>  Shell: zsh-ish
<span class="tm-a">   ▀▀▀▀▀▀   </span>  Apps: ${Object.keys(APPS).length}  ·  Projects: ${S.projects.length}</pre>`,
    btc: async () => { try { const d = await getMarkets(); const b = d.find(c => c.id === 'bitcoin') || d[0]; return `${esc(b.name)}: <b>${fmtUsd(b.current_price)}</b> (${b.price_change_percentage_24h.toFixed(2)}% 24h)`; } catch { return 'market data unavailable'; } },
    fng: async () => { const d = await getFng(); return d ? `Fear &amp; Greed: <b style="color:${fngColor(d[0].v)}">${d[0].v} (${esc(d[0].label)})</b> · yesterday ${d[1]?.v} · last week ${d[7]?.v}` : 'index unavailable'; },
    github: async () => { const { user, repos } = await getGH(); if (!user) return 'github unavailable'; return `<b>@${esc(user.login)}</b> · ${user.public_repos} repos · ${user.followers} followers<br>` + repos.slice(0, 5).map(r => `<span class="tm-a">●</span> ${esc(r.name)} <span class="tm-dim">${esc(r.language || '')} · ${ago(r.pushed_at)}</span>`).join('<br>'); },
    discord: async () => { const d = await getDiscord(); if (!d) return `find me on Discord: <a href="${esc(dcLink())}" target="_blank" rel="noopener">${esc(DC.username || S.handle)}</a>`; const a = dcActivity(d); return `<b>${esc(d.discord_user.username)}</b> is ${(DC_ST[d.discord_status] || DC_ST.offline)[1].toLowerCase()}${a ? ' · ' + esc(a.line) : ''}`; },
    weather: async () => { const w = await getWeather(); return w ? `${esc(S.weather.label)}: <b>${w.t}°F</b>, ${w.desc} · H ${w.hi}° L ${w.lo}°` : 'weather unavailable'; },
  };
  print(`Last login: ${new Date().toDateString()} on ttys001`, 'tm-dim');
  print(`Type <b>help</b> to get started.`);
  input.addEventListener('keydown', async e => {
    if (e.key === 'ArrowUp' && hist.length) { hi = Math.max(0, hi - 1); input.value = hist[hi]; return e.preventDefault(); }
    if (e.key === 'ArrowDown' && hist.length) { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; return; }
    if (e.key !== 'Enter') return;
    const v = input.value.trim(); input.value = '';
    print(`<span class="tm-p">${esc(S.handle)}@site ~ %</span> ${esc(v)}`);
    if (!v) return;
    hist.push(v); hi = hist.length;
    const [c, arg] = v.split(/\s+/);
    if (c === 'open' && APPS[arg]) { open(arg); return print(`opening ${esc(arg)}…`, 'tm-dim'); }
    const r = cmds[c] ? await cmds[c]() : `zsh: command not found: ${esc(c)}`;
    if (r) print(r);
  });
  wrap.addEventListener('click', () => input.focus());
  setTimeout(() => input.focus(), 80);
  return wrap;
}

function renderGuestbook() {
  const wrap = el('div', 'gb');
  const list = el('div', 'gb-list');
  const form = el('form', 'gb-form', `<input name="name" maxlength="24" placeholder="Your name" required aria-label="Your name"><div class="gb-row"><input name="msg" maxlength="140" placeholder="Say something about the site…" required aria-label="Message"><button aria-label="Send">↑</button></div>`);
  wrap.append(list, form);
  const paint = () => {
    const items = store.get('guestbook', []);
    list.innerHTML = `<div class="gb-meta">Guestbook</div><div class="bub them">Hey — thanks for stopping by. Leave a note below 👇</div>` +
      items.slice().reverse().map(g => `<div class="bub me"><b>${esc(g.name)}</b>${esc(g.msg)}</div>`).join('');
    list.scrollTop = list.scrollHeight;
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const items = store.get('guestbook', []);
    items.unshift({ name: f.get('name').trim(), msg: f.get('msg').trim() });
    store.set('guestbook', items.slice(0, 50));
    form.msg.value = ''; paint(); toast('Note added. Thank you.');
  });
  paint();
  return wrap;
}

function renderMail() {
  const wrap = el('form', 'mail', `
    <div class="ml-row"><span>To:</span><b>${esc(S.email)}</b></div>
    <label class="ml-row"><span>Subject:</span><input name="subject" placeholder="Let's build something" required></label>
    <textarea name="body" placeholder="Hey ${esc(S.name.split(' ')[0])}," required aria-label="Message"></textarea>
    <div class="ml-foot"><small>Opens in your email app</small><button class="btn">Send</button></div>`);
  wrap.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(wrap);
    window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(f.get('subject'))}&body=${encodeURIComponent(f.get('body'))}`;
  });
  return wrap;
}

function renderSettings() {
  const walls = S.wallpapers?.length ? S.wallpapers : [{ name: 'Default', src: S.desktopWallpaper }];
  const accents = [S.accent, '#0a84ff', '#34c759', '#bf5af2', '#ff375f', '#ffd60a'];
  const cur = () => prefs.wallpaper || S.desktopWallpaper;
  const wrap = el('div', 'set', `<h3>Wallpaper</h3><div class="set-walls"></div><h3>Accent color</h3><div class="set-acc"></div><h3>Other</h3><div class="set-row"><button class="set-btn" data-a="lock">Lock screen</button><button class="set-btn" data-a="reset">Reset to default</button></div><p class="set-note">These settings only change how the site looks for you, in this browser.</p>`);
  const wl = $('.set-walls', wrap), ac = $('.set-acc', wrap);
  const paint = () => {
    wl.innerHTML = ''; ac.innerHTML = '';
    walls.forEach(w => { const b = el('button', 'set-wall' + (cur() === w.src ? ' on' : ''), `<img src="${esc(w.src)}" alt=""><span>${esc(w.name)}</span>`); b.onclick = () => { prefs.wallpaper = w.src; savePrefs(); applyLook(); paint(); }; wl.appendChild(b); });
    accents.forEach(c => { const b = el('button', 'set-sw' + ((prefs.accent || S.accent) === c ? ' on' : '')); b.style.background = c; b.setAttribute('aria-label', 'Accent ' + c); b.onclick = () => { prefs.accent = c; savePrefs(); applyLook(); paint(); }; ac.appendChild(b); });
  };
  wrap.querySelector('[data-a=lock]').onclick = relock;
  wrap.querySelector('[data-a=reset]').onclick = () => { delete prefs.wallpaper; delete prefs.accent; savePrefs(); applyLook(); paint(); };
  paint();
  return wrap;
}

// ---------- weather (Open-Meteo, no key needed) ----------
const WMO = c => c === 0 ? ['Clear', '☀️'] : c <= 2 ? ['Partly cloudy', '⛅'] : c === 3 ? ['Cloudy', '☁️'] : c <= 48 ? ['Fog', '🌫️'] : c <= 57 ? ['Drizzle', '🌦️'] : c <= 67 ? ['Rain', '🌧️'] : c <= 77 ? ['Snow', '❄️'] : c <= 82 ? ['Showers', '🌧️'] : c <= 86 ? ['Snow showers', '🌨️'] : ['Storms', '⛈️'];
let wxP = null;
function getWeather() {
  if (!S.weather) return Promise.resolve(null);
  wxP = wxP || fetch(`https://api.open-meteo.com/v1/forecast?latitude=${S.weather.lat}&longitude=${S.weather.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`)
    .then(r => r.json()).then(d => { const [desc, emo] = WMO(d.current.weather_code); return { t: Math.round(d.current.temperature_2m), hi: Math.round(d.daily.temperature_2m_max[0]), lo: Math.round(d.daily.temperature_2m_min[0]), desc, emo }; })
    .catch(() => null);
  return wxP;
}
function weatherWidget(cls) {
  const w = el('div', 'mini wx ' + (cls || ''), `<small>${esc(S.weather?.label || '')}</small><div class="wx-t">--°</div><div class="wx-d">Loading…</div>`);
  getWeather().then(x => { if (!x) { $('.wx-d', w).textContent = 'Unavailable'; return; } w.innerHTML = `<small>${esc(S.weather.label)}</small><div class="wx-t">${x.t}°</div><div class="wx-d">${x.emo} ${x.desc}<br>H:${x.hi}° L:${x.lo}°</div>`; });
  return w;
}
function nowPlayingWidget(cls) {
  const n = S.nowPlaying || {};
  const w = el('a', 'mini np ' + (cls || ''), `<div class="np-art" style="background-image:url('${esc(n.cover || '')}')"></div><div class="np-txt"><small>Now playing</small><b>${esc(n.title || '')}</b><span>${esc(n.artist || '')}</span></div><div class="np-eq"><i></i><i></i><i></i><i></i></div>`);
  if (n.url) { w.href = n.url; w.target = '_blank'; w.rel = 'noopener'; }
  return w;
}


// ---------- shared helpers for live widgets ----------
const ago = t => { const s = (Date.now() - new Date(t)) / 1000; if (s < 60) return 'just now'; const u = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']].find(([n]) => s >= n); return Math.floor(s / u[0]) + u[1] + ' ago'; };
const alive = (node, fn, ms) => { const iv = setInterval(() => { if (!document.body.contains(node)) return clearInterval(iv); fn(); }, ms); };

// ---- Fear & Greed (alternative.me crypto index, no key needed) ----
let fngP = null;
const getFng = () => (fngP = fngP || fetch('https://api.alternative.me/fng/?limit=30').then(r => r.json()).then(d => d.data.map(x => ({ v: +x.value, label: x.value_classification, t: +x.timestamp * 1000 }))).catch(() => { fngP = null; return null; }));
const fngColor = v => v < 25 ? '#ff453a' : v < 45 ? '#ff9f0a' : v < 56 ? '#ffd60a' : v < 76 ? '#a3d94b' : '#34c759';
function gauge(v, size = 120) {
  const r = 46, cx = 60, cy = 58, seg = ['#ff453a', '#ff9f0a', '#ffd60a', '#a3d94b', '#34c759'];
  const pt = (a, rr = r) => [cx + rr * Math.cos(Math.PI * (1 - a)), cy - rr * Math.sin(Math.PI * (1 - a))];
  const arcs = seg.map((c, i) => { const [x1, y1] = pt(i / 5 + .012), [x2, y2] = pt((i + 1) / 5 - .012); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>`; }).join('');
  const [nx, ny] = pt(Math.max(0, Math.min(100, v ?? 50)) / 100, 36);
  return `<svg class="fg-g" viewBox="0 0 120 66" width="${size}" height="${size * .55}" aria-hidden="true">${arcs}<line class="fg-needle" x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="5" fill="#fff"/></svg>`;
}
function fngWidget(cls) {
  const w = el('button', 'fg-w ' + (cls || 'widget'), `<small class="fg-k">Fear &amp; Greed</small>${gauge(null)}<div class="fg-v">--</div><div class="fg-l">Loading…</div>`);
  w.setAttribute('aria-label', 'Crypto Fear and Greed index');
  w.onclick = () => open('markets');
  getFng().then(d => {
    if (!d) { $('.fg-l', w).textContent = 'Unavailable'; return; }
    const [now, yest] = d, wk = d[7], c = fngColor(now.v);
    const hist = d.slice().reverse().map(x => x.v);
    w.innerHTML = `<small class="fg-k">Fear &amp; Greed</small>${gauge(now.v)}<div class="fg-v" style="color:${c}">${now.v}</div><div class="fg-l">${esc(now.label)}</div><div class="fg-x"><span>Yesterday <b>${yest?.v ?? '-'}</b></span><span>Last week <b>${wk?.v ?? '-'}</b></span></div><div class="fg-h">${spark(hist, 240, 34, now.v >= (d[29]?.v ?? 0))}<small>30 days · crypto market mood</small></div>`;
  });
  return w;
}

// ---- Discord (live presence via Lanyard if a user ID is set) ----
const DC = S.discord || {};
const dcLink = () => DC.invite || (DC.userId ? `https://discord.com/users/${DC.userId}` : (S.socials || []).find(s => s.icon === 'dc')?.url || 'https://discord.com/');
const DC_ST = { online: ['#23a55a', 'Online'], idle: ['#f0b232', 'Idle'], dnd: ['#f23f43', 'Do not disturb'], offline: ['#80848e', 'Offline'] };
let dcCache = null, dcAt = 0;
async function getDiscord() {
  if (!DC.userId) return null;
  if (dcCache && Date.now() - dcAt < 25000) return dcCache;
  try { const r = await fetch(`https://api.lanyard.rest/v1/users/${encodeURIComponent(DC.userId)}`).then(r => r.json()); dcCache = r.success ? r.data : null; dcAt = Date.now(); } catch { dcCache = null; }
  return dcCache;
}
const ACT = ['Playing', 'Streaming', 'Listening to', 'Watching', '', 'Competing in'];
function dcActivity(d) {
  if (d.listening_to_spotify && d.spotify) return { line: `Listening to ${d.spotify.song}`, sub: `by ${d.spotify.artist}`, art: d.spotify.album_art_url };
  const a = (d.activities || []).find(x => x.type !== 4);
  if (a) return { line: `${ACT[a.type] || 'Playing'} ${a.name}`, sub: a.details || a.state || '' };
  return null;
}
function discordWidget(cls) {
  const w = el('a', 'dc-w ' + (cls || 'widget'));
  w.href = dcLink(); w.target = '_blank'; w.rel = 'noopener';
  const name = DC.username || S.handle;
  const paint = d => {
    if (!d) {
      w.innerHTML = `<div class="dc-top">${icon('dc')}<div class="dc-id"><b>${esc(name)}</b><small>Discord</small></div></div><p class="dc-act">Come hang out, talk bots, addons or trading.</p><span class="dc-btn">${DC.invite ? 'Join my server' : 'Message me'}</span>`;
      return;
    }
    const u = d.discord_user, [col, st] = DC_ST[d.discord_status] || DC_ST.offline;
    const av = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=128` : `https://cdn.discordapp.com/embed/avatars/${(BigInt(u.id) >> 22n) % 6n}.png`;
    const custom = (d.activities || []).find(x => x.type === 4)?.state;
    const act = dcActivity(d);
    w.innerHTML = `<div class="dc-top"><div class="dc-av" style="background-image:url('${esc(av)}')"><i style="background:${col}" title="${st}"></i></div><div class="dc-id"><b>${esc(u.global_name || u.display_name || u.username)}</b><small>@${esc(u.username)} · <span style="color:${col}">${st}</span></small></div></div>${custom ? `<p class="dc-cs">“${esc(custom)}”</p>` : ''}${act ? `<div class="dc-act on">${act.art ? `<img src="${esc(act.art)}" alt="">` : icon('games')}<div><b>${esc(act.line)}</b><small>${esc(act.sub)}</small></div></div>` : `<p class="dc-act">${d.discord_status === 'offline' ? 'Offline right now. Leave a message.' : 'Not playing anything right now.'}</p>`}<span class="dc-btn">${DC.invite ? 'Join my server' : 'Message me'}</span>`;
  };
  paint(null);
  if (DC.userId) { getDiscord().then(paint); alive(w, () => { dcAt = 0; getDiscord().then(paint); }, 30000); }
  return w;
}

// ---- GitHub (public API, cached 10 minutes per visitor) ----
const GHU = S.github?.user || 'TooHazey';
const LANG = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', 'C#': '#178600', Java: '#b07219', Lua: '#000080', Shell: '#89e051', Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d' };
let ghP = null;
function getGH() {
  if (ghP) return ghP;
  try { const c = JSON.parse(sessionStorage.getItem('ryanos-gh') || 'null'); if (c && c.u === GHU && Date.now() - c.t < 600000) return (ghP = Promise.resolve(c.d)); } catch {}
  const j = u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null);
  ghP = Promise.all([
    j(`https://api.github.com/users/${GHU}`),
    j(`https://api.github.com/users/${GHU}/repos?sort=pushed&per_page=30`),
    j(`https://api.github.com/users/${GHU}/events/public?per_page=40`),
    j(`https://github-contributions-api.jogruber.de/v4/${GHU}?y=last`),
  ]).then(([user, repos, events, contrib]) => {
    const d = { user, repos: (repos || []).filter(r => !r.fork), events: events || [], contrib };
    if (user) try { sessionStorage.setItem('ryanos-gh', JSON.stringify({ u: GHU, t: Date.now(), d })); } catch {}
    return d;
  });
  return ghP;
}
function heatmap(contrib, weeks = 53) {
  const days = contrib?.contributions || [];
  if (!days.length) return '<div class="hm-empty">Contribution graph unavailable</div>';
  const last = days.slice(-(weeks * 7 - (6 - new Date(days[days.length - 1].date + 'T12:00').getDay())));
  const pad = new Date(last[0].date + 'T12:00').getDay();
  const cells = Array(pad).fill('<i class="hm-x"></i>').concat(last.map(c => `<i class="l${c.level}" title="${c.count} contribution${c.count === 1 ? '' : 's'} on ${c.date}"></i>`));
  return `<div class="hm">${cells.join('')}</div>`;
}
function evText(e) {
  const r = `<b>${esc(e.repo.name.replace(GHU + '/', ''))}</b>`, p = e.payload || {};
  switch (e.type) {
    case 'PushEvent': { const n = p.size ?? p.commits?.length; return e._n ? `Pushed ${e._n} times to ${r}` : `Pushed ${n ? n + ' commit' + (n === 1 ? '' : 's') + ' ' : ''}to ${r}`; }
    case 'CreateEvent': return p.ref_type === 'repository' ? `Created repository ${r}` : `Created ${esc(p.ref_type)} ${esc(p.ref || '')} in ${r}`;
    case 'DeleteEvent': return `Deleted ${esc(p.ref_type)} ${esc(p.ref || '')} in ${r}`;
    case 'WatchEvent': return `Starred ${r}`;
    case 'ForkEvent': return `Forked ${r}`;
    case 'PublicEvent': return `Made ${r} public`;
    case 'ReleaseEvent': return `Released ${esc(p.release?.tag_name || '')} of ${r}`;
    case 'IssuesEvent': return `${esc(p.action)} an issue in ${r}`;
    case 'PullRequestEvent': return `${esc(p.action)} a pull request in ${r}`;
    default: return `${esc(e.type.replace('Event', ''))} in ${r}`;
  }
}
function groupEv(events) {
  const out = [];
  events.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).forEach(e => {
    const prev = out[out.length - 1];
    if (prev && e.type === 'PushEvent' && prev.type === 'PushEvent' && prev.repo.name === e.repo.name) { prev._n = (prev._n || 1) + 1; return; }
    out.push({ ...e });
  });
  return out;
}
const endScroll = node => requestAnimationFrame(() => node.querySelectorAll('.hm-scroll').forEach(h => h.scrollLeft = h.scrollWidth));
function renderGitHub() {
  const wrap = el('div', 'ghx', `<div class="ghx-load"><div class="mkt-skel"></div><div class="mkt-skel"></div><div class="mkt-skel"></div></div>`);
  getGH().then(({ user, repos, events, contrib }) => {
    if (!user) { wrap.innerHTML = `<div class="mkt-err">GitHub is not responding right now. <a href="https://github.com/${GHU}" target="_blank" rel="noopener">Open my profile</a> instead.</div>`; return; }
    const total = contrib?.total ? Object.values(contrib.total)[0] : null;
    wrap.innerHTML = `
      <header class="ghx-head"><img src="${esc(user.avatar_url)}&s=160" alt=""><div><h2>${esc(user.name || user.login)}</h2><small>@${esc(user.login)}${user.location ? ' · ' + esc(user.location) : ''}</small>${user.bio ? `<p>${esc(user.bio)}</p>` : ''}</div><a class="btn" href="${esc(user.html_url)}" target="_blank" rel="noopener">View profile</a></header>
      <div class="ghx-stats"><div><b>${user.public_repos}</b><small>Repos</small></div><div><b>${total ?? '-'}</b><small>Contributions (year)</small></div><div><b>${user.followers}</b><small>Followers</small></div><div><b>${user.following}</b><small>Following</small></div></div>
      <section class="ghx-hm"><h3>Contributions</h3><div class="hm-scroll">${heatmap(contrib)}</div><div class="hm-key">Less <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> More</div></section>
      <div class="ghx-cols"><section><h3>Repositories</h3><div class="ghx-repos">${repos.slice(0, 8).map(r => `<a class="ghx-r" href="${esc(r.html_url)}" target="_blank" rel="noopener"><b>${esc(r.name)}</b>${r.description ? `<p>${esc(r.description)}</p>` : ''}<small>${r.language ? `<span class="lang" style="--c:${LANG[r.language] || '#8e8e93'}"></span>${esc(r.language)} · ` : ''}★ ${r.stargazers_count} · updated ${ago(r.pushed_at)}</small></a>`).join('') || '<p class="muted">No public repos yet.</p>'}</div></section>
      <section><h3>Recent activity</h3><ul class="ghx-ev">${groupEv(events).slice(0, 10).map(e => `<li><span>${evText(e)}</span><time>${ago(e.created_at)}</time></li>`).join('') || '<li class="muted">No recent public activity.</li>'}</ul></section></div>`;
    endScroll(wrap);
  });
  return wrap;
}
function ghWidget(cls, weeks = 26) {
  const w = el('button', 'widget gh-w ' + (cls || ''), `<div class="ghw-top">${icon('gh')}<div><b>GitHub</b><small>@${esc(GHU)}</small></div></div><div class="hm-scroll"><div class="mkt-skel"></div></div>`);
  w.onclick = () => open('github');
  getGH().then(({ user, repos, contrib }) => {
    const total = contrib?.total ? Object.values(contrib.total)[0] : null;
    const latest = repos[0];
    w.innerHTML = `<div class="ghw-top">${user ? `<img src="${esc(user.avatar_url)}&s=96" alt="">` : icon('gh')}<div><b>GitHub</b><small>@${esc(GHU)}${total != null ? ` · ${total} contributions this year` : ''}</small></div>${latest ? `<span class="ghw-l">Latest: <b>${esc(latest.name)}</b> · ${ago(latest.pushed_at)}</span>` : ''}</div><div class="hm-scroll">${heatmap(contrib, weeks)}</div>`;
    endScroll(w);
  });
  return w;
}

// ---------- window manager (desktop) ----------
const winRoot = $('#windows');
const openWins = {};
let z = 10;
function focus(id) {
  Object.values(openWins).forEach(w => w.classList.remove('focused'));
  const w = openWins[id]; if (!w) return;
  w.style.zIndex = ++z; w.classList.add('focused');
  $('#mbApp').textContent = APPS[id].name;
}
function open(id, arg) {
  if (!APPS[id]) return;
  if (isPhone()) return openSheet(id, arg);
  if (openWins[id]) { openWins[id].classList.remove('min'); if (arg != null) openWins[id].content.show?.(arg); return focus(id); }
  const a = APPS[id];
  const vw = innerWidth, vh = innerHeight;
  const w = Math.min(a.w, vw - 40), h = Math.min(a.h, vh - 150);
  const n = Object.keys(openWins).length;
  const win = el('section', 'win opening', `<header class="win-bar"><div class="lights"><button class="l-close" aria-label="Close"></button><button class="l-min" aria-label="Minimize"></button><button class="l-max" aria-label="Maximize"></button></div><span class="win-title">${a.name}</span></header>`);
  win.setAttribute('aria-label', a.name);
  Object.assign(win.style, { width: w + 'px', height: h + 'px', left: Math.max(20, (vw - w) / 2 + n * 28 - 40) + 'px', top: Math.max(40, (vh - h) / 2 - 50 + n * 24) + 'px' });
  const body = el('div', 'win-body'); const content = a.render(arg); body.appendChild(content); win.appendChild(body); win.content = content;
  winRoot.appendChild(win); openWins[id] = win;
  dockItem(id)?.classList.add('running');
  focus(id);
  setTimeout(() => win.classList.remove('opening'), 300);
  win.addEventListener('pointerdown', () => focus(id));
  $('.l-close', win).onclick = e => { e.stopPropagation(); close(id); };
  $('.l-min', win).onclick = e => { e.stopPropagation(); win.classList.add('min'); $('#mbApp').textContent = 'Finder'; };
  $('.l-max', win).onclick = e => { e.stopPropagation(); win.classList.toggle('max'); };
  drag(win, $('.win-bar', win));
}
function close(id) {
  const w = openWins[id]; if (!w) return;
  w.content.cleanup?.();
  w.classList.add('closing'); delete openWins[id];
  dockItem(id)?.classList.remove('running');
  setTimeout(() => w.remove(), 200);
  $('#mbApp').textContent = 'Finder';
}
function drag(win, handle) {
  let sx = null, sy, ox, oy;
  handle.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || win.classList.contains('max')) return;
    sx = e.clientX; sy = e.clientY; ox = win.offsetLeft; oy = win.offsetTop;
    handle.setPointerCapture(e.pointerId); win.classList.add('dragging');
  });
  handle.addEventListener('pointermove', e => {
    if (sx == null) return;
    win.style.left = Math.min(innerWidth - 80, Math.max(-win.offsetWidth + 80, ox + e.clientX - sx)) + 'px';
    win.style.top = Math.min(innerHeight - 80, Math.max(28, oy + e.clientY - sy)) + 'px';
  });
  const end = () => { sx = null; win.classList.remove('dragging'); };
  handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
  handle.addEventListener('dblclick', () => win.classList.toggle('max'));
}

// ---------- dock ----------
const dock = $('#dock');
const dockApps = ['calendar', 'photos', 'safari', 'notes', 'github', 'markets', 'games', 'terminal', 'guestbook', 'mail', 'settings'];
function dockItem(id) { return dock.querySelector(`[data-app="${id}"]`); }
dockApps.forEach(id => {
  const b = el('button', 'dk', `${icon(id)}<span class="tip">${APPS[id].name}</span>`);
  b.dataset.app = id; b.setAttribute('aria-label', APPS[id].name);
  b.onclick = () => { b.classList.remove('bounce'); void b.offsetWidth; if (!openWins[id]) b.classList.add('bounce'); open(id); };
  dock.appendChild(b);
});
dock.appendChild(el('div', 'dk-sep'));
(S.socials || []).filter(s => s.icon !== 'gh').forEach(s => {
  const a = el('a', 'dk', `${icon(s.icon)}<span class="tip">${esc(s.name)}</span>`);
  a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', s.name);
  dock.appendChild(a);
});
dock.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  dock.querySelectorAll('.dk').forEach(d => {
    const r = d.getBoundingClientRect();
    const s = 1 + Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 140) * 0.45;
    d.style.setProperty('--s', s.toFixed(3));
  });
});
dock.addEventListener('pointerleave', () => dock.querySelectorAll('.dk').forEach(d => d.style.setProperty('--s', 1)));

// ---------- menus ----------
function closeMenus() { document.querySelectorAll('.menu').forEach(m => m.remove()); }
function menu(x, y, items) {
  closeMenus();
  const m = el('div', 'menu');
  items.forEach(it => {
    if (it === '-') return m.appendChild(el('hr'));
    const b = el('button', '', esc(it[0])); b.onclick = () => { closeMenus(); it[1](); }; m.appendChild(b);
  });
  document.body.appendChild(m);
  m.style.left = Math.min(x, innerWidth - m.offsetWidth - 8) + 'px';
  m.style.top = Math.min(y, innerHeight - m.offsetHeight - 8) + 'px';
}
document.addEventListener('pointerdown', e => { if (!e.target.closest('.menu, .mb-brand')) closeMenus(); });
function about() {
  closeMenus();
  const d = el('div', 'about', `<div class="about-card"><div class="about-av">${esc(S.name.split(' ').map(x => x[0]).join(''))}</div><h2>${esc(S.name)}</h2><p>${esc(S.tagline)}</p><dl><dt>Location</dt><dd>${esc(S.location)}</dd><dt>Projects</dt><dd>${S.projects.length}</dd><dt>Contact</dt><dd><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></dd><dt>Version</dt><dd>RyanOS 3.1</dd></dl><button class="btn">Close</button></div>`);
  d.onclick = e => { if (e.target === d || e.target.matches('.btn')) d.remove(); };
  document.body.appendChild(d);
}
const brandItems = () => [['About ' + S.name, about], ['Settings…', () => open('settings')], '-', ['Spotlight Search   Ctrl K', spotlight], ['Lock Screen', relock], '-', ['Edit site (owner)', () => location.href = 'admin.html']];
$('#mbHandle').addEventListener('click', e => { const r = e.target.getBoundingClientRect(); menu(r.left, r.bottom + 4, brandItems()); });
$('#spaces').addEventListener('contextmenu', e => { if (e.target.closest('.widget, button, a')) return; e.preventDefault(); menu(e.clientX, e.clientY, [['Change Wallpaper…', () => open('settings')], ['Open Terminal', () => open('terminal')], ['Play Snake', () => open('games')], '-', ...PAGES.map((pg, i) => ['Go to ' + pg.title, () => deskPager.go(i)]), '-', ['About This Site', about]]); });

// ---------- spotlight ----------
function spotlight() {
  closeMenus();
  if ($('.spot')) return;
  const ov = el('div', 'spot', `<div class="spot-box"><div class="spot-in"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input placeholder="Search apps, projects, notes…" aria-label="Search"></div><div class="spot-res"></div></div>`);
  const input = $('input', ov), res = $('.spot-res', ov);
  const all = [
    ...Object.entries(APPS).map(([id, a]) => ({ kind: 'App', label: a.name, ic: id, go: () => open(id) })),
    ...S.projects.map((p, i) => ({ kind: 'Project', label: p.name, ic: 'safari', go: () => open('safari', i) })),
    ...S.notes.map((n, i) => ({ kind: 'Note', label: n.title, ic: 'notes', go: () => open('notes', i) })),
    ...(S.socials || []).map(s => ({ kind: 'Link', label: s.name, ic: s.icon, go: () => window.open(s.url, '_blank', 'noopener') })),
  ];
  let sel = 0, cur = [];
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    cur = (q ? all.filter(x => (x.label + ' ' + x.kind).toLowerCase().includes(q)) : all.slice(0, 7)).slice(0, 8);
    sel = Math.min(sel, Math.max(0, cur.length - 1));
    res.innerHTML = cur.length ? '' : '<div class="spot-empty">No results</div>';
    cur.forEach((x, i) => { const b = el('button', 'spot-row' + (i === sel ? ' on' : ''), `${icon(x.ic)}<b>${esc(x.label)}</b><small>${x.kind}</small>`); b.onclick = () => { ov.remove(); x.go(); }; res.appendChild(b); });
  };
  input.addEventListener('input', () => { sel = 0; paint(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(cur.length - 1, sel + 1); paint(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); paint(); e.preventDefault(); }
    if (e.key === 'Enter' && cur[sel]) { ov.remove(); cur[sel].go(); }
    if (e.key === 'Escape') ov.remove();
  });
  ov.addEventListener('pointerdown', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov); paint(); input.focus();
}
$('#mbSearch').addEventListener('click', spotlight);
document.addEventListener('keydown', e => {
  if (!unlocked && ['Enter', ' ', 'ArrowUp'].includes(e.key)) { e.preventDefault(); return unlock(); }
  if (unlocked && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); spotlight(); }
  if (e.key === 'Escape') { closeMenus(); $('.about')?.remove(); }
});

// ---------- pages (swipeable home screens / desktop spaces) ----------
$('#mbHandle').textContent = S.handle;
const PAGES = (S.pages?.length ? S.pages : [{ title: 'Home', type: 'home' }, { title: 'Projects', type: 'projects' }, { title: 'About', type: 'about' }]);

// project "app icons": custom image, or a generated gradient tile with initials
const hue = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const initials = s => String(s).split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const projIcon = p => p.icon
  ? `<div class="ic ic-proj" style="background-image:url('${esc(p.icon)}')"></div>`
  : `<div class="ic ic-proj gen" style="--h:${hue(p.name)}"><span>${esc(initials(p.name))}</span></div>`;

function helloCard(cls) {
  return el('aside', 'widget hello ' + (cls || ''), `<div class="w-kicker">Hello, I'm</div><h1 class="w-name">${esc(S.name)}</h1><p class="w-tag">${esc(S.tagline)}</p><div class="w-meta"><span class="dot"></span><span>${esc(S.location)} · available for projects</span></div><div class="w-hint">Swipe or use ← → for more pages · Ctrl K to search</div>`);
}
function marketsWidget() {
  const w = el('button', 'widget mk-w', `<div class="w-kicker">Markets</div><div class="mk-rows"><div class="mkt-skel"></div></div>`);
  w.onclick = () => open('markets');
  getMarkets().then(d => {
    $('.mk-rows', w).innerHTML = d.slice(0, 3).map(c => { const up = (c.price_change_percentage_24h || 0) >= 0; return `<div class="mk-r"><b>${esc(c.symbol.toUpperCase())}</b>${spark(c.sparkline_in_7d?.price, 70, 22, up)}<span>${fmtUsd(c.current_price)}</span><em class="${up ? 'up' : 'dn'}">${up ? '+' : ''}${(c.price_change_percentage_24h || 0).toFixed(1)}%</em></div>`; }).join('');
  }).catch(() => { $('.mk-rows', w).innerHTML = '<small class="muted">Unavailable right now</small>'; });
  return w;
}
function noteWidget(n, i, cls) {
  const w = el('button', 'widget note-w ' + (cls || ''), `<div class="nw-top"><span class="nw-ic"></span>Notes</div><h3>${esc(n.title)}</h3><p>${esc(n.body).replace(/\n/g, '<br>')}</p>`);
  w.onclick = () => open('notes', i);
  return w;
}
function contactWidget() {
  const w = el('div', 'widget contact-w', `<div class="w-kicker">Get in touch</div><p>Got a bot, addon or tool idea? I'm open to projects.</p><div class="cw-btns"><button class="btn cw-mail">Email me</button><button class="btn ghost-btn cw-gb">Sign guestbook</button></div><div class="cw-socials"></div>`);
  $('.cw-mail', w).onclick = () => open('mail');
  $('.cw-gb', w).onclick = () => open('guestbook');
  (S.socials || []).forEach(s => { const a = el('a', 'cw-s', icon(s.icon)); a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.title = s.name; a.setAttribute('aria-label', s.name); $('.cw-socials', w).appendChild(a); });
  return w;
}
const aboutNoteIdx = () => Math.max(0, S.notes.findIndex(n => /about/i.test(n.title)));
const stackNoteIdx = () => S.notes.findIndex(n => /stack/i.test(n.title));

// --- desktop space builders ---
function deskSpace(pg) {
  const sp = el('section', 'space');
  sp.setAttribute('aria-label', pg.title);
  if (pg.type === 'home') {
    const col = el('div', 'deskcol'); col.appendChild(helloCard());
    const m = el('div', 'minis'); if (S.weather) m.appendChild(weatherWidget()); if (S.nowPlaying?.title) m.appendChild(nowPlayingWidget());
    col.appendChild(m); sp.appendChild(col);
    const rc = el('div', 'deskcol right'); rc.appendChild(discordWidget()); if (S.markets?.length) rc.appendChild(fngWidget()); sp.appendChild(rc);
  } else if (pg.type === 'projects') {
    const wrap = el('div', 'sp-wrap', `<div class="sp-title">${esc(pg.title)}<small>${S.projects.length} ${S.projects.length === 1 ? 'project' : 'projects'}</small></div>`);
    wrap.appendChild(ghWidget('wide', 30));
    const g = el('div', 'proj-grid');
    S.projects.forEach((p, i) => {
      const c = el('button', 'widget proj-card', `<div class="pc-top">${projIcon(p)}<span class="pc-n">${String(i + 1).padStart(2, '0')}</span></div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>`);
      c.onclick = () => open('safari', i);
      g.appendChild(c);
    });
    wrap.appendChild(g); sp.appendChild(wrap);
  } else if (pg.type === 'about') {
    const wrap = el('div', 'sp-wrap', `<div class="sp-title">${esc(pg.title)}</div>`);
    const g = el('div', 'about-grid');
    if (S.notes[aboutNoteIdx()]) g.appendChild(noteWidget(S.notes[aboutNoteIdx()], aboutNoteIdx(), 'big'));
    if (stackNoteIdx() >= 0) g.appendChild(noteWidget(S.notes[stackNoteIdx()], stackNoteIdx(), 'stack'));
    if (S.markets?.length) g.appendChild(marketsWidget());
    g.appendChild(contactWidget());
    wrap.appendChild(g); sp.appendChild(wrap);
  }
  return sp;
}

// --- phone page builders ---
const phoneIcon = (iconHtml, label, onclick, href) => {
  const t = el(href ? 'a' : 'button', 'ph-app', `${iconHtml}<span>${esc(label)}</span>`);
  if (href) { t.href = href; t.target = '_blank'; t.rel = 'noopener'; } else t.onclick = onclick;
  return t;
};
function phonePage(pg) {
  const p = el('section', 'ph-page');
  p.setAttribute('aria-label', pg.title);
  if (pg.type === 'home') {
    p.appendChild(el('div', 'ph-widget', `<div class="w-kicker">Hello, I'm</div><div class="ph-name">${esc(S.name)}</div><div class="ph-tag">${esc(S.tagline)}</div>`));
    const m = el('div', 'minis ph-minis'); if (S.weather) m.appendChild(weatherWidget()); if (S.nowPlaying?.title) m.appendChild(nowPlayingWidget());
    p.appendChild(m);
    const m2 = el('div', 'minis ph-minis'); m2.appendChild(discordWidget('mini')); if (S.markets?.length) m2.appendChild(fngWidget('mini'));
    p.appendChild(m2);
    const g = el('div', 'ph-grid');
    ['calendar', 'photos', 'github', 'markets', 'games', 'terminal', 'guestbook', 'settings'].forEach(id => g.appendChild(phoneIcon(icon(id), APPS[id].name, () => openSheet(id))));
    p.appendChild(g);
  } else if (pg.type === 'projects') {
    const f = S.projects[0];
    if (f) { const c = el('button', 'widget proj-card ph-feat', `<div class="pc-top">${projIcon(f)}<span class="pc-n">Featured</span></div><h3>${esc(f.name)}</h3><p>${esc(f.desc)}</p>`); c.onclick = () => openSheet('safari', 0); p.appendChild(c); }
    p.appendChild(ghWidget('ph-gh', 17));
    const g = el('div', 'ph-grid');
    S.projects.forEach((pr, i) => g.appendChild(phoneIcon(projIcon(pr), pr.name, () => openSheet('safari', i))));
    p.appendChild(g);
  } else if (pg.type === 'about') {
    if (S.notes[aboutNoteIdx()]) p.appendChild(noteWidget(S.notes[aboutNoteIdx()], aboutNoteIdx(), 'ph-note'));
    const row = el('div', 'minis ph-minis');
    if (S.markets?.length) row.appendChild(marketsWidget());
    if (stackNoteIdx() >= 0) row.appendChild(noteWidget(S.notes[stackNoteIdx()], stackNoteIdx(), 'stack'));
    p.appendChild(row);
    const g = el('div', 'ph-grid');
    (S.socials || []).forEach(s => g.appendChild(phoneIcon(icon(s.icon), s.name, null, s.url)));
    g.appendChild(phoneIcon(icon('mail'), 'Email', () => openSheet('mail')));
    p.appendChild(g);
  }
  return p;
}

// --- pager: native scroll-snap + dots + keys + mouse drag + wheel ---
function pager(track, dotsEl, pages, { wall } = {}) {
  const dots = pages.map((pg, i) => { const d = el('button', 'dot-b', ''); d.setAttribute('role', 'tab'); d.setAttribute('aria-label', `${pg.title} (page ${i + 1})`); d.onclick = () => go(i); dotsEl.appendChild(d); return d; });
  if (pages.length < 2) dotsEl.hidden = true;
  let cur = 0;
  const go = (i, smooth = true) => { i = Math.max(0, Math.min(pages.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' }); };
  const sync = () => {
    const x = track.scrollLeft / (track.clientWidth || 1);
    const i = Math.round(x);
    if (wall) wall.style.setProperty('--px', Math.max(-6, -x * 2) + '%');
    if (i !== cur) { cur = i; }
    dots.forEach((d, j) => { d.classList.toggle('on', j === cur); d.setAttribute('aria-selected', j === cur); });
    track.querySelectorAll(':scope > section').forEach((s, j) => s.toggleAttribute('inert', j !== cur && Math.abs(x - j) > .5));
  };
  track.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', () => go(cur, false));
  // mouse drag on empty space (touch already swipes natively)
  let dx = null, sl = 0, moved = false;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, a, input, .widget')) return;
    dx = e.clientX; sl = track.scrollLeft; moved = false; track.classList.add('dragging');
  });
  addEventListener('pointermove', e => { if (dx == null) return; const d = e.clientX - dx; if (Math.abs(d) > 3) moved = true; track.scrollLeft = sl - d; });
  addEventListener('pointerup', e => {
    if (dx == null) return;
    const d = e.clientX - dx; dx = null; track.classList.remove('dragging');
    go(Math.abs(d) > track.clientWidth * .12 ? cur + (d < 0 ? 1 : -1) : cur);
  });
  // vertical mouse wheel flips pages (trackpads swipe sideways natively)
  let wlock = 0;
  track.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.target.closest('.win')) return;
    const sc = e.target.closest('.sp-wrap, .ph-page');
    if (sc && sc.scrollHeight > sc.clientHeight + 4) return;
    if (Math.abs(e.deltaY) < 25 || Date.now() < wlock) return;
    wlock = Date.now() + 650; go(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });
  sync();
  return { go, get cur() { return cur; }, count: pages.length };
}

const spacesEl = $('#spaces');
PAGES.forEach(pg => spacesEl.appendChild(deskSpace(pg)));
const deskPager = pager(spacesEl, $('#deskDots'), PAGES, { wall: $('#desktop .wall') });
$('#spPrev').onclick = () => deskPager.go(deskPager.cur - 1);
$('#spNext').onclick = () => deskPager.go(deskPager.cur + 1);
const syncArrows = () => { $('#spPrev').hidden = deskPager.cur === 0; $('#spNext').hidden = deskPager.cur >= deskPager.count - 1; };
spacesEl.addEventListener('scroll', syncArrows, { passive: true }); syncArrows();

const phPagesEl = $('#phPages');
PAGES.forEach(pg => phPagesEl.appendChild(phonePage(pg)));
const phPager = pager(phPagesEl, $('#phDots'), PAGES, { wall: $('#phone .wall') });
const phDock = $('#phDock');
['safari', 'notes', 'mail'].forEach(id => phDock.appendChild(phoneIcon(icon(id), APPS[id].name, () => openSheet(id))));

document.addEventListener('keydown', e => {
  if (!unlocked || e.target.closest('input, textarea') || $('.spot, .about, .lightbox, .sheet') || e.metaKey || e.altKey) return;
  if (activeGame && openWins.games?.classList.contains('focused')) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const pgr = isPhone() ? phPager : deskPager;
  pgr.go(pgr.cur + (e.key === 'ArrowRight' ? 1 : -1));
});

function openSheet(id, arg) {
  const a = APPS[id];
  const sh = el('section', 'sheet', `<header class="sh-bar"><button class="sh-back" aria-label="Close">‹ Home</button><b>${a.name}</b><span></span></header>`);
  const body = el('div', 'sh-body'); const content = a.render(arg); body.appendChild(content); sh.appendChild(body);
  $('#sheets').appendChild(sh);
  requestAnimationFrame(() => sh.classList.add('in'));
  $('.sh-back', sh).onclick = () => { content.cleanup?.(); sh.classList.remove('in'); setTimeout(() => sh.remove(), 320); };
}

// ---------- toast ----------
let tt;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }
})();
