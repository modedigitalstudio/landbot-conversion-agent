/* Landbot Conversion Agent · WhatsApp pricing post · built 2026-10-08 */
/* lb-journey · first-party record of how a visitor moves through the site, for the Conversion Agent's handoff.
   Runs on every page of the site. Records ONLY after analytics consent (CookieFirst "performance").
   Stores in this browser only (localStorage "lb-journey-v1"): referrer host, UTMs, landing page, pages with time and scroll,
   visit count. Nothing is sent anywhere by this script; the agent reads it when the visitor talks to it. */
(function () {
  if (window.lbJourney) return;                         // already running (site-wide snippet + page bundle)
  var KEY = 'lb-journey-v1', GAP = 30 * 60 * 1000, MAX_PAGES = 30, MAX_SESSIONS = 3;
  function demoHost() { return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:'; }
  function consent() {
    var c = window.CookieFirst;
    if (!c) return demoHost();                         // no consent manager: only on a local demo copy
    return !!(c.hasConsented && c.consent && c.consent.performance);
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function save(j) { try { localStorage.setItem(KEY, JSON.stringify(j)); } catch (e) {} }
  function utm() {
    var q = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) { if (q.get(k)) o[k.slice(4)] = q.get(k).slice(0, 80); });
    if (q.get('gclid')) o.ad = 'google_ads'; if (q.get('fbclid')) o.ad = 'meta_ads'; if (q.get('li_fat_id')) o.ad = 'linkedin_ads';
    return o;
  }
  function refHost() { try { var h = new URL(document.referrer).hostname.replace(/^www\./, ''); return h === location.hostname.replace(/^www\./, '') ? '' : h; } catch (e) { return ''; } }
  function seedDemo(j) {                              // ?journey=demo on a local copy: a believable earlier path, clearly marked
    var now = Date.now();
    j.first = now - 3 * 864e5; j.visits = 2; j.demo = true;
    j.sessions = [{ start: now - 3 * 864e5, last: now - 3 * 864e5 + 6e4, ref: 'google.com', utm: {}, landing: '/whatsapp-business-api', pages: [{ p: '/whatsapp-business-api', t: 'WhatsApp Business API', ts: now - 3 * 864e5, d: 62, sc: 70 }] },
      { start: now - 2e5, last: now - 2e4, ref: 'chatgpt.com', utm: { source: 'chatgpt.com' }, landing: '/pricing', pages: [
        { p: '/pricing', t: 'Pricing', ts: now - 2e5, d: 41, sc: 85 }, { p: '/whatsapp', t: 'WhatsApp chatbot', ts: now - 1.5e5, d: 70, sc: 60 }] }];
    return j;
  }
  var started = false;
  function track() {
    if (started || !consent()) return; started = true;
    var now = Date.now(), j = load() || { first: now, visits: 0, sessions: [] };
    if (demoHost() && /(^|[?&])journey=demo\b/.test(location.search) && !j.demo) j = seedDemo({});
    var s = j.sessions[j.sessions.length - 1], ext = refHost();
    if (!s || now - s.last > GAP || ext) {
      s = { start: now, last: now, ref: ext, utm: utm(), landing: location.pathname, pages: [] };
      j.sessions.push(s); j.visits = (j.visits || 0) + 1;
      if (j.sessions.length > MAX_SESSIONS) j.sessions.shift();
    }
    var pg = { p: location.pathname, t: document.title.slice(0, 80), ts: now, d: 0, sc: 0 };
    s.pages.push(pg); if (s.pages.length > MAX_PAGES) s.pages.shift(); s.last = now; save(j);
    var t0 = now, maxSc = 0;
    addEventListener('scroll', function () { var h = document.documentElement.scrollHeight - innerHeight; if (h > 0) maxSc = Math.max(maxSc, Math.round(scrollY / h * 100)); }, { passive: true });
    function flush() {
      var jj = load(); if (!jj || !jj.sessions.length) return;
      var ss = jj.sessions[jj.sessions.length - 1], last = ss.pages[ss.pages.length - 1];
      if (last && last.ts === pg.ts) { last.d = Math.round((Date.now() - t0) / 1000); last.sc = maxSc; ss.last = Date.now(); save(jj); }
    }
    addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
    addEventListener('pagehide', flush); setInterval(flush, 15000);
  }
  function dur(s) { return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's'; }
  /* A compact, human-readable account of the journey, for the agent and for the team */
  function describe() {
    var j = load(); if (!j || !j.sessions.length) return null;
    var s = j.sessions[j.sessions.length - 1], here = location.pathname;
    var before = s.pages.filter(function (p) { return p.p !== here; }).slice(-6).map(function (p) { return p.p + (p.d ? ' (' + dur(p.d) + ')' : ''); });
    var u = s.utm || {}, camp = u.campaign ? u.campaign + (u.source ? ' (' + u.source + (u.medium ? '/' + u.medium : '') + ')' : '') : (u.ad || '');
    var prev = j.sessions.length > 1 ? j.sessions[j.sessions.length - 2] : null;
    var days = Math.round((Date.now() - (j.first || s.start)) / 864e5);
    return {
      from: s.ref || (u.source || 'direct'), campaign: camp, landing: s.landing, before: before,
      visit: j.visits || 1, firstDaysAgo: days, previous: prev ? (prev.ref || 'direct') + ' → ' + prev.pages.map(function (p) { return p.p; }).slice(0, 4).join(' → ') : '', demo: !!j.demo
    };
  }
  function line() {                                      // the "[Page context: …]" line the agent reads
    var d = describe(); if (!d) return '';
    var parts = ['came from ' + d.from];
    if (d.campaign) parts.push('campaign ' + d.campaign);
    if (d.landing && d.landing !== location.pathname) parts.push('landed on ' + d.landing);
    if (d.before.length) parts.push('before this article: ' + d.before.join(' → '));
    parts.push(d.visit > 1 ? 'visit ' + d.visit + ', first ' + (d.firstDaysAgo ? d.firstDaysAgo + ' days ago' : 'today') : 'first visit');
    if (d.previous) parts.push('previous visit: ' + d.previous);
    return '[Page context: ' + parts.join(' · ') + ']';
  }
  window.lbJourney = { track: track, get: load, describe: describe, line: line, consent: consent };
  if (consent()) track();
  ['cf_init', 'cf_consent', 'cf_consent_loaded'].forEach(function (ev) { addEventListener(ev, track); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', track); else setTimeout(track, 0);
})();

(() => { if (document.getElementById('awe-style')) return; const s = document.createElement('style'); s.id = 'awe-style'; s.textContent = "\n  :root{--awe-grad:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);--awe-ink:#1B2139;--awe-text:#3A3D5C;--awe-mut:#5D6079;--awe-line:#E5E6EA;--awe-soft:#F4F4FF;--awe-p:#5A60F6;--awe-p7:#4047C4}\n  .awe-orb{flex-shrink:0;width:34px;height:34px;border-radius:50%;position:relative;\n    background:conic-gradient(from 0deg,#5A60F6,#4FCCC2,#F58B0B,#FF3F7B,#5A60F6);animation:awe-spin 7s linear infinite}\n  .awe-orb::after{content:\"\";position:absolute;inset:22%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.9),rgba(255,255,255,.15) 60%,transparent 70%)}\n  .awe-orb.sm{width:24px;height:24px}\n  .awe-orb.work{animation-duration:1.4s}\n  @keyframes awe-spin{to{transform:rotate(360deg)}}\n\n  .awe-compose{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 16px;border-radius:14px;border:1px solid var(--awe-line);background:#fff;transition:border-color .2s,box-shadow .2s}\n  .awe-compose:focus-within{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-compose input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 15px/1.4 'DM Sans';color:var(--awe-ink);padding:8px 0}\n  .awe-compose input::placeholder{color:#9596A7}\n  .awe-send{all:unset;cursor:pointer;width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--awe-grad);color:#fff;font:700 16px/1 'DM Sans'}\n  .awe-chips{display:flex;flex-wrap:wrap;gap:8px}\n  .awe-chip{all:unset;cursor:pointer;padding:7px 13px;border-radius:999px;border:1px solid #CFD1FE;background:#fff;color:var(--awe-p7);font:500 13.5px/1.2 'DM Sans';transition:background .15s,border-color .15s}\n  .awe-chip:hover{background:var(--awe-soft);border-color:var(--awe-p)}\n  .awe-chip:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.35)}\n\n  /* Lava orb (from the orb widget example) */\n  .awe-lava{display:block;position:relative;flex-shrink:0;width:56px;height:56px;border-radius:50%;cursor:pointer}\n  .awe-lava svg{position:absolute;inset:0;width:100%;height:100%;animation:awe-breathe 9s ease-in-out infinite}\n  .awe-lava .g1{animation:awe-mb1 5.2s ease-in-out infinite}.awe-lava .g2{animation:awe-mb2 6s ease-in-out infinite}\n  .awe-lava .g3{animation:awe-mb3 4.6s ease-in-out infinite}.awe-lava .g4{animation:awe-mb4 5.6s ease-in-out infinite}\n  .awe-lava .g5{animation:awe-mb5 4s ease-in-out infinite}\n  .awe-lava.sm{width:30px;height:30px;cursor:default}\n  .awe-lava.work svg{animation-duration:1.6s}\n  @keyframes awe-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}\n  @keyframes awe-mb1{0%,100%{transform:translate(0,0)}33%{transform:translate(64px,38px)}66%{transform:translate(-30px,52px)}}\n  @keyframes awe-mb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-58px,56px)}66%{transform:translate(48px,-26px)}}\n  @keyframes awe-mb3{0%,100%{transform:translate(0,0)}33%{transform:translate(48px,-56px)}66%{transform:translate(-52px,-18px)}}\n  @keyframes awe-mb4{0%,100%{transform:translate(0,0)}33%{transform:translate(-66px,-36px)}66%{transform:translate(40px,44px)}}\n  @keyframes awe-mb5{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,68px)}66%{transform:translate(-44px,28px)}}\n\n  /* Launcher: a compact bar, bottom centre \u2014 reads as a page tool, not a support widget in the corner */\n  #awe-launch{position:fixed;left:50%;bottom:20px;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateX(-50%);\n    transition:opacity .3s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-launch.off{opacity:0;transform:translate(-50%,16px);pointer-events:none}\n  #awe-launch.tuck{opacity:0;transform:translate(-50%,28px);pointer-events:none}   /* out of the way while the visitor scrolls down to read */\n  /* LED border: a thin light in the brand colours travels round the bar (no glow \u2014 keep it subtle) */\n  @property --awe-ang{syntax:'<angle>';inherits:false;initial-value:0deg}\n  .awe-pill{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;padding:4px 4px 4px 4px;border-radius:999px;width:420px;max-width:calc(100vw - 32px);\n    --awe-led:conic-gradient(from var(--awe-ang),rgba(90,96,246,.3) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.3) 210deg,rgba(90,96,246,.3) 360deg);\n    border:1.5px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--awe-led) border-box;\n    box-shadow:0 22px 50px -24px rgba(51,64,94,.45);animation:awe-led 3.6s linear infinite;transition:width .45s cubic-bezier(.21,.78,.36,1),box-shadow .25s}\n  @keyframes awe-led{to{--awe-ang:360deg}}\n  #awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:500px;animation-duration:2.2s}\n  /* LED line on page cards (the sidebar CTA): same travelling light as the bar, drawn as a masked ring so the card keeps its own background */\n  .awe-led-card{position:relative;isolation:isolate}\n  .awe-led-card::before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;\n    background:conic-gradient(from var(--awe-ang),rgba(255,255,255,.14) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(255,255,255,.14) 210deg,rgba(255,255,255,.14) 360deg);\n    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:awe-led 5s linear infinite}\n  .awe-led-card.light::before{background:conic-gradient(from var(--awe-ang),rgba(90,96,246,.25) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.25) 210deg,rgba(90,96,246,.25) 360deg)}\n  .awe-pill-send{all:unset;cursor:pointer;flex-shrink:0;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;\n    background:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);box-shadow:0 10px 22px -8px rgba(90,96,246,.6);transition:transform .2s,box-shadow .2s}\n  .awe-pill-send svg{width:18px;height:18px}\n  .awe-pill-send:hover{transform:scale(1.08);box-shadow:0 14px 26px -8px rgba(90,96,246,.72)}\n  .awe-pill-send:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-pill input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 14.5px 'DM Sans';color:var(--awe-ink);padding:10px 0}\n  .awe-pill input::placeholder{color:var(--awe-mut);transition:opacity .25s}\n  .awe-pill.swap input::placeholder{opacity:0}\n  #awe-launch .awe-chips{margin:0;justify-content:center;max-width:500px;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .25s,transform .25s}\n  #awe-launch:focus-within .awe-chips,#awe-launch.wide .awe-chips{opacity:1;transform:none;pointer-events:auto}\n  #awe-launch .awe-chip{background:rgba(255,255,255,.92);box-shadow:0 8px 20px -12px rgba(51,64,94,.35)}\n\n  /* Unread badge on the closed launcher: a reply arrived while the layer was shut */\n  [data-awe-open]{position:relative}\n  .awe-badge{position:absolute;top:-4px;left:-4px;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:#E6194B;color:#fff;\n    font:700 11px/18px 'DM Sans';text-align:center;box-shadow:0 0 0 2px #fff;transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1);pointer-events:none}\n  .awe-badge.on{transform:scale(1)}\n  .awe-badge.bump{animation:awe-bump .45s ease}\n  @keyframes awe-bump{40%{transform:scale(1.3)}}\n  /* Scrim: dims the page while the layer is open so open vs closed reads at a glance */\n  #awe-scrim{position:fixed;inset:0;z-index:8999;background:rgba(16,20,36,.42);opacity:0;pointer-events:none;transition:opacity .3s ease}\n  #awe-scrim.on{opacity:1;pointer-events:auto}\n  #awe-scrim.on.lift{opacity:.25}\n  /* The layer: a panel that works next to the article */\n  #awe-panel{position:fixed;top:88px;right:24px;bottom:24px;width:440px;z-index:9001;display:flex;flex-direction:column;background:#fff;border-radius:22px;\n    border:1px solid var(--awe-line);box-shadow:0 4px 4px rgba(51,64,94,.06),0 16px 32px rgba(51,64,94,.1),0 32px 64px rgba(51,64,94,.1);overflow:hidden;\n    opacity:0;transform:translateX(28px);pointer-events:none;transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-panel.on{opacity:1;transform:none;pointer-events:auto}\n  /* desktop: the layer opens out of the bar, centred above it */\n  #awe-panel{top:auto;left:50%;right:auto;bottom:20px;width:540px;height:min(680px,calc(100vh - 108px));transform:translate(-50%,28px) scale(.98);transform-origin:50% 100%}\n  #awe-panel.on{transform:translate(-50%,0)}\n  #awe-panel{transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1),width .35s cubic-bezier(.2,.8,.2,1)}\n  #awe-panel.wide{width:min(720px,calc(100vw - 48px))}\n  .awe-cal{margin:10px -6px 0;border-radius:12px;overflow:hidden;border:1px solid var(--awe-line);background:#fff}\n  .awe-cal{position:relative}\n  .awe-cal::before{content:attr(data-loading);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  /* shown at 80%: the iframe is laid out 25% larger and scaled down, so Calendly keeps its layout and the card stays small */\n  .awe-cal{height:432px}\n  .awe-cal iframe{position:relative;display:block;width:125%;height:540px;border:0;opacity:0;transition:opacity .3s;transform:scale(.8);transform-origin:0 0}\n  .awe-cal.ready iframe{opacity:1}\n  .awe-head{display:flex;align-items:center;gap:12px;padding:14px 14px 12px 16px;border-bottom:1px solid #F7F7F8}\n  .awe-head-t{flex:1;min-width:0}\n  .awe-head-t b{display:block;font:700 15px/1.3 'DM Sans';color:var(--awe-ink)}\n  .awe-status{display:flex;align-items:center;gap:6px;font:500 12px/1.3 'DM Sans';color:var(--awe-mut)}\n  .awe-status::before{content:\"\";width:6px;height:6px;border-radius:50%;background:#52CC57;flex-shrink:0}\n  .awe-status.work::before{background:#F59E0B;animation:awe-pulse 1s ease-in-out infinite}\n  @keyframes awe-pulse{50%{opacity:.3}}\n  .awe-x{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;color:var(--awe-mut);font-size:15px}\n  .awe-x:hover{background:#F7F7F8}.awe-x:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n\n  .awe-facts{display:none;padding:10px 16px 12px;border-bottom:1px solid #F7F7F8;background:linear-gradient(180deg,#FAFAFF,#fff)}\n  .awe-facts.on{display:block;animation:awe-in .4s cubic-bezier(0,0,.2,1)}\n  .awe-facts-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;font:700 10.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--awe-p7)}\n  .awe-facts-h span{font:400 11px 'DM Sans';letter-spacing:0;text-transform:none;color:#9596A7}\n  .awe-facts-list{display:flex;flex-wrap:wrap;gap:6px}\n  .awe-fact{all:unset;cursor:text;display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:8px;background:#fff;border:1px solid var(--awe-line);font:500 12.5px/1.2 'DM Sans';color:var(--awe-ink);animation:awe-in .35s}\n  .awe-fact i{font-style:normal;color:#9596A7;font-size:11.5px}\n  .awe-fact.guess{border-style:dashed}\n  .awe-fact:hover{border-color:#CFD1FE}\n  .awe-fact input{all:unset;width:110px;font:500 12.5px 'DM Sans';color:var(--awe-ink)}\n\n  .awe-thread{flex:1;overflow-y:auto;padding:16px 18px 8px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}\n  .awe-msg{font:400 14.5px/1.6 'DM Sans';color:var(--awe-text);animation:awe-in .35s cubic-bezier(0,0,.2,1)}\n  /* chat bubbles: the agent's side reads like a conversation, not a document */\n  .awe-msg{align-self:flex-start;max-width:88%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:#F4F5F9;line-height:1.5}\n  .awe-thread .awe-msg + .awe-msg{margin-top:-8px}\n  .awe-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;border-radius:16px 16px 16px 4px;background:#F4F5F9;animation:awe-in .2s}\n  .awe-typing i{width:6px;height:6px;border-radius:50%;background:#9596A7;animation:awe-dot 1s ease-in-out infinite}\n  .awe-typing i:nth-child(2){animation-delay:.15s}.awe-typing i:nth-child(3){animation-delay:.3s}\n  @keyframes awe-dot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}\n  .awe-msg p{margin:0 0 8px}.awe-msg p:last-child{margin:0}\n  .awe-msg ul,.awe-msg ol{margin:4px 0 8px;padding-left:20px}.awe-msg li{margin:2px 0}\n  .awe-msg b,.awe-msg strong{color:var(--awe-ink)}\n  .awe-msg a{color:var(--awe-p);font-weight:700;text-decoration:none;border-bottom:1.5px solid #CFD1FE}\n  .awe-msg a:hover{border-color:var(--awe-p)}\n  .awe-me{align-self:flex-end;max-width:85%;padding:8px 13px;border-radius:16px 16px 4px 16px;background:var(--awe-p);color:#fff;font:500 14px/1.45 'DM Sans';animation:awe-in .25s}\n  @keyframes awe-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n  .awe-src{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n  .awe-src a,.awe-src button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:7px;background:#F7F7F8;font:500 11.5px/1.3 'DM Sans';color:var(--awe-mut);border:1px solid transparent}\n  .awe-src a:hover,.awe-src button:hover{border-color:var(--awe-line);color:var(--awe-ink)}\n  .awe-src em{font-style:normal;font:700 9.5px 'DM Mono',monospace;letter-spacing:.06em;color:var(--awe-p7)}\n  .awe-working{display:flex;align-items:center;gap:10px;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  .awe-working span{background:linear-gradient(90deg,#9596A7,#5A60F6,#9596A7);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:awe-sh 1.6s linear infinite}\n  @keyframes awe-sh{to{background-position:-200% 0}}\n\n  .awe-card{border:1px solid var(--awe-line);border-radius:16px;padding:14px 14px 12px;background:#fff;box-shadow:0 2px 8px rgba(51,64,94,.05);animation:awe-in .45s cubic-bezier(0,0,.2,1)}\n  .awe-tag{display:inline-block;font:700 9.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:4px 6px;border-radius:5px;background:#EBECFF;color:var(--awe-p7);margin-bottom:8px}\n  .awe-tag.act{background:#DEF6DF;color:#1B6B1F}\n  .awe-big{font:700 30px/1.1 'DM Sans';letter-spacing:-.02em;color:var(--awe-ink)}\n  .awe-big small{font:500 14px 'DM Sans';color:var(--awe-mut);letter-spacing:0}\n  .awe-sub{font:400 13px/1.5 'DM Sans';color:var(--awe-mut);margin-top:4px}\n  .awe-range{width:100%;margin:12px 0 2px;accent-color:#5A60F6}\n  .awe-rangelab{display:flex;justify-content:space-between;font:500 11px 'DM Mono',monospace;color:#9596A7}\n  .awe-why{margin-top:10px;padding:8px 10px;border-radius:10px;background:#FAFAFF;font:400 12.5px/1.5 'DM Sans';color:var(--awe-mut)}\n  .awe-why b{color:var(--awe-p7)}\n  .awe-cta{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--awe-ink);color:#fff;font:700 14.5px 'DM Sans';transition:transform .15s,box-shadow .15s}\n  .awe-cta:hover{transform:translateY(-1px);box-shadow:0 10px 22px -10px rgba(27,33,57,.6)}\n  .awe-cta:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-alt{display:flex;gap:6px;align-items:center;justify-content:center;margin-top:8px;font:400 12.5px 'DM Sans';color:#9596A7}\n  .awe-alt button,.awe-alt a{all:unset;cursor:pointer;color:var(--awe-p7);font-weight:700}\n  .awe-alt button:hover,.awe-alt a:hover{text-decoration:underline}\n  .awe-field{display:flex;gap:8px;margin-top:10px}\n  .awe-field input{flex:1;min-width:0;border:1px solid var(--awe-line);border-radius:10px;padding:11px 12px;font:500 14px 'DM Sans';color:var(--awe-ink);outline:0}\n  .awe-field input:focus{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-field input[aria-invalid=true]{border-color:#FF3F7B}\n  .awe-field button{all:unset;cursor:pointer;padding:0 14px;border-radius:10px;background:var(--awe-grad);color:#fff;font:700 13.5px 'DM Sans'}\n  .awe-receipt{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-top:1px dashed var(--awe-line);font:400 13px/1.45 'DM Sans';color:var(--awe-text);opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s}\n  .awe-receipt:first-of-type{border-top:0}\n  .awe-receipt.on{opacity:1;transform:none}\n  .awe-receipt .ok{flex-shrink:0;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#52CC57;color:#fff;font:700 11px 'DM Sans';margin-top:1px}\n  .awe-receipt small{display:block;font:500 11px 'DM Mono',monospace;color:#9596A7}\n\n  .awe-foot{border-top:1px solid #F7F7F8;padding:10px 12px 8px}\n  .awe-foot .awe-compose{margin:0}\n  .awe-foot p{margin:7px 2px 0;font:400 11px/1.4 'DM Sans';color:#9596A7;text-align:center}\n  .awe-foot .awe-chips{margin:0 0 8px}\n\n  /* pointAt(): the agent lights up the part of the article it is reading */\n  .awe-point{position:relative;border-radius:12px;box-shadow:0 0 0 3px rgba(90,96,246,.35),0 0 0 10px rgba(90,96,246,.08);transition:box-shadow .4s}\n  .awe-point::before{content:attr(data-awe-label);position:absolute;top:-12px;left:12px;z-index:2;padding:3px 8px;border-radius:6px;background:var(--awe-p);color:#fff;font:700 10.5px/1.4 'DM Sans';white-space:nowrap}\n  .awe-morph{transition:opacity .3s}\n  .awe-morph.out{opacity:0}\n\n  @media (max-width:900px){\n    #awe-panel{top:auto;left:0;right:0;bottom:0;width:auto;height:90vh;border-radius:22px 22px 0 0;transform:translateY(40px)}\n    #awe-panel.on{transform:none}\n    #awe-panel.wide{width:auto}\n    #awe-launch{left:16px;right:16px;bottom:12px;transform:none;align-items:stretch}\n    #awe-launch.off{transform:translateY(16px)}\n    #awe-launch.tuck{transform:translateY(28px)}\n    .awe-pill,#awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:auto;max-width:none}\n    #awe-launch .awe-chips{max-width:none}\n  }\n  @media (prefers-reduced-motion:reduce){.awe-pill,.awe-led-card::before{animation:none}.awe-orb{animation:none}#awe-launch,#awe-panel,#awe-scrim,.awe-badge,.awe-msg,.awe-card{transition:none;animation:none}.awe-lava svg,.awe-lava circle{animation:none!important}}\n  /* What the team will see: the handoff summary under a receipt */\n  .awe-sees{margin-top:10px;border-top:1px dashed var(--awe-line);padding-top:8px;font:400 12.5px/1.55 'DM Sans';color:var(--awe-mut)}\n  .awe-sees summary{cursor:pointer;list-style:none;font:700 10.5px/1.4 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--awe-p7);margin-bottom:4px}\n  .awe-sees summary::-webkit-details-marker{display:none}\n  .awe-sees div{padding:2px 0;word-break:break-word}\n"; document.head.appendChild(s); })();

/* ---------------------------------------------------------------------------
   Agentic Web Experience · lb-awe: wa-pricing
   One real Landbot agent run headless (Landbot.Core). The bot, its AI agent,
   its exits and its lead capture live in Landbot; this page only draws it in
   the article's visual language and reacts to what the agent says.
--------------------------------------------------------------------------- */
try {
const CONFIG_URL = 'https://storage.googleapis.com/landbot.pro/v3/H-3524392-S0GPLWUM25DX7Y4X/index.json';
const SDK_URL = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
/* Sales Entry Points convention (Notion · Growth & Marketing › Site › Conversión on-site): {surface}-{location}[-{section}]-{intent} */
const ENTRY = { source: 'web', sales: 'web-blog-whatsapp-business-api-pricing-change-october-sticky-sales', signup: 'web-blog-whatsapp-business-api-pricing-change-october-sticky-signup' };
const SIGNUP = 'https://app.landbot.io/sign-up/?utm_medium=conversion_agent&utm_campaign=wa_pricing_oct26&utm_content=' + ENTRY.signup;
/* utm_source is the REAL traffic source (from the journey), never a location */
function realSource() {
  try { const d = window.lbJourney && window.lbJourney.describe && window.lbJourney.describe(); return d && d.from && d.from !== 'direct' ? d.from : ''; } catch (_) { return ''; }
}
function tagUrl(href) {
  try {
    const u = new URL(href);
    if (/(^|\.)landbot\.io$/.test(u.hostname) && /sign-?up/.test(u.pathname)) { if (!u.searchParams.get('utm_content')) u.searchParams.set('utm_content', ENTRY.signup); }
    else return href;
    const src = realSource(); if (src && !u.searchParams.get('utm_source')) u.searchParams.set('utm_source', src);
    return u.toString();
  } catch (_) { return href; }
}
/* View / click events with the entry_point_id (dataLayer for GTM, gtag if present; both respect Consent Mode) */
const sent = {};
function emit(name, id, extra) {
  const key = name + ':' + id; if (sent[key]) return; sent[key] = 1;
  const p = Object.assign({ entry_point_id: id, entry_point_type: 'sticky / flotante', page_path: location.pathname }, extra || {});
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); } catch (_) {}
  try { if (typeof window.gtag === 'function') window.gtag('event', name, p); } catch (_) {}
}
const META = 'https://developers.facebook.com/docs/whatsapp/pricing';
const RATES = { Spain: 0.0200, 'United Kingdom': 0.0159, Brazil: 0.0068 };   // the article's figures: ES/BR in $, UK in £ (Meta's UK rate card, as the agent quotes it)
const CUR = { 'United Kingdom': '£' };
const SECTIONS = [
  ['tldr', /tl;?dr/i, 'TL;DR'], ['what-changes', /what changes/i, 'What changes on October 1'],
  ['real-cost', /1\.59p|real cost/i, 'Why 1.59p isn’t your real cost'], ['rules', /changed the rules/i, 'Meta changed the rules before'],
  ['bans', /bans?\b/i, 'When Meta bans your account'], ['n5', /eviction/i, 'The Eviction Test'],
  ['stop-using', /stop using/i, 'Should companies stop using WhatsApp?'], ['agentic', /agentic/i, 'What is an agentic web experience?'],
  ['ai-search', /ai search/i, 'AI search and your funnel'], ['next-30', /30 days/i, 'What to do in the next 30 days'], ['faq', /\bfaq\b|frequently/i, 'FAQ']
];
const DICT = {
  en: { rec: 'You’re reading about <b>the October change</b>. I can’t quote a rate this article doesn’t publish, and I’m not an adviser, but with its numbers I can <b>size your bill</b> and tell you which conversations to take off WhatsApp. About two minutes.',
    back: 'Welcome back. ', ph: 'Ask what October means for you…', phBar: 'Ask what this section means for you', phPanel: 'Ask a follow-up', guess: 'guessed from your time zone', change: 'change',
    reading: 'Reading', theArticle: 'the article', online: 'Online · answers only from this post', working: 'Working on it', facts: 'What I’ve understood', edit: 'tap to correct',
    est: 'Your delivery bill from Oct 1', per: '/ month', estSub: (v, r, c) => `${v} replies × $${r} (${c}) · delivery only`, estWhy: '+ your AI provider if AI writes the replies. Meta’s own Brazil example: ~$27–$97 per 1,000 AI replies.',
    notIn: (c) => `${c} isn’t in this article`, notInSub: 'The article only publishes Brazil, Spain and the UK. Your rate is on Meta’s rate card for your country.', checkMeta: 'Check Meta’s rate card ↗',
    nba: 'What makes most sense now', why: 'Why', or: 'or',
    build: 'Build my agent free →', team: 'Get a plan from the team', estimate: 'Size my bill', evict: 'Take the Eviction Test',
    whyEst: 'Two numbers, monthly replies and country, turn the article’s rates into your bill.',
    whyBuild: 'Your first step is small: move one discovery flow to an agent on your own site, where there’s no per-message tariff.',
    whyTeamVol: (v) => `At ${v} replies a month the bill sits in discovery and first qualification, which don’t need WhatsApp. That’s worth planning with someone.`,
    whyTeamScore: (s) => `${s}/40 means the conversation’s logic lives inside WhatsApp. Moving it is a plan, better made with someone.`,
    mail: 'Where should the plan go?', mailSub: 'The team replies within one business day, with everything you told me already on the table.', mailPh: 'you@company.com', sendIt: 'Send', mailBad: 'That doesn’t look like an email yet.',
    done: 'Done. Here’s what changed', r1: 'Lead saved in Landbot', r1s: 'Inbox · WA Pricing Conversion Agent', r2: 'Context attached to the lead', r3: 'Follow-up promised', r3s: 'within one business day · Landbot team',
    foot: 'Answers only from this article and the sources it cites · no legal or tax advice · Landbot is a WhatsApp Business partner.',
    fromArticle: 'ARTICLE', fromMeta: 'META', pointLabel: 'Landbot AI is reading this',
    msgEst: 'Estimate my monthly cost.', msgEvict: 'Let’s do the Eviction Test.', msgTeam: 'I’d like the team to follow up with a plan for my case.',
    msgCorr: (k, v) => `Quick correction: ${k} is ${v}.`, msgScore: (t, a) => `I scored ${t}/40 on the Eviction Test (Identity ${a[0]}, Logic ${a[1]}, Economics ${a[2]}, Exit ${a[3]}). What should I fix first?`,
    nudge: { tldr: ['Ask this article anything · answers only from the post', 'What changes for me on October 1?'], cost: ['Size your October bill · 2 questions', 'Estimate my monthly cost.'], risk: ['How exposed are you to a ban? · ask me', 'How exposed am I to a ban or lock-in?'], ev: ['Take the Eviction Test with me · 1 min', 'Let’s do the Eviction Test.'], try: ['See a conversion agent at work · right here', 'How would a conversion agent on my site work?'], plan: ['Get your 30-day plan · for your case', 'What should I do in the next 30 days?'] },
    scored: (s) => `Scored ${s}/40? I’ll tell you what to fix first`,
    k: { vol: 'Volume', country: 'Country', who: 'Replies by', score: 'Eviction score', use: 'Main use', from: 'Came from', why: 'Why here' }, teamSees: 'What the team will see', direct: 'direct', perMo: '/mo', human: 'Humans', ai: 'AI', oneMore: 'Yes, one more question', morph: (v, c, x) => `At ~${v} replies a month in ${c}, that’s ≈ ${x}/mo in delivery alone. Qualify on your own site first; hand off to WhatsApp when it pays.` },
  es: { rec: 'Estás leyendo sobre <b>el cambio de octubre</b>. No puedo darte una tarifa que el artículo no publica, y no soy asesor, pero con sus números puedo <b>calcular tu factura</b> y decirte qué conversaciones sacar de WhatsApp. Unos dos minutos.',
    back: 'Hola de nuevo. ', ph: 'Pregunta qué significa octubre para ti…', phBar: 'Pregunta qué significa esta sección para ti', phPanel: 'Haz otra pregunta', guess: 'deducido de tu zona horaria', change: 'cambiar',
    reading: 'Leyendo', theArticle: 'el artículo', online: 'En línea · responde solo con este post', working: 'Trabajando en ello', facts: 'Lo que he entendido', edit: 'toca para corregir',
    est: 'Tu factura de envío desde el 1 de octubre', per: '/ mes', estSub: (v, r, c) => `${v} respuestas × $${r} (${c}) · solo envío`, estWhy: '+ tu proveedor de IA si una IA escribe las respuestas. El ejemplo de Meta para Brasil: ~$27–$97 por cada 1.000 respuestas con IA.',
    notIn: (c) => `${c} no aparece en este artículo`, notInSub: 'El artículo solo publica Brasil, España y Reino Unido. Tu tarifa está en el rate card de Meta para tu país.', checkMeta: 'Ver el rate card de Meta ↗',
    nba: 'Lo que tiene más sentido ahora', why: 'Por qué', or: 'o',
    build: 'Crear mi agente gratis →', team: 'Que el equipo me prepare un plan', estimate: 'Calcular mi factura', evict: 'Hacer el Eviction Test',
    whyEst: 'Dos números, respuestas al mes y país, convierten las tarifas del artículo en tu factura.',
    whyBuild: 'El primer paso es pequeño: llevar un flujo de descubrimiento a un agente en tu web, donde no hay tarifa por mensaje.',
    whyTeamVol: (v) => `Con ${v} respuestas al mes la factura está en el descubrimiento y la primera cualificación, que no necesitan WhatsApp. Merece un plan con alguien.`,
    whyTeamScore: (s) => `${s}/40 significa que la lógica de la conversación vive dentro de WhatsApp. Sacarla es un plan, mejor hecho con alguien.`,
    mail: '¿A dónde te envío el plan?', mailSub: 'El equipo responde en un día laborable, con todo lo que me has contado ya sobre la mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Eso todavía no parece un email.',
    done: 'Hecho. Esto es lo que ha cambiado', r1: 'Lead guardado en Landbot', r1s: 'Inbox · WA Pricing Conversion Agent', r2: 'Contexto adjunto al lead', r3: 'Seguimiento prometido', r3s: 'en un día laborable · equipo de Landbot',
    foot: 'Respuestas solo con este artículo y sus fuentes · sin asesoramiento legal ni fiscal · Landbot es partner de WhatsApp Business.',
    fromArticle: 'ARTÍCULO', fromMeta: 'META', pointLabel: 'Landbot AI está leyendo esto',
    msgEst: 'Calcula mi coste mensual.', msgEvict: 'Hagamos el Eviction Test.', msgTeam: 'Quiero que el equipo me prepare un plan para mi caso.',
    msgCorr: (k, v) => `Corrijo: ${k} es ${v}.`, msgScore: (t, a) => `He sacado ${t}/40 en el Eviction Test (Identidad ${a[0]}, Lógica ${a[1]}, Economía ${a[2]}, Salida ${a[3]}). ¿Qué arreglo primero?`,
    nudge: { tldr: ['Pregúntale a este artículo · responde solo con lo que dice', '¿Qué cambia para mí el 1 de octubre?'], cost: ['Calcula tu factura de octubre · 2 preguntas', 'Calcula mi coste mensual.'], risk: ['¿Cuánto te expone un baneo? · pregúntame', '¿Cuánto me expone un baneo o el lock-in?'], ev: ['Haz el Eviction Test conmigo · 1 min', 'Hagamos el Eviction Test.'], try: ['Mira un conversion agent funcionando · aquí mismo', '¿Cómo funcionaría un conversion agent en mi web?'], plan: ['Tu plan de 30 días · para tu caso', '¿Qué hago en los próximos 30 días?'] },
    scored: (s) => `¿Has sacado ${s}/40? Te digo qué arreglar primero`,
    k: { vol: 'Volumen', country: 'País', who: 'Responde', score: 'Eviction score', use: 'Uso principal', from: 'Vino de', why: 'Por qué vino' }, teamSees: 'Lo que verá el equipo', direct: 'directo', perMo: '/mes', human: 'Personas', ai: 'IA', oneMore: 'Sí, una pregunta más', morph: (v, c, x) => `Con ~${v} respuestas al mes en ${c}, son ≈ ${x}/mes solo en envío. Cualifica primero en tu web; pasa a WhatsApp cuando compense.` },
  pt: { rec: 'Estás a ler sobre <b>a mudança de outubro</b>. Não posso dar uma tarifa que o artigo não publica, e não sou consultor, mas com os números dele posso <b>calcular a tua fatura</b> e dizer que conversas tirar do WhatsApp. Uns dois minutos.',
    back: 'Bem-vindo de volta. ', ph: 'Pergunta o que outubro significa para ti…', phBar: 'Pergunta o que esta secção significa para ti', phPanel: 'Faz outra pergunta', guess: 'deduzido do teu fuso horário', change: 'mudar',
    reading: 'A ler', theArticle: 'o artigo', online: 'Online · responde só com este post', working: 'A trabalhar nisso', facts: 'O que percebi', edit: 'toca para corrigir',
    est: 'A tua fatura de envio a partir de 1 de outubro', per: '/ mês', estSub: (v, r, c) => `${v} respostas × $${r} (${c}) · só envio`, estWhy: '+ o teu fornecedor de IA se uma IA escrever as respostas. O exemplo da Meta para o Brasil: ~$27–$97 por cada 1.000 respostas com IA.',
    notIn: (c) => `${c} não aparece neste artigo`, notInSub: 'O artigo só publica Brasil, Espanha e Reino Unido. A tua tarifa está no rate card da Meta para o teu país.', checkMeta: 'Ver o rate card da Meta ↗',
    nba: 'O que faz mais sentido agora', why: 'Porquê', or: 'ou',
    build: 'Criar o meu agente grátis →', team: 'Pedir um plano à equipa', estimate: 'Calcular a minha fatura', evict: 'Fazer o Eviction Test',
    whyEst: 'Dois números, respostas por mês e país, transformam as tarifas do artigo na tua fatura.',
    whyBuild: 'O primeiro passo é pequeno: levar um fluxo de descoberta para um agente no teu site, onde não há tarifa por mensagem.',
    whyTeamVol: (v) => `Com ${v} respostas por mês a fatura está na descoberta e na primeira qualificação, que não precisam do WhatsApp. Vale um plano com alguém.`,
    whyTeamScore: (s) => `${s}/40 significa que a lógica da conversa vive dentro do WhatsApp. Tirá-la é um plano, melhor feito com alguém.`,
    mail: 'Para onde envio o plano?', mailSub: 'A equipa responde num dia útil, com tudo o que me contaste já em cima da mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Isso ainda não parece um email.',
    done: 'Feito. Isto foi o que mudou', r1: 'Lead guardado na Landbot', r1s: 'Inbox · WA Pricing Conversion Agent', r2: 'Contexto anexado ao lead', r3: 'Seguimento prometido', r3s: 'num dia útil · equipa da Landbot',
    foot: 'Respostas só com este artigo e as suas fontes · sem aconselhamento legal ou fiscal · a Landbot é parceira do WhatsApp Business.',
    fromArticle: 'ARTIGO', fromMeta: 'META', pointLabel: 'A Landbot AI está a ler isto',
    msgEst: 'Calcula o meu custo mensal.', msgEvict: 'Vamos fazer o Eviction Test.', msgTeam: 'Quero que a equipa me prepare um plano para o meu caso.',
    msgCorr: (k, v) => `Correção: ${k} é ${v}.`, msgScore: (t, a) => `Tive ${t}/40 no Eviction Test (Identidade ${a[0]}, Lógica ${a[1]}, Economia ${a[2]}, Saída ${a[3]}). O que corrijo primeiro?`,
    nudge: { tldr: ['Pergunta a este artigo · responde só com o que ele diz', 'O que muda para mim a 1 de outubro?'], cost: ['Calcula a tua fatura de outubro · 2 perguntas', 'Calcula o meu custo mensal.'], risk: ['Quanto te expõe um bloqueio? · pergunta-me', 'Quanto me expõe um bloqueio ou o lock-in?'], ev: ['Faz o Eviction Test comigo · 1 min', 'Vamos fazer o Eviction Test.'], try: ['Vê um conversion agent a funcionar · aqui mesmo', 'Como funcionaria um conversion agent no meu site?'], plan: ['O teu plano de 30 dias · para o teu caso', 'O que faço nos próximos 30 dias?'] },
    scored: (s) => `Tiveste ${s}/40? Digo-te o que corrigir primeiro`,
    k: { vol: 'Volume', country: 'País', who: 'Responde', score: 'Eviction score', use: 'Uso principal', from: 'Veio de', why: 'Porquê' }, teamSees: 'O que a equipa vai ver', direct: 'direto', perMo: '/mês', human: 'Pessoas', ai: 'IA', oneMore: 'Sim, mais uma pergunta', morph: (v, c, x) => `Com ~${v} respostas por mês em ${c}, são ≈ ${x}/mês só em envio. Qualifica primeiro no teu site; passa para o WhatsApp quando compensar.` }
};
const BOOK_URL = 'https://calendly.com/landbot-sales/meeting-landbot-expert', HELP_URL = 'https://help.landbot.io/';
Object.assign(DICT.en, { calLoading: 'Loading the calendar…', bookH: 'Book 30 min with a Landbot expert', bookSub: 'Pick a slot that suits you. They’ll have this conversation on hand, so no starting from zero.', bookGo: 'Choose a time →', booked: 'I’ve booked a time', mailInstead: 'Email me instead', bookedMsg: 'Great, see you there. The team will have this conversation on hand.', supH: 'This one’s for our support team', supSub: 'They can look at your account and sort it fastest. The help center has guides and a way to reach them.', supGo: 'Open the help center →', backArt: 'Back to the article' });
Object.assign(DICT.es, { calLoading: 'Cargando el calendario…', bookH: 'Reserva 30 min con un experto de Landbot', bookSub: 'Elige el hueco que mejor te venga. Tendrán esta conversación a mano, así que no empiezas de cero.', bookGo: 'Elegir hora →', booked: 'Ya he reservado', mailInstead: 'Prefiero que me escribáis', bookedMsg: 'Genial, nos vemos ahí. El equipo tendrá esta conversación a mano.', supH: 'Esto es cosa de nuestro equipo de soporte', supSub: 'Pueden mirar tu cuenta y resolverlo antes. En el centro de ayuda tienes guías y cómo contactarles.', supGo: 'Abrir el centro de ayuda →', backArt: 'Volver al artículo' });
Object.assign(DICT.pt, { calLoading: 'A carregar o calendário…', bookH: 'Marca 30 min com um especialista da Landbot', bookSub: 'Escolhe o horário que te der jeito. Vão ter esta conversa à mão, por isso não começas do zero.', bookGo: 'Escolher horário →', booked: 'Já marquei', mailInstead: 'Prefiro que me enviem um email', bookedMsg: 'Ótimo, até lá. A equipa vai ter esta conversa à mão.', supH: 'Isto é com a nossa equipa de suporte', supSub: 'Podem ver a tua conta e resolver mais depressa. No centro de ajuda tens guias e forma de os contactar.', supGo: 'Abrir o centro de ajuda →', backArt: 'Voltar ao artigo' });
function pageLang() {
  const on = [...document.querySelectorAll('a[hreflang]')].find((a) => a.getAttribute('aria-current') || /background:\s*#fff/i.test(a.getAttribute('style') || ''));
  const l = (on && on.getAttribute('hreflang')) || document.documentElement.lang || 'en';
  return DICT[l.slice(0, 2).toLowerCase()] ? l.slice(0, 2).toLowerCase() : 'en';
}
let LANG = pageLang();
let T = DICT[LANG];
/* ---------- country and fit level (landbot-icp tiers, 14-sep-2026) ---------- */
const TIER_A = 'GB NL US ES MX IT SG ZA PL BR DE FR CO CL'.split(' ');
/* Tier C = paid exclusion list. IE and SE are treated as B here until the Tier C review (decision 2-oct-2026, reminder 15-mar-2027). */
const TIER_C = ('AF DZ AO BD BJ BO BW BN BF KH CM CR CY CZ DO EC EG SV EE SZ GH HN HK HU IN ID IQ JM JP JO KZ KE KW LV LB LR MG MW ML MQ MR MU MD MA MZ MM NP NG OM PK PS PA PY PE PH PR RO RU RW SN SK SO LK TW TZ TH TN TR UG UA UY UZ VE VN YE ZW').split(' ');
const TZ = Object.fromEntries(('Europe/London:GB Europe/Belfast:GB Europe/Dublin:IE Europe/Amsterdam:NL Europe/Madrid:ES Atlantic/Canary:ES Africa/Ceuta:ES Europe/Lisbon:PT Atlantic/Madeira:PT Atlantic/Azores:PT ' +
  'Europe/Paris:FR Europe/Berlin:DE Europe/Busingen:DE Europe/Rome:IT Europe/Warsaw:PL Europe/Brussels:BE Europe/Luxembourg:LU Europe/Zurich:CH Europe/Vienna:AT Europe/Prague:CZ Europe/Bratislava:SK ' +
  'Europe/Budapest:HU Europe/Bucharest:RO Europe/Sofia:BG Europe/Athens:GR Europe/Istanbul:TR Europe/Kiev:UA Europe/Kyiv:UA Europe/Moscow:RU Europe/Helsinki:FI Europe/Stockholm:SE Europe/Oslo:NO ' +
  'Europe/Copenhagen:DK Europe/Tallinn:EE Europe/Riga:LV Europe/Vilnius:LT Europe/Zagreb:HR Europe/Belgrade:RS Europe/Ljubljana:SI Europe/Malta:MT Asia/Nicosia:CY Europe/Chisinau:MD Europe/Minsk:BY ' +
  'America/New_York:US America/Chicago:US America/Denver:US America/Phoenix:US America/Los_Angeles:US America/Anchorage:US Pacific/Honolulu:US America/Detroit:US America/Boise:US ' +
  'America/Indiana/Indianapolis:US America/Kentucky/Louisville:US America/Toronto:CA America/Vancouver:CA America/Edmonton:CA America/Winnipeg:CA America/Halifax:CA America/St_Johns:CA ' +
  'America/Mexico_City:MX America/Monterrey:MX America/Tijuana:MX America/Cancun:MX America/Merida:MX America/Chihuahua:MX America/Hermosillo:MX America/Mazatlan:MX ' +
  'America/Bogota:CO America/Santiago:CL America/Punta_Arenas:CL America/Lima:PE America/Guayaquil:EC America/La_Paz:BO America/Caracas:VE America/Asuncion:PY America/Montevideo:UY ' +
  'America/Argentina/Buenos_Aires:AR America/Argentina/Cordoba:AR America/Buenos_Aires:AR America/Sao_Paulo:BR America/Fortaleza:BR America/Recife:BR America/Bahia:BR America/Manaus:BR ' +
  'America/Belem:BR America/Cuiaba:BR America/Campo_Grande:BR America/Porto_Velho:BR America/Rio_Branco:BR America/Maceio:BR America/Araguaina:BR America/Noronha:BR ' +
  'America/Panama:PA America/Costa_Rica:CR America/Guatemala:GT America/El_Salvador:SV America/Tegucigalpa:HN America/Managua:NI America/Santo_Domingo:DO America/Puerto_Rico:PR America/Havana:CU America/Jamaica:JM ' +
  'Asia/Singapore:SG Asia/Kolkata:IN Asia/Calcutta:IN Asia/Dhaka:BD Asia/Karachi:PK Asia/Kathmandu:NP Asia/Colombo:LK Asia/Jakarta:ID Asia/Manila:PH Asia/Bangkok:TH Asia/Ho_Chi_Minh:VN Asia/Saigon:VN ' +
  'Asia/Kuala_Lumpur:MY Asia/Hong_Kong:HK Asia/Taipei:TW Asia/Shanghai:CN Asia/Tokyo:JP Asia/Seoul:KR Asia/Dubai:AE Asia/Riyadh:SA Asia/Qatar:QA Asia/Kuwait:KW Asia/Muscat:OM Asia/Amman:JO ' +
  'Asia/Beirut:LB Asia/Jerusalem:IL Asia/Tel_Aviv:IL Asia/Baghdad:IQ Asia/Tehran:IR Asia/Almaty:KZ Asia/Tashkent:UZ Asia/Yangon:MM Asia/Phnom_Penh:KH Asia/Gaza:PS Asia/Hebron:PS ' +
  'Australia/Sydney:AU Australia/Melbourne:AU Australia/Brisbane:AU Australia/Perth:AU Australia/Adelaide:AU Pacific/Auckland:NZ ' +
  'Africa/Johannesburg:ZA Africa/Lagos:NG Africa/Cairo:EG Africa/Casablanca:MA Africa/Algiers:DZ Africa/Tunis:TN Africa/Nairobi:KE Africa/Accra:GH Africa/Kampala:UG Africa/Dar_es_Salaam:TZ ' +
  'Africa/Kigali:RW Africa/Dakar:SN Africa/Luanda:AO Africa/Maputo:MZ Africa/Harare:ZW Africa/Lusaka:ZM Africa/Abidjan:CI Africa/Douala:CM Indian/Mauritius:MU').split(' ').map((p) => p.split(':')));
function geoOf(cc) { return !cc ? '' : TIER_A.includes(cc) ? 'A' : TIER_C.includes(cc) ? 'C' : 'B'; }
const GEO = (() => {
  let cc = String(window.LB_COUNTRY || new URLSearchParams(location.search).get('country') || '').toUpperCase();
  let how = cc ? 'IP (Cloudflare)' : '';
  if (!cc) { try { cc = TZ[Intl.DateTimeFormat().resolvedOptions().timeZone] || ''; how = cc ? 'time zone' : ''; } catch (_) {} }
  return { cc, how, tier: geoOf(cc) };
})();
const countryName = (cc, lang) => { try { return new Intl.DisplayNames([lang === 'pt' ? 'pt-BR' : lang], { type: 'region' }).of(cc); } catch (_) { return cc; } };
/* page language, country and fit level travel in the [Page context] line: the agent copies them to page_lang / country_tier (6-oct-2026) */
const PAGE_LANG0 = LANG;
const ctxAdd = () => { const a = [`page language ${PAGE_LANG0}`, `chat language ${LANG}`]; if (GEO.cc) a.push(`country ${countryName(GEO.cc, 'en')} (inferred from ${GEO.how}) · geo ${GEO.tier}`); return a.join(' · '); };

/* phones: the builder works best on a computer, so the sign-up CTA asks for the account now and the build later (Fabo, 6-oct-2026) */
const MOBILE = matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 768;
if (MOBILE) {
  const M = { en: ['Create my account now →', 'Create the free account now from your phone (1 min, no card) and build it later on your computer, where the builder works best.'],
    es: ['Crear mi cuenta ahora →', 'Crea la cuenta gratis ahora desde el móvil (1 min, sin tarjeta) y móntalo luego en el ordenador, donde el builder funciona mejor.'],
    pt: ['Criar minha conta agora →', 'Crie a conta grátis agora pelo celular (1 min, sem cartão) e monte depois no computador, onde o builder funciona melhor.'] };
  const H = { en: '1 min from your phone · build it later on your computer', es: '1 min desde el móvil · lo montas luego en el ordenador', pt: '1 min pelo celular · você monta depois no computador' };
  for (const [l, [b, w]] of Object.entries(M)) if (DICT[l]) { DICT[l].build = b; DICT[l].whyBuild = w; DICT[l].mobHint = H[l]; if (DICT[l].freeGo) DICT[l].freeGo = b; if (DICT[l].planGo) DICT[l].planGo = b; }
}
/* The interface follows the language the visitor WRITES in, not only the page's switch */
const LANG_CUES = {
  es: [/[¿¡ñ]/, /\b(hola|gracias|qué|que|cuánto|cuanto|cómo|como|quiero|tengo|necesito|precio|cuesta|puedo|mi|mis|nuestro|empresa|mensajes|usted|vale|con|una|unos|por|las|los|del|pero|hay|muy|soy|somos|hablar|ventas|cliente|ya|funciona|también|dónde|cuándo|y|el|la|es)\b/gi],
  pt: [/[ãõç]/, /\b(olá|ola|obrigad[oa]|não|você|voce|quanto|custa|quero|tenho|preciso|preço|meu|minha|nossa|empresa|mensagens|isso|está|com|uma|pelo|das|dos|muito|tem|eu|sou|somos|falar|vendas|já|funciona|também|onde|quando|o|os|é|em)\b/gi],
  en: [/(?!)/, /\b(hello|hi|thanks|what|how|much|will|does|the|my|our|we|need|want|cost|price|company|messages|can|is|i|with|to|and|for|it|you|this|do|are|talk|sales|already|customer|working|of|in)\b/gi],
};
function detectLang(q) {
  const score = {};
  for (const [l, [strong, words]] of Object.entries(LANG_CUES)) score[l] = (strong.test(q) ? 2 : 0) + (q.match(words) || []).length;
  const [best, second] = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const short = q.trim().split(/\s+/).length <= 2;          // "hola", "olá obrigado"
  return best[1] > second[1] && (best[1] >= 2 || short) ? best[0] : null;   // mixed or no cues: keep the current language
}
function followLang(q) {
  const l = detectLang(q);
  if (l && l !== LANG && DICT[l]) { LANG = l; T = DICT[LANG]; paint(); }
}
const COUNTRY_NAME = { en: { Spain: 'Spain', 'United Kingdom': 'UK', Brazil: 'Brazil' }, es: { Spain: 'España', 'United Kingdom': 'Reino Unido', Brazil: 'Brasil' }, pt: { Spain: 'Espanha', 'United Kingdom': 'Reino Unido', Brazil: 'Brasil' } };
const cName = (c) => ((COUNTRY_NAME[LANG] || COUNTRY_NAME.en)[c]) || c;
const fmt = (n) => Math.round(n).toLocaleString(LANG === 'en' ? 'en-US' : LANG === 'pt' ? 'pt-PT' : 'es-ES');
const money = (n, c) => (CUR[c] || '$') + (n >= 100 ? fmt(n) : n.toFixed(2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

/* ---------- context before questions ---------- */
const TZ_NAME = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { return ''; } })();
const tzCountry = /Madrid|Canary|Ceuta/.test(TZ_NAME) ? 'Spain' : /London|Belfast/.test(TZ_NAME) ? 'United Kingdom' : /Sao_Paulo|Bahia|Fortaleza|Recife|Manaus|Belem|Maceio|Araguaina|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Noronha/.test(TZ_NAME) ? 'Brazil' : null;
let visits = 0;
try { visits = +(localStorage.getItem('awe-visits') || 0); localStorage.setItem('awe-visits', String(visits + 1)); } catch (_) {}

const st = { core: null, boot: null, greeted: false, greetBtns: null, facts: {}, awaiting: null, answers: 0, nbaKey: '', open: false, t0: Date.now(), teamDone: false, section: 'tldr', dismissed: false, evTouched: false, cited: new Set() };
const J = () => (window.lbJourney && window.lbJourney.describe && window.lbJourney.describe()) || null;
try { const d = J(); if (d && d.from) st.facts.from = { v: d.from === 'direct' ? T.direct : d.from, guess: true }; } catch (_) {}
if (tzCountry) st.facts.country = { v: tzCountry, guess: true };

/* ---------- the real back: Landbot.Core, headless ---------- */
function loadSDK() {
  if (window.Landbot) return Promise.resolve(window.Landbot);
  if (!document.querySelector('script[data-awe-sdk]')) { const s = document.createElement('script'); s.type = 'module'; s.src = SDK_URL; s.dataset.aweSdk = '1'; document.head.appendChild(s); }
  return new Promise((res, rej) => { const t0 = Date.now(); const tick = () => window.Landbot ? res(window.Landbot) : (Date.now() - t0 > 15000 ? rej(new Error('sdk timeout')) : setTimeout(tick, 60)); tick(); });
}
function boot() {
  if (st.boot) return st.boot;
  st.boot = (async () => {
    const LB = await loadSDK();
    const cfg = await fetch(CONFIG_URL).then((r) => r.json());
    cfg.customData = Object.assign({}, cfg.customData || {}, { source: ENTRY.source, subsource: ENTRY.sales });   // embedded bot: origin travels as customData
    const core = new LB.Core(cfg);
    st.core = core;
    let greetRes; const greeted = new Promise((r) => (greetRes = r)); st._greet = greetRes;
    core.pipelines.$readableSequence.subscribe((m) => { try { onMsg(m); } catch (e) { console.warn('[awe]', e); } });
    await core.init(cfg);
    await Promise.race([greeted, sleep(8000)]);
  })();
  return st.boot;
}
/* the booking's Calendly references ride on the next message as custom_data, so the bot can look the invitee up (Xavi, 8-oct-2026) */
function withData(m) { const d = st.nextData; st.nextData = null; if (d) m.custom_data = d; return m; }
const calRefs = (d) => { const p = (d && d.payload) || {}; return { calendly_invitee: (p.invitee && p.invitee.uri) || '', calendly_event: (p.event && p.event.uri) || '' }; };
async function deliver(text, payload) {
  await boot();
  const btn = payload && st.greetBtns && st.greetBtns.find((b) => b.payload === payload);
  return st.core.sendMessage(withData(payload ? { type: 'button', message: btn ? btn.text : text, payload } : { type: 'text', message: text }));
}

/* ---------- UI: lava orb, bottom-right launcher, layer ---------- */
const STARTERS = { en: ['What will it cost me?', 'What exactly changes?', 'Am I too dependent on WhatsApp?'], es: ['¿Cuánto me va a costar?', '¿Qué cambia exactamente?', '¿Dependo demasiado de WhatsApp?'], pt: ['Quanto me vai custar?', 'O que muda exatamente?', 'Dependo demasiado do WhatsApp?'] };
const starterChips = () => STARTERS[LANG].map((l) => `<button type="button" class="awe-chip" data-awe-say="${esc(l)}">${esc(l)}</button>`).join('');
let gooN = 0;
const LAVA = (cls) => { const id = 'aweGoo' + (++gooN); return `<span class="awe-lava ${cls || ''}" aria-hidden="true">
  <svg viewBox="0 0 300 300"><defs><filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="13" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs>
  <g filter="url(#${id})"><circle class="g1" cx="150" cy="150" r="52" fill="#F58B0B"/><circle class="g2" cx="178" cy="170" r="40" fill="#636BFC"/><circle class="g3" cx="135" cy="120" r="34" fill="#4FCCC2"/><circle class="g4" cx="120" cy="175" r="28" fill="#FF3F7B"/><circle class="g5" cx="180" cy="125" r="24" fill="#F58B0B"/></g></svg></span>`; };
const launch = h(`<div id="awe-launch" role="region" aria-label="Landbot AI"><div class="awe-chips" data-awe-starters></div>
  <form class="awe-pill" data-awe-form><button type="button" data-awe-open style="all:unset;cursor:pointer;border-radius:50%">${LAVA()}</button><input type="text" autocomplete="off"><button type="submit" class="awe-pill-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></button></form></div>`);
const panel = h(`<aside id="awe-panel" role="dialog" aria-label="Landbot AI" aria-hidden="true">
  <div class="awe-head">${LAVA('sm')}<div class="awe-head-t"><b>Landbot AI</b><span class="awe-status"></span></div>
    <button type="button" class="awe-x" data-awe-close aria-label="Close">✕</button></div>
  <div class="awe-facts"><div class="awe-facts-h"><span data-t="facts"></span><span data-t="edit"></span></div><div class="awe-facts-list"></div></div>
  <div class="awe-thread" aria-live="polite"></div>
  <div class="awe-foot"><div class="awe-chips" data-awe-replies></div>
    <form class="awe-compose" data-awe-form><input type="text" autocomplete="off"><button class="awe-send" type="submit" aria-label="Send">↑</button></form>
    <p data-t="foot"></p></div></aside>`);
const scrim = h('<div id="awe-scrim" aria-hidden="true"></div>');
scrim.addEventListener('click', () => closePanel());
document.body.appendChild(scrim); document.body.appendChild(panel); document.body.appendChild(launch);
const launchInput = launch.querySelector('input'), pill = launch.querySelector('.awe-pill');
const badge = h('<span class="awe-badge" aria-hidden="true"></span>');
launch.querySelector('[data-awe-open]').appendChild(badge);
function setUnread(n) {                              // count of replies that arrived while the layer was closed
  st.unread = n;
  badge.textContent = n > 9 ? '9+' : String(n || '');
  badge.classList.toggle('on', n > 0);
  if (n > 0) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  launch.querySelector('[data-awe-open]').setAttribute('aria-label', n > 0 ? `Landbot AI · ${n} new` : 'Landbot AI');
}
function paint() {                                   // every visible string follows the page's language
  launch.querySelector('[data-awe-starters]').innerHTML = starterChips();
  panel.querySelector('.awe-foot input').placeholder = T.phPanel;
  panel.querySelectorAll('[data-t]').forEach((n) => { n.textContent = T[n.dataset.t]; });
  if (!panel.querySelector('.awe-status').classList.contains('work')) panel.querySelector('.awe-status').textContent = T.online;
  st.section = ''; syncLaunch(); renderFacts();
}
const thread = panel.querySelector('.awe-thread'), statusEl = panel.querySelector('.awe-status'), headOrb = panel.querySelector('.awe-head .awe-lava');
const repliesEl = panel.querySelector('[data-awe-replies]');
const push = (el) => { thread.appendChild(el); requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; }); return el; };

