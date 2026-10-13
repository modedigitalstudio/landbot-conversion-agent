/* Landbot Conversion Agent · Black Friday chatbot post (10 AI agents) · built 2026-10-11 */
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
   Agentic Web Experience · lb-awe: bf-chatbot
   Blog 1 "Black Friday Chatbot Ideas: 10 AI Agents…" (EN /blog/black-friday-chatbot; ES/PT reuse it if they ship).
   It opens in the post's language and then follows the language the visitor writes in.
   Back: the real bot "BF Chatbot Conversion Agent 10-11" (208f4e1a…, channel 3529085,
   AI agent 4d23d752…, brand Landbot Sales) run headless via Landbot.Core.
   Front adapted from the BF customer service build (awe-bfcs-script.html): the advise card is
   "Your Black Friday shortlist" (2–3 of the article's 10 agents, each with Try it live + Copy the prompt).
--------------------------------------------------------------------------- */
try {
if (window.__aweBfchat) throw new Error('loaded twice'); window.__aweBfchat = 1;
const CONFIG_URL = 'https://storage.googleapis.com/landbot.pro/v3/H-3529085-YMJE1IZX3WAT33JB/index.json';
const SDK_URL = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
/* Sales Entry Points convention: {surface}-{location}[-{section}]-{intent}; one id for the three language URLs (language never goes in the id; page_lang carries it) */
const ENTRY = { source: 'web', sales: 'web-blog-black-friday-chatbot-sticky-sales', signup: 'web-blog-black-friday-chatbot-sticky-signup' };
const CAMPAIGN = 'bf_chatbot';
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
const sent = {};
function emit(name, id, extra) {
  const key = name + ':' + id + ':' + JSON.stringify(extra || ''); if (sent[key]) return; sent[key] = 1;
  const p = Object.assign({ entry_point_id: id, entry_point_type: 'sticky / flotante', page_path: location.pathname, page_lang: PAGE_LANG0 }, extra || {});
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); } catch (_) {}
  try { if (typeof window.gtag === 'function') window.gtag('event', name, p); } catch (_) {}
}
const SIGNUP = `https://app.landbot.io/sign-up/?utm_medium=conversion_agent&utm_campaign=${CAMPAIGN}&utm_content=${ENTRY.signup}`;
const TEMPLATES = 'https://landbot.io/ai-agent-templates';
/* the agent cites these names; ids are the article's anchors */
const SECTIONS = [
  ['tldr', /tl;?dr/i, { en: 'TL;DR', es: 'TL;DR', pt: 'TL;DR' }],
  ['takeaways', /key takeaways/i, { en: 'Key Takeaways', es: 'Puntos clave', pt: 'Pontos-chave' }],
  ['why', /why agents/i, { en: 'Why agents, not just discounts', es: 'Por qué agentes', pt: 'Por que agentes' }],
  ['before', /before the peak/i, { en: 'Before the peak', es: 'Antes del pico', pt: 'Antes do pico' }],
  ['during', /during black week/i, { en: 'During Black Week', es: 'Durante la Black Week', pt: 'Durante a Black Week' }],
  ['after', /after the peak/i, { en: 'After the peak', es: 'Después del pico', pt: 'Depois do pico' }],
  ...[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => ['agent-' + n, new RegExp('agent[e]?\\s*' + n + '\\b', 'i'), { en: 'Agent ' + n, es: 'Agente ' + n, pt: 'Agente ' + n }]),
  ['launch', /how to launch|launch/i, { en: 'How to launch in time', es: 'Cómo lanzarlos a tiempo', pt: 'Como lançar a tempo' }],
  ['practices', /best practices/i, { en: 'Best practices', es: 'Buenas prácticas', pt: 'Boas práticas' }],
  ['faq', /\bfaqs?\b/i, { en: 'FAQ', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes' }]
];
/* the article's 10 agents: number → demo (BF-xx on landbot.pro), phase, titles, the page's own build prompt */
const AGENTS = {
  1: { demo: 'BF-05', ph: 0, url: 'https://landbot.pro/v3/H-3527919-D0DOZQLJGEVYVYXY/index.html', t: { en: 'Early access and VIP list', es: 'Acceso anticipado y lista VIP', pt: 'Acesso antecipado e lista VIP' },
    p: 'Build a Black Friday early-access agent for my store. Ask visitors what they are shopping for (2–4 interest options), then offer to join the VIP list on WhatsApp or email with an explicit consent checkbox. Tell them early access opens 24 hours before the sale. Handle "Not now" politely and answer "When does early access start?". Save interests, channel and consent to my CRM.' },
  2: { demo: 'BF-06', ph: 0, url: 'https://landbot.pro/v3/H-3527907-0PKO43MBFVPEM3KD/index.html', t: { en: 'Click-to-WhatsApp ad', es: 'Anuncio Click-to-WhatsApp', pt: 'Anúncio Click-to-WhatsApp' },
    p: 'Build a Click-to-WhatsApp ad agent for my Black Friday campaign. When someone taps the ad, greet them with the offer from the ad, run any required age check, ask one question to narrow down the product, recommend the right option with an optional gift add-on, show the total and send a checkout link with the offer applied. Answer "What is on offer?" from my promotion rules.' },
  3: { demo: 'BF-01', ph: 1, url: 'https://landbot.pro/v3/H-3527911-JY0SYNFG5MJGCRV6/index.html', t: { en: 'Deal and gift finder', es: 'Buscador de ofertas y regalos', pt: 'Buscador de ofertas e presentes' },
    p: 'Build a Black Friday deal and gift finder for my website. Ask who the gift is for, the budget (3 ranges) and one line about the person. Recommend three products that are on sale, each with a one-sentence reason it fits and a link to the product page. If none fit, offer to adjust the budget or show other categories.' },
  4: { demo: 'BF-08', ph: 1, url: 'https://landbot.pro/v3/H-3527935-H5IF2CWV80638OO8/index.html', t: { en: 'Size and stock checker', es: 'Tallas y stock', pt: 'Tamanhos e estoque' },
    p: 'Build a size and stock checker for my Black Friday catalog. Ask which product and the shopper\'s usual size and fit preference, recommend a size from my size chart (e.g. "runs small: take one size up"), confirm stock and the Black Week price, and add to bag. If the size is sold out, suggest the closest available size or offer a restock alert by WhatsApp or email.' },
  5: { demo: 'BF-09', ph: 1, url: 'https://landbot.pro/v3/H-3527913-27PR40ZRJPQ39JUP/index.html', t: { en: 'Promo and discount code FAQ', es: 'Dudas de códigos y promos', pt: 'Dúvidas de cupons e promoções' },
    p: 'Build a promo code helper for Black Week. When a shopper says their code does not work, check the code against my promotion rules and their cart, explain why it fails (excluded category, minimum spend, expired, does not exist), show how much a valid code saves and recommend the best code for the cart. Never invent codes or prices; hand off to a person if unsure.' },
  6: { demo: 'BF-02', ph: 1, url: 'https://landbot.pro/v3/H-3527903-YFWJCB0XVOFP7FXD/index.html', t: { en: 'Abandoned cart recovery', es: 'Recuperación de carritos', pt: 'Recuperação de carrinhos' },
    p: 'Build a Black Week cart recovery agent. Show the abandoned product with its original and Black Week price and when the offer ends. Ask what stopped the purchase (size, shipping, payment, price) and answer it from my policies. Offer one tap to complete the order, a reminder if they choose "Not now", and answer "Will it drop further on Cyber Monday?" honestly.' },
  7: { demo: 'BF-07', ph: 1, url: 'https://landbot.pro/v3/H-3527909-YQIE137EVH6J59SY/index.html', t: { en: 'Post-purchase upsell', es: 'Venta cruzada tras la compra', pt: 'Venda adicional pós-compra' },
    p: 'Build a post-purchase upsell agent that runs right after checkout. Confirm the order, suggest one add-on that fits what was just bought at the Black Week price, explain why it fits if asked ("Why this?"), and add it to the same shipment in one tap. Accept "No thanks" without pushing again.' },
  8: { demo: 'BF-03', ph: 2, url: 'https://landbot.pro/v3/H-3527890-JET9HLDWG19YW3VU/index.html', t: { en: '“Where is my order?”', es: '«¿Dónde está mi pedido?»', pt: '“Cadê meu pedido?”' },
    p: 'Build a "Where is my order?" agent for the post-Black Friday period. Ask for the order number and email, show a status timeline (ordered, shipped, out for delivery, delivered) with the estimated date, explain delays beyond the promised window and open a case for my team if needed, let the shopper change the delivery address before dispatch, and answer free-text questions.' },
  9: { demo: 'BF-04', ph: 2, url: 'https://landbot.pro/v3/H-3527901-4M4KXQ63E4TRBSCH/index.html', t: { en: 'Returns and exchanges', es: 'Devoluciones y cambios', pt: 'Trocas e devoluções' },
    p: 'Build a holiday returns and exchanges agent. Ask for the order and item, check it is inside the extended holiday return window, ask why it is going back, offer an exchange first (e.g. a different size), accept a photo for damaged items, generate the return label, and route final-sale items to a person.' },
  10: { demo: 'BF-10', ph: 0, url: 'https://landbot.pro/v3/H-3527915-YARR8Y1RW5SL31NR/index.html', t: { en: 'Corporate gifting quote', es: 'Presupuesto de regalos corporativos', pt: 'Orçamento de presentes corporativos' },
    p: 'Build a corporate gifting quote agent for Black Week. Ask for the gift box type, quantity, whether to add the company logo and the delivery date. Calculate the total with the Black Week business price, require a work email (reject free email domains), answer delivery-before-Christmas questions and send qualified quotes to my sales team.' }
};
/* bottleneck words → the agent the article points to */
const NEED_AGENT = { wismo: 8, returns: 9, promo: 5, sizes: 4, carts: 6, gifts: 3, ads: 2, vip: 1, upsell: 7, b2b: 10 };
const DICT = {
  en: { rec: 'You’re reading <b>10 AI agents for Black Friday</b>. Tell me what hurt most last November (lost sales or support load) and I’ll pick <b>the two or three to launch first</b>, each with a live demo to try.',
    back: 'Welcome back. ', phPanel: 'Ask a follow-up', reading: 'Reading', theArticle: 'the ten agents', online: 'Online · answers only from this post', working: 'Working on it', oops: 'Something went wrong reaching the agent. Try again in a moment.',
    facts: 'What I’ve understood', edit: 'tap to correct', nba: 'What makes most sense now', why: 'Why', or: 'or',
    build: 'Start building free →', team: 'Talk to the team', plan: 'Pick my agents',
    whyPlan: 'Two answers and I’ll cut the ten down to the two or three that fix your biggest bottleneck, with a demo of each.',
    whyBuild: 'Start with the first agent on your list: the closest template plus the prompt from its demo, live in days and tested with last year’s questions before the sale.',
    whyTeamVol: (v) => `At ${v} a month in November, our team can build and run your Black Friday agents with you before the peak.`,
    whyTeamMany: 'Three agents and little time before November: our team can build and run them with you before the peak.',
    planH: 'Your Black Friday shortlist', planSub: 'Launch these first · try each one live', tryIt: 'Try it live', copyP: 'Copy the prompt', copied: 'Prompt copied ✓',
    phases: ['Before the peak', 'During Black Week', 'After the peak'], pickedFor: 'For', afterDemo: (t) => `How did ${t} feel? I can tell you what to change for your store, or you can start from its prompt now.`,
    reasons: { wismo: 'Order status', returns: 'Returns', promo: 'Promo codes', sizes: 'Sizes and stock', carts: 'Abandoned carts', gifts: 'Gift shoppers', ads: 'Ad traffic', vip: 'Early access', upsell: 'Upsell', b2b: 'Corporate gifts' },
    mail: 'Where should the plan go?', mailSub: 'The team replies within one business day, with everything you told me already on the table.', mailPh: 'you@company.com', sendIt: 'Send', mailBad: 'That doesn’t look like an email yet.',
    done: 'Done. Here’s what changed', r1: 'Lead saved in Landbot', r1s: 'Inbox · BF Chatbot Conversion Agent', r2: 'Context attached to the lead', r3: 'Follow-up promised', r3s: 'within one business day · Landbot team',
    foot: 'Answers only from this post and landbot.io · demo prices are from invented shops · Landbot builds AI agents for ecommerce.',
    fromArticle: 'ARTICLE', pointLabel: 'Landbot AI is reading this',
    msgPlan: 'Pick the 2–3 Black Friday agents I should launch first.', msgTeam: 'I’d like to talk to the team.', msgCorr: (k, v) => `Quick correction: ${k} is ${v}.`,
    msgAgent: (n, t) => `How would agent ${n} (${t}) work for my store, and what do I need to launch it?`,
    nudgeAgent: (n, t) => `How would ${t} work for me? · agent ${n}`,
    nudge: { tldr: ['Pick my 2–3 agents · 2 questions', 'Pick the 2–3 Black Friday agents I should launch first.'], why: ['Which agent pays off first for me?', 'Which of these agents would pay off first for my store, and why?'],
      before: ['Build my VIP list before the sale', 'How do I start an early-access list on WhatsApp before Black Friday?'], during: ['Which one saves the most sales?', 'During Black Week, which agent would save me the most sales?'],
      after: ['Cut my December tickets', 'Which agents cut order-status and returns tickets after Black Friday?'], launch: ['Can I launch in time? · plan it with me', 'Plan my launch: what can I have live before my Black Friday sale?'],
      practices: ['Write my promo rules with me', 'Help me write my Black Friday promotion rules in one place: products, codes, dates and exclusions.'], faq: ['Ask anything about these agents', 'Which agent should I launch first?'] },
    k: { picks: 'Shortlist', reasons: 'Bottleneck', chan: 'Channels', vol: 'November volume', from: 'Came from', why: 'Why here' }, teamSees: 'What the team will see', direct: 'direct', perMo: ' /mo', oneMore: 'Yes, one more question',
    calLoading: 'Loading the calendar…', bookH: 'Book 30 min with the Landbot team', bookSub: 'Pick a slot that suits you. They’ll have this conversation on hand, so no starting from zero.', bookGo: 'Choose a time →', booked: 'I’ve booked a time', mailInstead: 'Email me instead', bookedMsg: 'Great, see you there. The team will have this conversation on hand.', supH: 'This one’s for our support team', supSub: 'They can look at your account and sort it fastest. The help center has guides and a way to reach them.', supGo: 'Open the help center →', backArt: 'Back to the article' },
  es: { rec: 'Estás leyendo <b>10 agentes de IA para Black Friday</b>. Cuéntame qué te dolió más el noviembre pasado (ventas perdidas o carga de soporte) y te elijo <b>los dos o tres que lanzar primero</b>, cada uno con una demo en vivo.',
    back: 'Hola de nuevo. ', phPanel: 'Haz otra pregunta', reading: 'Leyendo', theArticle: 'los diez agentes', online: 'En línea · responde solo con este artículo', working: 'Trabajando en ello', oops: 'Algo ha fallado al contactar con el agente. Prueba de nuevo en un momento.',
    facts: 'Lo que he entendido', edit: 'toca para corregir', nba: 'Lo que tiene más sentido ahora', why: 'Por qué', or: 'o',
    build: 'Empezar gratis →', team: 'Hablar con el equipo', plan: 'Elegir mis agentes',
    whyPlan: 'Con dos respuestas reduzco los diez a los dos o tres que arreglan tu mayor cuello de botella, con la demo de cada uno.',
    whyBuild: 'Empieza por el primero de tu lista: la plantilla más parecida y el prompt de su demo, en marcha en días y probado con las preguntas del año pasado.',
    whyTeamVol: (v) => `Con ${v} al mes en noviembre, nuestro equipo puede montar y gestionar tus agentes de Black Friday contigo antes del pico.`,
    whyTeamMany: 'Tres agentes y poco tiempo antes de noviembre: nuestro equipo puede montarlos y gestionarlos contigo antes del pico.',
    planH: 'Tu shortlist para Black Friday', planSub: 'Lanza estos primero · prueba cada uno en vivo', tryIt: 'Probar en vivo', copyP: 'Copiar el prompt', copied: 'Prompt copiado ✓',
    phases: ['Antes del pico', 'Durante la Black Week', 'Después del pico'], pickedFor: 'Para', afterDemo: (t) => `¿Qué tal ${t}? Te digo qué cambiar para tu tienda, o puedes empezar ya desde su prompt.`,
    reasons: { wismo: 'Estado del pedido', returns: 'Devoluciones', promo: 'Códigos promo', sizes: 'Tallas y stock', carts: 'Carritos abandonados', gifts: 'Compras de regalo', ads: 'Tráfico de anuncios', vip: 'Acceso anticipado', upsell: 'Venta cruzada', b2b: 'Regalos de empresa' },
    mail: '¿A dónde te envío el plan?', mailSub: 'El equipo responde en un día laborable, con todo lo que me has contado ya sobre la mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Eso todavía no parece un email.',
    done: 'Hecho. Esto es lo que ha cambiado', r1: 'Lead guardado en Landbot', r1s: 'Inbox · BF Chatbot Conversion Agent', r2: 'Contexto adjunto al lead', r3: 'Seguimiento prometido', r3s: 'en un día laborable · equipo de Landbot',
    foot: 'Respuestas solo con este artículo y landbot.io · los precios de las demos son de tiendas inventadas · Landbot crea agentes de IA para ecommerce.',
    fromArticle: 'ARTÍCULO', pointLabel: 'Landbot AI está leyendo esto',
    msgPlan: 'Elígeme los 2 o 3 agentes de Black Friday que debería lanzar primero.', msgTeam: 'Quiero hablar con el equipo.', msgCorr: (k, v) => `Corrijo: ${k} es ${v}.`,
    msgAgent: (n, t) => `¿Cómo funcionaría el agente ${n} (${t}) en mi tienda y qué necesito para lanzarlo?`,
    nudgeAgent: (n, t) => `¿Cómo me funcionaría ${t}? · agente ${n}`,
    nudge: { tldr: ['Elige mis 2–3 agentes · 2 preguntas', 'Elígeme los 2 o 3 agentes de Black Friday que debería lanzar primero.'], why: ['¿Qué agente me compensa antes?', '¿Cuál de estos agentes compensaría antes en mi tienda y por qué?'],
      before: ['Monta mi lista VIP antes de la campaña', '¿Cómo empiezo una lista de acceso anticipado en WhatsApp antes del Black Friday?'], during: ['¿Cuál salva más ventas?', 'Durante la Black Week, ¿qué agente me salvaría más ventas?'],
      after: ['Reduce mis tickets de diciembre', '¿Qué agentes reducen los tickets de estado del pedido y devoluciones después del Black Friday?'], launch: ['¿Llego a tiempo? · lo planeamos', 'Planifica mi lanzamiento: ¿qué puedo tener en marcha antes de mi campaña de Black Friday?'],
      practices: ['Escribe conmigo las reglas de la promo', 'Ayúdame a escribir en un solo sitio las reglas de mi promoción de Black Friday: productos, códigos, fechas y exclusiones.'], faq: ['Pregunta lo que quieras de estos agentes', '¿Qué agente debería lanzar primero?'] },
    k: { picks: 'Shortlist', reasons: 'Cuello de botella', chan: 'Canales', vol: 'Volumen en noviembre', from: 'Vino de', why: 'Por qué vino' }, teamSees: 'Lo que verá el equipo', direct: 'directo', perMo: ' /mes', oneMore: 'Sí, una pregunta más',
    calLoading: 'Cargando el calendario…', bookH: 'Reserva 30 min con el equipo de Landbot', bookSub: 'Elige el hueco que mejor te venga. Tendrán esta conversación a mano, así que no empiezas de cero.', bookGo: 'Elegir hora →', booked: 'Ya he reservado', mailInstead: 'Prefiero que me escribáis', bookedMsg: 'Genial, nos vemos ahí. El equipo tendrá esta conversación a mano.', supH: 'Esto es cosa de nuestro equipo de soporte', supSub: 'Pueden mirar tu cuenta y resolverlo antes. En el centro de ayuda tienes guías y cómo contactarles.', supGo: 'Abrir el centro de ayuda →', backArt: 'Volver al artículo' },
  pt: { rec: 'Você está lendo <b>10 agentes de IA para a Black Friday</b>. Me conta o que mais doeu no último novembro (vendas perdidas ou carga de atendimento) e eu escolho <b>os dois ou três para lançar primeiro</b>, cada um com uma demo ao vivo.',
    back: 'Que bom te ver de novo. ', phPanel: 'Faça outra pergunta', reading: 'Lendo', theArticle: 'os dez agentes', online: 'Online · responde só com este artigo', working: 'Trabalhando nisso', oops: 'Algo deu errado ao falar com o agente. Tente de novo em um instante.',
    facts: 'O que eu entendi', edit: 'toque para corrigir', nba: 'O que faz mais sentido agora', why: 'Por quê', or: 'ou',
    build: 'Começar grátis →', team: 'Falar com a equipe', plan: 'Escolher meus agentes',
    whyPlan: 'Com duas respostas eu reduzo os dez aos dois ou três que resolvem o seu maior gargalo, com a demo de cada um.',
    whyBuild: 'Comece pelo primeiro da sua lista: o template mais parecido e o prompt da demo, no ar em dias e testado com as perguntas do ano passado.',
    whyTeamVol: (v) => `Com ${v} por mês em novembro, a nossa equipe pode montar e operar seus agentes de Black Friday com você antes do pico.`,
    whyTeamMany: 'Três agentes e pouco tempo antes de novembro: a nossa equipe pode montar e operar com você antes do pico.',
    planH: 'Sua shortlist para a Black Friday', planSub: 'Lance estes primeiro · teste cada um ao vivo', tryIt: 'Testar ao vivo', copyP: 'Copiar o prompt', copied: 'Prompt copiado ✓',
    phases: ['Antes do pico', 'Durante a Black Week', 'Depois do pico'], pickedFor: 'Para', afterDemo: (t) => `E aí, o que achou de ${t}? Eu digo o que mudar para a sua loja, ou você já pode começar pelo prompt dele.`,
    reasons: { wismo: 'Status do pedido', returns: 'Trocas', promo: 'Cupons', sizes: 'Tamanhos e estoque', carts: 'Carrinhos abandonados', gifts: 'Compras de presente', ads: 'Tráfego de anúncios', vip: 'Acesso antecipado', upsell: 'Venda adicional', b2b: 'Presentes corporativos' },
    mail: 'Para onde envio o plano?', mailSub: 'A equipe responde em um dia útil, com tudo o que você me contou já em cima da mesa.', mailPh: 'voce@empresa.com', sendIt: 'Enviar', mailBad: 'Isso ainda não parece um e-mail.',
    done: 'Pronto. Isto foi o que mudou', r1: 'Lead salvo em Landbot', r1s: 'Inbox · BF Chatbot Conversion Agent', r2: 'Contexto anexado ao lead', r3: 'Retorno prometido', r3s: 'em um dia útil · equipe de Landbot',
    foot: 'Respostas só com este artigo e landbot.io · os preços das demos são de lojas inventadas · Landbot cria agentes de IA para e-commerce.',
    fromArticle: 'ARTIGO', pointLabel: 'A Landbot AI está lendo isto',
    msgPlan: 'Escolha os 2 ou 3 agentes de Black Friday que eu deveria lançar primeiro.', msgTeam: 'Quero falar com a equipe.', msgCorr: (k, v) => `Correção: ${k} é ${v}.`,
    msgAgent: (n, t) => `Como o agente ${n} (${t}) funcionaria na minha loja e do que eu preciso para lançar?`,
    nudgeAgent: (n, t) => `Como ${t} funcionaria para mim? · agente ${n}`,
    nudge: { tldr: ['Escolha meus 2–3 agentes · 2 perguntas', 'Escolha os 2 ou 3 agentes de Black Friday que eu deveria lançar primeiro.'], why: ['Qual agente se paga primeiro?', 'Qual destes agentes daria retorno primeiro na minha loja, e por quê?'],
      before: ['Monte minha lista VIP antes da campanha', 'Como eu começo uma lista de acesso antecipado no WhatsApp antes da Black Friday?'], during: ['Qual salva mais vendas?', 'Durante a Black Week, qual agente salvaria mais vendas?'],
      after: ['Reduza meus chamados de dezembro', 'Quais agentes reduzem os chamados de status do pedido e trocas depois da Black Friday?'], launch: ['Dá tempo de lançar? · planejamos juntos', 'Planeje meu lançamento: o que consigo ter no ar antes da minha campanha de Black Friday?'],
      practices: ['Escreva comigo as regras da promoção', 'Me ajude a escrever em um só lugar as regras da minha promoção de Black Friday: produtos, cupons, datas e exclusões.'], faq: ['Pergunte o que quiser sobre estes agentes', 'Qual agente eu deveria lançar primeiro?'] },
    k: { picks: 'Shortlist', reasons: 'Gargalo', chan: 'Canais', vol: 'Volume em novembro', from: 'Veio de', why: 'Por que veio' }, teamSees: 'O que a equipe vai ver', direct: 'direto', perMo: ' /mês', oneMore: 'Sim, mais uma pergunta',
    calLoading: 'Carregando o calendário…', bookH: 'Agende 30 min com a equipe de Landbot', bookSub: 'Escolha o horário que for melhor. Eles vão ter esta conversa à mão, então você não começa do zero.', bookGo: 'Escolher horário →', booked: 'Já agendei', mailInstead: 'Prefiro receber um e-mail', bookedMsg: 'Ótimo, até lá. A equipe vai ter esta conversa à mão.', supH: 'Isto é com a nossa equipe de suporte', supSub: 'Eles podem olhar a sua conta e resolver mais rápido. A central de ajuda tem guias e como falar com eles.', supGo: 'Abrir a central de ajuda →', backArt: 'Voltar ao artigo' }
};
const BOOK_URL = 'https://calendly.com/landbot-sales/meeting-landbot-expert', HELP_URL = 'https://help.landbot.io/';
/* the post's language: the active switch (aria-current), then <html lang>; ?lang= overrides for previews */
function pageLang() {
  const q = new URLSearchParams(location.search).get('lang'); if (q && DICT[q.slice(0, 2)]) return q.slice(0, 2);
  const path = (location.pathname.match(/^\/(es|pt)(-br)?\//i) || [])[1]; if (path) return path.toLowerCase();
  const on = document.querySelector('a[hreflang][aria-current]');
  const l = ((on && on.getAttribute('hreflang')) || document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  return DICT[l] ? l : 'en';
}
let LANG = pageLang();
let T = DICT[LANG];
/* ---------- country and fit level (landbot-icp tiers) ---------- */
const TIER_A = 'GB NL US ES MX IT SG ZA PL BR DE FR CO CL'.split(' ');
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
const PAGE_LANG0 = LANG;
const ctxAdd = () => { const a = [`page language ${PAGE_LANG0}`, `chat language ${LANG}`]; if (GEO.cc) a.push(`country ${countryName(GEO.cc, 'en')} (inferred from ${GEO.how}) · geo ${GEO.tier}`); return a.join(' · '); };

const MOBILE = matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 768;
if (MOBILE) {
  const M = { en: ['Create my account now →', 'Create the free account now from your phone (1 min, no card) and build it later on your computer, where the builder works best.'],
    es: ['Crear mi cuenta ahora →', 'Crea la cuenta gratis ahora desde el móvil (1 min, sin tarjeta) y móntalo luego en el ordenador, donde el builder funciona mejor.'],
    pt: ['Criar minha conta agora →', 'Crie a conta grátis agora pelo celular (1 min, sem cartão) e monte depois no computador, onde o builder funciona melhor.'] };
  for (const [l, [b, w]] of Object.entries(M)) if (DICT[l]) { DICT[l].build = b; DICT[l].whyBuild = w; }
}
/* the UI follows the language the visitor WRITES in. No words shared with English counted as pt/es; "com" is out (domains). */
const LANG_CUES = {
  es: [/[¿¡ñ]/, /\b(hola|gracias|qué|cuánto|cuanto|cómo|quiero|tengo|necesito|precio|cuesta|puedo|mis|nuestro|empresa|mensajes|usted|vale|una|unos|por|las|los|del|pero|hay|muy|soy|somos|hablar|ventas|cliente|clientes|ya|funciona|también|dónde|cuándo|y|el|la|es|todavía|aún|al|nos|unas|mes|queremos|para|lo|se|tenemos|hacer|pedido|pedidos|tienda|devoluciones|equipo|soporte)\b/gi],
  pt: [/[ãõç]/, /\b(olá|ola|obrigad[oa]|não|você|voce|quanto|custa|quero|tenho|preciso|preço|meu|minha|nossa|empresa|mensagens|isso|está|uma|pelo|das|dos|muito|tem|eu|sou|somos|falar|vendas|já|funciona|também|onde|quando|os|é|em|pedido|pedidos|loja|trocas|equipe|atendimento|chamados|cadê)\b/gi],
  en: [/(?!)/, /\b(hello|hi|thanks|what|how|much|will|does|the|my|our|we|need|want|cost|price|company|messages|can|is|i|with|to|and|for|it|you|this|do|are|talk|sales|already|customer|working|of|in|yet|order|orders|store|returns|team|support|tickets)\b/gi],
};
function detectLang(q) {
  q = q.replace(/\S+@\S+|https?:\/\/\S+|\b[\w-]+\.(com|io|net|org|es|br)\b/gi, ' ');
  if ((q.match(/\p{L}/gu) || []).length < 3) return null;
  const score = {};
  for (const [l, [strong, words]] of Object.entries(LANG_CUES)) score[l] = (strong.test(q) ? 2 : 0) + (q.match(words) || []).length;
  const [best, second] = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const short = q.trim().split(/\s+/).length <= 2;
  return best[1] > second[1] && (best[1] >= 2 || short) ? best[0] : null;
}
function followLang(q) { const l = detectLang(q); if (l && l !== LANG && DICT[l]) { LANG = l; T = DICT[LANG]; paint(); } }
const fmt = (n) => Math.round(n).toLocaleString(LANG === 'en' ? 'en-US' : LANG === 'pt' ? 'pt-BR' : 'es-ES');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let visits = 0;
try { visits = +(localStorage.getItem('awe-bfchat-visits') || 0); localStorage.setItem('awe-bfchat-visits', String(visits + 1)); } catch (_) {}
const st = { core: null, boot: null, facts: {}, awaiting: null, answers: 0, nbaKey: '', open: false, t0: Date.now(), teamDone: false, section: 'tldr', cited: new Set(), picks: null };
const J = () => (window.lbJourney && window.lbJourney.describe && window.lbJourney.describe()) || null;
try { const d = J(); if (d && d.from) st.facts.from = { v: d.from === 'direct' ? T.direct : d.from, guess: true }; } catch (_) {}

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
    cfg.customData = Object.assign({}, cfg.customData, { source: ENTRY.source, subsource: ENTRY.sales });
    const core = new LB.Core(cfg);
    st.core = core; st.real = true;
    let greetRes; const greeted = new Promise((r) => (greetRes = r)); st._greet = greetRes;
    core.pipelines.$readableSequence.subscribe((m) => { try { onMsg(m); } catch (e) { console.warn('[awe]', e); } });
    await core.init(cfg);
    await Promise.race([greeted, sleep(8000)]);
  })();
  return st.boot;
}
function withData(m) { const d = st.nextData; st.nextData = null; if (d) m.custom_data = d; return m; }
const calRefs = (d) => { const p = (d && d.payload) || {}; return { calendly_invitee: (p.invitee && p.invitee.uri) || '', calendly_event: (p.event && p.event.uri) || '' }; };
async function deliver(text, payload) {
  await boot();
  const btn = payload && st.greetBtns && st.greetBtns.find((b) => b.payload === payload);
  /* a fixed button reaches the agent with the visitor's own label, so the agent keeps the visitor's language */
  return st.core.sendMessage(withData(payload ? { type: 'button', message: text || (btn ? btn.text : ''), payload } : { type: 'text', message: text }));
}

/* ---------- UI: lava orb bar, layer ---------- */
const STARTERS = { en: ['Pick my 2–3 agents', 'Which one pays off first?', 'Can I launch in time?'], es: ['Elegir mis 2–3 agentes', '¿Cuál compensa antes?', '¿Llego a tiempo?'], pt: ['Escolher meus 2–3 agentes', 'Qual se paga primeiro?', 'Dá tempo de lançar?'] };
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
function setUnread(n) {
  st.unread = n; badge.textContent = n > 9 ? '9+' : String(n || ''); badge.classList.toggle('on', n > 0);
  if (n > 0) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  launch.querySelector('[data-awe-open]').setAttribute('aria-label', n > 0 ? `Landbot AI · ${n} new` : 'Landbot AI');
}
function paint() {
  launch.querySelector('[data-awe-starters]').innerHTML = starterChips();
  panel.querySelector('.awe-foot input').placeholder = T.phPanel;
  panel.querySelectorAll('[data-t]').forEach((n) => { n.textContent = T[n.dataset.t]; });
  if (!panel.querySelector('.awe-status').classList.contains('work')) panel.querySelector('.awe-status').textContent = T.online;
  if (st.reasonKeys) st.facts.reasons = { v: st.reasonKeys.map((k) => T.reasons[k]).join(', ') };
  if (st.facts.vol) st.facts.vol = { v: st.facts.vol.v };
  if (st.facts.from && st.facts.from.guess) { const d = J(); if (d && d.from === 'direct') st.facts.from = { v: T.direct, guess: true }; }
  st.section = ''; syncLaunch(); renderFacts();
  if (planEl && planEl.isConnected) planCard();
}
const thread = panel.querySelector('.awe-thread'), statusEl = panel.querySelector('.awe-status'), headOrb = panel.querySelector('.awe-head .awe-lava');
const repliesEl = panel.querySelector('[data-awe-replies]');
const push = (el) => { thread.appendChild(el); requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; }); return el; };
function openPanel() {
  emit('entry_point_click', ENTRY.sales);
  if (st.unread) setUnread(0);
  if (!st.open) { st.open = true; panel.classList.add('on'); scrim.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); syncLaunch(); }
  if (!thread.children.length) {
    const d = J();
    const ctx = d && d.from && d.from !== 'direct' ? `<div class="awe-src"><button type="button" data-awe-fact="from"><em>${esc(T.k.from)}</em>${esc(d.from)}${d.before.length ? ' · ' + esc(d.before[d.before.length - 1].split(' ')[0]) : ''}</button></div>` : '';
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
const secLabel = (id) => { const s = SECTIONS.find((x) => x[0] === id); return s ? '“' + (s[2][LANG] || s[2].en) + '”' : T.theArticle; };
function guessSection(q) {
  const n = (q.match(/agent[ea]?\s*(\d{1,2})\b/i) || [])[1]; if (n && AGENTS[+n]) return secLabel('agent-' + n);
  if (/pick|elig|escolh|shortlist|first|primero|primeiro|pays? off|compensa|retorno/i.test(q)) return T.theArticle;
  if (/launch|lanz|lan[cç]|in time|a tiempo|a tempo|novemb|noviemb/i.test(q)) return secLabel('launch');
  if (/promo|code|código|cupom|cupon|rules|reglas|regras/i.test(q)) return secLabel('agent-5');
  if (/order|pedido|wismo|track|rastreio/i.test(q)) return secLabel('agent-8');
  if (/cart|carrito|carrinho/i.test(q)) return secLabel('agent-6');
  if (/return|devol|troca|exchange|cambio/i.test(q)) return secLabel('agent-9');
  if (/size|talla|tamanho|stock|estoque/i.test(q)) return secLabel('agent-4');
  if (/gift|regalo|presente/i.test(q)) return secLabel('agent-3');
  if (/whatsapp|vip|early|anticipad|antecipad/i.test(q)) return secLabel('before');
  return T.theArticle;
}

/* ---------- sending ---------- */
async function say(text, payload) {
  const q = (text || '').trim(); if (!q) return;
  openPanel(); repliesEl.innerHTML = '';
  thread.querySelectorAll('.awe-nba').forEach((n) => n.remove());
  push(h(`<div class="awe-me">${esc(q)}</div>`));
  if (!payload) followLang(q); readUser(q); setWorking(guessSection(q));
  let out = q;
  if (st.ctxSent && !payload && st.sentLang && st.sentLang !== LANG) out = `[Page context: chat language ${LANG}]\n\n` + q;   // the visitor switched language: tell the agent
  if (!payload) st.sentLang = LANG;
  if (!st.ctxSent && !payload) { st.ctxSent = true; let line = window.lbJourney && window.lbJourney.line ? window.lbJourney.line() : ''; line = line ? line.replace(/\]$/, ' · ' + ctxAdd() + ']') : '[Page context: ' + ctxAdd() + ']'; if (MOBILE) line = line.replace(/\]$/, ' · device mobile]'); out = line + '\n\n' + q; }
  armWatchdog(q);
  try { await deliver(payload ? q : out, payload); }
  catch (e) { setWorking(null); push(h(`<div class="awe-msg"><p>${esc(T.oops)}</p></div>`)); console.warn('[awe]', e); }
}

