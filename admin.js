(() => {
// ---------- repo this editor writes to ----------
const OWNER = 'TooHazey';
const REPO = 'TooHazey.github.io';
const BRANCH = 'main';
const FILE = 'content.json';
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#repoName').textContent = REPO;

let token = null, data = null, sha = null, dirty = false;
const KEY = 'ryanos-editor-token';
const readSaved = () => { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch { return null; } };
const saveTok = (t, remember) => { try { (remember ? localStorage : sessionStorage).setItem(KEY, t); } catch {} };
const clearTok = () => { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {} };

async function gh(path, opts = {}) {
  const r = await fetch(path.startsWith('http') ? path : API + path, {
    ...opts,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) },
  });
  const body = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) { const e = new Error(body?.message || r.statusText); e.status = r.status; throw e; }
  return body;
}
const b64encode = str => { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); };
const b64decode = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0)));

// ---------- sign in ----------
async function signIn(t, remember) {
  token = t.trim();
  const err = $('#signinErr'); err.textContent = '';
  const btn = $('#signinForm .primary'); btn.disabled = true; btn.textContent = 'Checking…';
  try {
    const me = await gh('https://api.github.com/user');
    if (me.login.toLowerCase() !== OWNER.toLowerCase()) throw Object.assign(new Error(`This token belongs to @${me.login}. Only @${OWNER} can edit this site.`), { status: 403 });
    const f = await gh(`/contents/${FILE}?ref=${BRANCH}`);
    sha = f.sha; data = JSON.parse(b64decode(f.content));
    if (remember != null) saveTok(token, remember);
    $('#who').textContent = '@' + me.login;
    $('#signin').hidden = true; $('#editor').hidden = false;
    buildEditor();
  } catch (e) {
    token = null;
    err.textContent = e.status === 401 ? 'That token is not valid or has expired.' : e.status === 404 ? `This token can't see ${REPO}. Make sure you selected that repo when creating it.` : e.message;
    if (remember == null) clearTok();
  } finally { btn.disabled = false; btn.textContent = 'Sign in'; }
}
$('#signinForm').addEventListener('submit', e => { e.preventDefault(); signIn($('#token').value, $('#remember').checked); });
$('#signout').onclick = () => { if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return; clearTok(); location.reload(); };
const saved = readSaved(); if (saved) signIn(saved, null);