function openPanel() {
  emit('entry_point_click', ENTRY.sales);
  if (st.unread) setUnread(0);
  if (!st.open) { st.open = true; panel.classList.add('on'); if (st.calOpen) panel.classList.add('wide'); scrim.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); syncLaunch(); }
  if (!thread.children.length) {
    const ctx = st.facts.country && st.facts.country.guess ? `<div class="awe-src"><button type="button" data-awe-fact="country"><em>${esc(T.k.country)}</em>${esc(cName(st.facts.country.v))} · ${esc(T.guess)}</button></div>` : '';
    push(h(`<div class="awe-msg"><p>${visits > 0 ? T.back : ''}${T.rec}</p>${ctx}</div>`));
    repliesEl.innerHTML = starterChips();
  }
}
function closePanel() { st.open = false; panel.classList.remove('on', 'wide'); scrim.classList.remove('on', 'lift'); panel.setAttribute('aria-hidden', 'true'); syncLaunch(); }
function setWorking(label) {
  thread.querySelectorAll('.awe-working').forEach((n) => n.remove());
  if (!label) { statusEl.textContent = T.online; statusEl.classList.remove('work'); headOrb.classList.remove('work'); return; }
  statusEl.textContent = T.working + '…'; statusEl.classList.add('work'); headOrb.classList.add('work');
  push(h(`<div class="awe-working"><span class="awe-orb sm work" aria-hidden="true"></span><span>${esc(T.reading)} ${esc(label)}…</span></div>`));
}
function guessSection(q) {
  if (/cost|price|pay|bill|cuest|cost|precio|pag|factur|custa|preç|estimat|calcul/i.test(q)) return '“Why 1.59p isn’t your real cost”';
  if (/chang|cambi|mud/i.test(q)) return '“What changes on October 1”';
  if (/depend|evict|expos|score/i.test(q)) return '“The Eviction Test”';
  if (/ban|lock|bloque|baneo/i.test(q)) return '“When Meta bans your account”';
  if (/30|next|próxim|proxim/i.test(q)) return '“What to do in the next 30 days”';
  return T.theArticle;
}

