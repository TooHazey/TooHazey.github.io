(() => {
const S = window.SITE;
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isPhone = () => window.matchMedia('(max-width: 760px)').matches;

document.documentElement.style.setProperty('--accent', S.accent);
document.documentElement.style.setProperty('--lock-img', `url("${S.lockWallpaper}")`);
document.documentElement.style.setProperty('--desk-img', `url("${S.desktopWallpaper}")`);
document.title = S.name;

// ---------- in-memory state (swap for a backend to make the guestbook permanent) ----------
const mem = {};
const store = {
  get(k, d) { return k in mem ? mem[k] : d; },
  set(k, v) { mem[k] = v; },
};

// ---------- icons ----------
const ICON = {
  calendar: () => { const d = new Date(); return `<div class="ic ic-cal"><span>${d.toLocaleDateString('en-US',{weekday:'short'})}</span><b>${d.getDate()}</b></div>`; },
  photos: () => `<div class="ic ic-photos"><svg viewBox="0 0 40 40">${[0,45,90,135,180,225,270,315].map((r,i)=>`<ellipse cx="20" cy="11" rx="5" ry="9" fill="${['#f9b233','#f37021','#e5383b','#c2185b','#7b4fd6','#2a7de1','#20b07a','#9bcf3a'][i]}" opacity=".88" transform="rotate(${r} 20 20)"/>`).join('')}</svg></div>`,
  safari: () => `<div class="ic ic-safari"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>${Array.from({length:24},(_,i)=>`<line x1="20" y1="6" x2="20" y2="${i%6?7.5:9}" stroke="#fff" stroke-width="1" opacity=".8" transform="rotate(${i*15} 20 20)"/>`).join('')}<path d="M27 13 L21.5 21.5 L13 27 L18.5 18.5Z" fill="#fff"/><path d="M27 13 L21.5 21.5 L18.5 18.5Z" fill="#ff3b30"/></svg></div>`,
  notes: () => `<div class="ic ic-notes"><i></i><i></i><i></i></div>`,
  terminal: () => `<div class="ic ic-term"><span>&gt;_</span></div>`,
  guestbook: () => `<div class="ic ic-msg"><svg viewBox="0 0 40 40"><path d="M20 9c-7.2 0-13 4.7-13 10.5 0 3.3 1.9 6.2 4.8 8.1L10.5 32l5.3-2.6c1.3.4 2.7.6 4.2.6 7.2 0 13-4.7 13-10.5S27.2 9 20 9z" fill="#fff"/></svg></div>`,
  mail: () => `<div class="ic ic-mail"><svg viewBox="0 0 40 40"><rect x="7" y="11" width="26" height="18" rx="2.5" fill="#fff"/><path d="M8 12.5 L20 22 L32 12.5" fill="none" stroke="#2a7de1" stroke-width="1.8"/></svg></div>`,
  gh: () => `<div class="ic ic-gh"><svg viewBox="0 0 24 24"><path fill="#fff" d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg></div>`,
  dc: () => `<div class="ic ic-dc"><svg viewBox="0 0 24 24"><path fill="#fff" d="M19.5 5.3A17 17 0 0 0 15.3 4l-.5 1a15.7 15.7 0 0 0-5.6 0L8.7 4a17 17 0 0 0-4.2 1.3C1.8 9.3 1.1 13.2 1.4 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.9l.4-.3a12.2 12.2 0 0 0 11.2 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7zM8.7 14.7c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z"/></svg></div>`,
  yt: () => `<div class="ic ic-yt"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="#ff0033"/><path d="M10 9 L15.5 12 L10 15Z" fill="#fff"/></svg></div>`,
  mc: () => `<div class="ic ic-mc"><svg viewBox="0 0 16 16"><rect width="16" height="16" fill="#7a5230"/><rect width="16" height="5" fill="#5fae3a"/><rect y="5" width="3" height="2" fill="#5fae3a"/><rect x="7" y="5" width="2" height="1" fill="#5fae3a"/><rect x="12" y="5" width="3" height="2" fill="#5fae3a"/><rect x="4" y="9" width="2" height="2" fill="#5c3c22"/><rect x="10" y="11" width="2" height="2" fill="#5c3c22"/></svg></div>`,
};

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
const guest = store.get('guestbook', []);
const lockNotifs = [
  { icon: 'guestbook', title: 'Leave me a note', body: 'Tap to say something about the site. It goes straight into the guestbook.', time: 'now', action: 'guestbook' },
  ...S.notifications,
  ...(guest[0] ? [{ icon: 'notes', title: `${guest[0].name} left a note`, body: `“${guest[0].msg}”`, time: 'earlier' }] : []),
];
lockNotifs.forEach((n, i) => {
  const c = el('button', 'notif', `${ICON[n.icon] ? ICON[n.icon]() : ''}<div class="n-body"><div class="n-row"><b>${esc(n.title)}</b><span>${esc(n.time)}</span></div><p>${esc(n.body)}</p></div>`);
  c.style.animationDelay = (400 + i * 650) + 'ms';
  c.addEventListener('click', e => { e.stopPropagation(); unlock(n.action || null); });
  notifBox.appendChild(c);
});

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
lock.addEventListener('pointerdown', e => { startY = e.clientY; lock.setPointerCapture?.(e.pointerId); });
lock.addEventListener('pointermove', e => {
  if (startY == null) return;
  const dy = Math.min(0, e.clientY - startY);
  lock.style.transform = `translateY(${dy * 0.6}px)`;
});
lock.addEventListener('pointerup', e => {
  const dy = startY == null ? 0 : e.clientY - startY; startY = null;
  lock.style.transform = '';
  if (dy < -60 || Math.abs(dy) < 6) unlock();
});
lock.addEventListener('wheel', e => { if (e.deltaY > 20) unlock(); }, { passive: true });
document.addEventListener('keydown', e => { if (!unlocked && ['Enter', ' ', 'ArrowUp'].includes(e.key)) { e.preventDefault(); unlock(); } });
$('#unlockBtn').addEventListener('click', e => { e.stopPropagation(); unlock(); });

// ---------- app content ----------
const APPS = {
  calendar: { name: 'Calendar', w: 380, h: 400, render: renderCalendar },
  photos:   { name: 'Photos',   w: 640, h: 290, render: renderPhotos },
  safari:   { name: 'Safari',   w: 860, h: 560, render: renderSafari },
  notes:    { name: 'Notes',    w: 720, h: 480, render: renderNotes },
  terminal: { name: 'Terminal', w: 640, h: 400, render: renderTerminal },
  guestbook:{ name: 'Guestbook',w: 440, h: 540, render: renderGuestbook },
  mail:     { name: 'Mail',     w: 560, h: 480, render: renderMail },
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

function renderPhotos() {
  const wrap = el('div', 'photos');
  S.photos.forEach((p, i) => {
    const f = el('figure', 'ph-item', `<img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="lazy"><figcaption>${esc(p.caption)}</figcaption>`);
    f.addEventListener('click', () => {
      const lb = el('div', 'lightbox', `<img src="${esc(p.src)}" alt="${esc(p.caption)}"><span>${esc(p.caption)}</span>`);
      lb.addEventListener('click', () => lb.remove());
      document.body.appendChild(lb);
    });
    wrap.appendChild(f);
  });
  return wrap;
}

function renderSafari() {
  const wrap = el('div', 'safari');
  const tabs = el('div', 'sf-tabs');
  const bar = el('div', 'sf-bar');
  const page = el('div', 'sf-page');
  wrap.append(tabs, bar, page);
  const show = i => {
    const p = S.projects[i];
    [...tabs.children].forEach((t, j) => t.classList.toggle('on', i === j));
    const host = p.url ? p.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'local project';
    bar.innerHTML = `<div class="sf-url"><svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="1" y="5" width="8" height="7" rx="1.5"/><path d="M3 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>${esc(host)}</div>${p.url ? `<a class="sf-open" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Open in new tab">↗</a>` : ''}`;
    page.innerHTML = `<div class="sf-hero"><div class="sf-num">${String(i + 1).padStart(2, '0')} / ${String(S.projects.length).padStart(2, '0')}</div><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p><div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener">Visit project</a>` : ''}</div>`;
  };
  S.projects.forEach((p, i) => { const t = el('button', 'sf-tab', esc(p.name)); t.onclick = () => show(i); tabs.appendChild(t); });
  show(0);
  return wrap;
}

function renderNotes() {
  const wrap = el('div', 'notes');
  const list = el('div', 'nt-list'), body = el('article', 'nt-body');
  wrap.append(list, body);
  const show = i => {
    [...list.children].forEach((t, j) => t.classList.toggle('on', i === j));
    const n = S.notes[i];
    body.innerHTML = `<time>${esc(n.date)}</time><h2>${esc(n.title)}</h2>${esc(n.body).split('\n').map(l => l ? `<p>${l}</p>` : '<br>').join('')}`;
  };
  S.notes.forEach((n, i) => {
    const b = el('button', 'nt-item', `<b>${esc(n.title)}</b><small>${esc(n.date)} · ${esc(n.body.slice(0, 38))}…</small>`);
    b.onclick = () => { show(i); if (isPhone()) wrap.classList.add('reading'); };
    list.appendChild(b);
  });
  body.addEventListener('click', () => isPhone() && wrap.classList.remove('reading'));
  show(0);
  return wrap;
}

function renderTerminal() {
  const wrap = el('div', 'term');
  const out = el('div', 'tm-out');
  const line = el('label', 'tm-line', `<span class="tm-p">${esc(S.handle)}@site ~ %</span>`);
  const input = el('input'); input.setAttribute('aria-label', 'Terminal command'); input.autocomplete = 'off'; input.spellcheck = false;
  line.appendChild(input); wrap.append(out, line);
  const print = (txt, cls = '') => { out.appendChild(el('div', cls, txt)); wrap.scrollTop = wrap.scrollHeight; };
  const cmds = {
    help: () => 'commands: <b>whoami</b>, <b>projects</b>, <b>stack</b>, <b>contact</b>, <b>open &lt;app&gt;</b>, <b>clear</b>',
    whoami: () => `${esc(S.name)} — ${esc(S.tagline)}<br>📍 ${esc(S.location)}`,
    projects: () => S.projects.map((p, i) => `<span class="tm-a">[${i + 1}]</span> ${esc(p.name)} — ${esc(p.tags.join(', '))}`).join('<br>'),
    stack: () => esc(S.notes.find(n => /stack/i.test(n.title))?.body || '').replace(/\n/g, '<br>'),
    contact: () => `<a href="mailto:${esc(S.email)}">${esc(S.email)}</a>`,
    clear: () => { out.innerHTML = ''; return null; },
    sudo: () => 'nice try.',
    ls: () => Object.keys(APPS).join('  '),
  };
  print(`Last login: ${new Date().toDateString()} on ttys001`, 'tm-dim');
  print(`Type <b>help</b> to get started.`);
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const v = input.value.trim(); input.value = '';
    print(`<span class="tm-p">${esc(S.handle)}@site ~ %</span> ${esc(v)}`);
    if (!v) return;
    const [c, arg] = v.split(/\s+/);
    if (c === 'open' && APPS[arg]) { open(arg); return print(`opening ${esc(arg)}…`, 'tm-dim'); }
    const r = cmds[c] ? cmds[c]() : `zsh: command not found: ${esc(c)}`;
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
    list.innerHTML = `<div class="gb-meta">Guestbook</div>` +
      `<div class="bub them">Hey — thanks for stopping by. Leave a note below 👇</div>` +
      items.slice().reverse().map(g => `<div class="bub me"><b>${esc(g.name)}</b>${esc(g.msg)}</div>`).join('');
    list.scrollTop = list.scrollHeight;
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const items = store.get('guestbook', []);
    items.unshift({ name: f.get('name').trim(), msg: f.get('msg').trim(), at: Date.now() });
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
    <textarea name="body" placeholder="Hey Ryan," required aria-label="Message"></textarea>
    <div class="ml-foot"><small>Opens in your email app</small><button class="btn">Send</button></div>`);
  wrap.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(wrap);
    window.location.href = `mailto:${S.email}?subject=${encodeURIComponent(f.get('subject'))}&body=${encodeURIComponent(f.get('body'))}`;
  });
  return wrap;
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
function open(id) {
  if (isPhone()) return openSheet(id);
  if (openWins[id]) { openWins[id].classList.remove('min'); return focus(id); }
  const a = APPS[id];
  const vw = innerWidth, vh = innerHeight;
  const w = Math.min(a.w, vw - 40), h = Math.min(a.h, vh - 150);
  const n = Object.keys(openWins).length;
  const win = el('section', 'win opening', `<header class="win-bar"><div class="lights"><button class="l-close" aria-label="Close"></button><button class="l-min" aria-label="Minimize"></button><button class="l-max" aria-label="Maximize"></button></div><span class="win-title">${a.name}</span></header>`);
  win.setAttribute('aria-label', a.name);
  Object.assign(win.style, { width: w + 'px', height: h + 'px', left: Math.max(20, (vw - w) / 2 + n * 28 - 40) + 'px', top: Math.max(40, (vh - h) / 2 - 50 + n * 24) + 'px' });
  const body = el('div', 'win-body'); body.appendChild(a.render()); win.appendChild(body);
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
  w.classList.add('closing'); delete openWins[id];
  dockItem(id)?.classList.remove('running');
  setTimeout(() => w.remove(), 200);
  $('#mbApp').textContent = 'Finder';
}
function drag(win, handle) {
  let sx, sy, ox, oy;
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
const dockApps = ['calendar', 'photos', 'safari', 'notes', 'terminal', 'guestbook', 'mail'];
function dockItem(id) { return dock.querySelector(`[data-app="${id}"]`); }
dockApps.forEach(id => {
  const b = el('button', 'dk', `${ICON[id]()}<span class="tip">${APPS[id].name}</span>`);
  b.dataset.app = id; b.setAttribute('aria-label', APPS[id].name);
  b.onclick = () => { b.classList.remove('bounce'); void b.offsetWidth; if (!openWins[id]) b.classList.add('bounce'); open(id); };
  dock.appendChild(b);
});
dock.appendChild(el('div', 'dk-sep'));
S.socials.forEach(s => {
  const a = el('a', 'dk', `${ICON[s.icon] ? ICON[s.icon]() : ''}<span class="tip">${esc(s.name)}</span>`);
  a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', s.name);
  dock.appendChild(a);
});
// magnification
dock.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  [...dock.querySelectorAll('.dk')].forEach(d => {
    const r = d.getBoundingClientRect();
    const dist = Math.abs(e.clientX - (r.left + r.width / 2));
    const s = 1 + Math.max(0, 1 - dist / 140) * 0.45;
    d.style.setProperty('--s', s.toFixed(3));
  });
});
dock.addEventListener('pointerleave', () => dock.querySelectorAll('.dk').forEach(d => d.style.setProperty('--s', 1)));