// ---------- schema ----------
const ICONS = ['gh', 'li', 'bsky', 'dc', 'yt', 'mc', 'guestbook', 'notes', 'terminal', 'markets', 'games', 'mail', 'safari', 'photos', 'calendar', 'settings', 'messages', 'link'];
const SECTIONS = [
  { id: 'profile', title: 'Profile', hint: 'Your name and the intro card on the desktop.', fields: [
    { key: 'name', label: 'Full name' },
    { key: 'handle', label: 'Menu bar name', help: 'Shown top-left, like a logo.' },
    { key: 'tagline', label: 'Tagline', type: 'textarea' },
    { key: 'location', label: 'Location' },
    { key: 'email', label: 'Contact email', help: 'Used by the Mail app. Visible to visitors.' },
    { key: 'accent', label: 'Accent color', type: 'color' },
  ]},
  { id: 'pages', title: 'Pages', hint: 'The swipeable screens, in order. Home has your intro, weather and apps; Projects shows every project; About shows your notes, markets and contact card.', fields: [
    { key: 'pages', label: 'Pages', type: 'list', item: 'Page', fields: [{ key: 'title', label: 'Title' }, { key: 'type', label: 'Layout', type: 'select', options: ['home', 'projects', 'about'] }], blank: { title: 'New page', type: 'projects' } },
  ]},
  { id: 'look', title: 'Wallpapers', hint: 'The lock screen image, default desktop and the choices in Settings.', fields: [
    { key: 'lockWallpaper', label: 'Lock screen image', type: 'image' },
    { key: 'desktopWallpaper', label: 'Default desktop wallpaper', type: 'image' },
    { key: 'wallpapers', label: 'Wallpaper choices', type: 'list', item: 'Wallpaper', fields: [{ key: 'name', label: 'Name' }, { key: 'src', label: 'Image', type: 'image' }], blank: { name: 'New wallpaper', src: '' } },
  ]},
  { id: 'notifications', title: 'Lock screen', hint: 'Notifications that slide in on the lock screen.', fields: [
    { key: 'notifications', label: 'Notifications', type: 'list', item: 'Notification', fields: [{ key: 'title', label: 'Title' }, { key: 'body', label: 'Message', type: 'textarea' }, { key: 'time', label: 'Time label', help: 'e.g. now, 2h ago' }, { key: 'icon', label: 'Icon', type: 'select', options: ICONS }], blank: { title: 'New notification', body: '', time: 'now', icon: 'gh' } },
  ]},
  { id: 'projects', title: 'Projects', hint: 'Each project is a tab in the Safari app.', fields: [
    { key: 'projects', label: 'Projects', type: 'list', item: 'Project', fields: [{ key: 'name', label: 'Name' }, { key: 'url', label: 'Repo link (optional)' }, { key: 'demo', label: 'Live demo (optional)', help: 'Second button in Safari, for a GitHub Pages demo.' }, { key: 'icon', label: 'App icon (optional)', type: 'image', help: 'Square image. Leave empty for an auto-made icon with initials.' }, { key: 'desc', label: 'Description', type: 'textarea' }, { key: 'tags', label: 'Tags', type: 'tags', help: 'Separate with commas.' }], blank: { name: 'New project', url: '', demo: '', icon: '', desc: '', tags: [] } },
  ]},
  { id: 'notes', title: 'Notes', hint: 'Pages in the Notes app — about you, what you’re building, your stack.', fields: [
    { key: 'notes', label: 'Notes', type: 'list', item: 'Note', fields: [{ key: 'title', label: 'Title' }, { key: 'date', label: 'Date label', help: 'e.g. Today, Pinned' }, { key: 'body', label: 'Text', type: 'textarea', rows: 8, help: 'New lines are kept. Start a line with • for bullets.' }], blank: { title: 'New note', date: 'Today', body: '' } },
  ]},
  { id: 'photos', title: 'Photos', hint: 'Images in the Photos app.', fields: [
    { key: 'photos', label: 'Photos', type: 'list', item: 'Photo', fields: [{ key: 'src', label: 'Image', type: 'image' }, { key: 'caption', label: 'Caption' }], blank: { src: '', caption: '' } },
  ]},
  { id: 'widgets', title: 'Widgets', hint: 'Now Playing, weather, GitHub, Discord and the Markets app (with the Fear & Greed gauge).', fields: [
    { key: 'nowPlaying.title', label: 'Now playing — title' },
    { key: 'nowPlaying.artist', label: 'Now playing — artist' },
    { key: 'nowPlaying.video', label: 'Now playing — YouTube video ID', help: 'Played in the page after a tap. Example: 3Kxf2dHlDpQ. Nothing starts on load.' },
    { key: 'nowPlaying.url', label: 'Now playing — YouTube link', help: 'Optional. Shown as Mix. If empty, the video ID is used.' },
    { key: 'nowPlaying.cover', label: 'Now playing — cover art', type: 'image' },
    { key: 'weather.label', label: 'Weather — city name' },
    { key: 'weather.lat', label: 'Weather — latitude', type: 'number' },
    { key: 'weather.lon', label: 'Weather — longitude', type: 'number' },
    { key: 'github.user', label: 'GitHub — username', help: 'Powers the GitHub app and the contribution graph on the Projects page.' },
    { key: 'discord.userId', label: 'Discord — user ID (for live status)', help: 'Optional. In Discord: Settings → Advanced → Developer Mode, then right-click your name → Copy User ID. You also need to join discord.gg/lanyard once so your status can be read.' },
    { key: 'discord.username', label: 'Discord — display name', help: 'Shown when live status is off.' },
    { key: 'discord.invite', label: 'Discord — server invite link (optional)', help: 'If set, the widget button says “Join my server”.' },
    { key: 'markets', label: 'Markets — coins', type: 'tags', help: 'CoinGecko IDs, comma-separated: bitcoin, ethereum, solana…' },
  ]},
  { id: 'socials', title: 'Links', hint: 'Icons on the right side of the dock.', fields: [
    { key: 'socials', label: 'Links', type: 'list', item: 'Link', fields: [{ key: 'name', label: 'Name' }, { key: 'url', label: 'URL' }, { key: 'icon', label: 'Icon', type: 'select', options: ICONS }], blank: { name: 'New link', url: 'https://', icon: 'link' } },
  ]},
];