/* ---------- sending ---------- */
async function say(text, payload) {
  const q = (text || '').trim(); if (!q) return;
  openPanel();
  repliesEl.innerHTML = '';
  thread.querySelectorAll('.awe-nba').forEach((n) => n.remove());
  push(h(`<div class="awe-me">${esc(q)}</div>`));
  if (!payload) followLang(q);
  readUser(q);
  setWorking(guessSection(q));
  let out = q, pl = payload;
  if (!st.ctxSent) {
    st.ctxSent = true;
    let line = window.lbJourney && window.lbJourney.line ? window.lbJourney.line() : '';
    line = line ? line.replace(/\]$/, ' · ' + ctxAdd() + ']') : '[Page context: ' + ctxAdd() + ']';
    if (MOBILE) line = line.replace(/\]$/, ' · device mobile]');
    if (line) { out = line + '\n\n' + q; pl = undefined; }        // as text: the greeting's "anything else" route also reaches the agent
  }
  armWatchdog(q);
  try { await deliver(out, pl); }
  catch (e) { setWorking(null); push(h(`<div class="awe-msg"><p>Something went wrong reaching the agent. Try again in a moment.</p></div>`)); console.warn('[awe]', e); }
}

/* ---------- receiving: what the real agent says ---------- */
/* watchdog: if no reply arrives in 40 s (service down, model error, disabled bot), say so and offer a retry */
const AWE_SLOW = { en: ['This is taking longer than usual. Want me to try again?', 'Try again'], es: ['Esto está tardando más de lo normal. ¿Lo intento de nuevo?', 'Reintentar'], pt: ['Isto está demorando mais que o normal. Quer que eu tente de novo?', 'Tentar de novo'] };
function armWatchdog(q) {
  clearTimeout(st.wd); st.wdQ = q;
  st.wd = setTimeout(() => {
    const s = AWE_SLOW[LANG] || AWE_SLOW.en; setWorking(null);
    push(h(`<div class="awe-msg"><p>${esc(s[0])}</p></div>`));
    repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-retry>${esc(s[1])}</button>`;
  }, 40000);
}
async function retryLast() {
  const q = st.wdQ; if (!q) return;
  repliesEl.innerHTML = '';
  const fresh = typeof restartSession === 'function';
  if (fresh) { st.restarted = true; await restartSession(); st.ctxSent = true; }
  setWorking(T.theArticle || T.theSite || '…'); armWatchdog(q);
  try { await deliver((fresh && typeof contextLine === 'function' ? contextLine() + '\n\n' : '') + q); } catch (e) { console.warn('[awe]', e); }
}
function onMsg(m) {
  const ts = m.timestamp ? (m.timestamp > 1e12 ? m.timestamp : m.timestamp * 1000) : Date.now();
  if (ts < st.t0 - 5000) return;                       // ignore any replayed history
  if (m.author_type === 'user') return;                // the page draws the visitor's side itself
  const ex = m.extra || {};
  const bid = String(ex.id || '').replace(/_\d+$/, '');   // block id in the Landbot flow (ids arrive as team_done_0)
  if (!st.greeted && m.type === 'dialog') {            // the bot's greeting: its buttons become our chips
    st.greeted = true; st.greetBtns = (m.buttons || []).map((t, i) => ({ text: t, payload: (m.payloads || [])[i] }));
    if (st._greet) st._greet();
    return;
  }
  clearTimeout(st.wd);   // a real reply (not the flow's greeting) cancels the watchdog
  st.chain = (st.chain || Promise.resolve()).then(async () => {
    const before = thread.children.length;
    await handleMsg(m, ex, bid);
    if (!st.open && thread.children.length > before) setUnread((st.unread || 0) + 1);
  }).then(() => keepFocus()).catch((e) => console.warn('[awe]', e));
}
async function handleMsg(m, ex, bid) {
  setWorking(null);
  const text = m.message || m.title || '';
  if (bid === 'team_email' || (ex.textarea && ex.textarea.type === 'email')) { emailCard(); return; }
  if (bid === 'team_done') { receipts(); return; }
  if (bid === 'sales_book') { bookCard(); return; }
  if (bid === 'sales_booked') { await agentText(T.bookedMsg); return; }
  if (bid === 'support_route') { supportCard(); return; }
  if (bid === 'team_more') { repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.oneMore)}" data-awe-payload="$0">${esc(T.oneMore)}</button>`; return; }
  if (m.type === 'dialog' && (m.buttons || []).length) {
    const labels = new Set(m.buttons.map((b) => String(b).trim().toLowerCase()));
    const clean = text.split(/\n/).filter((l) => !labels.has(l.replace(/^[-•*\d.)\s]+/, '').trim().toLowerCase())).join('\n').trim();
    if (clean) { await agentText(clean); if (ex.is_ai_agent_message) { st.answers++; decide(''); } }
    repliesEl.innerHTML = m.buttons.map((b, i) => `<button type="button" class="awe-chip" data-awe-say="${esc(b)}" data-awe-payload="${esc((m.payloads || [])[i] || '')}">${esc(b)}</button>`).join('');
    return;
  }
  if (text) { await agentText(text); st.answers++; decide(text); }
}