// widget text
$('#mbHandle').textContent = S.handle;
$('#wName').textContent = S.name;
$('#wTag').textContent = S.tagline;
$('#wLoc').textContent = S.location + ' · available for projects';

// ---------- phone ----------
$('#phName').textContent = S.name;
$('#phTag').textContent = S.tagline;
const grid = $('#phGrid'), phDock = $('#phDock');
const phoneIcon = (id, label, href) => {
  const t = el(href ? 'a' : 'button', 'ph-app', `${ICON[id]()}<span>${esc(label)}</span>`);
  if (href) { t.href = href; t.target = '_blank'; t.rel = 'noopener'; } else t.onclick = () => openSheet(id);
  return t;
};
['calendar', 'photos', 'terminal', 'guestbook'].forEach(id => grid.appendChild(phoneIcon(id, APPS[id].name)));
S.socials.forEach(s => grid.appendChild(phoneIcon(s.icon, s.name, s.url)));
['safari', 'notes', 'mail'].forEach(id => phDock.appendChild(phoneIcon(id, APPS[id].name)));

function openSheet(id) {
  const a = APPS[id];
  const sh = el('section', 'sheet', `<header class="sh-bar"><button class="sh-back" aria-label="Close">‹ Home</button><b>${a.name}</b><span></span></header>`);
  const body = el('div', 'sh-body'); body.appendChild(a.render()); sh.appendChild(body);
  $('#sheets').appendChild(sh);
  requestAnimationFrame(() => sh.classList.add('in'));
  $('.sh-back', sh).onclick = () => { sh.classList.remove('in'); setTimeout(() => sh.remove(), 320); };
}

// ---------- toast ----------
let tt;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }
})();
