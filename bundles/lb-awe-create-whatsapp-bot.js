/* Landbot Conversion Agent · create-whatsapp-bot post · built 2026-10-08 */
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
   Agentic Web Experience · lb-awe: create-whatsapp-bot  (PREVIEW)
   Same front as the WhatsApp Pricing build, adapted to this guide.
   Back: the real bot "Create WA Bot Conversion Agent" (a386dbea…,
   channel 3524394, AI agent b0deb8c8…, brand Landbot Sales) run headless via Landbot.Core.
   ?stub=1 still runs the old scripted stand-in (stubCore) for offline demos.
--------------------------------------------------------------------------- */
try {
const CONFIG_URL = 'https://storage.googleapis.com/landbot.pro/v3/H-3524394-1HMUCYYG7180C64S/index.json';
const SDK_URL = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
const STUB = /(^|[?&])stub=1\b/.test(location.search);
/* Sales Entry Points convention (Notion · Growth & Marketing › Site › Conversión on-site): {surface}-{location}[-{section}]-{intent} */
const ENTRY = { source: 'web', sales: 'web-blog-create-whatsapp-bot-sticky-sales', signup: 'web-blog-create-whatsapp-bot-sticky-signup' };
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
const SIGNUP = 'https://app.landbot.io/sign-up/?utm_medium=conversion_agent&utm_campaign=create_wa_bot&utm_content=web-blog-create-whatsapp-bot-sticky-signup';
const TEMPLATES = 'https://landbot.io/ai-agent-templates';
const TESTING = 'https://help.landbot.io/';
const SECTIONS = [
  ['tldr', /tl;?dr/i, 'TL;DR'], ['whatsapp-bot', /what is a whatsapp bot/i, 'What is a WhatsApp Bot?'],
  ['build-whatsapp-bots', /who can build/i, 'Who Can Build WhatsApp Bots?'], ['create-test-whatsapp-bot', /no-code builder/i, 'Build it with the No-Code Builder'],
  ['export-google-sheets', /google sheets/i, '7. Export Collected Data: Google Sheets'], ['human-hand-off', /hand-?off/i, '8. Offer Human Hand-off'],
  ['test-your-chatbot', /test your/i, '10. Test Your WhatsApp Chatbot'], ['whatsapp-ai-agent', /ai agent/i, 'Build it with the AI Agent'],
  ['knowledge-base', /knowledge base/i, 'Knowledge Base'], ['store-data', /store data/i, 'Store Data'],
  ['landbot-case-studies', /customers|case/i, 'Landbot customers using WhatsApp bots'], ['choices', /choices/i, 'Choices · real estate'], ['hotelbeds', /hotelbeds/i, 'Hotelbeds · self-service'],
  ['faqs', /\bfaqs?\b/i, 'FAQs']
];
const DICT = {
  en: { rec: 'You’re reading <b>how to build a WhatsApp bot</b>. Tell me what yours should do and I’ll pick the <b>faster of the two ways</b> in this guide and the steps you can skip. About a minute.',
    back: 'Welcome back. ', phPanel: 'Ask a follow-up', reading: 'Reading', theArticle: 'the guide', online: 'Online', working: 'Working on it',
    facts: 'What I’ve understood', edit: 'tap to correct', nba: 'What makes most sense now', why: 'Why', or: 'or', preview: STUB ? 'Preview · scripted replies' : '',
    build: 'Start building free →', team: 'Talk to a WhatsApp expert', plan: 'Get my build plan',
    whyPlan: 'Two answers, what the bot does and whether your number is approved, are enough to cut this guide down to your steps.',
    whyBuild: 'Your case fits the guide as it is: you can build and test it yourself today, free, before Meta even approves your number.',
    whyBuildNo: 'You don’t need the approved number to start: build now and test with WhatsApp Testing while Meta reviews it.',
    whyTeamVol: (v) => `At ${v} conversations a month, the number set-up, templates and opt-in are worth planning with someone who has done it before.`,
    planH: 'Your build plan', planWay: { agent: 'AI Agent', flow: 'No-code builder', both: 'AI Agent inside a builder flow' },
    planSub: (w) => `The way: ${w} · only the steps from this guide that apply to you`, skip: 'You can skip', planNoNum: 'Before going live: Meta approves your WhatsApp Business API number. Test meanwhile.',
    mail: 'Where should the plan go?', mailSub: 'A WhatsApp expert replies within one business day, with everything you told me already on the table.', mailPh: 'you@company.com', sendIt: 'Send', mailBad: 'That doesn’t look like an email yet.',
    done: 'Done. Here’s what changed', r1: 'Lead saved in Landbot', r1s: 'Inbox · Create WhatsApp Bot Conversion Agent', r2: 'Context attached to the lead', r3: 'Follow-up promised', r3s: 'within one business day · Landbot team',
    foot: 'Answers only from this guide and the pages it links · Landbot is a WhatsApp Business partner.',
    fromArticle: 'GUIDE', pointLabel: 'Landbot AI is reading this',
    msgPlan: 'Make me a build plan for my case.', msgTeam: 'I’d like to talk to a WhatsApp expert.', msgCorr: (k, v) => `Quick correction: ${k} is ${v}.`,
    nudge: { tldr: ['Pick your fastest way to build · 2 questions', 'Which of the two ways should I use?'], who: ['Can you build one yet? · check in 1 question', 'Can I build a WhatsApp bot yet?'],
      flow: ['Build this flow with me · I’ll skip what you don’t need', 'Make me a build plan for my case.'], data: ['Send the answers to your tools · Sheets, CRM, Slack', 'Where can the collected data go?'],
      test: ['Test before Meta approves you · ask me how', 'Can I test before my number is approved?'], agent: ['Set up your AI Agent · instructions, knowledge, outputs', 'Help me set up the AI Agent for my case.'],
      cases: ['See a case like yours · 3 seconds', 'Which customer case is closest to mine?'], faq: ['Ask this guide anything · answers only from it', 'Do I need coding skills?'] },
    k: { use: 'Bot does', way: 'Best way', num: 'WA number', tools: 'Send data to', vol: 'Volume', from: 'Came from', why: 'Why here' }, teamSees: 'What the team will see', direct: 'direct', perMo: ' conv/mo',
    yes: 'approved', no: 'not yet', oneMore: 'Yes, one more question',
    morph: (u, w) => `Your ${u} bot on WhatsApp: build it with the ${w}, test it free today.` },
  es: { rec: 'Estás leyendo <b>cómo crear un bot de WhatsApp</b>. Cuéntame qué debe hacer el tuyo y te digo <b>cuál de las dos vías</b> de esta guía es más rápida y qué pasos te puedes saltar. Un minuto.',
    back: 'Hola de nuevo. ', phPanel: 'Haz otra pregunta', reading: 'Leyendo', theArticle: 'la guía', online: 'En línea', working: 'Trabajando en ello',
    facts: 'Lo que he entendido', edit: 'toca para corregir', nba: 'Lo que tiene más sentido ahora', why: 'Por qué', or: 'o', preview: STUB ? 'Vista previa · respuestas guionizadas' : '',
    build: 'Empezar gratis →', team: 'Hablar con un experto en WhatsApp', plan: 'Ver mi plan',
    whyPlan: 'Con dos respuestas, qué hace el bot y si tu número está aprobado, recorto esta guía a tus pasos.',
    whyBuild: 'Tu caso encaja con la guía tal cual: puedes construirlo y probarlo tú hoy, gratis, incluso antes de que Meta apruebe tu número.',
    whyBuildNo: 'No necesitas el número aprobado para empezar: constrúyelo ya y pruébalo con WhatsApp Testing mientras Meta lo revisa.',
    whyTeamVol: (v) => `Con ${v} conversaciones al mes, el número, las plantillas y el opt-in merecen un plan con alguien que ya lo haya hecho.`,
    planH: 'Tu plan de construcción', planWay: { agent: 'AI Agent', flow: 'builder sin código', both: 'AI Agent dentro de un flujo del builder' },
    planSub: (w) => `La vía: ${w} · solo los pasos de esta guía que te aplican`, skip: 'Te puedes saltar', planNoNum: 'Antes de salir en vivo: Meta aprueba tu número de WhatsApp Business API. Mientras, pruébalo.',
    mail: '¿A dónde te envío el plan?', mailSub: 'Un experto en WhatsApp responde en un día laborable, con todo lo que me has contado ya sobre la mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Eso todavía no parece un email.',
    done: 'Hecho. Esto es lo que ha cambiado', r1: 'Lead guardado en Landbot', r1s: 'Inbox · Create WhatsApp Bot Conversion Agent', r2: 'Contexto adjunto al lead', r3: 'Seguimiento prometido', r3s: 'en un día laborable · equipo de Landbot',
    foot: 'Respuestas solo con esta guía y las páginas que enlaza · Landbot es partner de WhatsApp Business.',
    fromArticle: 'GUÍA', pointLabel: 'Landbot AI está leyendo esto',
    msgPlan: 'Hazme un plan de construcción para mi caso.', msgTeam: 'Quiero hablar con un experto en WhatsApp.', msgCorr: (k, v) => `Corrijo: ${k} es ${v}.`,
    nudge: { tldr: ['Elige la vía más rápida · 2 preguntas', '¿Cuál de las dos vías me conviene?'], who: ['¿Puedes crear uno ya? · 1 pregunta', '¿Puedo crear ya un bot de WhatsApp?'],
      flow: ['Construye este flujo conmigo · me salto lo que no necesitas', 'Hazme un plan de construcción para mi caso.'], data: ['Manda las respuestas a tus herramientas · Sheets, CRM, Slack', '¿A dónde pueden ir los datos?'],
      test: ['Pruébalo antes de que Meta te apruebe · te digo cómo', '¿Puedo probarlo antes de tener el número aprobado?'], agent: ['Configura tu AI Agent · instrucciones, conocimiento, salidas', 'Ayúdame a configurar el AI Agent para mi caso.'],
      cases: ['Mira un caso como el tuyo · 3 segundos', '¿Qué caso de cliente se parece más al mío?'], faq: ['Pregúntale a esta guía · responde solo con ella', '¿Necesito saber programar?'] },
    k: { use: 'El bot', way: 'Mejor vía', num: 'Número WA', tools: 'Datos a', vol: 'Volumen', from: 'Vino de', why: 'Por qué vino' }, teamSees: 'Lo que verá el equipo', direct: 'directo', perMo: ' conv/mes',
    yes: 'aprobado', no: 'todavía no', oneMore: 'Sí, una pregunta más',
    morph: (u, w) => `Tu bot de ${u} en WhatsApp: hazlo con el ${w} y pruébalo gratis hoy.` }
};
const BOOK_URL = 'https://calendly.com/landbot-sales/meeting-landbot-expert', HELP_URL = 'https://help.landbot.io/';
Object.assign(DICT.en, { calLoading: 'Loading the calendar…', bookH: 'Book 30 min with a WhatsApp expert', bookSub: 'Pick a slot that suits you. They’ll have this conversation on hand, so no starting from zero.', bookGo: 'Choose a time →', booked: 'I’ve booked a time', mailInstead: 'Email me instead', bookedMsg: 'Great, see you there. The team will have this conversation on hand.', supH: 'This one’s for our support team', supSub: 'They can look at your account and sort it fastest. The help center has guides and a way to reach them.', supGo: 'Open the help center →', backArt: 'Back to the guide' });
Object.assign(DICT.es, { calLoading: 'Cargando el calendario…', bookH: 'Reserva 30 min con un experto en WhatsApp', bookSub: 'Elige el hueco que mejor te venga. Tendrán esta conversación a mano, así que no empiezas de cero.', bookGo: 'Elegir hora →', booked: 'Ya he reservado', mailInstead: 'Prefiero que me escribáis', bookedMsg: 'Genial, nos vemos ahí. El equipo tendrá esta conversación a mano.', supH: 'Esto es cosa de nuestro equipo de soporte', supSub: 'Pueden mirar tu cuenta y resolverlo antes. En el centro de ayuda tienes guías y cómo contactarles.', supGo: 'Abrir el centro de ayuda →', backArt: 'Volver a la guía' });
function pageLang() { const l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return DICT[l] ? l : 'en'; }
let LANG = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : pageLang();
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
const LANG_CUES = {
  es: [/[¿¡ñ]/, /\b(hola|gracias|qué|que|cuánto|cuanto|cómo|como|quiero|tengo|necesito|precio|cuesta|puedo|mi|mis|nuestro|empresa|mensajes|usted|vale|con|una|unos|por|las|los|del|pero|hay|muy|soy|somos|hablar|ventas|cliente|ya|funciona|también|dónde|cuándo|y|el|la|es|todavía|aún|de|al|nos|unas|mes|queremos|para|lo|se|en|tenemos|hacer|mano|citas|visitas)\b/gi],
  en: [/(?!)/, /\b(hello|hi|thanks|what|how|much|will|does|the|my|our|we|need|want|cost|price|company|messages|can|is|i|with|to|and|for|it|you|this|do|are|talk|sales|already|customer|working|of|in|yet)\b/gi],
};
function detectLang(q) {
  const score = {};
  for (const [l, [strong, words]] of Object.entries(LANG_CUES)) score[l] = (strong.test(q) ? 2 : 0) + (q.match(words) || []).length;
  const [best, second] = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const short = q.trim().split(/\s+/).length <= 2;
  return best[1] > second[1] && (best[1] >= 2 || short) ? best[0] : null;
}
function followLang(q) { const l = detectLang(q); if (l && l !== LANG && DICT[l]) { LANG = l; T = DICT[LANG]; paint(); } }
const fmt = (n) => Math.round(n).toLocaleString(LANG === 'en' ? 'en-US' : 'es-ES');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let visits = 0;
try { visits = +(localStorage.getItem('awe-cwb-visits') || 0); localStorage.setItem('awe-cwb-visits', String(visits + 1)); } catch (_) {}
const st = { core: null, boot: null, facts: {}, awaiting: null, answers: 0, nbaKey: '', open: false, t0: Date.now(), teamDone: false, section: 'tldr', cited: new Set(), plan: null };
const J = () => (window.lbJourney && window.lbJourney.describe && window.lbJourney.describe()) || null;
try { const d = J(); if (d && d.from) st.facts.from = { v: d.from === 'direct' ? T.direct : d.from, guess: true }; } catch (_) {}

/* ---------- PREVIEW back: a scripted stand-in with Landbot.Core's message shape ---------- */
function stubCore() {
  const subs = []; const S = { stage: 'start', ctxLine: '' };
  const emit = (m) => subs.forEach((f) => f({ timestamp: Date.now(), author_type: 'bot', ...m }));
  const ai = (message) => emit({ type: 'text', message, extra: { id: 'ai_agent', is_ai_agent_message: true } });
  const btns = (message, buttons, payloads) => emit({ type: 'dialog', message, buttons, payloads: payloads || buttons.map((_, i) => '$' + i), extra: { id: 'ai_agent', is_ai_agent_message: true } });
  const block = (id, message) => emit({ type: 'text', message: message || '', extra: { id: id + '_0' } });
  const es = () => LANG === 'es';
  const R = {
    ways: () => es()
      ? 'Hay dos vías, y ninguna pide código.\nEl **builder** si quieres controlar cada paso: preguntas, condiciones, botones.\nEl **AI Agent** si prefieres darle instrucciones y conocimiento y que conduzca él.\n¿Qué debe hacer tu bot?\nFuentes: No-code builder · AI Agent'
      : 'There are two ways, and neither needs code.\nThe **builder** if you want to control every step: questions, conditions, buttons.\nThe **AI Agent** if you’d rather give it instructions and knowledge and let it lead.\nWhat should your bot do?\nSources: No-code builder · AI Agent',
    who: () => es()
      ? 'Sí, si tienes un perfil de WhatsApp Business **aprobado para la API**.\nY aunque no lo tengas todavía, puedes construirlo y probarlo ya.\n¿Tu número ya está aprobado?\nFuentes: Who Can Build · Test Your'
      : 'Yes, if you have a WhatsApp Business profile **approved for the API**.\nAnd even if it isn’t yet, you can build and test it now.\nIs your number approved already?\nSources: Who Can Build · Test Your',
    code: () => es()
      ? '**No**, no hace falta programar.\nEl builder es arrastrar y soltar, y el AI Agent se configura con instrucciones en texto.\n¿Qué quieres que haga el tuyo?\nFuentes: FAQs'
      : '**No**, you don’t need to code.\nThe builder is drag and drop, and the AI Agent is set up with plain-text instructions.\nWhat do you want yours to do?\nFuentes: FAQs'.replace('Fuentes', 'Sources'),
    data: () => es()
      ? 'La guía lo hace con **Google Sheets**: cada respuesta va a una fila nueva.\nY con un aviso en **Slack** cuando alguien pide hablar con una persona.\n¿Qué debe hacer tu bot, para decirte qué más conectar?\nFuentes: Google Sheets · Hand-off'
      : 'The guide does it with **Google Sheets**: each answer goes to a new row.\nPlus a **Slack** alert when someone asks for a person.\nWhat should your bot do, so I can tell you what else to connect?\nSources: Google Sheets · Hand-off',
    use: (u) => {
      const t = {
        faq: es() ? ['Para **FAQs**, el **AI Agent** es la vía corta.', 'Le subes un PDF, pegas texto o le das una URL, y responde con eso.', 'Fuentes: AI Agent · Knowledge Base']
                  : ['For **FAQs**, the **AI Agent** is the short way.', 'You upload a PDF, paste text or give it a URL, and it answers from that.', 'Sources: AI Agent · Knowledge Base'],
        leads: es() ? ['Para **cualificar leads**, el **AI Agent** con Store Data: pregunta lo que necesitas y lo guarda en campos.', 'Luego lo mandas a Sheets o a tu CRM.', 'Fuentes: Store Data · Google Sheets']
                    : ['To **qualify leads**, the **AI Agent** with Store Data: it asks what you need and saves it to fields.', 'Then you send it to Sheets or your CRM.', 'Sources: Store Data · Google Sheets'],
        book: es() ? ['Para **citas**, el **AI Agent** es la vía corta.', 'Choices, una inmobiliaria del Reino Unido, lo usa para cualificar y agendar: **9 %** de lead a cita.', 'Fuentes: AI Agent · Choices']
                   : ['For **appointments**, the **AI Agent** is the short way.', 'Choices, a UK real estate agency, uses it to qualify and book: **9%** from lead to appointment.', 'Sources: AI Agent · Choices'],
        survey: es() ? ['Para una **encuesta**, el **builder**: es exactamente el ejemplo de la guía.', 'Preguntas, una condición de edad, botones, vídeo y Sheets.', 'Fuentes: No-code builder · Google Sheets']
                     : ['For a **survey**, the **builder**: it’s exactly the guide’s example.', 'Questions, an age condition, buttons, a video and Sheets.', 'Sources: No-code builder · Google Sheets'],
        support: es() ? ['Para **soporte**, un flujo del builder con **Human takeover** y un aviso en Slack.', 'Hotelbeds montó así su autoservicio: 350.000 consultas respondidas.', 'Fuentes: Hand-off · Hotelbeds']
                      : ['For **support**, a builder flow with **Human takeover** and a Slack alert.', 'Hotelbeds built its self-service that way: 350,000 queries answered.', 'Sources: Hand-off · Hotelbeds'] }[u];
      return t.slice(0, 2).join('\n') + '\n' + (es() ? '¿Tu número de WhatsApp Business ya está aprobado para la API?' : 'Is your WhatsApp Business number approved for the API yet?') + '\n' + t[2];
    },
    num: (yes) => (yes
      ? (es() ? 'Perfecto, entonces lo pruebas directamente en tu número, como un usuario real.' : 'Great, then you test it straight on your number, like a real user.')
      : (es() ? 'Sin problema: con **WhatsApp Testing** lo pruebas antes de que Meta apruebe la marca y el número.' : 'No problem: with **WhatsApp Testing** you test it before Meta approves your brand and number.'))
      + '\n' + (es() ? 'Te he dejado tu plan abajo.' : 'I’ve put your plan below.')
      + '\n' + (es() ? '¿Qué te ha hecho mirar esto ahora?' : 'What made you look into this now?') + '\nSources: Test Your',
    why: () => es()
      ? 'Entendido, gracias.\nCon eso ya sé qué te propongo.\n'
      : 'Got it, thanks.\nThat tells me what to suggest.\n',
    cases: () => es()
      ? 'Depende de qué haga tu bot.\n**Choices** si es cualificar y agendar citas; **Hotelbeds** si es autoservicio a escala.\n¿Cuál se parece más a lo tuyo?\nFuentes: Choices · Hotelbeds'
      : 'Depends on what your bot does.\n**Choices** if it’s qualifying and booking; **Hotelbeds** if it’s self-service at scale.\nWhich is closer to yours?\nSources: Choices · Hotelbeds',
    agent: () => es()
      ? 'Son cuatro piezas: **Instructions**, **Knowledge Base**, **Store Data** y **Outputs**.\nLa que más importa son las instrucciones: cómo habla y qué debe conseguir.\n¿Qué debe hacer tu agente?\nFuentes: Instructions · Knowledge Base · Store Data'
      : 'Four pieces: **Instructions**, **Knowledge Base**, **Store Data** and **Outputs**.\nThe one that matters most is the instructions: how it talks and what it must get.\nWhat should your agent do?\nSources: Instructions · Knowledge Base · Store Data',
    lang: () => es() ? '**Sí**, los bots de WhatsApp de Landbot pueden hablar varios idiomas.\n¿Qué debe hacer el tuyo?\nFuentes: FAQs' : '**Yes**, Landbot’s WhatsApp bots can be multilingual.\nWhat should yours do?\nSources: FAQs',
    salesLine: () => es() ? 'Claro, mejor con alguien que lo haya montado antes.\nTe abro el calendario aquí mismo.' : 'Sure, that’s best done with someone who has set it up before.\nI’ll open the calendar right here.',
    supLine: () => es() ? 'Eso lo resuelve mejor nuestro equipo de soporte, que puede mirar tu cuenta.' : 'Our support team sorts that fastest, since they can look at your account.',
    fallback: () => es() ? 'Eso la guía no lo cubre, así que no te lo voy a inventar.\nLo que sí puedo: decirte qué vía y qué pasos te tocan.\n¿Qué debe hacer tu bot?' : 'The guide doesn’t cover that, so I won’t make it up.\nWhat I can do: tell you which way and which steps are yours.\nWhat should your bot do?',
    useBtns: () => (es() ? ['Responder FAQs', 'Cualificar leads', 'Agendar citas', 'Atender soporte'] : ['Answer FAQs', 'Qualify leads', 'Book appointments', 'Handle support']),
    numBtns: () => (es() ? ['Sí, aprobado', 'Todavía no'] : ['Yes, approved', 'Not yet'])
  };
  const USE_RX = [[/faq|pregunta(s)? frecuente|dudas|answer faq|responder faq/i, 'faq'], [/lead|cualific|qualif|captar|ventas|sales/i, 'leads'], [/cita|appoint|book|agend|reserv|schedul/i, 'book'], [/survey|encuesta|form/i, 'survey'], [/support|soporte|atender|atención|customer service|servicio al cliente/i, 'support']];
  function useOf(q) { for (const [re, u] of USE_RX) if (re.test(q)) return u; return null; }
  async function reply(raw) {
    const q = raw.replace(/^\[Page context:[^\]]*\]\s*/i, '').trim();
    await sleep(1300 + Math.random() * 900);
    if (S.stage === 'email') { if (/@/.test(q)) { block('team_done'); S.stage = 'after'; } return; }
    if (S.stage === 'book') {
      if (q === '$1' || /email|escrib/i.test(q)) { block('team_email'); S.stage = 'email'; return; }
      if (q === '$0' || /booked|reservado/i.test(q)) { block('sales_booked'); S.stage = 'after'; return; }
    }
    if (/(my|mi) (bot|chatbot|cuenta|account).{0,30}(not|no|doesn|isn|falla|broken|work|funciona)|log ?in|billing|factura(ción)?|no me funciona|isn.t working|not working/i.test(q)) { ai(R.supLine()); await sleep(300); block('support_route'); S.stage = 'after'; return; }
    if (/demo|expert|experto|talk to|hablar con|call|llamada|pricing|precio|plan(es)? de pago|cuánto cuesta|how much/i.test(q) && !/build plan|plan de construcción/i.test(q)) { ai(R.salesLine()); await sleep(300); block('sales_book'); S.stage = 'book'; return; }
    if (S.stage === 'why') { ai(R.why()); S.stage = 'after'; return; }
    const u = useOf(q);
    if (S.stage === 'num' || /approved|aprobad|todav[ií]a no|not yet|^no\b|^s[ií]\b|^yes\b/i.test(q) && S.use) {
      const yes = /yes|s[ií]|aprobado|approved/i.test(q) && !/not|no\b|todav/i.test(q);
      emitFact('num', yes); ai(R.num(yes)); S.stage = 'why'; return;
    }
    if (u) { S.use = u; emitFact('use', u); btns(R.use(u), R.numBtns()); S.stage = 'num'; return; }
    if (/two ways|dos v[ií]as|which.*(way|use)|cu[aá]l.*v[ií]a|builder|faster|m[aá]s r[aá]pid|build plan|plan de construcción|plan for my|plan para mi/i.test(q)) { btns(R.ways(), R.useBtns()); S.stage = 'use'; return; }
    if (/yet|ya\b|can i build|puedo crear|approv|test|prueb/i.test(q)) { btns(R.who(), R.numBtns()); S.stage = 'num'; S.use = S.use || 'faq'; return; }
    if (/cod(e|ing)|program/i.test(q)) { btns(R.code(), R.useBtns()); S.stage = 'use'; return; }
    if (/data|datos|sheets|crm|slack|hubspot/i.test(q)) { btns(R.data(), R.useBtns()); S.stage = 'use'; return; }
    if (/case|caso|customer|cliente/i.test(q)) { ai(R.cases()); S.stage = 'use'; return; }
    if (/ai agent|agente|instruc|knowledge/i.test(q)) { btns(R.agent(), R.useBtns()); S.stage = 'use'; return; }
    if (/language|idioma|multiling/i.test(q)) { btns(R.lang(), R.useBtns()); S.stage = 'use'; return; }
    if (q === '$0' && S.stage === 'after') { ai(es() ? 'Claro, dime.' : 'Sure, go ahead.'); return; }
    btns(R.fallback(), R.useBtns()); S.stage = 'use';
  }
  function emitFact(k, v) { window.dispatchEvent(new CustomEvent('awe-fact', { detail: { k, v } })); }
  return {
    pipelines: { $readableSequence: { subscribe: (f) => subs.push(f) } },
    init: async () => {},
    sendMessage: async (m) => { reply(m.type === 'button' ? (m.payload || m.message) : m.message); }
  };
}
function loadSDK() {
  if (window.Landbot) return Promise.resolve(window.Landbot);
  if (!document.querySelector('script[data-awe-sdk]')) { const s = document.createElement('script'); s.type = 'module'; s.src = SDK_URL; s.dataset.aweSdk = '1'; document.head.appendChild(s); }
  return new Promise((res, rej) => { const t0 = Date.now(); const tick = () => window.Landbot ? res(window.Landbot) : (Date.now() - t0 > 15000 ? rej(new Error('sdk timeout')) : setTimeout(tick, 60)); tick(); });
}
function boot() {
  if (st.boot) return st.boot;
  st.boot = (async () => {
    if (STUB) { const core = stubCore(); st.core = core; st.greeted = true; core.pipelines.$readableSequence.subscribe((m) => { try { onMsg(m); } catch (e) { console.warn('[awe]', e); } }); await core.init(); return; }
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
/* the booking's Calendly references ride on the next message as custom_data, so the bot can look the invitee up (Xavi, 8-oct-2026) */
function withData(m) { const d = st.nextData; st.nextData = null; if (d) m.custom_data = d; return m; }
const calRefs = (d) => { const p = (d && d.payload) || {}; return { calendly_invitee: (p.invitee && p.invitee.uri) || '', calendly_event: (p.event && p.event.uri) || '' }; };
async function deliver(text, payload) {
  await boot();
  if (STUB) {
    if (payload) return st.core.sendMessage(withData({ type: 'button', message: text, payload: /^\$/.test(payload) && st.lastBtns ? (st.lastBtns[+payload.slice(1)] || payload) : payload }));
    return st.core.sendMessage(withData({ type: 'text', message: text }));
  }
  const btn = payload && st.greetBtns && st.greetBtns.find((b) => b.payload === payload);
  return st.core.sendMessage(withData(payload ? { type: 'button', message: btn ? btn.text : text, payload } : { type: 'text', message: text }));
}
window.addEventListener('awe-fact', (e) => {
  const { k, v } = e.detail;
  if (k === 'use') { st.facts.use = { v: USE_LABEL()[v] }; st.useKey = v; st.facts.way = { v: T.planWay[WAY[v]] }; }
  if (k === 'num') { st.facts.num = { v: v ? T.yes : T.no }; st.numOk = v; }
  renderFacts();
  if (k === 'num') { if (st.real) st.planPending = true; else setTimeout(() => { st.chain = (st.chain || Promise.resolve()).then(() => planCard()); }, 0); }   // after the reply's bubbles, never between them
});
const WAY = { faq: 'agent', leads: 'agent', book: 'agent', survey: 'flow', support: 'flow' };
const USE_LABEL = () => (LANG === 'es' ? { faq: 'FAQs', leads: 'Cualificar leads', book: 'Citas', survey: 'Encuesta', support: 'Soporte' } : { faq: 'FAQs', leads: 'Lead qualification', book: 'Appointments', survey: 'Survey', support: 'Support' });

/* ---------- UI: lava orb bar, layer ---------- */
const STARTERS = { en: ['Which way is faster for me?', 'Can I build one yet?', 'Do I need to code?'], es: ['¿Qué vía es más rápida para mí?', '¿Puedo crear uno ya?', '¿Necesito programar?'] };
const starterChips = () => STARTERS[LANG].map((l) => `<button type="button" class="awe-chip" data-awe-say="${esc(l)}">${esc(l)}</button>`).join('');
let gooN = 0;
const LAVA = (cls) => { const id = 'aweGoo' + (++gooN); return `<span class="awe-lava ${cls || ''}" aria-hidden="true">
  <svg viewBox="0 0 300 300"><defs><filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur in="SourceGraphic" stdDeviation="13" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs>
  <g filter="url(#${id})"><circle class="g1" cx="150" cy="150" r="52" fill="#F58B0B"/><circle class="g2" cx="178" cy="170" r="40" fill="#636BFC"/><circle class="g3" cx="135" cy="120" r="34" fill="#4FCCC2"/><circle class="g4" cx="120" cy="175" r="28" fill="#FF3F7B"/><circle class="g5" cx="180" cy="125" r="24" fill="#F58B0B"/></g></svg></span>`; };
const launch = h(`<div id="awe-launch" role="region" aria-label="Landbot AI"><div class="awe-chips" data-awe-starters></div>
  <form class="awe-pill" data-awe-form><button type="button" data-awe-open style="all:unset;cursor:pointer;border-radius:50%">${LAVA()}</button><input type="text" autocomplete="off"><button type="submit" class="awe-pill-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></button></form></div>`);
const panel = h(`<aside id="awe-panel" role="dialog" aria-label="Landbot AI" aria-hidden="true">
  <div class="awe-head">${LAVA('sm')}<div class="awe-head-t"><b>Landbot AI</b><span class="awe-status"></span></div>
    <span data-t="preview" style="${STUB ? '' : 'display:none;'}font:600 10px/1 'DM Sans';letter-spacing:.04em;text-transform:uppercase;color:#7A5B00;background:#FFF4D6;border-radius:999px;padding:5px 8px;margin-right:6px;white-space:nowrap"></span>
    <button type="button" class="awe-x" data-awe-close aria-label="Close">✕</button></div>
  <div class="awe-facts"><div class="awe-facts-h"><span data-t="facts"></span><span data-t="edit"></span></div><div class="awe-facts-list"></div></div>
  <div class="awe-thread" aria-live="polite"></div>
  <div class="awe-foot"><div class="awe-chips" data-awe-replies></div>
    <form class="awe-compose" data-awe-form><input type="text" autocomplete="off"><button class="awe-send" type="submit" aria-label="Send">↑</button></form>
    <!-- foot note removed 10-nov-2026: it was for us, not for the visitor (Fabo) --></div></aside>`);
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
  if (st.useKey) { st.facts.use = { v: USE_LABEL()[st.useKey] }; st.facts.way = { v: T.planWay[WAY[st.useKey]] }; }
  if (st.facts.num) st.facts.num = { v: st.numOk ? T.yes : T.no };
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
  push(h(`<div class="awe-working"><span class="awe-orb sm work" aria-hidden="true"></span></div>`));   // orb only: no "Reading …" label (Fabo, 10-nov-2026)
}
function guessSection(q) {
  if (/way|vía|via|builder|faster|rápid/i.test(q)) return '“How to Build a WhatsApp Bot”';
  if (/yet|ya\b|approv|aprob|test|prueb/i.test(q)) return '“Who Can Build WhatsApp Bots?”';
  if (/data|datos|sheets|slack|crm/i.test(q)) return '“Export Collected Data: Google Sheets”';
  if (/agent|instruc|knowledge|faq/i.test(q)) return '“How to Build a WhatsApp Bot with Landbot’s AI Agent”';
  if (/case|caso|cita|appoint|book/i.test(q)) return '“Landbot Customers Successfully Using WhatsApp Chatbots”';
  return T.theArticle;
}

/* ---------- sending ---------- */
async function say(text, payload) {
  const q = (text || '').trim(); if (!q) return;
  openPanel(); repliesEl.innerHTML = '';
  thread.querySelectorAll('.awe-nba').forEach((n) => n.remove());
  push(h(`<div class="awe-me">${esc(q)}</div>`));
  if (!payload) followLang(q); readUser(q); setWorking(guessSection(q));
  let out = q, pl = payload;
  if (!st.ctxSent) { st.ctxSent = true; let line = window.lbJourney && window.lbJourney.line ? window.lbJourney.line() : ''; line = line ? line.replace(/\]$/, ' · ' + ctxAdd() + ']') : '[Page context: ' + ctxAdd() + ']'; if (MOBILE) line = line.replace(/\]$/, ' · device mobile]'); if (line) { out = line + '\n\n' + q; } }
  armWatchdog(q);
  try { await deliver(pl ? q : out, pl); }
  catch (e) { setWorking(null); push(h(`<div class="awe-msg"><p>Something went wrong reaching the agent. Try again in a moment.</p></div>`)); console.warn('[awe]', e); }
}