function md(src) {
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${tagUrl(u.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/(^|[\s(*])(https?:\/\/[^\s<)*]+)/g, (_, pre, u) => { const clean = u.replace(/[.,;:]+$/, ''), tail = u.slice(clean.length); return `${pre}<a href="${tagUrl(clean.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${clean}</a>${tail}`; })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  const out = []; let list = null;
  for (const raw of src.split(/\n/)) {
    const line = raw.trim();
    const li = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (li) { if (!list) { list = []; } list.push(`<li>${inline(li[1])}</li>`); continue; }
    if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; }
    if (line) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push(`<ul>${list.join('')}</ul>`);
  return out.join('');
}
function splitSources(text) {
  const src = []; const keep = [];
  for (const line of text.split(/\n/)) {
    const mm = line.replace(/[*_]/g, '').match(/^\s*(sources?|fuentes?|fontes?)\s*:\s*(.+)$/i);
    if (mm) src.push(mm[2]); else keep.push(line);
  }
  return { body: keep.join('\n').trim(), src: src.join(' · ') };
}
function sourceChips(s) {
  if (!s) return '';
  const chips = []; const seen = new Set();
  if (/meta|developers\.facebook/i.test(s)) chips.push(`<a href="${META}" target="_blank" rel="noopener"><em>${T.fromMeta}</em>Meta for Developers · pricing ↗</a>`);
  for (const [id, re, label] of SECTIONS) if (re.test(s) && !seen.has(id)) { seen.add(id); chips.push(`<button type="button" data-awe-point="${id}"><em>${T.fromArticle}</em>${esc(label)}</button>`); }
  if (!chips.length && /article|artículo|artigo/i.test(s)) chips.push(`<button type="button" data-awe-point="tldr"><em>${T.fromArticle}</em>${esc(s.replace(/this article,?\s*/i, '').slice(0, 60))}</button>`);
  return chips.length ? `<div class="awe-src">${chips.join('')}</div>` : '';
}
/* ---------- new-message chime: two soft sine notes, synthesised so there's no audio file to load ---------- */
let actx = null, lastDing = 0;
const unlockAudio = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} };
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, unlockAudio, { passive: true }));   // browsers only allow sound after a gesture
function ding() {
  if (!actx || actx.state !== 'running' || Date.now() - lastDing < 800) return;
  lastDing = Date.now();
  const t = actx.currentTime;
  [[880, 0], [1318.5, 0.09]].forEach(([f, dt]) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.12, t + dt + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.35);
    o.connect(g).connect(actx.destination); o.start(t + dt); o.stop(t + dt + 0.4);
  });
}
function bubbles(body) {                           // one thought per bubble; a list stays together
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push(list.join('\n')); list = []; } };
  for (const raw of body.split(/\n/)) {
    const line = raw.trim(); if (!line) { flush(); continue; }
    if (/^(?:[-•*]|\d+[.)])\s+/.test(line)) { list.push(line); continue; }
    flush();
    if (line.length <= 200) { out.push(line); continue; }
    let cur = '';                                      // long paragraph: break at sentence ends
    for (const sn of line.match(/[^.!?]+[.!?]+["”»)]*\s*|[^.!?]+$/g) || [line]) {
      if (cur && (cur + sn).length > 180) { out.push(cur.trim()); cur = ''; }
      cur += sn;
    }
    if (cur.trim()) out.push(cur.trim());
  }
  flush();
  return out.length ? out : [body];
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/* Sign-up links from the agent: always the tagged URL and the button wording, whatever markdown the agent used */
function fixLinks(el) {
  el.querySelectorAll('a[href]').forEach((a) => {
    if (!/(^|\.)landbot\.io\/sign-?up/.test(a.href.replace(/^https?:\/\//, ''))) return;
    a.href = tagUrl(SIGNUP);
    if (/^https?:\/\//.test(a.textContent.trim())) a.textContent = T.build;
    const prev = a.previousElementSibling;
    if (prev && prev.tagName === 'B' && /build|crear|criar/i.test(prev.textContent)) { prev.remove(); }
  });
  return el;
}
const FIELD_LINE = /^\s*[*_`]*\s*(conversation_summary|visitor_journey|channels_wanted|page_lang|arrival_reason|use_case|channel|team_size|monthly_volume|urgency|comparing|country_tier|subsource|source|bot_use_case|wa_number_approved)\s*[*_`]*\s*[:=]/i;
async function agentText(text) {
  text = String(text).split(/\n/).filter((l) => !FIELD_LINE.test(l)).join('\n');   // a field the agent saves must never be shown to the visitor
  const { body, src } = splitSources(text);
  const parts = bubbles(body);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && !reduce) {
      const dots = push(h('<div class="awe-typing" aria-hidden="true"><i></i><i></i><i></i></div>'));
      await wait(Math.min(1600, 450 + parts[i].length * 14));
      dots.remove();
    }
    fixLinks(push(h(`<div class="awe-msg">${md(parts[i])}${i === parts.length - 1 ? sourceChips(src) : ''}</div>`)));
    if (i === 0) ding();
  }
  readAgent(text);
  for (const [id, re] of SECTIONS) if (re.test(src) && !st.cited.has(id)) { st.cited.add(id); pointAt(id); break; }
}

/* Sections: by id on the mockup, by heading text on the live Webflow post (its h2s have no ids) */
const HEAD_RX = { tldr: /^tl;?dr/i, 'what-changes': /^what changes in the whatsapp/i, 'real-cost': /1\.59p/i, rules: /changed the rules/i, bans: /bans your whatsapp/i,
  eviction: /eviction test/i, n5: /eviction test/i, 'ev-1': /^identity/i, 'ev-2': /^logic/i, 'ev-3': /^economics/i, 'ev-4': /^exit/i,
  'stop-using': /stop using whatsapp/i, agentic: /agentic web experience/i, 'ai-search': /ai search/i, 'next-30': /next 30 days/i, faq: /frequently asked/i };
const secCache = {};
function secEl(id) {
  const byId = document.getElementById(id); if (byId) return byId;
  if (secCache[id] && secCache[id].isConnected) return secCache[id];
  let el = id === 'tldr' ? document.querySelector('.lb-tldr') : null;
  const rx = HEAD_RX[id];
  if (!el && rx) el = [...document.querySelectorAll('article h2, article h3, .w-richtext h2, .w-richtext h3, main h2, main h3')].find((h) => rx.test(h.textContent.trim())) || null;
  return (secCache[id] = el);
}
/* ---------- pointAt(): the agent lights up what it is reading ---------- */
function pointAt(id) {
  const el = secEl(id); if (!el) return;
  document.querySelectorAll('.awe-point').forEach((n) => n.classList.remove('awe-point'));
  el.dataset.aweLabel = T.pointLabel; el.classList.add('awe-point'); scrim.classList.add('lift');
  if (window.innerWidth > 1180 || !st.open) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  clearTimeout(st._pt); st._pt = setTimeout(() => { el.classList.remove('awe-point'); scrim.classList.remove('lift'); }, 4500);
}

/* ---------- what I've understood (editable) ---------- */
const COUNTRY_RX = [[/\b(spain|españa|espanha|spanish)\b/i, 'Spain'], [/\b(uk|u\.k\.|united kingdom|reino unido|england|britain|great britain)\b/i, 'United Kingdom'], [/\b(brazil|brasil)\b/i, 'Brazil'],
  [/\b(m[eé]xico)\b/i, 'Mexico'], [/\bcolombia\b/i, 'Colombia'], [/\bargentina\b/i, 'Argentina'], [/\bchile\b/i, 'Chile'], [/\bper[uú]\b/i, 'Peru'], [/\bportugal\b/i, 'Portugal'], [/\b(italy|italia|itália)\b/i, 'Italy'],
  [/\b(france|francia|frança)\b/i, 'France'], [/\b(germany|alemania|alemanha)\b/i, 'Germany'], [/\b(usa|u\.s\.|united states|estados unidos|eeuu|eua)\b/i, 'United States'], [/\bindia\b/i, 'India'], [/\bindonesia\b/i, 'Indonesia']];
function parseVolume(q, force) {
  const ctx = /(repl|messag|mensaj|mensag|respuest|respost|month|mes|mês|\/mo|per month|al mes|por mes|por mês)/i.test(q);
  if (!ctx && !force) return null;
  let best = null;
  const rx = /(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil|thousand|m\b|million|millones|milhões|millón)?/gi;
  let mm; while ((mm = rx.exec(q))) {
    let n = parseFloat(mm[1].replace(/[\s]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
    const u = (mm[2] || '').toLowerCase();
    if (u === 'k' || u === 'mil' || u === 'thousand') n *= 1000; else if (u && u[0] === 'm') n *= 1e6;
    if (n >= 2024 && n <= 2027 && !u) continue;
    if (n < 50) continue;
    if (!best || n > best) best = n;
  }
  return best;
}
function readUser(q) {
  const f = st.facts; let changed = false;
  if (st.awaiting === 'why' && q.length > 2) { f.why = { v: q.length > 70 ? q.slice(0, 68) + '…' : q }; changed = true; }
  const v = parseVolume(q, st.awaiting === 'volume'); if (v) { f.vol = { v }; changed = true; }
  for (const [re, c] of COUNTRY_RX) if (re.test(q)) { f.country = { v: c }; changed = true; break; }
  if (/\b(ai|ia|chatgpt|gpt|llm|bot)\b/i.test(q) && /(repl|respond|answer|contest|respon|escrib|writ)/i.test(q)) { f.who = { v: T.ai }; changed = true; }
  else if (/(human|agents|agentes|team|equipo|equipa|people|personas|pessoas)/i.test(q) && /(repl|respond|answer|contest|respon)/i.test(q)) { f.who = { v: T.human }; changed = true; }
  const use = /support|soporte|suporte|atención/i.test(q) ? 'Support' : /sales|ventas|vendas/i.test(q) ? 'Sales' : /campaign|marketing|campañ|campanh/i.test(q) ? 'Campaigns' : /booking|citas|appointment|agend|reserv/i.test(q) ? 'Bookings' : null;
  if (use) { f.use = { v: use }; changed = true; }
  if (changed) { renderFacts(); estimate(); }
}
function readAgent(text) {
  const sc = text.match(/\b(\d{1,2})\s*\/\s*40\b/); if (sc && /score|total|puntua|pontua|eviction/i.test(text)) { st.facts.score = { v: +sc[1] }; renderFacts(); }
  const tail = text.slice(-260);
  if (/(what brought you|brought you here|what made you look|qu[eé] te (ha )?tra[ií]do|qu[eé] te trajo|o que te trouxe|what got you)/i.test(tail)) { st.awaiting = 'why'; return; }
  st.awaiting = /(how many|cuánt|cuant|quant|volume|volumen|ballpark).{0,80}(repl|messag|mensaj|mensag|respuest|respost)/i.test(tail) ? 'volume'
    : /(country|país|pais)/i.test(tail) && /\?/.test(tail) ? 'country' : /0\s*(–|-|to|a)\s*10/.test(tail) ? 'eviction' : null;
}
const FACT_ORDER = ['why', 'vol', 'country', 'who', 'use', 'score', 'from'];
function factVal(k, o) { return k === 'vol' ? fmt(o.v) + T.perMo : k === 'country' ? cName(o.v) : k === 'score' ? o.v + '/40' : o.v; }
function renderFacts() {
  const box = panel.querySelector('.awe-facts'), list = panel.querySelector('.awe-facts-list');
  const keys = FACT_ORDER.filter((k) => st.facts[k]);
  box.classList.toggle('on', keys.length > 0 && Object.keys(st.facts).some((k) => !st.facts[k].guess) || keys.length > 1);
  list.innerHTML = keys.map((k) => `<button type="button" class="awe-fact${st.facts[k].guess ? ' guess' : ''}" data-awe-fact="${k}"><i>${esc(T.k[k])}</i>${esc(factVal(k, st.facts[k]))}</button>`).join('');
}
function editFact(btn) {
  const k = btn.dataset.aweFact; const o = st.facts[k];
  btn.innerHTML = `<i>${esc(T.k[k])}</i><input value="${esc(k === 'vol' ? String(o.v) : factVal(k, o))}" aria-label="${esc(T.k[k])}">`;
  const inp = btn.querySelector('input'); inp.focus(); inp.select();
  const commit = (sendIt) => {
    const val = inp.value.trim(); if (!val) { renderFacts(); return; }
    if (k === 'vol') { const n = parseVolume(val, true); if (n) st.facts.vol = { v: n }; }
    else if (k === 'country') { let c = val; for (const [re, cc] of COUNTRY_RX) if (re.test(val)) { c = cc; break; } st.facts.country = { v: c }; }
    else if (k === 'score') { const n = parseInt(val, 10); if (!isNaN(n)) st.facts.score = { v: n }; }
    else st.facts[k] = { v: val };
    renderFacts(); estimate();
    if (sendIt && st.greeted) say(T.msgCorr(T.k[k].toLowerCase(), factVal(k, st.facts[k])));
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') renderFacts(); });
  inp.addEventListener('blur', () => commit(false), { once: true });
}

/* ---------- components: estimate, next best action, lead capture, receipts ---------- */
let estCard = null;
function estimate() {
  const f = st.facts; if (!f.vol || !f.country) return;
  const c = f.country.v, rate = RATES[c];
  const html = rate
    ? `<div class="awe-card awe-est"><span class="awe-tag">${esc(T.est)}</span>
        <div class="awe-big" data-big>${money(f.vol.v * rate, c)} <small>${T.per}</small></div>
        <div class="awe-sub" data-sub>${esc(T.estSub(fmt(f.vol.v), rate.toFixed(4), cName(c)).replace('$' + rate.toFixed(4), (CUR[c] || '$') + rate.toFixed(4)))}</div>
        <input class="awe-range" type="range" min="0" max="100" step="1" aria-label="${esc(T.k.vol)}">
        <div class="awe-rangelab"><span>1k</span><span>10k</span><span>100k</span><span>1M</span></div>
        <div class="awe-why">${esc(T.estWhy)}</div>
        <div class="awe-src"><a href="${META}" target="_blank" rel="noopener"><em>${T.fromMeta}</em>Official rate card (cited in the article) ↗</a><button type="button" data-awe-point="real-cost"><em>${T.fromArticle}</em>Why 1.59p isn’t your real cost</button></div></div>`
    : `<div class="awe-card awe-est"><span class="awe-tag">${esc(T.est)}</span>
        <div class="awe-big" style="font-size:20px">${esc(T.notIn(cName(c)))}</div><div class="awe-sub">${esc(T.notInSub)}</div>
        <div class="awe-src"><a href="${META}" target="_blank" rel="noopener"><em>${T.fromMeta}</em>${esc(T.checkMeta)}</a></div></div>`;
  const card = h(html);
  if (estCard && estCard.isConnected) estCard.replaceWith(card); else push(card);
  estCard = card;
  const r = card.querySelector('.awe-range');
  if (r) {
    const toPos = (v) => Math.round((Math.log10(Math.max(1000, Math.min(1e6, v))) - 3) / 3 * 100);
    const toVal = (p) => Math.round(Math.pow(10, 3 + p / 100 * 3) / 100) * 100;
    r.value = toPos(f.vol.v);
    r.addEventListener('input', () => {
      f.vol = { v: toVal(+r.value) };
      card.querySelector('[data-big]').innerHTML = `${money(f.vol.v * rate, c)} <small>${T.per}</small>`;
      card.querySelector('[data-sub]').textContent = T.estSub(fmt(f.vol.v), rate.toFixed(4), cName(c)).replace('$' + rate.toFixed(4), (CUR[c] || '$') + rate.toFixed(4));
      renderFacts(); morphPage();
    });
    r.addEventListener('change', () => decide(''));
  }
  morphPage();
}
function decide(lastText) {
  if (st.teamDone || /\?\s*$/.test((lastText || '').trim())) return;      // one thing asking for attention at a time
  const f = st.facts; let n = null;
  if (f.score && f.score.v < 20) n = { k: 'team-score', p: 'team', s: 'build', why: T.whyTeamScore(f.score.v) };
  else if (estCard && f.vol && f.vol.v >= 100000 && RATES[f.country && f.country.v]) n = { k: 'team-vol', p: 'team', s: 'build', why: T.whyTeamVol(fmt(f.vol.v)) };
  else if (estCard) n = { k: 'build', p: 'build', s: 'team', why: T.whyBuild };
  else if (st.answers >= 1) n = { k: 'est', p: 'estimate', s: 'evict', why: T.whyEst };
  if (!n || n.k === st.nbaKey) return;
  st.nbaKey = n.k;
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const btn = (a, primary) => a === 'build'
    ? (primary ? `<a class="awe-cta" href="${SIGNUP}" target="_blank" rel="noopener">${esc(T.build)}</a>` : `<a href="${SIGNUP}" target="_blank" rel="noopener">${esc(T.build)}</a>`)
    : (primary ? `<button type="button" class="awe-cta" data-awe-act="${a}">${esc(T[a])}</button>` : `<button type="button" data-awe-act="${a}">${esc(T[a])}</button>`);
  push(h(`<div class="awe-card awe-nba"><span class="awe-tag act">${esc(T.nba)}</span>
    <div class="awe-why" style="margin-top:0"><b>${esc(T.why)}:</b> ${esc(n.why)}</div>
    ${btn(n.p, true)}<div class="awe-alt">${esc(T.or)} ${btn(n.s, false)}</div></div>`));
  repliesEl.innerHTML = '';                                              // the recommendation replaces generic reply chips
}
function act(a) {
  if (a === 'team') say(T.msgTeam);
  else if (a === 'estimate') say(T.msgEst);
  else if (a === 'evict') say(T.msgEvict);
}
function emailCard() {
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  if (thread.querySelector('.awe-mail:not([data-done])')) return;
  const card = push(h(`<div class="awe-card awe-mail"><span class="awe-tag act">ACTION</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink)">${esc(T.mail)}</div><div class="awe-sub">${esc(T.mailSub)}</div>
    <form class="awe-field"><input type="email" required placeholder="${esc(T.mailPh)}" aria-label="Email" autocomplete="email"><button type="submit">${esc(T.sendIt)}</button></form>
    <div class="awe-sub" data-err style="color:#BE2257;display:none">${esc(T.mailBad)}</div></div>`));
  const form = card.querySelector('form'), inp = form.querySelector('input');
  setTimeout(() => inp.focus({ preventScroll: true }), 300);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { inp.setAttribute('aria-invalid', 'true'); card.querySelector('[data-err]').style.display = 'block'; return; }
    card.dataset.done = '1'; form.querySelectorAll('input,button').forEach((x) => (x.disabled = true));
    st.facts.email = { v }; st.teamPending = true;
    push(h(`<div class="awe-me">${esc(v)}</div>`)); setWorking(T.theArticle);
    deliver(v).catch((err) => console.warn('[awe]', err));
  });
}
/* Calendly's "anything that will help prepare" is seen and edited by the visitor: only what they told us, readable. Nothing internal (guessed country, visits, journey). */
function prepNote() {
  const f = st.facts, P = [];
  if (f.why) P.push(T.k.why + ': ' + f.why.v);
  const facts = FACT_ORDER.filter((k) => f[k] && !f[k].guess && !['why', 'from', 'email', 'country'].includes(k)).map((k) => factVal(k, f[k]));
  if (facts.length) P.push(facts.join(' · '));
  return P.join(' | ');
}
function handoffLines() {
  const d = J(), f = st.facts, L = [];
  if (f.why) L.push(T.k.why + ': ' + f.why.v);
  if (d) {
    L.push(T.k.from + ': ' + (d.from === 'direct' ? T.direct : d.from) + (d.campaign ? ' · ' + d.campaign : ''));
    if (d.before.length) L.push('→ ' + d.before.join(' → '));
    L.push(d.visit > 1 ? '#' + d.visit + ' · ' + (d.firstDaysAgo ? d.firstDaysAgo + 'd' : '0d') : '#1');
  }
  const facts = FACT_ORDER.filter((k) => f[k] && !['why', 'from', 'email'].includes(k)).map((k) => factVal(k, f[k]));
  if (facts.length) L.push(facts.join(' · '));
  return L;
}
function bookCard() {
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  push(h(`<div class="awe-card awe-book"><span class="awe-tag act">SALES</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink)">${esc(T.bookH)}</div><div class="awe-sub">${esc(T.bookSub)}</div>
    <button type="button" class="awe-cta" data-awe-cal>${esc(T.bookGo)}</button></div>`));
  repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.mailInstead)}" data-awe-payload="$1">${esc(T.mailInstead)}</button>`;
}
/* the calendar opens inside the conversation; the layer widens while it is there */
function calUrl() {
  const q = new URLSearchParams({ embed_type: 'Inline', embed_domain: location.hostname || 'landbot.io', hide_gdpr_banner: '1',
    hide_event_type_details: '1', hide_landing_page_details: '1', primary_color: '5a60f6', text_color: '1b2139',   // straight to the calendar, in our colours
    utm_medium: 'conversion_agent', utm_campaign: 'wa_pricing_oct26', utm_content: ENTRY.sales });
  if (realSource()) q.set('utm_source', realSource());
  if (st.facts.email) q.set('email', st.facts.email.v);
  /* the Calendly event asks a1 = WhatsApp phone (required, left to the visitor) and a2 = "anything that will help prepare" (required): the summary goes in a2 */
  const prep = prepNote();
  if (prep) q.set('a2', prep.slice(0, 900));
  if (st.facts.name) q.set('name', st.facts.name.v);
  return `${BOOK_URL}?${q}`;
}
function openCal(btn) {
  const card = btn.closest('.awe-book'); if (!card || card.querySelector('iframe')) return;
  btn.remove();
  const wrap = h(`<div class="awe-cal" data-loading="${esc(T.calLoading)}"><iframe src="${calUrl()}" title="${esc(T.bookH)}" loading="eager"></iframe></div>`);
  wrap.querySelector('iframe').addEventListener('load', () => wrap.classList.add('ready'), { once: true });
  card.appendChild(wrap);
  st.calOpen = true;
  setTimeout(() => thread.scrollTo({ top: thread.scrollTop + card.getBoundingClientRect().top - thread.getBoundingClientRect().top - 8, behavior: 'smooth' }), 380);   // after the layer has widened
}
function closeCal(booked) {
  const card = thread.querySelector('.awe-book'); panel.classList.remove('wide'); st.calOpen = false;
  if (!card) return;
  const cal = card.querySelector('.awe-cal'); if (cal) cal.remove();
  if (booked) {
    emit('entry_point_booking', ENTRY.sales);
    card.querySelector('.awe-tag').textContent = 'SALES ✓';
    card.appendChild(h(`<div class="awe-receipt on"><span class="ok">✓</span><div>${esc(T.booked)}<small>Calendly · ${esc(T.bookH)}</small></div></div>`));
    if (handoffLines().length) card.appendChild(h(`<details class="awe-sees" open><summary>${esc(T.teamSees)}</summary>${handoffLines().map((l) => `<div>${esc(l)}</div>`).join('')}</details>`));
    say(T.booked, '$0');
  }
}
window.addEventListener('message', (e) => {           // Calendly reports the booking to the page that embeds it
  if (!/calendly\.com$/.test((() => { try { return new URL(e.origin).hostname; } catch (_) { return ''; } })())) return;
  const ev = e.data && e.data.event;
  if (ev === 'calendly.event_scheduled' && st.calOpen) { st.nextData = calRefs(e.data); closeCal(true); }
});
function supportCard() {
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  push(h(`<div class="awe-card"><span class="awe-tag act">SUPPORT</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink)">${esc(T.supH)}</div><div class="awe-sub">${esc(T.supSub)}</div>
    <a class="awe-cta" href="${HELP_URL}" target="_blank" rel="noopener">${esc(T.supGo)}</a></div>`));
  repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.backArt)}" data-awe-payload="$0">${esc(T.backArt)}</button>`;
}
function receipts() {
  st.teamDone = true; thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const ctx = FACT_ORDER.filter((k) => st.facts[k] && k !== 'email').map((k) => factVal(k, st.facts[k])).join(' · ') || '—';
  const card = push(h(`<div class="awe-card"><span class="awe-tag act">ACTION ✓</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink);margin-bottom:6px">${esc(T.done)}</div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(T.r1)}<small>${esc(T.r1s)}</small></div></div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(T.r2)}<small>${esc(ctx)}</small></div></div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(T.r3)}<small>${esc(T.r3s)}</small></div></div>
    ${handoffLines().length ? `<details class="awe-sees"><summary>${esc(T.teamSees)}</summary>${handoffLines().map((l) => `<div>${esc(l)}</div>`).join('')}</details>` : ''}</div>`));
  card.querySelectorAll('.awe-receipt').forEach((r, i) => setTimeout(() => r.classList.add('on'), 450 * (i + 1)));
}