const getP = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const setP = (obj, path, v) => { const ks = path.split('.'); let o = obj; ks.slice(0, -1).forEach(k => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }); o[ks.at(-1)] = v; };
const markDirty = () => { dirty = true; $('#save').disabled = false; status(''); };

// ---------- rendering ----------
let current = 'profile';
function buildEditor() {
  const side = $('#side'); side.innerHTML = '';
  SECTIONS.forEach(s => { const b = el('button', s.id === current ? 'on' : '', esc(s.title)); b.onclick = () => { current = s.id; buildEditor(); }; side.appendChild(b); });
  const sec = SECTIONS.find(s => s.id === current);
  const form = $('#form'); form.innerHTML = `<h2>${esc(sec.title)}</h2><p class="hint">${esc(sec.hint)}</p>`;
  sec.fields.forEach(f => form.appendChild(field(data, f)));
}

function field(obj, f) {
  const wrap = el('div', 'field');
  const val = getP(obj, f.key);
  const id = 'f' + Math.random().toString(36).slice(2);
  if (f.type === 'list') return listField(obj, f);
  wrap.appendChild(el('label', '', esc(f.label))).setAttribute('for', id);
  let input;
  if (f.type === 'textarea') { input = el('textarea'); input.rows = f.rows || 4; input.value = val ?? ''; }
  else if (f.type === 'select') { input = el('select'); f.options.forEach(o => { const op = el('option', '', o); op.value = o; input.appendChild(op); }); input.value = val ?? f.options[0]; }
  else if (f.type === 'color') { input = el('input'); input.type = 'color'; input.value = val || '#ff8a3d'; }
  else if (f.type === 'number') { input = el('input'); input.type = 'number'; input.step = 'any'; input.value = val ?? ''; }
  else if (f.type === 'tags') { input = el('input'); input.value = (val || []).join(', '); }
  else if (f.type === 'image') return imageField(obj, f, wrap, id);
  else { input = el('input'); input.value = val ?? ''; }
  input.id = id;
  input.addEventListener('input', () => {
    let v = input.value;
    if (f.type === 'number') v = v === '' ? null : Number(v);
    if (f.type === 'tags') v = v.split(',').map(s => s.trim()).filter(Boolean);
    setP(obj, f.key, v); markDirty();
  });
  wrap.appendChild(input);
  if (f.help) wrap.appendChild(el('small', '', esc(f.help)));
  return wrap;
}

function imageField(obj, f, wrap, id) {
  const val = getP(obj, f.key) || '';
  const row = el('div', 'img-row', `<div class="thumb"></div><div class="img-ctl"><input id="${id}" value="${esc(val)}" placeholder="media/photo.jpg or https://…"><div class="img-btns"><label class="ghost upl">Upload image<input type="file" accept="image/*" hidden></label><span class="up-st"></span></div></div>`);
  const thumb = $('.thumb', row), text = $(`#${id}`, row), file = $('input[type=file]', row), st = $('.up-st', row);
  const show = src => { thumb.style.backgroundImage = src ? `url("${src.startsWith('http') || src.startsWith('data:') ? src : './' + src}")` : 'none'; };
  show(val);
  text.addEventListener('input', () => { setP(obj, f.key, text.value.trim()); show(text.value.trim()); markDirty(); });
  file.addEventListener('change', async () => {
    const fl = file.files[0]; if (!fl) return;
    st.textContent = 'Uploading…';
    try {
      const { b64, ext, preview } = await prepImage(fl);
      const name = `media/uploads/${Date.now()}-${fl.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'image'}.${ext}`;
      await gh(`/contents/${name}`, { method: 'PUT', body: JSON.stringify({ message: `Upload ${name}`, content: b64, branch: BRANCH }) });
      setP(obj, f.key, name); text.value = name; show(preview); markDirty();
      st.textContent = 'Uploaded. Save to use it.';
    } catch (e) { st.textContent = 'Upload failed: ' + e.message; }
    file.value = '';
  });
  wrap.appendChild(el('label', '', esc(f.label))).setAttribute('for', id);
  wrap.appendChild(row);
  if (f.help) wrap.appendChild(el('small', '', esc(f.help)));
  return wrap;
}