/* ---------- receiving ---------- */
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
  repliesEl.innerHTML = ''; setWorking(T.theArticle); armWatchdog(q);
  try { await deliver(q); } catch (e) { console.warn('[awe]', e); }
}
function onMsg(m) {
  const ts = m.timestamp ? (m.timestamp > 1e12 ? m.timestamp : m.timestamp * 1000) : Date.now();
  if (ts < st.t0 - 5000) return;
  if (m.author_type === 'user') return;
  const ex = m.extra || {}; const bid = String(ex.id || '').replace(/_\d+$/, '');
  if (!st.greeted && m.type === 'dialog' && !ex.is_ai_agent_message) {   // the flow's greeting: the page draws its own, in the page language
    st.greeted = true; st.greetBtns = (m.buttons || []).map((t, i) => ({ text: t, payload: (m.payloads || [])[i] }));
    if (st._greet) st._greet();
    return;
  }
  clearTimeout(st.wd);
  st.chain = (st.chain || Promise.resolve()).then(async () => {
    const before = thread.children.length;
    await handleMsg(m, ex, bid);
    if (!st.open && thread.children.length > before) setUnread((st.unread || 0) + 1);
  }).then(() => keepFocus()).catch((e) => console.warn('[awe]', e));
}
/* the agent names its shortlist as [[AGENTS:8,6,5]]; the page strips it and draws the card after the bubbles */
const PICKS_RX = /\[\[\s*AGENTS?\s*:\s*([\d\s,]+)\]\]/i;
function setPicks(list) {
  const picks = [...new Set(list.map(Number).filter((n) => AGENTS[n]))].slice(0, 3); if (!picks.length) return;
  st.picks = picks; st.facts.picks = { v: picks.map((n) => n + ' ' + AGENTS[n].t[LANG]).join(' · ') }; renderFacts(); st.planPending = true;
}
function takePicks(text) {
  const mm = String(text).match(PICKS_RX);
  if (!mm) {   // no marker: a reply that recommends 2–3 numbered agents still draws the card, once
    if (st.picks == null) { const ns = [...String(text).matchAll(/\bagent[ea]?\s*(\d{1,2})\b/gi)].map((x) => +x[1]).filter((n) => AGENTS[n]); if (new Set(ns).size >= 2) setPicks(ns); }
    return text;
  }
  setPicks(mm[1].split(/[\s,]+/).filter(Boolean));
  return String(text).replace(PICKS_RX, '').replace(/\n{3,}/g, '\n\n').trim();
}
async function handleMsg(m, ex, bid) {
  setWorking(null);
  let text = takePicks(m.message || m.title || '');
  if (bid === 'team_email') { emailCard(); return; }
  if (bid === 'team_done') { receipts(); return; }
  if (bid === 'sales_book') { bookCard(); return; }
  if (bid === 'sales_booked') { await agentText(T.bookedMsg); return; }
  if (bid === 'support_route') { supportCard(); return; }
  if (bid === 'team_more') { repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.oneMore)}" data-awe-payload="$0">${esc(T.oneMore)}</button>`; return; }
  if (m.type === 'dialog' && (m.buttons || []).length) {
    st.lastBtns = m.buttons;
    const labels = new Set(m.buttons.map((b) => String(b).trim().toLowerCase()));
    const clean = text.split(/\n/).filter((l) => { const raw = l.replace(/^[-•*\s]+/, '').replace(/^["“”']|["“”']$/g, '').trim().toLowerCase(); return !labels.has(raw) && !labels.has(l.replace(/^[-•*\d.)\s]+/, '').trim().toLowerCase()); }).join('\n').trim();
    if (clean) { await agentText(clean); st.answers++; }
    repliesEl.innerHTML = m.buttons.map((b) => `<button type="button" class="awe-chip" data-awe-say="${esc(b)}">${esc(b)}</button>`).join('');
    if (st.planPending && ex.is_ai_agent_message) { st.planPending = false; planCard(); }
    return;
  }
  if (text) { await agentText(text); st.answers++; }
  if (st.planPending && ex.is_ai_agent_message) { st.planPending = false; planCard(); }
  if (text) decide(text);
}
function md(src) {
  src = src.replace(/(?:\[[^\]]*\]\()?(?:[^\n:]{0,40}?→\s*:?\s*)?(https:\/\/app\.landbot\.io\/sign-?up\/?(?:[^\s)]*[^\s).,;:])?)\)?/g, (_, u) => `[${T.build}](${u})`);
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${tagUrl(u.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/(^|[\s(*])(https?:\/\/[^\s<)*]+)/g, (_, pre, u) => { const clean = u.replace(/[.,;:]+$/, ''), tail = u.slice(clean.length); return `${pre}<a href="${tagUrl(clean.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${clean}</a>${tail}`; })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return src.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${inline(l)}</p>`).join('');
}
function splitSources(text) {
  const src = []; const keep = [];
  for (const line of text.split(/\n/)) { const mm = line.replace(/[*_]/g, '').match(/^\s*(sources?|fuentes?|fontes?)\s*:\s*(.+)$/i); if (mm) src.push(mm[2]); else keep.push(line); }
  return { body: keep.join('\n').trim(), src: src.join(' · ') };
}
function sourceChips(s) {
  if (!s) return '';
  const chips = []; const seen = new Set();
  for (const part of s.split(/\s*·\s*/)) for (const [id, re, label] of SECTIONS) if (re.test(part) && !seen.has(id)) { seen.add(id); chips.push(`<button type="button" data-awe-point="${id}"><em>${T.fromArticle}</em>${esc(label[LANG] || label.en)}</button>`); break; }
  return chips.length ? `<div class="awe-src">${chips.join('')}</div>` : '';
}
let actx = null, lastDing = 0;
const unlockAudio = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} };
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, unlockAudio, { passive: true }));
function ding() {
  if (!actx || actx.state !== 'running' || Date.now() - lastDing < 800) return;
  lastDing = Date.now(); const t = actx.currentTime;
  [[880, 0], [1318.5, 0.09]].forEach(([f, dt]) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.12, t + dt + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.35);
    o.connect(g).connect(actx.destination); o.start(t + dt); o.stop(t + dt + 0.4); });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/* a field the agent saves must never reach the visitor, whatever separator it uses; visitor_intent lines start with Ventas/Soporte/Explorando — */
const FIELD_LINE = /^\s*[*_`]*\s*(conversation[_\s]summary|visitor[_\s]journey|visitor[_\s]intent|channels[_\s]wanted|page[_\s]lang|page[_\s]url|chat[_\s]lang|arrival[_\s]reason|urgency|comparing|country[_\s]tier|subsource|source|agents[_\s]shortlist|main[_\s]bottleneck|order[_\s]volume)\s*[*_`]*\s*([:=—–-]|$)|^\s*[*_`]*\s*(ventas|soporte|explorando)\s*[*_`]*\s*[—–-]\s|^\s*\[?page context:|^\s*\[\s*options?\b/i;
async function agentText(text) {
  text = String(text).split(/\n/).filter((l) => !FIELD_LINE.test(l)).join('\n');
  const { body, src } = splitSources(text);
  const parts = [];   // a numbered or bulleted list stays in one bubble, with each item's own explanation line
  const LI = /^([-•*]|\d+[.)])\s/;
  for (const l of body.split(/\n/).map((x) => x.trim()).filter(Boolean)) {
    const prev = parts.length ? parts[parts.length - 1].split('\n') : [];
    if (prev.length && LI.test(l) && prev.some((x) => LI.test(x))) parts[parts.length - 1] += '\n' + l;
    else if (prev.length && !LI.test(l) && LI.test(prev[prev.length - 1]) && !/[?？]\s*$/.test(l)) parts[parts.length - 1] += '\n' + l;
    else parts.push(l);
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && !reduce) { const dots = push(h('<div class="awe-typing" aria-hidden="true"><i></i><i></i><i></i></div>')); await wait(Math.min(1600, 450 + parts[i].length * 14)); dots.remove(); }
    const el = push(h(`<div class="awe-msg">${md(parts[i])}${i === parts.length - 1 ? sourceChips(src) : ''}</div>`));
    if (el.querySelector('a[href*="sign-up"]')) st.signupShown = true;
    if (i === 0) ding();
  }
  readAgent(text);
  for (const part of src.split(/\s*·\s*/)) for (const [id, re] of SECTIONS) if (part && re.test(part) && !st.cited.has(id)) { st.cited.add(id); pointAt(id); return; }
}
function secEl(id) {
  return document.getElementById(id);
}
function pointAt(id) {
  const el = secEl(id); if (!el) return;
  document.querySelectorAll('.awe-point').forEach((n) => n.classList.remove('awe-point'));
  el.dataset.aweLabel = T.pointLabel; el.classList.add('awe-point'); scrim.classList.add('lift');
  if (window.innerWidth > 1180 || !st.open) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  clearTimeout(st._pt); st._pt = setTimeout(() => { el.classList.remove('awe-point'); scrim.classList.remove('lift'); }, 4500);
}

/* ---------- what I've understood (editable) ---------- */
function parseVolume(q) {
  if (!/(ticket|chamad|consult|conversa|chats?|messag|mensaj|pedido|order|month|mes|mês|semana|week|día|dia|day)/i.test(q)) return null;
  const all = [...q.matchAll(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k\b|mil\b|thousand)?/gi)]; if (!all.length) return null;
  let n = Math.max(...all.map((mm) => parseFloat(mm[1].replace(/[\s]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')) * (mm[2] ? 1000 : 1)));
  if (/semana|week/i.test(q)) n *= 4.3; if (/\b(d[ií]a|day|daily|diario|diários?)\b/i.test(q)) n *= 30;
  return n >= 50 ? n : null;
}
const REASON_RX = [[/where[\s-]+is[\s-]+my[\s-]+order|wismo|order status|estado del pedido|d[oó]nde est[aá] mi pedido|status do pedido|cad[eê] meu pedido|rastre|tracking|env[ií]o|entrega|delivery/i, 'wismo'], [/return|devoluci|devolu[cç]|troca|exchange|cambio|refund|reembolso/i, 'returns'],
  [/promo|code|c[oó]digo|cup[oó]n|cupom|discount|descuento|desconto/i, 'promo'], [/size|talla|tamanho|stock|estoque|inventory|sold out|agotad|esgotad/i, 'sizes'], [/cart|carrito|carrinho|checkout|abandon/i, 'carts'],
  [/gift|regalo|presente/i, 'gifts'], [/\bads?\b|anuncio|anúncio|meta ads|instagram ads|click-to/i, 'ads'], [/vip|early access|acceso anticipado|acesso antecipado|waitlist|lista de espera/i, 'vip'], [/upsell|cross-?sell|bundle|venta cruzada|venda adicional/i, 'upsell'], [/corporate|b2b|bulk|empresa[s]? que regalan|corporativ/i, 'b2b']];
const CHAN_RX = [[/whats ?app/i, 'WhatsApp'], [/web|site|sitio|chat en la web|website/i, 'Web'], [/e-?mail|correo/i, 'Email'], [/instagram/i, 'Instagram']];
function readUser(q) {
  const f = st.facts; let changed = false;
  if (st.awaiting === 'why' && q.length > 2) { f.why = { v: q.length > 70 ? q.slice(0, 68) + '…' : q }; changed = true; st.awaiting = null; }
  const keys = REASON_RX.filter(([re]) => re.test(q)).map(([, k]) => k);
  if (keys.length && !/^(pick|elig|escolh)/i.test(q)) { st.reasonKeys = [...new Set([...(st.reasonKeys || []), ...keys])].slice(0, 4); f.reasons = { v: st.reasonKeys.map((k) => T.reasons[k]).join(', ') }; changed = true; }
  const ch = CHAN_RX.filter(([re]) => re.test(q)).map(([, k]) => k);
  if (ch.length && /(answer|atend|respond|soporte|support|canal|channel|usamos|we use|usamos|temos|tenemos)/i.test(q)) { f.chan = { v: [...new Set(ch)].join(', ') }; changed = true; }
  const v = parseVolume(q); if (v) { f.vol = { v }; changed = true; }
  if (changed) { renderFacts(); if (planEl && planEl.isConnected) planCard(); }
}
function readAgent(text) {
  const tail = text.slice(-220);
  st.awaiting = /(what made you|what brought you|what got you|qu[eé] te (ha )?(hecho|llevado|llev[oó]|tra[ií]do|trajo)|o que (te |fez você |te fez |trouxe))/i.test(tail) ? 'why' : null;
}
const FACT_ORDER = ['why', 'picks', 'reasons', 'vol', 'chan', 'from'];
function factVal(k, o) { return k === 'vol' ? fmt(o.v) + T.perMo : o.v; }
function renderFacts() {
  const box = panel.querySelector('.awe-facts'), list = panel.querySelector('.awe-facts-list');
  const keys = FACT_ORDER.filter((k) => st.facts[k]);
  box.classList.toggle('on', keys.some((k) => !st.facts[k].guess));
  list.innerHTML = keys.map((k) => `<button type="button" class="awe-fact${st.facts[k].guess ? ' guess' : ''}" data-awe-fact="${k}"><i>${esc(T.k[k])}</i>${esc(factVal(k, st.facts[k]))}</button>`).join('');
}
function editFact(btn) {
  const k = btn.dataset.aweFact; const o = st.facts[k]; if (!o) return;
  btn.innerHTML = `<i>${esc(T.k[k])}</i><input value="${esc(k === 'vol' ? String(Math.round(o.v)) : factVal(k, o))}" aria-label="${esc(T.k[k])}">`;
  const inp = btn.querySelector('input'); inp.focus(); inp.select();
  const commit = (sendIt) => {
    const val = inp.value.trim(); if (!val) { renderFacts(); return; }
    st.facts[k] = k === 'vol' ? { v: parseFloat(val) || o.v } : { v: val };
    if (k === 'picks') { const ns = (val.match(/\d{1,2}/g) || []).map(Number).filter((n) => AGENTS[n]); if (ns.length) st.picks = ns.slice(0, 3); }
    if (k === 'reasons') st.reasonKeys = null;
    renderFacts(); if (planEl && planEl.isConnected) planCard();
    if (sendIt) say(T.msgCorr(T.k[k].toLowerCase(), factVal(k, st.facts[k])));
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') renderFacts(); });
  inp.addEventListener('blur', () => commit(false), { once: true });
}

/* ---------- the advise component: their shortlist, cut from the article's ten agents ---------- */
let planEl = null;
function planCard() {
  let picks = st.picks;
  if (!picks && st.reasonKeys && st.reasonKeys.length) picks = st.reasonKeys.map((k) => NEED_AGENT[k]).filter(Boolean).slice(0, 3);
  if (!picks || !picks.length) return;
  const html = `<div class="awe-card awe-est"><span class="awe-tag">${esc(T.planH)}</span>
    <div class="awe-sub" style="margin-bottom:8px">${esc(T.planSub)}</div>
    <ol style="margin:0;padding:0;list-style:none;display:grid;gap:10px">${picks.map((n) => `<li style="display:grid;gap:6px;padding:10px 12px;border-radius:12px;background:var(--awe-soft)">
      <button type="button" data-awe-point="agent-${n}" style="all:unset;cursor:pointer;display:flex;gap:10px;align-items:center;font:600 14px/1.35 'DM Sans';color:var(--awe-ink)"><span style="flex-shrink:0;min-width:30px;height:22px;border-radius:6px;background:var(--awe-p7);color:#fff;font:700 11px/22px 'DM Sans';text-align:center">${String(n).padStart(2, '0')}</span><span>${esc(AGENTS[n].t[LANG])}<small style="display:block;font:500 11.5px/1.3 'DM Sans';color:var(--awe-mut)">${esc(T.phases[AGENTS[n].ph])}</small></span></button>
      <span style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="awe-chip" data-awe-demo="${n}">▶ ${esc(T.tryIt)}</button><button type="button" class="awe-chip" data-awe-copy="${n}">${esc(T.copyP)}</button></span></li>`).join('')}</ol>
    ${st.facts.reasons ? `<div class="awe-why"><b>${esc(T.pickedFor)}:</b> ${esc(st.facts.reasons.v)}</div>` : ''}</div>`;
  const card = h(html);
  if (planEl && planEl.isConnected) planEl.replaceWith(card); else push(card);
  planEl = card; st.cardShown = true;
}
/* Try it live: the page's own demo window (the article's agent card button); without it, the demo inside the card */
function openDemo(n, btn) {
  const a = AGENTS[n]; if (!a) return;
  emit('demo_open', ENTRY.sales, { demo_id: a.demo, agent_n: n });
  const pageBtn = document.querySelector(`#agent-${n} button[aria-label]`) || document.querySelector(`#agent-${n} a[href*="#demo-"]`);
  if (pageBtn) { st.demoFrom = n; closePanel(); setTimeout(() => pageBtn.click(), 120); return; }
  const li = btn && btn.closest('li'); if (!li || li.querySelector('iframe')) return;
  const wrap = h(`<div class="awe-cal ready" style="height:520px"><iframe src="${a.url}" title="${esc(a.t[LANG])}" loading="eager" style="width:100%;height:100%;transform:none;border:0;border-radius:12px"></iframe></div>`);
  li.appendChild(wrap);
}
function copyPrompt(n, btn) {
  const t = AGENTS[n] && AGENTS[n].p; if (!t) return;
  const done = () => { btn.textContent = T.copied; setTimeout(() => { btn.textContent = T.copyP; }, 2000); };
  emit('prompt_copy', ENTRY.signup, { agent_n: n });
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => {}); else done();
}
/* the page's demo window owns the screen: the bar steps aside; when it closes after a Try it live, the agent picks up */
const pageModal = () => [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].find((d) => !panel.contains(d) && d.getClientRects().length > 0);
setInterval(() => {
  const m = !!pageModal(); launch.classList.toggle('awe-away', m); launch.style.display = m ? 'none' : '';
  if (m) st.modalSeen = true;
  else if (st.modalSeen && st.demoFrom) {
    const n = st.demoFrom; st.demoFrom = null; st.modalSeen = false;
    openPanel(); push(h(`<div class="awe-msg"><p>${esc(T.afterDemo(AGENTS[n].t[LANG]))}</p></div>`)); ding();
    repliesEl.innerHTML = `<a class="awe-chip" href="${tagUrl(SIGNUP)}" target="_blank" rel="noopener">${esc(T.build)}</a><button type="button" class="awe-chip" data-awe-say="${esc(T.msgAgent(n, AGENTS[n].t[LANG]))}">${esc(T.nudgeAgent(n, AGENTS[n].t[LANG]).split(' · ')[0])}</button>`;
    keepFocus();
  }
}, 500);
function decide(lastText) {
  if (st.teamDone || st.awaiting === 'why' || (/\?\s*$/.test(splitSources(lastText || '').body) && st.answers < 3)) return;
  const f = st.facts; let n = null;
  if (f.vol && f.vol.v >= 10000) n = { k: 'team-vol', p: 'team', s: 'build', why: T.whyTeamVol(fmt(f.vol.v)) };
  else if (st.picks && st.picks.length >= 3 && st.answers >= 4) n = { k: 'team-many', p: 'team', s: 'build', why: T.whyTeamMany };
  else if (st.picks || st.signupShown) n = { k: 'build', p: 'build', s: 'team', why: T.whyBuild };
  else if (st.answers >= 2) n = { k: 'plan', p: 'plan', s: 'build', why: T.whyPlan };
  if (!n || n.k === st.nbaKey) return;
  st.nbaKey = n.k;
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const btn = (a, primary) => a === 'build'
    ? `<a ${primary ? 'class="awe-cta" ' : ''}href="${tagUrl(SIGNUP)}" target="_blank" rel="noopener">${esc(T.build)}</a>`
    : `<button type="button" ${primary ? 'class="awe-cta" ' : ''}data-awe-act="${a}">${esc(T[a])}</button>`;
  push(h(`<div class="awe-card awe-nba"><span class="awe-tag act">${esc(T.nba)}</span>
    <div class="awe-why" style="margin-top:0"><b>${esc(T.why)}:</b> ${esc(n.why)}</div>
    ${btn(n.p, true)}<div class="awe-alt">${esc(T.or)} ${btn(n.s, false)}</div></div>`));
  repliesEl.innerHTML = '';
}
function act(a) { if (a === 'team') say(T.msgTeam); else if (a === 'plan') say(T.msgPlan); }
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
    e.preventDefault(); const v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { inp.setAttribute('aria-invalid', 'true'); card.querySelector('[data-err]').style.display = 'block'; return; }
    card.dataset.done = '1'; form.querySelectorAll('input,button').forEach((x) => (x.disabled = true));
    st.facts.email = { v }; push(h(`<div class="awe-me">${esc(v)}</div>`)); setWorking(T.theArticle);
    deliver(v).catch((err) => console.warn('[awe]', err));
  });
}
function prepNote() {
  const f = st.facts, P = [];
  if (f.why) P.push(T.k.why + ': ' + f.why.v);
  const facts = FACT_ORDER.filter((k) => f[k] && !f[k].guess && !['why', 'from', 'email'].includes(k)).map((k) => T.k[k] + ': ' + factVal(k, f[k]));
  if (facts.length) P.push(facts.join(' · '));
  return P.join(' | ');
}
function handoffLines() {
  const d = J(), f = st.facts, L = [];
  if (f.why) L.push(T.k.why + ': ' + f.why.v);
  if (d) { L.push(T.k.from + ': ' + (d.from === 'direct' ? T.direct : d.from) + (d.campaign ? ' · ' + d.campaign : '')); if (d.before.length) L.push('→ ' + d.before.join(' → ')); L.push(d.visit > 1 ? '#' + d.visit + ' · ' + (d.firstDaysAgo ? d.firstDaysAgo + 'd' : '0d') : '#1'); }
  const facts = FACT_ORDER.filter((k) => f[k] && !['why', 'from', 'email'].includes(k)).map((k) => T.k[k] + ': ' + factVal(k, f[k]));
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
function calUrl() {
  const q = new URLSearchParams({ embed_type: 'Inline', embed_domain: location.hostname || 'landbot.io', hide_gdpr_banner: '1', hide_event_type_details: '1', hide_landing_page_details: '1', primary_color: '5a60f6', text_color: '1b2139', utm_medium: 'conversion_agent', utm_campaign: CAMPAIGN, utm_content: ENTRY.sales });
  if (realSource()) q.set('utm_source', realSource());
  if (st.facts.email) q.set('email', st.facts.email.v);
  /* a1 = the event's WhatsApp phone question (left to the visitor); a2 = "anything that will help prepare": only what they told us */
  const prep = prepNote();
  if (prep) q.set('a2', prep.slice(0, 900));
  return `${BOOK_URL}?${q}`;
}
function openCal(btn) {
  const card = btn.closest('.awe-book'); if (!card || card.querySelector('iframe')) return;
  btn.remove();
  const wrap = h(`<div class="awe-cal" data-loading="${esc(T.calLoading)}"><iframe src="${calUrl()}" title="${esc(T.bookH)}" loading="eager"></iframe></div>`);
  wrap.querySelector('iframe').addEventListener('load', () => wrap.classList.add('ready'), { once: true });
  card.appendChild(wrap); st.calOpen = true;
  setTimeout(() => thread.scrollTo({ top: thread.scrollTop + card.getBoundingClientRect().top - thread.getBoundingClientRect().top - 8, behavior: 'smooth' }), 380);
}
function closeCal(booked) {
  const card = thread.querySelector('.awe-book'); panel.classList.remove('wide'); st.calOpen = false; if (!card) return;
  const cal = card.querySelector('.awe-cal'); if (cal) cal.remove();
  if (booked) {
    emit('entry_point_booking', ENTRY.sales);
    card.querySelector('.awe-tag').textContent = 'SALES ✓';
    card.appendChild(h(`<div class="awe-receipt on"><span class="ok">✓</span><div>${esc(T.booked)}<small>Calendly · ${esc(T.bookH)}</small></div></div>`));
    if (handoffLines().length) card.appendChild(h(`<details class="awe-sees" open><summary>${esc(T.teamSees)}</summary>${handoffLines().map((l) => `<div>${esc(l)}</div>`).join('')}</details>`));
    say(T.booked, '$0');
  }
}
window.addEventListener('message', (e) => {
  if (!/calendly\.com$/.test((() => { try { return new URL(e.origin).hostname; } catch (_) { return ''; } })())) return;
  if (e.data && e.data.event === 'calendly.event_scheduled' && st.calOpen) { st.nextData = calRefs(e.data); closeCal(true); }
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

/* ---------- the bar: section-aware outcome ---------- */
const NUDGE_OF = { tldr: 'tldr', takeaways: 'tldr', why: 'why', before: 'before', 'agent-1': 1, 'agent-2': 2, during: 'during', 'agent-3': 3, 'agent-4': 4, 'agent-5': 5, 'agent-6': 6, 'agent-7': 7,
  after: 'after', 'agent-8': 8, 'agent-9': 9, 'agent-10': 10, launch: 'launch', practices: 'practices', ready: 'launch', faq: 'faq' };
const ORDER = Object.keys(NUDGE_OF);
function setNudge(label, prompt) {
  if (window.innerWidth < 560) label = label.split(' · ')[0];
  if (launchInput.dataset.prompt === prompt && launchInput.placeholder === label) return;
  pill.classList.add('swap');
  setTimeout(() => { launchInput.placeholder = label; launchInput.setAttribute('aria-label', label); launchInput.dataset.prompt = prompt; pill.classList.remove('swap'); }, 200);
}
function syncLaunch() {
  launch.classList.toggle('off', st.open);
  if (!st.open && !launch.classList.contains('tuck')) emit('entry_point_view', ENTRY.sales);
  let active = ORDER[0];
  for (const id of ORDER) { const el = secEl(id); const r = el && el.getBoundingClientRect(); if (r && r.height > 0 && r.top < window.innerHeight * 0.45) active = id; }
  if (active !== st.section) {
    st.section = active;
    const k = NUDGE_OF[active];
    if (typeof k === 'number') { const t = AGENTS[k].t[LANG]; setNudge(T.nudgeAgent(k, t), T.msgAgent(k, t)); return; }
    const [l, p] = T.nudge[k]; setNudge(l, p);
  }
}
const TOUCH = matchMedia('(hover: none)').matches;
function keepFocus(force) {
  if (!st.open) return;
  const box = panel.querySelector('.awe-foot input'), a = document.activeElement;
  if (a === box) return;
  if (a && a !== document.body && a.matches('input, textarea, select') && a !== launchInput) return;
  if (TOUCH && !force) return;
  box.focus({ preventScroll: true });
}
document.addEventListener('submit', (e) => {
  const f = e.target.closest && e.target.closest('[data-awe-form]'); if (!f) return;
  e.preventDefault(); const inp = f.querySelector('input'); const v = inp.value.trim() || (inp === launchInput ? inp.dataset.prompt : ''); inp.value = ''; say(v); keepFocus(true);
});
document.addEventListener('click', (e) => {
  const su = e.target.closest && e.target.closest('a[href*="sign-up"], a[href*="signup"]'); if (su && su.closest('#awe-panel')) emit('entry_point_click', ENTRY.signup);
  const t = e.target.closest ? e.target : null; if (!t) return;
  /* the article's own "Ask the agent" nudges send their prompt; the FAQ one just opens the layer */
  const ask = t.closest('[data-awe-ask]'); if (ask) { e.preventDefault(); const p = ask.dataset.aweAsk; if (p) say(p); else { openPanel(); panel.querySelector('.awe-foot input').focus(); } keepFocus(); return; }
  const chip = t.closest('[data-awe-say]'); if (chip) { say(chip.dataset.aweSay, chip.dataset.awePayload || undefined); keepFocus(); return; }
  const cal = t.closest('[data-awe-cal]'); if (cal) { openCal(cal); return; }
  const dm = t.closest('[data-awe-demo]'); if (dm) { openDemo(+dm.dataset.aweDemo, dm); return; }
  const cp = t.closest('[data-awe-copy]'); if (cp) { copyPrompt(+cp.dataset.aweCopy, cp); return; }
  const p = t.closest('[data-awe-point]'); if (p) { pointAt(p.dataset.awePoint); return; }
  const a = t.closest('[data-awe-act]'); if (a) { act(a.dataset.aweAct); return; }
  const fct = t.closest('[data-awe-fact]'); if (fct && !fct.querySelector('input')) { editFact(fct); return; }
  if (t.closest('[data-awe-retry]')) { retryLast(); return; }
  if (t.closest('[data-awe-close]')) { closePanel(); return; }
  if (t.closest('[data-awe-open]')) { if (launchInput.value.trim()) { const v = launchInput.value; launchInput.value = ''; say(v); } else { openPanel(); panel.querySelector('.awe-foot input').focus(); } return; }
}, true);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (st.open) closePanel(); else { openPanel(); panel.querySelector('.awe-foot input').focus(); } }
  if (e.key === 'Escape' && st.open) closePanel();
});
window.addEventListener('scroll', syncLaunch, { passive: true });
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
[800, 2000].forEach((ms) => setTimeout(() => { st.section = ''; syncLaunch(); }, ms));
} catch (err) { console.warn('[awe] layer failed', err); }