/* ---------- the page adapts: the sidebar CTA speaks to this visitor ---------- */
const CTA_TXT = 'Qualify leads on your own site with no per-message tariff. Hand off to WhatsApp when it pays.';
function morphPage() {
  const f = st.facts; const rate = f.country && RATES[f.country.v]; if (!f.vol || !rate) return;
  const line = T.morph(fmt(f.vol.v), cName(f.country.v), money(f.vol.v * rate, f.country.v));
  document.querySelectorAll('div,p,span').forEach((el) => {
    if (el.children.length) return;
    if (el.textContent.trim() === CTA_TXT || el.dataset.aweMorph) {
      if (el.textContent === line) return;
      el.dataset.aweMorph = '1'; el.classList.add('awe-morph', 'out');
      setTimeout(() => { el.textContent = line; el.classList.remove('out'); }, 300);
    }
  });
}

/* ---------- the launcher: section-aware prompt, hidden while the layer is open ---------- */
const NUDGE_OF = { tldr: 'tldr', 'what-changes': 'tldr', 'real-cost': 'cost', rules: 'risk', bans: 'risk', eviction: 'ev', 'ev-1': 'ev', 'ev-2': 'ev', 'ev-3': 'ev', 'ev-4': 'ev', 'stop-using': 'try', agentic: 'try', 'ai-search': 'try', 'next-30': 'plan', faq: 'plan' };
const ORDER = Object.keys(NUDGE_OF);
function setNudge(label, prompt) {
  if (window.innerWidth < 560) label = label.split(' · ')[0];   // phones: the action only, the rest doesn't fit
  if (launchInput.dataset.prompt === prompt && launchInput.placeholder === label) return;
  pill.classList.add('swap');
  setTimeout(() => { launchInput.placeholder = label; launchInput.setAttribute('aria-label', label); launchInput.dataset.prompt = prompt; pill.classList.remove('swap'); }, 200);
}
function syncLaunch() {
  launch.classList.toggle('off', st.open);
  if (!st.open && !launch.classList.contains('tuck')) emit('entry_point_view', ENTRY.sales);   // real impression of the sticky bar, once
  if (st.evTouched) return;
  let active = ORDER[0];
  for (const id of ORDER) { const el = secEl(id); const r = el && el.getBoundingClientRect(); if (r && r.height > 0 && r.top < window.innerHeight * 0.45) active = id; }
  if (active !== st.section) { st.section = active; const [l, p] = T.nudge[NUDGE_OF[active]]; setNudge(l, p); }
}