// Resize big photos to keep the site fast (max 2000px, JPEG)
function prepImage(fl) {
  return new Promise((res, rej) => {
    const rd = new FileReader();
    rd.onerror = () => rej(new Error('could not read file'));
    rd.onload = () => {
      const url = rd.result;
      if (/gif|svg/.test(fl.type)) return res({ b64: url.split(',')[1], ext: fl.type.includes('svg') ? 'svg' : 'gif', preview: url });
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 2000 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const png = fl.type === 'image/png' && fl.size < 600000;
        const out = png ? url : c.toDataURL('image/jpeg', 0.85);
        res({ b64: out.split(',')[1], ext: png ? 'png' : 'jpg', preview: out });
      };
      img.onerror = () => rej(new Error('not an image'));
      img.src = url;
    };
    rd.readAsDataURL(fl);
  });
}

function listField(obj, f) {
  const wrap = el('div', 'list');
  if (!Array.isArray(getP(obj, f.key))) setP(obj, f.key, []);
  const arr = getP(obj, f.key);
  const paint = () => {
    wrap.innerHTML = `<div class="list-head"><b>${esc(f.label)}</b><span>${arr.length}</span></div>`;
    arr.forEach((item, i) => {
      const card = el('div', 'item');
      const title = item.name || item.title || item.caption || `${f.item} ${i + 1}`;
      const head = el('div', 'item-head', `<b>${esc(title)}</b><div class="item-btns"><button title="Move up" aria-label="Move up" ${i === 0 ? 'disabled' : ''}>↑</button><button title="Move down" aria-label="Move down" ${i === arr.length - 1 ? 'disabled' : ''}>↓</button><button class="del" title="Delete" aria-label="Delete">✕</button></div>`);
      const [up, down, del] = head.querySelectorAll('button');
      up.onclick = () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; markDirty(); paint(); };
      down.onclick = () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; markDirty(); paint(); };
      del.onclick = () => { if (!confirm(`Delete "${title}"?`)) return; arr.splice(i, 1); markDirty(); paint(); };
      card.appendChild(head);
      const body = el('div', 'item-body');
      f.fields.forEach(sf => body.appendChild(field(item, sf)));
      body.addEventListener('input', e => { if (/name|title|caption/.test(e.target.closest('.field')?.querySelector('label')?.textContent.toLowerCase() || '')) $('b', head).textContent = item.name || item.title || item.caption || `${f.item} ${i + 1}`; });
      card.appendChild(body);
      wrap.appendChild(card);
    });
    const add = el('button', 'ghost add', `+ Add ${esc(f.item.toLowerCase())}`);
    add.onclick = () => { arr.push(structuredClone(f.blank)); markDirty(); paint(); wrap.lastElementChild.previousElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    wrap.appendChild(add);
  };
  paint();
  return wrap;
}

// ---------- save ----------
function status(t, kind) { const s = $('#status'); s.textContent = t; s.className = 'status ' + (kind || ''); }
async function save() {
  const btn = $('#save'); btn.disabled = true; btn.textContent = 'Saving…';
  const body = () => JSON.stringify({ message: 'Update site content', content: b64encode(JSON.stringify(data, null, 2) + '\n'), sha, branch: BRANCH });
  try {
    let r;
    try { r = await gh(`/contents/${FILE}`, { method: 'PUT', body: body() }); }
    catch (e) {
      if (e.status !== 409 && e.status !== 422) throw e;
      sha = (await gh(`/contents/${FILE}?ref=${BRANCH}`)).sha;  // file changed elsewhere — retry on latest
      r = await gh(`/contents/${FILE}`, { method: 'PUT', body: body() });
    }
    sha = r.content.sha; dirty = false;
    status('Saved. Live in about a minute.', 'ok');
    btn.textContent = 'Save changes';
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Save changes';
    status(e.status === 403 ? 'Save blocked — give the token Contents: Read and write.' : 'Save failed: ' + e.message, 'bad');
  }
}
$('#save').onclick = save;
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && token) { e.preventDefault(); if (dirty) save(); } });
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