/* ---------- receiving ---------- */
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
  if (m.author_type === 'user') return;
  const ex = m.extra || {}; const bid = String(ex.id || '').replace(/_\d+$/, '');
  if (!st.greeted && m.type === 'dialog' && !ex.is_ai_agent_message) {   // the flow's greeting: the page has its own
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
  if (bid === 'team_email') { emailCard(); return; }
  if (bid === 'team_done') { receipts(); return; }
  if (bid === 'sales_book') { bookCard(); return; }
  if (bid === 'sales_booked') { await agentText(T.bookedMsg); return; }
  if (bid === 'support_route') { supportCard(); return; }
  if (bid === 'team_more') { repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(LANG === 'es' ? 'Sí, una pregunta más' : 'Yes, one more question')}" data-awe-payload="$0">${esc(LANG === 'es' ? 'Sí, una pregunta más' : 'Yes, one more question')}</button>`; return; }
  if (m.type === 'dialog' && (m.buttons || []).length) {
    st.lastBtns = m.buttons;
    const labels = new Set(m.buttons.map((b) => String(b).trim().toLowerCase()));   // the agent also lists its buttons as lines: drop them
    const clean = text.split(/\n/).filter((l) => !labels.has(l.replace(/^[-•*\d.)\s]+/, '').trim().toLowerCase())).join('\n').trim();
    if (clean) { await agentText(clean); st.answers++; }
    repliesEl.innerHTML = m.buttons.map((b, i) => `<button type="button" class="awe-chip" data-awe-say="${esc(b)}">${esc(b)}</button>`).join('');
    if (st.planPending && ex.is_ai_agent_message) { st.planPending = false; planCard(); }
    return;
  }
  if (text) { await agentText(text); st.answers++; decide(text); }
  if (st.planPending && ex.is_ai_agent_message) { st.planPending = false; planCard(); }
}
function md(src) {
  // a bare sign-up URL from the agent (with or without its label) always becomes the labelled link, never a raw URL
  src = src.replace(/(?:\[[^\]]*\]\()?(?:[^\n:]{0,40}?→\s*:?\s*)?(https:\/\/app\.landbot\.io\/sign-?up\/?(?:[^\s)]*[^\s).,;:])?)\)?/g, (_, u) => `[${T.build}](${u})`);
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${tagUrl(u.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/(^|[\s(*])(https?:\/\/[^\s<)*]+)/g, (_, pre, u) => { const clean = u.replace(/[.,;:]+$/, ''), tail = u.slice(clean.length); return `${pre}<a href="${tagUrl(clean.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${clean}</a>${tail}`; })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return src.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${inline(l)}</p>`).join('');
}
function splitSources(text) {
  const src = []; const keep = [];
  for (const line of text.split(/\n/)) { const mm = line.replace(/[*_]/g, '').match(/^\s*(sources?|fuentes?)\s*:\s*(.+)$/i); if (mm) src.push(mm[2]); else keep.push(line); }
  return { body: keep.join('\n').trim(), src: src.join(' · ') };
}
function sourceChips(s) {
  if (!s) return '';
  const chips = []; const seen = new Set();
  for (const part of s.split(/\s*·\s*/)) for (const [id, re, label] of SECTIONS) if (re.test(part) && !seen.has(id)) { seen.add(id); chips.push(`<button type="button" data-awe-point="${id}"><em>${T.fromArticle}</em>${esc(label)}</button>`); break; }
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
const FIELD_LINE = /^\s*[*_`]*\s*(conversation_summary|visitor_journey|channels_wanted|page_lang|arrival_reason|use_case|channel|team_size|monthly_volume|urgency|comparing|country_tier|subsource|source|bot_use_case|wa_number_approved)\s*[*_`]*\s*[:=]/i;
async function agentText(text) {
  text = String(text).split(/\n/).filter((l) => !FIELD_LINE.test(l)).join('\n');   // a field the agent saves must never be shown to the visitor
  const { body, src } = splitSources(text);
  const parts = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && !reduce) { const dots = push(h('<div class="awe-typing" aria-hidden="true"><i></i><i></i><i></i></div>')); await wait(Math.min(1600, 450 + parts[i].length * 14)); dots.remove(); }
    push(h(`<div class="awe-msg">${md(parts[i])}${i === parts.length - 1 ? sourceChips(src) : ''}</div>`));
    if (i === 0) ding();
  }
  readAgent(text);
  for (const part of src.split(/\s*·\s*/)) for (const [id, re] of SECTIONS) if (part && re.test(part) && !st.cited.has(id)) { st.cited.add(id); pointAt(id); return; }
}
function secEl(id) { return document.getElementById(id) || (id === 'tldr' ? document.querySelector('.lb-tldr') : null); }
function pointAt(id) {
  const el = secEl(id); if (!el) return;
  document.querySelectorAll('.awe-point').forEach((n) => n.classList.remove('awe-point'));
  el.dataset.aweLabel = T.pointLabel; el.classList.add('awe-point'); scrim.classList.add('lift');
  if (window.innerWidth > 1180 || !st.open) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  clearTimeout(st._pt); st._pt = setTimeout(() => { el.classList.remove('awe-point'); scrim.classList.remove('lift'); }, 4500);
}

/* ---------- what I've understood (editable) ---------- */
function parseVolume(q) {
  if (!/(conversa|chats?|messag|mensaj|month|mes|users|usuarios|clientes|customers)/i.test(q)) return null;
  const mm = q.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil|thousand)?/i); if (!mm) return null;
  let n = parseFloat(mm[1].replace(/[\s]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')); if (mm[2]) n *= 1000;
  return n >= 50 ? n : null;
}
const USE_RX = [[/faq|pregunta(s)? frecuente|dudas|answer faq|responder faq/i, 'faq'], [/lead|cualific|qualif|captar/i, 'leads'], [/cita|appoint|agend|reserv|schedul|book appointments/i, 'book'], [/survey|encuesta|questionnaire/i, 'survey'], [/support|soporte|atender|atención al cliente|customer service/i, 'support']];
const fact = (k, v) => window.dispatchEvent(new CustomEvent('awe-fact', { detail: { k, v } }));
function readUser(q) {
  const f = st.facts; let changed = false;
  if (st.real) {
    if (st.awaiting === 'num') { const no = /not yet|no\b|todav[ií]a|a[uú]n no|unsure|no s[eé]/i.test(q); const yes = /yes|s[ií]\b|approved|aprobad/i.test(q); if (yes || no) { st.awaiting = null; fact('num', yes && !no); } }
    if (!st.useKey) for (const [re, u] of USE_RX) if (re.test(q)) { fact('use', u); break; }
  }
  if (st.awaiting === 'why' && q.length > 2) { f.why = { v: q.length > 70 ? q.slice(0, 68) + '…' : q }; changed = true; st.awaiting = null; }
  const v = parseVolume(q); if (v) { f.vol = { v }; changed = true; }
  const tools = ['Google Sheets', 'HubSpot', 'Salesforce', 'Slack', 'Zapier', 'Pipedrive'].filter((t) => new RegExp(t.split(' ').pop(), 'i').test(q));
  if (tools.length) { f.tools = { v: tools.join(', ') }; changed = true; }
  if (changed) { renderFacts(); if (st.plan) planCard(); }
}
function readAgent(text) {
  const tail = text.slice(-200);
  st.awaiting = /(what made you|what brought you|what got you|qu[eé] te (ha )?(hecho|llevado|llev[oó]|tra[ií]do|trajo)|por qu[eé] (te )?(est[aá]s|empezaste))/i.test(tail) ? 'why' : /(approved|aprobad)[^?]*\?/i.test(tail) ? 'num' : st.awaiting;
}
const FACT_ORDER = ['why', 'use', 'way', 'num', 'tools', 'vol', 'from'];
function factVal(k, o) { return k === 'vol' ? fmt(o.v) + T.perMo : o.v; }
function renderFacts() {
  const box = panel.querySelector('.awe-facts'), list = panel.querySelector('.awe-facts-list');
  const keys = FACT_ORDER.filter((k) => st.facts[k]);
  box.classList.remove('on'); /* 10-nov (Fabo): the strip stays hidden; facts still feed the plan card and the summary */
  list.innerHTML = keys.map((k) => `<button type="button" class="awe-fact${st.facts[k].guess ? ' guess' : ''}" data-awe-fact="${k}"><i>${esc(T.k[k])}</i>${esc(factVal(k, st.facts[k]))}</button>`).join('');
}
function editFact(btn) {
  const k = btn.dataset.aweFact; const o = st.facts[k]; if (!o) return;
  btn.innerHTML = `<i>${esc(T.k[k])}</i><input value="${esc(k === 'vol' ? String(o.v) : factVal(k, o))}" aria-label="${esc(T.k[k])}">`;
  const inp = btn.querySelector('input'); inp.focus(); inp.select();
  const commit = (sendIt) => {
    const val = inp.value.trim(); if (!val) { renderFacts(); return; }
    st.facts[k] = k === 'vol' ? { v: parseFloat(val) || o.v } : { v: val };
    renderFacts(); if (st.plan) planCard();
    if (sendIt) say(T.msgCorr(T.k[k].toLowerCase(), factVal(k, st.facts[k])));
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') renderFacts(); });
  inp.addEventListener('blur', () => commit(false), { once: true });
}

/* ---------- the advise component: a build plan cut from this guide ---------- */
const STEPS = {
  flow: [['create-test-whatsapp-bot', '1–2', 'Canvas + Collect intent'], ['ask-question', '3', 'Questions (text, number)'], ['conditional-logic', '4', 'Conditions'], ['ask-question-buttons', '5', 'Reply buttons / list'], ['export-google-sheets', '7', 'Google Sheets'], ['human-hand-off', '8–9', 'Human takeover + Slack'], ['test-your-chatbot', '10', 'Test']],
  agent: [['whatsapp-ai-agent', '1', 'Greeting block → AI Agent block'], ['instructions', '2', 'Instructions'], ['knowledge-base', '3', 'Knowledge Base (PDF, text, URL)'], ['store-data', '4', 'Store Data'], ['jump-to', '5', 'Outputs (exit conditions)'], ['test-your-chatbot', '6', 'Test + Publish']]
};
const STEPS_ES = { 'Canvas + Collect intent': 'Canvas + Collect intent', 'Questions (text, number)': 'Preguntas (texto, número)', 'Conditions': 'Condiciones', 'Reply buttons / list': 'Botones / lista', 'Human takeover + Slack': 'Human takeover + Slack', 'Test': 'Probar', 'Greeting block → AI Agent block': 'Bloque de saludo → bloque AI Agent', 'Knowledge Base (PDF, text, URL)': 'Knowledge Base (PDF, texto, URL)', 'Test + Publish': 'Probar + Publicar', 'Outputs (exit conditions)': 'Outputs (condiciones de salida)' };
const SKIP = { faq: { en: 'Conditions, Media and the Sheets export', es: 'Condiciones, Media y la exportación a Sheets' }, leads: { en: 'Conditions and Media', es: 'Condiciones y Media' }, book: { en: 'Conditions and Media', es: 'Condiciones y Media' }, survey: { en: 'Human takeover, if nobody answers live', es: 'Human takeover, si nadie atiende en vivo' }, support: { en: 'Media and the age condition', es: 'Media y la condición de edad' } };
let planEl = null;
function planCard() {
  if (!st.useKey) return;
  const way = WAY[st.useKey]; st.plan = way;
  const tr = (s) => (LANG === 'es' ? STEPS_ES[s] || s : s);
  let steps = STEPS[way];
  if (way === 'agent' && st.useKey !== 'faq') steps = steps.concat([['export-google-sheets', '+', st.facts.tools ? st.facts.tools.v : 'Google Sheets']]);
  const html = `<div class="awe-card awe-est"><span class="awe-tag">${esc(T.planH)}</span>
    <div class="awe-sub" style="margin-top:2px">${esc(T.planSub(T.planWay[way]))}</div>
    <ol style="margin:10px 0 0;padding:0;list-style:none;display:grid;gap:6px">${steps.map(([id, n, l]) => `<li><button type="button" data-awe-point="${id}" style="all:unset;cursor:pointer;display:flex;gap:10px;align-items:center;font:500 14px/1.35 'DM Sans';color:var(--awe-ink)"><span style="flex-shrink:0;min-width:30px;height:22px;border-radius:6px;background:var(--awe-soft);color:var(--awe-p7);font:700 11px/22px 'DM Sans';text-align:center">${esc(n)}</span>${esc(tr(l))}</button></li>`).join('')}</ol>
    <div class="awe-why"><b>${esc(T.skip)}:</b> ${esc(SKIP[st.useKey][LANG] || SKIP[st.useKey].en)}${st.numOk === false ? '<br>' + esc(T.planNoNum) : ''}</div></div>`;
  const card = h(html);
  if (planEl && planEl.isConnected) planEl.replaceWith(card); else push(card);
  planEl = card; morphPage();
}
function decide(lastText) {
  if (st.teamDone || /\?\s*$/.test((lastText || '').trim()) || st.awaiting === 'why') return;
  const f = st.facts; let n = null;
  if (f.vol && f.vol.v >= 5000) n = { k: 'team-vol', p: 'team', s: 'build', why: T.whyTeamVol(fmt(f.vol.v)) };
  else if (st.plan) n = { k: 'build', p: 'build', s: 'team', why: st.numOk === false ? T.whyBuildNo : T.whyBuild };
  else if (st.answers >= 1) n = { k: 'plan', p: 'plan', s: 'team', why: T.whyPlan };
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
/* Calendly's "anything that will help prepare" is seen and edited by the visitor: only what they told us, readable. Nothing internal (guessed country, visits, journey). */
function prepNote() {
  const f = st.facts, P = [];
  if (f.why) P.push(T.k.why + ': ' + f.why.v);
  const facts = FACT_ORDER.filter((k) => f[k] && !f[k].guess && !['why', 'from', 'email', 'country'].includes(k)).map((k) => T.k[k] + ': ' + factVal(k, f[k]));
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
  st.lastBtns = ['$0', '$1'];
  repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.mailInstead)}" data-awe-payload="$1">${esc(T.mailInstead)}</button>`;
}
function calUrl() {
  const q = new URLSearchParams({ embed_type: 'Inline', embed_domain: location.hostname || 'landbot.io', hide_gdpr_banner: '1', hide_event_type_details: '1', hide_landing_page_details: '1', primary_color: '5a60f6', text_color: '1b2139', utm_medium: 'conversion_agent', utm_campaign: 'create_wa_bot', utm_content: ENTRY.sales });
  if (realSource()) q.set('utm_source', realSource());
  if (st.facts.email) q.set('email', st.facts.email.v);
  /* the Calendly event asks a1 = WhatsApp phone (required, left to the visitor) and a2 = "anything that will help prepare" (required): the summary goes in a2 */
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
  st.lastBtns = ['$0'];
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

/* ---------- the page adapts: the sidebar demo card speaks to this visitor ---------- */
const CTA_TXT = 'Want to qualify more leads and book 10X more appointments with AI?';
function morphPage() {
  if (!st.useKey) return;
  const line = T.morph(USE_LABEL()[st.useKey].toLowerCase(), T.planWay[WAY[st.useKey]]);
  document.querySelectorAll('p.demo-cta').forEach((el) => {
    if (el.textContent.trim() !== CTA_TXT && !el.dataset.aweMorph) return;
    if (el.textContent === line) return;
    el.dataset.aweMorph = '1'; el.classList.add('awe-morph', 'out');
    setTimeout(() => { el.textContent = line; el.classList.remove('out'); }, 300);
  });
}

/* ---------- the bar: section-aware outcome ---------- */
const NUDGE_OF = { tldr: 'tldr', 'whatsapp-bot': 'tldr', 'build-whatsapp-bots': 'who', 'create-test-whatsapp-bot': 'flow', 'export-google-sheets': 'data', 'human-hand-off': 'data', 'test-your-chatbot': 'test', 'whatsapp-ai-agent': 'agent', 'landbot-case-studies': 'cases', faqs: 'faq' };
const ORDER = Object.keys(NUDGE_OF);
function setNudge(label, prompt) {
  if (window.innerWidth < 560) label = label.split(' · ')[0];
  if (launchInput.dataset.prompt === prompt && launchInput.placeholder === label) return;
  pill.classList.add('swap');
  setTimeout(() => { launchInput.placeholder = label; launchInput.setAttribute('aria-label', label); launchInput.dataset.prompt = prompt; pill.classList.remove('swap'); }, 200);
}
function syncLaunch() {
  launch.classList.toggle('off', st.open);
  if (!st.open && !launch.classList.contains('tuck')) emit('entry_point_view', ENTRY.sales);   // real impression of the sticky bar, once
  let active = ORDER[0];
  for (const id of ORDER) { const el = secEl(id); const r = el && el.getBoundingClientRect(); if (r && r.height > 0 && r.top < window.innerHeight * 0.45) active = id; }
  if (active !== st.section) { st.section = active; const [l, p] = T.nudge[NUDGE_OF[active]]; setNudge(l, p); }
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
  const chip = t.closest('[data-awe-say]'); if (chip) { say(chip.dataset.aweSay, chip.dataset.awePayload || undefined); keepFocus(); return; }
  const cal = t.closest('[data-awe-cal]'); if (cal) { openCal(cal); return; }
  const p = t.closest('[data-awe-point]'); if (p) { pointAt(p.dataset.awePoint); return; }
  const a = t.closest('[data-awe-act]'); if (a) { act(a.dataset.aweAct); return; }
  const fct = t.closest('[data-awe-fact]'); if (fct && !fct.querySelector('input')) { editFact(fct); return; }
  if (t.closest('[data-awe-retry]')) { retryLast(); return; }
  if (t.closest('[data-awe-close]')) { closePanel(); return; }
  if (t.closest('[data-awe-open]')) { if (launchInput.value.trim()) { const v = launchInput.value; launchInput.value = ''; say(v); } else { openPanel(); panel.querySelector('.awe-foot input').focus(); } return; }
});
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