/* ---------- focus stays in the chat while the layer is open; only closing it lets go ---------- */
const TOUCH = matchMedia('(hover: none)').matches;
function keepFocus(force) {
  if (!st.open) return;
  const box = panel.querySelector('.awe-foot input'), a = document.activeElement;
  if (a === box) return;
  if (a && a !== document.body && a.matches('input, textarea, select') && a !== launchInput) return;   // don't steal from the email card or a fact being edited
  if (TOUCH && !force) return;                                                                         // no surprise keyboards on phones
  box.focus({ preventScroll: true });
}
/* ---------- events (delegated, so they survive the page re-rendering) ---------- */
document.addEventListener('submit', (e) => {
  const f = e.target.closest && e.target.closest('[data-awe-form]'); if (!f) return;
  e.preventDefault(); const inp = f.querySelector('input'); const v = inp.value.trim() || (inp === launchInput ? inp.dataset.prompt : ''); inp.value = ''; say(v); keepFocus(true);
});
document.addEventListener('click', (e) => {
  const su = e.target.closest && e.target.closest('a[href*="sign-up"], a[href*="signup"]'); if (su && su.closest('#awe-panel')) emit('entry_point_click', ENTRY.signup);
  const t = e.target.closest ? e.target : null; if (!t) return;
  const chip = t.closest('[data-awe-say]'); if (chip) { say(chip.dataset.aweSay, chip.dataset.awePayload || undefined); keepFocus(); return; }
  const cal = t.closest('[data-awe-cal]'); if (cal) { openCal(cal); return; }
  const p = t.closest('[data-awe-point]'); if (p) { pointAt(p.dataset.awePoint); return; }
  const a = t.closest('[data-awe-act]'); if (a) { act(a.dataset.aweAct); return; }
  const fct = t.closest('[data-awe-fact]'); if (fct && !fct.querySelector('input')) { editFact(fct); return; }
  if (t.closest('[data-awe-retry]')) { retryLast(); return; }
  if (t.closest('[data-awe-close]')) { closePanel(); return; }
  if (t.closest('[data-awe-open]')) { if (launchInput.value.trim()) { const v = launchInput.value; launchInput.value = ''; say(v); } else { openPanel(); panel.querySelector('.awe-foot input').focus(); } return; }
  const hl = t.closest('a[hreflang]'); if (hl && DICT[hl.getAttribute('hreflang')]) { LANG = hl.getAttribute('hreflang'); T = DICT[LANG]; paint(); }
});
document.addEventListener('focusin', (e) => { if (e.target.closest && e.target.closest('[data-awe-form]')) boot().catch(() => {}); });   // warm the agent as soon as someone starts typing
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (st.open) closePanel(); else { openPanel(); panel.querySelector('.awe-foot input').focus(); } }
  if (e.key === 'Escape' && st.open) closePanel();
});
document.addEventListener('input', (e) => {
  const box = document.getElementById('n5');
  if (!box || !e.target || e.target.type !== 'range' || !box.contains(e.target)) return;
  clearTimeout(st._ev);
  st._ev = setTimeout(() => {
    const vals = [...box.querySelectorAll('input[type=range]')].map((r) => +r.value);
    const total = vals.reduce((a, b) => a + b, 0);
    st.evTouched = true; st.dismissed = false; st.facts.score = { v: total }; renderFacts();
    setNudge(T.scored(total), T.msgScore(total, vals)); launch.classList.add('wide'); setTimeout(() => launch.classList.remove('wide'), 4000);
  }, 600);
});
window.addEventListener('scroll', syncLaunch, { passive: true });
/* reading comes first: the bar tucks away while the visitor scrolls down and comes back when they pause or scroll up */
let lastY = window.scrollY, tuckT = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY, down = y > lastY + 6, up = y < lastY - 6;
  if (down || up) lastY = y;
  const busy = st.open || st.unread || launch.contains(document.activeElement);
  if (down && y > 240 && !busy) launch.classList.add('tuck');
  if (up || busy) launch.classList.remove('tuck');
  clearTimeout(tuckT); tuckT = setTimeout(() => launch.classList.remove('tuck'), 900);
}, { passive: true });
window.addEventListener('resize', syncLaunch);
paint();
[800, 2000].forEach((ms) => setTimeout(() => { st.section = ''; syncLaunch(); }, ms));   // re-read once the article has laid out
} catch (err) { console.warn('[awe] layer failed', err); }
