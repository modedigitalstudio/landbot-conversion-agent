/* Landbot Conversion Agent · WhatsApp API cost posts (EN/ES/PT-BR) · built 2026-11-20 */
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

(() => { if (document.getElementById('awe-style')) return; const s = document.createElement('style'); s.id = 'awe-style'; s.textContent = "\n  :root{--awe-grad:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);--awe-ink:#1B2139;--awe-text:#3A3D5C;--awe-mut:#5D6079;--awe-line:#E5E6EA;--awe-soft:#F4F4FF;--awe-p:#5A60F6;--awe-p7:#4047C4}\n  .awe-orb{flex-shrink:0;width:34px;height:34px;border-radius:50%;position:relative;\n    background:conic-gradient(from 0deg,#5A60F6,#4FCCC2,#F58B0B,#FF3F7B,#5A60F6);animation:awe-spin 7s linear infinite}\n  .awe-orb::after{content:\"\";position:absolute;inset:22%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.9),rgba(255,255,255,.15) 60%,transparent 70%)}\n  .awe-orb.sm{width:24px;height:24px}\n  .awe-orb.work{animation-duration:1.4s}\n  @keyframes awe-spin{to{transform:rotate(360deg)}}\n\n  .awe-compose{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 16px;border-radius:14px;border:1px solid var(--awe-line);background:#fff;transition:border-color .2s,box-shadow .2s}\n  .awe-compose:focus-within{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-compose input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 15px/1.4 'DM Sans';color:var(--awe-ink);padding:8px 0}\n  .awe-compose input::placeholder{color:#9596A7}\n  .awe-send{all:unset;cursor:pointer;width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--awe-grad);color:#fff;font:700 16px/1 'DM Sans'}\n  .awe-chips{display:flex;flex-wrap:wrap;gap:8px}\n  .awe-chip{all:unset;cursor:pointer;padding:7px 13px;border-radius:999px;border:1px solid #CFD1FE;background:#fff;color:var(--awe-p7);font:500 13.5px/1.2 'DM Sans';transition:background .15s,border-color .15s}\n  .awe-chip:hover{background:var(--awe-soft);border-color:var(--awe-p)}\n  .awe-chip:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.35)}\n\n  /* Lava orb (from the orb widget example) */\n  .awe-lava{display:block;position:relative;flex-shrink:0;width:56px;height:56px;border-radius:50%;cursor:pointer}\n  .awe-lava svg{position:absolute;inset:0;width:100%;height:100%;animation:awe-breathe 9s ease-in-out infinite}\n  .awe-lava .g1{animation:awe-mb1 5.2s ease-in-out infinite}.awe-lava .g2{animation:awe-mb2 6s ease-in-out infinite}\n  .awe-lava .g3{animation:awe-mb3 4.6s ease-in-out infinite}.awe-lava .g4{animation:awe-mb4 5.6s ease-in-out infinite}\n  .awe-lava .g5{animation:awe-mb5 4s ease-in-out infinite}\n  .awe-lava.sm{width:30px;height:30px;cursor:default}\n  .awe-lava.work svg{animation-duration:1.6s}\n  @keyframes awe-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}\n  @keyframes awe-mb1{0%,100%{transform:translate(0,0)}33%{transform:translate(64px,38px)}66%{transform:translate(-30px,52px)}}\n  @keyframes awe-mb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-58px,56px)}66%{transform:translate(48px,-26px)}}\n  @keyframes awe-mb3{0%,100%{transform:translate(0,0)}33%{transform:translate(48px,-56px)}66%{transform:translate(-52px,-18px)}}\n  @keyframes awe-mb4{0%,100%{transform:translate(0,0)}33%{transform:translate(-66px,-36px)}66%{transform:translate(40px,44px)}}\n  @keyframes awe-mb5{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,68px)}66%{transform:translate(-44px,28px)}}\n\n  /* Launcher: a compact bar, bottom centre \u2014 reads as a page tool, not a support widget in the corner */\n  #awe-launch{position:fixed;left:50%;bottom:20px;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateX(-50%);\n    transition:opacity .3s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-launch.off{opacity:0;transform:translate(-50%,16px);pointer-events:none}\n  #awe-launch.tuck{opacity:0;transform:translate(-50%,28px);pointer-events:none}   /* out of the way while the visitor scrolls down to read */\n  /* LED border: a thin light in the brand colours travels round the bar (no glow \u2014 keep it subtle) */\n  @property --awe-ang{syntax:'<angle>';inherits:false;initial-value:0deg}\n  .awe-pill{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;padding:4px 4px 4px 4px;border-radius:999px;width:420px;max-width:calc(100vw - 32px);\n    --awe-led:conic-gradient(from var(--awe-ang),rgba(90,96,246,.3) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.3) 210deg,rgba(90,96,246,.3) 360deg);\n    border:1.5px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--awe-led) border-box;\n    box-shadow:0 22px 50px -24px rgba(51,64,94,.45);animation:awe-led 3.6s linear infinite;transition:width .45s cubic-bezier(.21,.78,.36,1),box-shadow .25s}\n  @keyframes awe-led{to{--awe-ang:360deg}}\n  #awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:500px;animation-duration:2.2s}\n  /* LED line on page cards (the sidebar CTA): same travelling light as the bar, drawn as a masked ring so the card keeps its own background */\n  .awe-led-card{position:relative;isolation:isolate}\n  .awe-led-card::before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;\n    background:conic-gradient(from var(--awe-ang),rgba(255,255,255,.14) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(255,255,255,.14) 210deg,rgba(255,255,255,.14) 360deg);\n    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:awe-led 5s linear infinite}\n  .awe-led-card.light::before{background:conic-gradient(from var(--awe-ang),rgba(90,96,246,.25) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.25) 210deg,rgba(90,96,246,.25) 360deg)}\n  .awe-pill-send{all:unset;cursor:pointer;flex-shrink:0;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;\n    background:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);box-shadow:0 10px 22px -8px rgba(90,96,246,.6);transition:transform .2s,box-shadow .2s}\n  .awe-pill-send svg{width:18px;height:18px}\n  .awe-pill-send:hover{transform:scale(1.08);box-shadow:0 14px 26px -8px rgba(90,96,246,.72)}\n  .awe-pill-send:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-pill input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 14.5px 'DM Sans';color:var(--awe-ink);padding:10px 0}\n  .awe-pill input::placeholder{color:var(--awe-mut);transition:opacity .25s}\n  .awe-pill.swap input::placeholder{opacity:0}\n  #awe-launch .awe-chips{margin:0;justify-content:center;max-width:500px;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .25s,transform .25s}\n  #awe-launch:focus-within .awe-chips,#awe-launch.wide .awe-chips,#awe-launch .awe-chips.is-pressing{opacity:1;transform:none;pointer-events:auto}\n  #awe-launch .awe-chip{background:rgba(255,255,255,.92);box-shadow:0 8px 20px -12px rgba(51,64,94,.35)}\n\n  /* Unread badge on the closed launcher: a reply arrived while the layer was shut */\n  [data-awe-open]{position:relative}\n  .awe-badge{position:absolute;top:-4px;left:-4px;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:#E6194B;color:#fff;\n    font:700 11px/18px 'DM Sans';text-align:center;box-shadow:0 0 0 2px #fff;transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1);pointer-events:none}\n  .awe-badge.on{transform:scale(1)}\n  .awe-badge.bump{animation:awe-bump .45s ease}\n  @keyframes awe-bump{40%{transform:scale(1.3)}}\n  /* Scrim: dims the page while the layer is open so open vs closed reads at a glance */\n  #awe-scrim{position:fixed;inset:0;z-index:8999;background:rgba(16,20,36,.42);opacity:0;pointer-events:none;transition:opacity .3s ease}\n  #awe-scrim.on{opacity:1;pointer-events:auto}\n  #awe-scrim.on.lift{opacity:.25}\n  /* The layer: a panel that works next to the article */\n  #awe-panel{position:fixed;top:88px;right:24px;bottom:24px;width:440px;z-index:9001;display:flex;flex-direction:column;background:#fff;border-radius:22px;\n    border:1px solid var(--awe-line);box-shadow:0 4px 4px rgba(51,64,94,.06),0 16px 32px rgba(51,64,94,.1),0 32px 64px rgba(51,64,94,.1);overflow:hidden;\n    opacity:0;transform:translateX(28px);pointer-events:none;transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-panel.on{opacity:1;transform:none;pointer-events:auto}\n  /* desktop: the layer opens out of the bar, centred above it */\n  #awe-panel{top:auto;left:50%;right:auto;bottom:20px;width:540px;height:min(680px,calc(100vh - 108px));transform:translate(-50%,28px) scale(.98);transform-origin:50% 100%}\n  #awe-panel.on{transform:translate(-50%,0)}\n  #awe-panel{transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1),width .35s cubic-bezier(.2,.8,.2,1)}\n  #awe-panel.wide{width:min(720px,calc(100vw - 48px))}\n  .awe-cal{margin:10px -6px 0;border-radius:12px;overflow:hidden;border:1px solid var(--awe-line);background:#fff}\n  .awe-cal{position:relative}\n  .awe-cal::before{content:attr(data-loading);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  /* shown at 80%: the iframe is laid out 25% larger and scaled down, so Calendly keeps its layout and the card stays small */\n  .awe-cal{height:432px}\n  .awe-cal iframe{position:relative;display:block;width:125%;height:540px;border:0;opacity:0;transition:opacity .3s;transform:scale(.8);transform-origin:0 0}\n  .awe-cal.ready iframe{opacity:1}\n  /* booking: the layer grows to the screen and the calendar fills the visible thread, so it's seen whole with no scroll (sales feedback, 4-nov-2026) */\n  #awe-panel{transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1),width .35s cubic-bezier(.2,.8,.2,1),height .35s cubic-bezier(.2,.8,.2,1)}\n  #awe-panel.booking{height:calc(100vh - 40px)}\n  /* booking: room to spare, so Calendly at its real size (no .8 shrink) and the day picker fills the layer */\n  #awe-panel.booking .awe-cal iframe{width:100%;transform:none}\n  #awe-panel.booking .awe-thread{scrollbar-width:none}\n  #awe-panel.booking .awe-thread::-webkit-scrollbar{display:none}\n  /* details step: the form runs past the screen, so the thread scrolls and shows its scrollbar again */\n  #awe-panel.booking.caldetails .awe-thread{scrollbar-width:thin}\n  #awe-panel.booking.caldetails .awe-thread::-webkit-scrollbar{display:block}\n  .awe-head{display:flex;align-items:center;gap:12px;padding:14px 14px 12px 16px;border-bottom:1px solid #F7F7F8}\n  .awe-head-t{flex:1;min-width:0}\n  .awe-head-t b{display:block;font:700 15px/1.3 'DM Sans';color:var(--awe-ink)}\n  .awe-status{display:flex;align-items:center;gap:6px;font:500 12px/1.3 'DM Sans';color:var(--awe-mut)}\n  .awe-status::before{content:\"\";width:6px;height:6px;border-radius:50%;background:#52CC57;flex-shrink:0}\n  .awe-status.work::before{background:#F59E0B;animation:awe-pulse 1s ease-in-out infinite}\n  @keyframes awe-pulse{50%{opacity:.3}}\n  .awe-x{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;color:var(--awe-mut);font-size:15px}\n  .awe-x:hover{background:#F7F7F8}.awe-x:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n\n  .awe-facts{display:none;padding:10px 16px 12px;border-bottom:1px solid #F7F7F8;background:linear-gradient(180deg,#FAFAFF,#fff)}\n  .awe-facts.on{display:block;animation:awe-in .4s cubic-bezier(0,0,.2,1)}\n  .awe-facts-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;font:700 10.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--awe-p7)}\n  .awe-facts-h span{font:400 11px 'DM Sans';letter-spacing:0;text-transform:none;color:#9596A7}\n  .awe-facts-list{display:flex;flex-wrap:wrap;gap:6px}\n  .awe-fact{all:unset;cursor:text;display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:8px;background:#fff;border:1px solid var(--awe-line);font:500 12.5px/1.2 'DM Sans';color:var(--awe-ink);animation:awe-in .35s}\n  .awe-fact i{font-style:normal;color:#9596A7;font-size:11.5px}\n  .awe-fact.guess{border-style:dashed}\n  .awe-fact:hover{border-color:#CFD1FE}\n  .awe-fact input{all:unset;width:110px;font:500 12.5px 'DM Sans';color:var(--awe-ink)}\n\n  .awe-thread{flex:1;overflow-y:auto;padding:16px 18px 8px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}\n  .awe-msg{font:400 14.5px/1.6 'DM Sans';color:var(--awe-text);animation:awe-in .35s cubic-bezier(0,0,.2,1)}\n  /* chat bubbles: the agent's side reads like a conversation, not a document */\n  .awe-msg{align-self:flex-start;max-width:88%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:#F4F5F9;line-height:1.5}\n  .awe-thread .awe-msg + .awe-msg{margin-top:-8px}\n  .awe-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;border-radius:16px 16px 16px 4px;background:#F4F5F9;animation:awe-in .2s}\n  .awe-typing i{width:6px;height:6px;border-radius:50%;background:#9596A7;animation:awe-dot 1s ease-in-out infinite}\n  .awe-typing i:nth-child(2){animation-delay:.15s}.awe-typing i:nth-child(3){animation-delay:.3s}\n  @keyframes awe-dot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}\n  .awe-msg p{margin:0 0 8px}.awe-msg p:last-child{margin:0}\n  .awe-msg ul,.awe-msg ol{margin:4px 0 8px;padding-left:20px}.awe-msg li{margin:2px 0}\n  .awe-msg b,.awe-msg strong{color:var(--awe-ink)}\n  .awe-msg a{color:var(--awe-p);font-weight:700;text-decoration:none;border-bottom:1.5px solid #CFD1FE}\n  .awe-msg a:hover{border-color:var(--awe-p)}\n  .awe-me{align-self:flex-end;max-width:85%;padding:8px 13px;border-radius:16px 16px 4px 16px;background:var(--awe-p);color:#fff;font:500 14px/1.45 'DM Sans';animation:awe-in .25s}\n  @keyframes awe-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n  .awe-src{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n  .awe-src a,.awe-src button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:7px;background:#F7F7F8;font:500 11.5px/1.3 'DM Sans';color:var(--awe-mut);border:1px solid transparent}\n  .awe-src a:hover,.awe-src button:hover{border-color:var(--awe-line);color:var(--awe-ink)}\n  .awe-src em{font-style:normal;font:700 9.5px 'DM Mono',monospace;letter-spacing:.06em;color:var(--awe-p7)}\n  .awe-working{display:flex;align-items:center;gap:10px;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  .awe-working span{background:linear-gradient(90deg,#9596A7,#5A60F6,#9596A7);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:awe-sh 1.6s linear infinite}\n  @keyframes awe-sh{to{background-position:-200% 0}}\n\n  .awe-card{border:1px solid var(--awe-line);border-radius:16px;padding:14px 14px 12px;background:#fff;box-shadow:0 2px 8px rgba(51,64,94,.05);animation:awe-in .45s cubic-bezier(0,0,.2,1)}\n  .awe-tag{display:inline-block;font:700 9.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:4px 6px;border-radius:5px;background:#EBECFF;color:var(--awe-p7);margin-bottom:8px}\n  .awe-tag.act{background:#DEF6DF;color:#1B6B1F}\n  .awe-big{font:700 30px/1.1 'DM Sans';letter-spacing:-.02em;color:var(--awe-ink)}\n  .awe-big small{font:500 14px 'DM Sans';color:var(--awe-mut);letter-spacing:0}\n  .awe-sub{font:400 13px/1.5 'DM Sans';color:var(--awe-mut);margin-top:4px}\n  .awe-range{width:100%;margin:12px 0 2px;accent-color:#5A60F6}\n  .awe-rangelab{display:flex;justify-content:space-between;font:500 11px 'DM Mono',monospace;color:#9596A7}\n  .awe-why{margin-top:10px;padding:8px 10px;border-radius:10px;background:#FAFAFF;font:400 12.5px/1.5 'DM Sans';color:var(--awe-mut)}\n  .awe-why b{color:var(--awe-p7)}\n  .awe-cta{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--awe-ink);color:#fff;font:700 14.5px 'DM Sans';transition:transform .15s,box-shadow .15s}\n  .awe-cta:hover{transform:translateY(-1px);box-shadow:0 10px 22px -10px rgba(27,33,57,.6)}\n  .awe-cta:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-alt{display:flex;gap:6px;align-items:center;justify-content:center;margin-top:8px;font:400 12.5px 'DM Sans';color:#9596A7}\n  .awe-alt button,.awe-alt a{all:unset;cursor:pointer;color:var(--awe-p7);font-weight:700}\n  .awe-alt button:hover,.awe-alt a:hover{text-decoration:underline}\n  .awe-field{display:flex;gap:8px;margin-top:10px}\n  .awe-field input{flex:1;min-width:0;border:1px solid var(--awe-line);border-radius:10px;padding:11px 12px;font:500 14px 'DM Sans';color:var(--awe-ink);outline:0}\n  /* iOS zooms the page when an input under 16px gets focus: 16px on touch screens */\n  @media (pointer:coarse){.awe-pill input,.awe-compose input,.awe-field input,.awe-fact input{font-size:16px!important}}\n  .awe-field input:focus{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-field input[aria-invalid=true]{border-color:#FF3F7B}\n  .awe-field button{all:unset;cursor:pointer;padding:0 14px;border-radius:10px;background:var(--awe-grad);color:#fff;font:700 13.5px 'DM Sans'}\n  .awe-receipt{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-top:1px dashed var(--awe-line);font:400 13px/1.45 'DM Sans';color:var(--awe-text);opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s}\n  .awe-receipt:first-of-type{border-top:0}\n  .awe-receipt.on{opacity:1;transform:none}\n  .awe-receipt .ok{flex-shrink:0;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#52CC57;color:#fff;font:700 11px 'DM Sans';margin-top:1px}\n  .awe-receipt small{display:block;font:500 11px 'DM Mono',monospace;color:#9596A7}\n\n  .awe-foot{border-top:1px solid #F7F7F8;padding:10px 12px 8px}\n  .awe-foot .awe-compose{margin:0}\n  .awe-foot p{margin:7px 2px 0;font:400 11px/1.4 'DM Sans';color:#9596A7;text-align:center}\n  .awe-foot .awe-chips{margin:0 0 8px}\n\n  /* pointAt(): the agent lights up the part of the article it is reading */\n  .awe-point{position:relative;border-radius:12px;box-shadow:0 0 0 3px rgba(90,96,246,.35),0 0 0 10px rgba(90,96,246,.08);transition:box-shadow .4s}\n  .awe-point::before{content:attr(data-awe-label);position:absolute;top:-12px;left:12px;z-index:2;padding:3px 8px;border-radius:6px;background:var(--awe-p);color:#fff;font:700 10.5px/1.4 'DM Sans';white-space:nowrap}\n  .awe-morph{transition:opacity .3s}\n  .awe-morph.out{opacity:0}\n\n  @media (max-width:900px){\n    #awe-panel{top:auto;left:0;right:0;bottom:0;width:auto;height:90vh;border-radius:22px 22px 0 0;transform:translateY(40px)}\n    #awe-panel.on{transform:none}\n    #awe-panel.wide{width:auto}\n    #awe-panel.booking{height:calc(100vh - 8px);height:calc(100dvh - 8px)}\n    #awe-launch{left:16px;right:16px;bottom:12px;transform:none;align-items:stretch}\n    #awe-launch.off{transform:translateY(16px)}\n    #awe-launch.tuck{transform:translateY(28px)}\n    .awe-pill,#awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:auto;max-width:none}\n    #awe-launch .awe-chips{max-width:none}\n  }\n  @media (prefers-reduced-motion:reduce){.awe-pill,.awe-led-card::before{animation:none}.awe-orb{animation:none}#awe-launch,#awe-panel,#awe-scrim,.awe-badge,.awe-msg,.awe-card{transition:none;animation:none}.awe-lava svg,.awe-lava circle{animation:none!important}}\n  /* What the team will see: the handoff summary under a receipt */\n  .awe-sees{margin-top:10px;border-top:1px dashed var(--awe-line);padding-top:8px;font:400 12.5px/1.55 'DM Sans';color:var(--awe-mut)}\n  .awe-sees summary{cursor:pointer;list-style:none;font:700 10.5px/1.4 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--awe-p7);margin-bottom:4px}\n  .awe-sees summary::-webkit-details-marker{display:none}\n  .awe-sees div{padding:2px 0;word-break:break-word}\n  /* AI agent template card + live preview inside the chat (10-nov-2026) */\n  .awe-tpl-row{display:flex;gap:12px;align-items:flex-start}\n  .awe-tpl-info{flex:1;min-width:0}\n  .awe-tpl-info .awe-why{margin-top:8px}\n  .awe-tpl-shot{all:unset;box-sizing:border-box;cursor:pointer;position:relative;flex:0 0 96px;width:96px;aspect-ratio:520/1124;border-radius:12px;overflow:hidden;background:#F2F3FA;border:1px solid var(--awe-line);box-shadow:0 8px 18px -12px rgba(27,33,57,.45)}\n  .awe-tpl-shot[hidden]{display:none}\n  .awe-tpl-shot img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .35s cubic-bezier(0,0,.2,1)}\n  .awe-tpl-shot:hover img{transform:scale(1.04)}\n  .awe-tpl-shot span{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(27,33,57,.82);color:#fff;font:700 13px/1 'DM Sans';box-shadow:0 6px 16px -6px rgba(0,0,0,.5);transition:transform .2s}\n  .awe-tpl-shot:hover span{transform:scale(1.08)}\n  .awe-tpl-shot:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-tpl-t{font:700 15.5px/1.3 'DM Sans';color:var(--awe-ink)}\n  .awe-tpl-info .awe-sub{margin-top:3px}\n  .awe-tpl-f{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}\n  .awe-tpl-f a.awe-chip{text-decoration:none}\n  .awe-tpl-live{position:relative;margin:10px -6px 0;border-radius:12px;overflow:hidden;border:1px solid var(--awe-line);background:#fff;height:520px}\n  .awe-tpl-live::before{content:attr(data-loading);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  .awe-tpl-live iframe{position:relative;display:block;width:100%;height:100%;border:0;opacity:0;transition:opacity .3s}\n  .awe-tpl-live.ready iframe{opacity:1}\n  @media (prefers-reduced-motion:reduce){.awe-tpl-shot img{transition:none}}\n  /* \"More below \u2193\" pointer (10-nov-2026) */\n  .awe-down{all:unset;box-sizing:border-box;cursor:pointer;position:absolute;left:50%;transform:translateX(-50%);z-index:3;padding:7px 12px;border-radius:999px;background:var(--awe-ink);color:#fff;font:700 12.5px/1 'DM Sans';box-shadow:0 8px 20px -8px rgba(27,33,57,.6);animation:awe-in .3s cubic-bezier(0,0,.2,1)}\n  .awe-down[hidden]{display:none}\n  #awe-panel > .awe-down{position:absolute}\n  .awe-down:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  /* template strip under the prompt card (10-nov-2026) */\n  .awe-tplrow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}\n  .awe-tplmini{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:6px;min-width:0;font:600 12px/1.25 'DM Sans';color:var(--awe-ink)}\n  .awe-tplmini img{display:block;width:100%;aspect-ratio:520/640;object-fit:cover;object-position:top center;border-radius:10px;border:1px solid var(--awe-line);background:#F2F3FA;transition:transform .25s cubic-bezier(0,0,.2,1)}\n  .awe-tplmini:hover img{transform:translateY(-2px)}\n  .awe-tplmini b{font-weight:600;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}\n  .awe-tplmini:focus-visible{outline:2px solid rgba(90,96,246,.6);outline-offset:2px;border-radius:10px}\n  /* phone mockup for templates (10-nov-2026): dark bezel, rounded screen, a small speaker notch */\n  .awe-phone{position:relative;display:block;box-sizing:border-box;aspect-ratio:520/1000;padding:5px;border-radius:18px;background:#0F1222;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 14px 28px -14px rgba(0,0,0,.6);overflow:hidden}\n  .awe-phone::before{content:\"\";position:absolute;top:8px;left:50%;width:30%;height:5px;margin-left:-15%;border-radius:4px;background:#0F1222;z-index:2}\n  .awe-phone img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center;border-radius:13px;background:#fff}\n  a.awe-tpl-shot.awe-phone{flex:0 0 104px;width:104px;border:0;padding:5px;background:#0F1222;text-decoration:none}\n  a.awe-tpl-shot.awe-phone img{border-radius:13px}\n  a.awe-tpl-shot.awe-phone span{width:30px;height:30px;margin:-15px 0 0 -15px;font-size:14px;opacity:0;transition:opacity .2s}\n  a.awe-tpl-shot.awe-phone:hover span,a.awe-tpl-shot.awe-phone:focus-visible span{opacity:1}\n  a.awe-tplmini{text-decoration:none}\n  .awe-tplmini .awe-phone{width:100%;transition:transform .25s cubic-bezier(0,0,.2,1)}\n  .awe-tplmini:hover .awe-phone{transform:translateY(-3px)}\n  .awe-tplmini .awe-phone img{aspect-ratio:auto;border:0}\n  /* blog post card (10-nov-2026) */\n  a.awe-blog{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit;padding:10px;transition:transform .2s cubic-bezier(0,0,.2,1)}\n  a.awe-blog:hover{transform:translateY(-2px)}\n  .awe-blog img{flex:0 0 132px;width:132px;aspect-ratio:1200/630;object-fit:cover;border-radius:10px;background:#F2F3FA}\n  .awe-blog-b{min-width:0;flex:1}\n  .awe-blog-b .awe-tag{margin-bottom:6px}\n  .awe-blog-t{font:700 14.5px/1.3 'DM Sans';color:var(--awe-ink)}\n  .awe-blog-b .awe-sub{font-size:12.5px;margin-top:3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}\n  .awe-blog-go{display:inline-block;margin-top:6px;font:700 12.5px 'DM Sans';color:var(--awe-p7)}\n  @media (max-width:420px){a.awe-blog{flex-direction:column;align-items:stretch}.awe-blog img{width:100%;flex-basis:auto}}\n"; document.head.appendChild(s); })();

/* ---------------------------------------------------------------------------
   Agentic Web Experience · lb-awe: reduce-whatsapp-api-costs
   ONE agent for the three versions of "WhatsApp API Cost: Keep the Chat, Change Where It Happens"
   (EN /blog/reduce-whatsapp-api-costs, ES /es/blog/reduce-whatsapp-api-costs, PT /pt-br/blog/reduce-whatsapp-api-costs).
   It opens in the post's language and then follows the language the visitor writes in.
   Back: the real bot "Reduce WhatsApp API Costs Conversion Agent 11-16" (1d576aec…, channel 3556830,
   AI agent 03a15f51…, brand Landbot Sales) run headless via Landbot.Core.
   Front derived from Blog 4 (bf-statistics/awe-bfst-script.html) by make_script.py, 16-nov-2026:
   Stay-or-Move Test → plan card, [[SAVE:n]] → savings card, the page's savings calculator feeds the bar.
--------------------------------------------------------------------------- */
try {
if (window.__aweRwac) throw new Error('loaded twice'); window.__aweRwac = 1;
const CONFIG_URL = 'https://storage.googleapis.com/landbot.pro/v3/H-3556830-3JDGU9H6DSVZ0HBF/index.json';
const SDK_URL = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
/* Sales Entry Points convention: {surface}-{location}[-{section}]-{intent}; one id for the three language URLs (language never goes in the id; page_lang carries it) */
const ENTRY = { source: 'web', sales: 'web-blog-reduce-whatsapp-api-costs-sticky-sales', signup: 'web-blog-reduce-whatsapp-api-costs-sticky-signup' };
const CAMPAIGN = 'reduce_whatsapp_api_costs';
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
  const key = name + ':' + id; if (sent[key]) return; sent[key] = 1;
  const p = Object.assign({ entry_point_id: id, entry_point_type: 'sticky / flotante', page_path: location.pathname, page_lang: PAGE_LANG0 }, extra || {});
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); } catch (_) {}
  try { if (typeof window.gtag === 'function') window.gtag('event', name, p); } catch (_) {}
}
const SIGNUP = `https://app.landbot.io/sign-up/?utm_medium=conversion_agent&utm_campaign=${CAMPAIGN}&utm_content=${ENTRY.signup}`;
const TEMPLATES = 'https://landbot.io/ai-agent-templates';
/* the agent cites these names; ids are the article's anchors */
const SECTIONS = [
  ['tldr', /tl;?dr/i, { en: 'TL;DR', es: 'TL;DR', pt: 'TL;DR' }],
  ['why', /more expensive|got more|pricier/i, { en: 'Why it got more expensive', es: 'Por qué sale más caro', pt: 'Por que ficou mais caro' }],
  ['which', /which flows/i, { en: 'Which flows need WhatsApp', es: 'Qué flujos necesitan WhatsApp', pt: 'Quais fluxos precisam do WhatsApp' }],
  ['two-ways', /two ways/i, { en: 'Two ways to move', es: 'Dos formas de moverla', pt: 'Duas formas de mover' }],
  ['savings', /worked example/i, { en: 'Worked example', es: 'Ejemplo con números', pt: 'Exemplo com números' }],
  ['calc', /calculator/i, { en: 'Savings calculator', es: 'Calculadora de ahorro', pt: 'Calculadora de economia' }],
  ['test', /stay[- ]or[- ]move|\btest\b/i, { en: 'Stay-or-Move Test', es: 'Test quedarse o mudarse', pt: 'Teste fica ou muda' }],
  ['move', /move without|without losing/i, { en: 'Move without losing customers', es: 'Mover sin perder clientes', pt: 'Mover sem perder clientes' }],
  ['plan', /the plan|\bplan\b/i, { en: 'The four-week plan', es: 'El plan de cuatro semanas', pt: 'O plano de quatro semanas' }],
  ['faq', /\bfaqs?\b/i, { en: 'FAQ', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes' }]
];
const DICT = {
  en: { rec: 'You’re reading <b>how to cut your WhatsApp API cost</b>. Tell me your country and how many WhatsApp conversations you handle a month, and I’ll work out <b>what Meta charges you now and what you could save</b>. Or score one of your flows with the Stay-or-Move Test: 4 questions.',
    back: 'Welcome back. ', phPanel: 'Ask a follow-up', reading: 'Reading', theArticle: 'the article', online: 'Online', working: 'Working on it', oops: 'Something went wrong reaching the agent. Try again in a moment.',
    facts: 'What I’ve understood', edit: 'tap to correct', nba: 'What makes most sense now', why: 'Why', or: 'or',
    build: 'Start building free →', team: 'Book a demo', plan: 'Take the Stay-or-Move Test',
    whyPlan: 'Four answers, 0 to 10, tell you whether a flow should stay on WhatsApp or move to your web chat, and what to do first.',
    whyBuild: 'Your first step is small: one WhatsApp-style web chat on the page where your most common question starts, built once for web and WhatsApp.',
    whyTeamVol: (v) => `At ${v} WhatsApp conversations a month, the team can run your numbers with you and show both options working on your flows.`,
    whyTeamSave: (v) => `Around ${v} a year is worth a proper plan: the team runs your numbers with you and shows which flows to move first.`,
    planH: 'Your Stay-or-Move Test', planSub: (s, m) => `${s}/40 · ${m}`, planStart: 'Do this first', planFirst: 'Then',
    bands: ['Stay on WhatsApp', 'Hybrid', 'Move to web chat'],
    fixes: [['Trim the flow: one welcome message, one menu, no loops', 'Keep it on WhatsApp and count the messages again'], ['Start on web chat, send the result or reminder on WhatsApp', 'Use a branded form for the long part'], ['Add a WhatsApp-style web chat on the page where this question starts', 'Swap that page’s “Message us on WhatsApp” button']],
    qNames: ['Origin', 'Shape', 'Follow-up', 'Identity'], weakest: 'Lowest score', seePlan: 'See the four-week plan',
    reasons: { balance: 'Balance checks', pplan: 'Payment plans', booking: 'Bookings', faq: 'FAQs', remind: 'Reminders' },
    saveH: 'Your estimated saving', saveSub: 'Meta service fees only, at 30% moved to web chat and about a third of messages trimmed.', perYr: ' / year', seeCalc: 'Check it in the calculator',
    calcd: (v) => `Saving ${v} a year? Let’s see which flows to move first`, msgCalc: (c) => `The calculator says I'd save ${c.y} a year (${c.conv} conversations a month, ${c.mpc} billable messages each, ${c.country}, ${c.moved}% moved, ${c.trim}% trimmed). Which flows should I move first?`,
    mail: 'Where should the team send your savings plan?', mailSub: 'The team replies within one business day, with everything you told me already on the table.', mailPh: 'you@company.com', sendIt: 'Send', mailBad: 'That doesn’t look like an email yet.',
    done: 'Done. Here’s what changed', r1: 'Lead saved in Landbot', r1s: 'Inbox · Reduce WhatsApp API Costs Conversion Agent', r2: 'Context attached to the lead', r3: 'Follow-up promised', r3s: 'within one business day · Landbot team',
    foot: 'Answers only from this article and landbot.io · Landbot builds AI agents for websites and WhatsApp.',
    fromArticle: 'ARTICLE', pointLabel: 'Landbot AI is reading this',
    msgPlan: 'Let’s take the Stay-or-Move Test.', msgTeam: 'I’d like to book a demo.', msgCorr: (k, v) => `Quick correction: ${k} is ${v}.`,
    msgScore: (t, a) => `I scored ${t}/40 on the Stay-or-Move Test (Origin ${a[0]}, Shape ${a[1]}, Follow-up ${a[2]}, Identity ${a[3]}). What does my score mean?`,
    scored: (s) => `Scored ${s}/40? I’ll tell you what it means`,
    nudge: { tldr: ['What would I save on WhatsApp?', 'Ask my country, monthly WhatsApp conversations and billable messages per conversation, then tell me what Meta charges me now and what I could save.'],
      why: ['How much will October’s change cost me?', 'The visitor wants to know what the October pricing change costs them. Ask their country, monthly WhatsApp conversations, and billable messages per conversation, then estimate their monthly Meta service fees and point to the calculator.'],
      which: ['Which of my flows should move to web?', 'The visitor wants to sort their flows. Ask for their top three WhatsApp flows and where each starts, then classify each as WhatsApp, web chat, or hybrid with one reason.'],
      'two-ways': ['Web chat or branded form: which fits my flows?', 'The visitor is choosing between the two options. Ask where their main flows start (website, app, or WhatsApp) and which ones are long tasks, then recommend a WhatsApp-style web chat or a branded form opened from WhatsApp for each, and offer a demo.'],
      savings: ['What would I save in my country?', 'The visitor wants their own savings. Ask country, monthly conversations, and messages per conversation, then calculate savings at 30% moved and 30% trimmed, and offer to book a demo with the team.'],
      test: ['What does my score mean?', 'The visitor just took the Stay-or-Move Test. Read the four slider values, explain the band, and give the "Fix first" step for their flow.'],
      move: ['How do I move customers without losing them?', 'The visitor worries about losing customers. Ask which channels link to WhatsApp today (site buttons, emails, invoices, QR codes) and which metrics they track, then suggest the first link to swap and what to measure for two weeks.'],
      plan: ['Plan my next four weeks', 'Turn the four-week plan into my own: ask my top WhatsApp flows and my channels, then tell me what to do this week.'],
      faq: ['Ask anything about WhatsApp API costs', 'What would I save if I moved my most common WhatsApp flow to a web chat?'] },
    k: { score: 'Stay-or-Move Test', reasons: 'Flows', chan: 'Channels', vol: 'WhatsApp conversations', save: 'Estimated saving', from: 'Came from', why: 'Why here' }, teamSees: 'What the team will see', direct: 'direct', perMo: ' /mo', oneMore: 'Yes, one more question',
    money: '$#',
    calLoading: 'Loading the calendar…', bookH: 'Book a demo with the Landbot team', bookSub: 'Pick a slot that suits you. They’ll have this conversation and your numbers on hand, so no starting from zero.', bookGo: 'Choose a time →', booked: 'I’ve booked a time', mailInstead: 'Email me instead', bookedMsg: 'Great, see you there. The team will have this conversation on hand.', supH: 'This one’s for our support team', supSub: 'They can look at your account and sort it fastest. The help center has guides and a way to reach them.', supGo: 'Open the help center →', backArt: 'Back to the article' },
  es: { rec: 'Estás leyendo <b>cómo pagar menos con las tarifas de WhatsApp Business</b>. Dime tu país y cuántas conversaciones de WhatsApp gestionas al mes, y te calculo <b>lo que te cobra Meta hoy y cuánto podrías ahorrar</b>. O puntúa uno de tus flujos con el test quedarse o mudarse: 4 preguntas.',
    back: 'Hola de nuevo. ', phPanel: 'Haz otra pregunta', reading: 'Leyendo', theArticle: 'el artículo', online: 'En línea', working: 'Trabajando en ello', oops: 'Algo ha fallado al contactar con el agente. Prueba de nuevo en un momento.',
    facts: 'Lo que he entendido', edit: 'toca para corregir', nba: 'Lo que tiene más sentido ahora', why: 'Por qué', or: 'o',
    build: 'Empezar gratis →', team: 'Reservar una demo', plan: 'Hacer el test quedarse o mudarse',
    whyPlan: 'Cuatro respuestas, de 0 a 10, te dicen si un flujo debe quedarse en WhatsApp o pasar a tu chat web, y qué hacer primero.',
    whyBuild: 'El primer paso es pequeño: un chat web tipo WhatsApp en la página donde surge tu pregunta más habitual, construido una vez para la web y WhatsApp.',
    whyTeamVol: (v) => `Con ${v} conversaciones de WhatsApp al mes, el equipo puede hacer los números contigo y enseñarte las dos opciones funcionando con tus flujos.`,
    whyTeamSave: (v) => `Unos ${v} al año merecen un buen plan: el equipo hace los números contigo y te dice qué flujos mover primero.`,
    planH: 'Tu test quedarse o mudarse', planSub: (s, m) => `${s}/40 · ${m}`, planStart: 'Haz esto primero', planFirst: 'Después',
    bands: ['Se queda en WhatsApp', 'Híbrido', 'Se muda al chat web'],
    fixes: [['Recorta el flujo: una bienvenida, un menú, sin bucles', 'Déjalo en WhatsApp y vuelve a contar los mensajes'], ['Empieza en el chat web y envía el resultado o el recordatorio por WhatsApp', 'Usa un formulario de tu marca para la parte larga'], ['Pon un chat web tipo WhatsApp en la página donde surge esta pregunta', 'Cambia el botón “Escríbenos por WhatsApp” de esa página']],
    qNames: ['Origen', 'Forma', 'Seguimiento', 'Identidad'], weakest: 'Puntuación más baja', seePlan: 'Ver el plan de cuatro semanas',
    reasons: { balance: 'Consulta de saldo', pplan: 'Planes de pago', booking: 'Reservas', faq: 'Preguntas frecuentes', remind: 'Recordatorios' },
    saveH: 'Tu ahorro estimado', saveSub: 'Solo tarifas de servicio de Meta, moviendo un 30% al chat web y recortando un tercio de los mensajes.', perYr: ' / año', seeCalc: 'Compruébalo en la calculadora',
    calcd: (v) => `¿Ahorras ${v} al año? Veamos qué flujos mover primero`, msgCalc: (c) => `La calculadora dice que ahorraría ${c.y} al año (${c.conv} conversaciones al mes, ${c.mpc} mensajes facturables cada una, ${c.country}, ${c.moved}% al chat web, ${c.trim}% recortado). ¿Qué flujos muevo primero?`,
    mail: '¿A dónde envía el equipo tu plan de ahorro?', mailSub: 'El equipo responde en un día laborable, con todo lo que me has contado ya sobre la mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Eso todavía no parece un email.',
    done: 'Hecho. Esto es lo que ha cambiado', r1: 'Lead guardado en Landbot', r1s: 'Inbox · Reduce WhatsApp API Costs Conversion Agent', r2: 'Contexto adjunto al lead', r3: 'Seguimiento prometido', r3s: 'en un día laborable · equipo de Landbot',
    foot: 'Respuestas solo con este artículo y landbot.io · Landbot crea agentes de IA para webs y WhatsApp.',
    fromArticle: 'ARTÍCULO', pointLabel: 'Landbot AI está leyendo esto',
    msgPlan: 'Hagamos el test quedarse o mudarse.', msgTeam: 'Quiero reservar una demo.', msgCorr: (k, v) => `Corrijo: ${k} es ${v}.`,
    msgScore: (t, a) => `He sacado ${t}/40 en el test quedarse o mudarse (Origen ${a[0]}, Forma ${a[1]}, Seguimiento ${a[2]}, Identidad ${a[3]}). ¿Qué significa mi puntuación?`,
    scored: (s) => `¿Has sacado ${s}/40? Te digo qué significa`,
    nudge: { tldr: ['¿Cuánto ahorraría en WhatsApp?', 'Pregúntame mi país, mis conversaciones de WhatsApp al mes y los mensajes facturables por conversación, y dime lo que me cobra Meta hoy y cuánto podría ahorrar.'],
      why: ['¿Cuánto me va a costar el cambio de octubre?', 'El visitante quiere saber cuánto le cuesta el cambio de precios de octubre. Pregunta su país, sus conversaciones de WhatsApp al mes y los mensajes facturables por conversación, estima su gasto mensual en mensajes de servicio de Meta y llévale a la calculadora.'],
      which: ['¿Qué flujos debería pasar a la web?', 'El visitante quiere ordenar sus flujos. Pide sus tres flujos principales de WhatsApp y dónde empieza cada uno, y clasifica cada uno como WhatsApp, chat web o híbrido con un motivo.'],
      'two-ways': ['¿Chat web o formulario de marca: cuál encaja con mis flujos?', 'El visitante duda entre las dos opciones. Pregunta dónde empiezan sus flujos principales (web, app o WhatsApp) y cuáles son tareas largas, recomienda para cada uno un chat web tipo WhatsApp o un formulario de marca desde WhatsApp y ofrece una demo.'],
      savings: ['¿Cuánto ahorraría en mi país?', 'El visitante quiere su propio ahorro. Pregunta país, conversaciones al mes y mensajes por conversación, calcula el ahorro moviendo un 30% y recortando un 30%, y ofrece reservar una demo con el equipo.'],
      test: ['¿Qué significa mi puntuación?', 'El visitante acaba de hacer el test quedarse o mudarse. Lee los valores de los cuatro controles, explica la franja y da el paso "Arregla primero" para su flujo.'],
      move: ['¿Cómo muevo a los clientes sin perderlos?', 'Al visitante le preocupa perder clientes. Pregunta qué canales enlazan hoy a WhatsApp (botones de la web, emails, facturas, QR) y qué métricas sigue, y sugiere el primer enlace a cambiar y qué medir durante dos semanas.'],
      plan: ['Planifica mis cuatro semanas', 'Convierte el plan de cuatro semanas en el mío: pregúntame mis flujos principales de WhatsApp y mis canales, y dime qué hacer esta semana.'],
      faq: ['Pregunta lo que quieras sobre las tarifas de WhatsApp', '¿Cuánto ahorraría si paso mi flujo de WhatsApp más habitual a un chat web?'] },
    k: { score: 'Test quedarse o mudarse', reasons: 'Flujos', chan: 'Canales', vol: 'Conversaciones de WhatsApp', save: 'Ahorro estimado', from: 'Vino de', why: 'Por qué vino' }, teamSees: 'Lo que verá el equipo', direct: 'directo', perMo: ' /mes', oneMore: 'Sí, una pregunta más',
    money: '# USD',
    calLoading: 'Cargando el calendario…', bookH: 'Reserva una demo con el equipo de Landbot', bookSub: 'Elige el hueco que mejor te venga. Tendrán esta conversación y tus números a mano, así que no empiezas de cero.', bookGo: 'Elegir hora →', booked: 'Ya he reservado', mailInstead: 'Prefiero que me escribáis', bookedMsg: 'Genial, nos vemos ahí. El equipo tendrá esta conversación a mano.', supH: 'Esto es cosa de nuestro equipo de soporte', supSub: 'Pueden mirar tu cuenta y resolverlo antes. En el centro de ayuda tienes guías y cómo contactarles.', supGo: 'Abrir el centro de ayuda →', backArt: 'Volver al artículo' },
  pt: { rec: 'Você está lendo <b>como pagar menos pela API do WhatsApp</b>. Me diga o seu país e quantas conversas de WhatsApp você atende por mês, e eu calculo <b>quanto Meta cobra hoje e quanto você poderia economizar</b>. Ou avalie um dos seus fluxos com o teste fica ou muda: 4 perguntas.',
    back: 'Que bom te ver de novo. ', phPanel: 'Faça outra pergunta', reading: 'Lendo', theArticle: 'o artigo', online: 'Online', working: 'Trabalhando nisso', oops: 'Algo deu errado ao falar com o agente. Tente de novo em um instante.',
    facts: 'O que eu entendi', edit: 'toque para corrigir', nba: 'O que faz mais sentido agora', why: 'Por quê', or: 'ou',
    build: 'Começar grátis →', team: 'Agendar uma demo', plan: 'Fazer o teste fica ou muda',
    whyPlan: 'Quatro respostas, de 0 a 10, dizem se um fluxo deve ficar no WhatsApp ou ir para o chat do seu site, e o que fazer primeiro.',
    whyBuild: 'O primeiro passo é pequeno: um chat web estilo WhatsApp na página onde surge a sua dúvida mais comum, construído uma vez para o site e o WhatsApp.',
    whyTeamVol: (v) => `Com ${v} conversas de WhatsApp por mês, o time pode fazer as contas com você e mostrar as duas opções funcionando nos seus fluxos.`,
    whyTeamSave: (v) => `Cerca de ${v} por ano merecem um bom plano: o time faz as contas com você e mostra quais fluxos mover primeiro.`,
    planH: 'Seu teste fica ou muda', planSub: (s, m) => `${s}/40 · ${m}`, planStart: 'Faça isto primeiro', planFirst: 'Depois',
    bands: ['Fica no WhatsApp', 'Híbrido', 'Muda para o chat no site'],
    fixes: [['Enxugue o fluxo: uma boas-vindas, um menu, sem loops', 'Mantenha no WhatsApp e conte as mensagens de novo'], ['Comece no chat do site e envie o resultado ou o lembrete pelo WhatsApp', 'Use um formulário com a sua marca para a parte longa'], ['Coloque um chat web estilo WhatsApp na página onde essa dúvida surge', 'Troque o botão “Fale com a gente no WhatsApp” dessa página']],
    qNames: ['Origem', 'Formato', 'Acompanhamento', 'Identidade'], weakest: 'Nota mais baixa', seePlan: 'Ver o plano de quatro semanas',
    reasons: { balance: 'Consulta de saldo', pplan: 'Parcelamentos', booking: 'Agendamentos', faq: 'Perguntas frequentes', remind: 'Lembretes' },
    saveH: 'Sua economia estimada', saveSub: 'Só as tarifas de serviço de Meta, levando 30% para o chat no site e cortando um terço das mensagens.', perYr: ' / ano', seeCalc: 'Confira na calculadora',
    calcd: (v) => `Economiza ${v} por ano? Vamos ver quais fluxos mover primeiro`, msgCalc: (c) => `A calculadora diz que eu economizaria ${c.y} por ano (${c.conv} conversas por mês, ${c.mpc} mensagens cobradas em cada uma, ${c.country}, ${c.moved}% para o chat no site, ${c.trim}% cortado). Quais fluxos movo primeiro?`,
    mail: 'Para onde o time envia o seu plano de economia?', mailSub: 'O time responde em um dia útil, com tudo o que você me contou já em cima da mesa.', mailPh: 'voce@empresa.com', sendIt: 'Enviar', mailBad: 'Isso ainda não parece um e-mail.',
    done: 'Pronto. Isto foi o que mudou', r1: 'Lead salvo em Landbot', r1s: 'Inbox · Reduce WhatsApp API Costs Conversion Agent', r2: 'Contexto anexado ao lead', r3: 'Retorno prometido', r3s: 'em um dia útil · time de Landbot',
    foot: 'Respostas só com este artigo e landbot.io · Landbot cria agentes de IA para sites e WhatsApp.',
    fromArticle: 'ARTIGO', pointLabel: 'A Landbot AI está lendo isto',
    msgPlan: 'Vamos fazer o teste fica ou muda.', msgTeam: 'Quero agendar uma demo.', msgCorr: (k, v) => `Correção: ${k} é ${v}.`,
    msgScore: (t, a) => `Tirei ${t}/40 no teste fica ou muda (Origem ${a[0]}, Formato ${a[1]}, Acompanhamento ${a[2]}, Identidade ${a[3]}). O que significa a minha nota?`,
    scored: (s) => `Tirou ${s}/40? Eu digo o que significa`,
    nudge: { tldr: ['Quanto eu economizaria no WhatsApp?', 'Pergunte o meu país, as conversas de WhatsApp por mês e as mensagens cobradas por conversa, e me diga quanto Meta cobra hoje e quanto eu poderia economizar.'],
      why: ['Quanto a mudança de outubro vai me custar?', 'O visitante quer saber quanto a mudança de preços de outubro custa para ele. Pergunte o país, as conversas de WhatsApp por mês e as mensagens cobradas por conversa, estime o gasto mensal com mensagens de serviço de Meta e indique a calculadora.'],
      which: ['Quais fluxos devo levar para o site?', 'O visitante quer organizar os fluxos. Peça os três principais fluxos de WhatsApp e onde cada um começa, e classifique cada um como WhatsApp, chat no site ou híbrido, com um motivo.'],
      'two-ways': ['Chat no site ou formulário com a minha marca: qual combina com os meus fluxos?', 'O visitante está escolhendo entre as duas opções. Pergunte onde começam os fluxos principais (site, app ou WhatsApp) e quais são tarefas longas, recomende para cada um um chat web estilo WhatsApp ou um formulário com a marca a partir do WhatsApp e ofereça uma demo.'],
      savings: ['Quanto eu economizaria no meu país?', 'O visitante quer calcular a própria economia. Pergunte país, conversas por mês e mensagens por conversa, calcule a economia movendo 30% e cortando 30%, e ofereça agendar uma demo com o time.'],
      test: ['O que significa a minha nota?', 'O visitante acabou de fazer o teste fica ou muda. Leia os quatro controles, explique a faixa e dê o passo "Resolva primeiro" para o fluxo dele.'],
      move: ['Como mudo os clientes de canal sem perdê-los?', 'O visitante tem medo de perder clientes. Pergunte quais canais levam ao WhatsApp hoje (botões do site, e-mails, boletos, QR codes) e quais métricas acompanha, e sugira o primeiro link a trocar e o que medir por duas semanas.'],
      plan: ['Planeje as minhas quatro semanas', 'Transforme o plano de quatro semanas no meu: pergunte os meus principais fluxos de WhatsApp e os meus canais, e diga o que fazer esta semana.'],
      faq: ['Pergunte o que quiser sobre o preço da API do WhatsApp', 'Quanto eu economizaria se levasse o meu fluxo de WhatsApp mais comum para um chat no site?'] },
    k: { score: 'Teste fica ou muda', reasons: 'Fluxos', chan: 'Canais', vol: 'Conversas de WhatsApp', save: 'Economia estimada', from: 'Veio de', why: 'Por que veio' }, teamSees: 'O que o time vai ver', direct: 'direto', perMo: ' /mês', oneMore: 'Sim, mais uma pergunta',
    money: 'US$ #',
    calLoading: 'Carregando o calendário…', bookH: 'Agende uma demo com o time de Landbot', bookSub: 'Escolha o horário que for melhor. Eles vão ter esta conversa e os seus números à mão, então você não começa do zero.', bookGo: 'Escolher horário →', booked: 'Já agendei', mailInstead: 'Prefiro receber um e-mail', bookedMsg: 'Ótimo, até lá. O time vai ter esta conversa à mão.', supH: 'Isto é com o nosso time de suporte', supSub: 'Eles podem olhar a sua conta e resolver mais rápido. A central de ajuda tem guias e como falar com eles.', supGo: 'Abrir a central de ajuda →', backArt: 'Voltar ao artigo' }
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
const fmt = (n) => new Intl.NumberFormat(LANG === 'en' ? 'en-US' : LANG === 'pt' ? 'pt-BR' : 'es-ES', { maximumFractionDigits: 0, useGrouping: 'always' }).format(Math.round(n));
const money = (n) => T.money.replace('#', fmt(n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let visits = 0;
try { visits = +(localStorage.getItem('awe-rwac-visits') || 0); localStorage.setItem('awe-rwac-visits', String(visits + 1)); } catch (_) {}
const st = { core: null, boot: null, facts: {}, awaiting: null, answers: 0, nbaKey: '', open: false, t0: Date.now(), teamDone: false, section: 'tldr', cited: new Set(), score: null, save: null, calc: null };
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
function withData(m) { const d = st.nextData; st.nextData = null; let pf = {}; try { pf = pageFields(); } catch (_) {} m.custom_data = Object.assign(pf, d || {}); return m; }   /* Slim: the summary for sales rides on every message */
const calRefs = (d) => { const p = (d && d.payload) || {}; return { calendly_invitee: (p.invitee && p.invitee.uri) || '', calendly_event: (p.event && p.event.uri) || '' }; };
async function deliver(text, payload) {
  await boot();
  if (payload && st.awaitBook) { if (st.salesReady) await st.salesReady; if (st.salesMissed) await reroute(); st.awaitBook = false; }   /* a booking button waits until the bot is really at sales_book */
  const btn = payload && st.greetBtns && st.greetBtns.find((b) => b.payload === payload);
  /* a fixed button reaches the agent with the visitor's own label, so the agent keeps the visitor's language */
  return st.core.sendMessage(withData(payload ? { type: 'button', message: text || (btn ? btn.text : ''), payload } : { type: 'text', message: text }));
}

/* ---------- UI: lava orb bar, layer ---------- */
const STARTERS = { en: ['What would I save?', 'Take the Stay-or-Move Test', 'Which flows should move to web?'], es: ['¿Cuánto ahorraría?', 'Hacer el test quedarse o mudarse', '¿Qué flujos paso a la web?'], pt: ['Quanto eu economizaria?', 'Fazer o teste fica ou muda', 'Quais fluxos levo para o site?'] };
const starterChips = () => { const xs = STARTERS[LANG].slice(), ex = (SLIM[LANG] || SLIM.en).expert; if (GEO.tier !== 'C') xs.splice(1, 0, ex); return xs; }; const starterChipsArr = starterChips; const _starterHTML = () => starterChipsArr().map((l) => `<button type="button" class="awe-chip" data-awe-say="${esc(l)}">${esc(l)}</button>`).join('');
let gooN = 0;
const LAVA = (cls) => { const id = 'aweGoo' + (++gooN); return `<span class="awe-lava ${cls || ''}" aria-hidden="true">
  <svg viewBox="0 0 300 300"><defs><filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><feGaussianBlur in="SourceGraphic" stdDeviation="13" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs>
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
    <!-- foot note removed 10-nov-2026: it was for us, not for the visitor (Fabo) --></div></aside>`);
const scrim = h('<div id="awe-scrim" aria-hidden="true"></div>');
scrim.addEventListener('click', () => closePanel());
document.body.appendChild(scrim); document.body.appendChild(panel); document.body.appendChild(launch);
const launchInput = launch.querySelector('input'), pill = launch.querySelector('.awe-pill');
const starters = launch.querySelector('[data-awe-starters]');
// Safari blurs the input on pointer down without focusing the chip.
let starterPress = null;
function clearStarterPress() {
  starterPress = null;
  starters.classList.remove('is-pressing');
}
starters.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary || e.button !== 0 || !e.target.closest('button[data-awe-say]')) return;
  starterPress = e;
  starters.classList.add('is-pressing');
});
// iPhone sends the mouse events of a tap after pointerup: never let a chip's mousedown blur the input.
starters.addEventListener('mousedown', (e) => { if (e.target.closest('button[data-awe-say]')) e.preventDefault(); });
window.addEventListener('pointerup', (e) => {
  const press = starterPress;
  if (!press || press.pointerId !== e.pointerId) return;
  // Let the browser dispatch the native click before restoring the focus rule (touch: iOS sends it later).
  setTimeout(() => { if (starterPress === press) clearStarterPress(); }, e.pointerType === 'mouse' ? 0 : 700);
}, true);
window.addEventListener('pointercancel', (e) => {
  if (starterPress?.pointerId === e.pointerId) clearStarterPress();
}, true);
window.addEventListener('blur', clearStarterPress);
const badge = h('<span class="awe-badge" aria-hidden="true"></span>');
launch.querySelector('[data-awe-open]').appendChild(badge);
function setUnread(n) {
  st.unread = n; badge.textContent = n > 9 ? '9+' : String(n || ''); badge.classList.toggle('on', n > 0);
  if (n > 0) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  launch.querySelector('[data-awe-open]').setAttribute('aria-label', n > 0 ? `Landbot AI · ${n} new` : 'Landbot AI');
}
function paint() {
  starters.innerHTML = _starterHTML();
  panel.querySelector('.awe-foot input').placeholder = T.phPanel;
  panel.querySelectorAll('[data-t]').forEach((n) => { n.textContent = T[n.dataset.t]; });
  if (!panel.querySelector('.awe-status').classList.contains('work')) panel.querySelector('.awe-status').textContent = T.online;
  if (st.reasonKeys) st.facts.reasons = { v: st.reasonKeys.map((k) => T.reasons[k]).join(', ') };
  if (st.facts.vol) st.facts.vol = { v: st.facts.vol.v };
  if (st.facts.from && st.facts.from.guess) { const d = J(); if (d && d.from === 'direct') st.facts.from = { v: T.direct, guess: true }; }
  st.section = ''; syncLaunch(); renderFacts();
  if (planEl && planEl.isConnected) planCard();
  if (saveEl && saveEl.isConnected) saveCard();
}
const thread = panel.querySelector('.awe-thread'), statusEl = panel.querySelector('.awe-status'), headOrb = panel.querySelector('.awe-head .awe-lava');
const repliesEl = panel.querySelector('[data-awe-replies]');
const push = (el) => { thread.appendChild(el); requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; }); return el; };
/* entry_point_click = the panel was opened (launcher, a message, ⌘K or a reset); trigger says which, first one per page view wins */
function openPanel(trigger) {
  emit('entry_point_click', ENTRY.sales, { trigger: trigger || 'other' });
  if (st.unread) setUnread(0);
  if (!st.open) { st.open = true; panel.classList.add('on'); scrim.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); syncLaunch(); }
  if (!thread.children.length) {
    const d = J();
    const ctx = d && d.from && d.from !== 'direct' ? `<div class="awe-src"><button type="button" data-awe-fact="from"><em>${esc(T.k.from)}</em>${esc(d.from)}${d.before.length ? ' · ' + esc(d.before[d.before.length - 1].split(' ')[0]) : ''}</button></div>` : '';
    push(h(`<div class="awe-msg"><p>${visits > 0 ? T.back : ''}${T.rec}</p>${ctx}</div>`));
    repliesEl.innerHTML = _starterHTML();
  }
}
function closePanel() { st.open = false; panel.classList.remove('on', 'wide'); scrim.classList.remove('on', 'lift'); panel.setAttribute('aria-hidden', 'true'); syncLaunch(); }
function setWorking(label) {
  thread.querySelectorAll('.awe-working').forEach((n) => n.remove());
  if (!label) { statusEl.textContent = T.online; statusEl.classList.remove('work'); headOrb.classList.remove('work'); return; }
  statusEl.textContent = T.working + '…'; statusEl.classList.add('work'); headOrb.classList.add('work');
  push(h(`<div class="awe-working"><span class="awe-orb sm work" aria-hidden="true"></span></div>`));   // orb only: no "Reading …" label (Fabo, 10-nov-2026)
}
const secLabel = (id) => { const s = SECTIONS.find((x) => x[0] === id); return s ? '“' + (s[2][LANG] || s[2].en) + '”' : T.theArticle; };
function guessSection(q) {
  if (/score|puntu|nota|stay|quedarse|mudarse|fica ou muda|test|teste|\/40/i.test(q)) return secLabel('test');
  if (/sav|ahorr|econom|cost|cuest|cust|price|precio|preço|tarif|rate|bill|factura|fatura|\$|usd/i.test(q)) return secLabel('savings');
  if (/flow|flujo|fluxo/i.test(q)) return secLabel('which');
  if (/form|web chat|chat web|chat no site|branded|marca/i.test(q)) return secLabel('two-ways');
  if (/lose|losing|perder|without|sin perder|sem perder/i.test(q)) return secLabel('move');
  if (/october|octubre|outubro|why|por qu|por que/i.test(q)) return secLabel('why');
  if (/plan|week|semana/i.test(q)) return secLabel('plan');
  return T.theArticle;
}

/* ---------- sending ---------- */
const RATES = [['United Kingdom', 0.022, /\b(uk|u\.k\.)\b|united kingdom|britain|england|reino unido|inglaterra/i], ['South Africa', 0.0095, /south africa|sud[aá]frica|[aá]frica do sul/i],
  ['Spain', 0.02, /\bspain\b|espa[ñn]a|espanha/i], ['Germany', 0.055, /germany|alemania|alemanha/i], ['France', 0.03, /france|francia|fran[cç]a/i], ['Italy', 0.03, /\bital(y|ia|ía)\b/i],
  ['Netherlands', 0.05, /netherlands|holland|pa[ií]ses bajos|pa[ií]ses baixos|holanda/i], ['Mexico', 0.0085, /m[eé]xico/i], ['Brazil', 0.0068, /\bbra[sz]il\b/i], ['Colombia', 0.0008, /col[oô]mbia/i],
  ['Chile', 0.02, /\bchile\b/i], ['Argentina', 0.026, /argentina/i], ['Peru', 0.03, /\bper[uú]\b/i], ['North America', 0.0034, /\b(usa|us)\b|united states|estados unidos|\beua\b|canad[aá]/i],
  ['India', 0.0014, /\b[ií]ndia\b/i], ['UAE', 0.0157, /\buae\b|emirates|emiratos|emirados|dubai/i], ['Saudi Arabia', 0.0107, /saudi|saud[ií]/i]];
function readSavings(q) {
  const c = st.calcIn = st.calcIn || {}; let changed = false;
  const co = RATES.find(([, , re]) => re.test(q)); if (co) { c.country = co[0]; c.rate = co[1]; changed = true; }
  const cv = q.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil|thousand)?\s*(?:whats ?app\s+)?(?:conversations?|conversaciones|conversas|chats)/i);
  if (cv) { let n = parseFloat(cv[1].replace(/\s/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')); if (cv[2]) n *= 1000; if (n >= 50) { c.conv = n; changed = true; } }
  const mp = q.match(/(\d{1,2}(?:[.,]\d+)?)\s*(?:billable\s+)?(?:messages?|mensajes?|mensagens?|msgs?)\b/i);
  if (mp && +mp[1].replace(',', '.') <= 30) { c.mpc = +mp[1].replace(',', '.'); changed = true; }
  else if (c.conv && c.mpc == null && /^\D{0,12}\d{1,2}(?:[.,]\d)?\D{0,12}$/.test(q.trim())) { const n = +q.match(/\d{1,2}(?:[.,]\d)?/)[0].replace(',', '.'); if (n > 0 && n <= 30) { c.mpc = n; changed = true; } }
  else if (c.conv && c.mpc == null && /don.?t know|not sure|no (lo )?s[eé]|n[aã]o sei/i.test(q)) { c.mpc = 4.4; changed = true; }
  const mv = q.match(/(\d{1,2})\s*%\s*(?:of (?:conversations|chats) )?(?:moved|to (?:the )?web|al chat|para o chat|a la web|para o site)/i) || q.match(/mov(?:e|ed|iendo|endo)\s+(?:un |o )?(\d{1,2})\s*%/i); if (mv) { c.moved = +mv[1]; changed = true; }
  const tr = q.match(/(\d{1,2})\s*%\s*(?:of (?:messages )?)?(?:trimmed|recortad|cortad)/i) || q.match(/(?:trim(?:med|ming)?|recortando|cortando)\s+(?:un |o )?(\d{1,2})\s*%/i); if (tr) { c.trim = +tr[1]; changed = true; }
  if (!changed || !c.conv || !c.mpc || !c.rate) return '';
  const moved = c.moved != null ? c.moved : 30, trim = c.trim != null ? c.trim : 34;
  const m0 = c.conv * c.mpc, m1 = c.conv * (1 - moved / 100) * c.mpc * (1 - trim / 100), f0 = m0 * c.rate, f1 = m1 * c.rate, sv = f0 - f1;
  st.pageSave = Math.round(sv * 12);
  const $ = (n) => '$' + Math.round(n).toLocaleString('en-US');
  return `[Page context: savings computed by the page, use these exact figures: ${c.country} at $${c.rate} per message · ${Math.round(c.conv).toLocaleString('en-US')} conversations × ${c.mpc} messages = ${Math.round(m0).toLocaleString('en-US')} billable messages, Meta fees now ${$(f0)}/month · after ${moved}% moved and ${trim}% trimmed: ${Math.round(m1).toLocaleString('en-US')} messages, ${$(f1)}/month · saving ${$(sv)}/month, ${$(sv * 12)}/year, cut ${Math.round(sv / f0 * 100)}%]`;
}
/* ================= Slim (conversion-agent-home-slim skill, applied 20-nov-2026) =================
   Only what needs the agent goes to the agent:
   - booking requests (chip or typed) draw the booking card at once; the text still goes to the agent so the bot reaches sales_book;
   - the three starters are answered by the page: savings (3 chip questions + the page's own maths), the Stay-or-Move Test
     (4 chip questions + plan card) and "which flows" (the article's table + one chip that does go to the agent);
   - the summary for sales is built here and sent as custom_data on every message (the agent no longer writes it). */
const normQ = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[¿?¡!.,;:"“”'’]/g, ' ').replace(/\s+/g, ' ').trim();
const nMap = (o) => { const m = new Map(); Object.keys(o).forEach((l) => o[l].forEach((x) => m.set(normQ(x), l))); return m; };
const BOOK_N = nMap({
  en: ['book a demo', 'i’d like to book a demo', 'i want a demo', 'i want to book a demo', 'talk to sales', 'i want to talk to sales', 'talk to the team', 'book a call', 'see a demo'],
  es: ['reservar una demo', 'reserva una demo', 'quiero reservar una demo', 'quiero una demo', 'hablar con ventas', 'quiero hablar con ventas', 'hablar con el equipo', 'hablar con un comercial', 'ver una demo'],
  pt: ['agendar uma demo', 'agende uma demo', 'quero agendar uma demo', 'quero uma demo', 'falar com vendas', 'quero falar com vendas', 'falar com o time', 'ver uma demo'] });
/* the chip that leads to the call (Fabo, 20-nov): it opens the booking card like "Book a demo"; the agent gets T.msgTeam */
const EXPERT_N = nMap({ en: ['talk to an expert about saving', 'help me save', 'help me cut my whatsapp bill', 'i want help to save', 'talk to an expert'],
  es: ['hablar con un experto para ahorrar', 'quiero ayuda para ahorrar', 'ayudame a ahorrar', 'hablar con un experto', 'quiero hablar con un experto'],
  pt: ['falar com um especialista para economizar', 'quero ajuda para economizar', 'me ajude a economizar', 'falar com um especialista', 'quero falar com um especialista'] });
EXPERT_N.forEach((l, k) => BOOK_N.set(k, l));
const SAVE_N = nMap({ en: ['what would i save', 'what would i save on whatsapp', 'calculate my savings', 'how much would i save'],
  es: ['cuanto ahorraria', 'cuanto ahorraria en whatsapp', 'calcula mi ahorro', 'cuanto me ahorro'],
  pt: ['quanto eu economizaria', 'quanto eu economizaria no whatsapp', 'calcule a minha economia', 'quanto eu economizo'] });
const TEST_N = nMap({ en: ['take the stay-or-move test', 'take the stay or move test', 'stay-or-move test', 'let’s take the stay-or-move test'],
  es: ['hacer el test quedarse o mudarse', 'test quedarse o mudarse', 'hagamos el test quedarse o mudarse'],
  pt: ['fazer o teste fica ou muda', 'teste fica ou muda', 'vamos fazer o teste fica ou muda'] });
const FLOWS_N = nMap({ en: ['which flows should move to web', 'which of my flows should move to web'],
  es: ['que flujos paso a la web', 'que flujos deberia pasar a la web'],
  pt: ['quais fluxos levo para o site', 'quais fluxos devo levar para o site'] });
const SLIM = {
  en: { expert: 'Talk to an expert about saving', demoLang: 'Which language for the demo?', demoLangPT: 'Your demo will be in Portuguese.', demo: 'Book a demo', save: 'What would I save?', test: 'Take the Stay-or-Move Test', flows: 'Which flows should move to web?', sort: 'Sort my top 3 flows',
    qCountry: 'Which country do you send most WhatsApp messages in?', other: 'Other country',
    qConv: 'How many WhatsApp conversations do you handle a month?',
    qMpc: 'And roughly how many billable messages per conversation? The article’s example has **4.4**.', mpcKnow: 'Not sure',
    res: (c) => [`${c.where}, at **$${c.rate}** a message, Meta charges you about **${c.f0}/month** today (${c.m0} billable messages).`,
      `Moving 30% of conversations to a WhatsApp-style web chat and trimming about a third of bot messages brings it to **${c.f1}/month**.`,
      `That’s **${c.y} a year** saved, a ${c.pct}% cut. You can try other numbers in the article’s calculator.`],
    tq: ['**Origin**: does this conversation start while the customer is on your website or app? 0 (never) to 10 (always).',
      '**Shape**: is it a structured task with a clear end, like a booking or a payment plan?',
      '**Follow-up**: can the customer finish in one sitting, without later messages from you?',
      '**Identity**: can you recognize the customer on web, through a login or a personalized link?'],
    tIntro: 'Pick one flow and score it. Four questions, 0 to 10.',
    tRes: (s, b, fix) => [`**${s}/40**: ${b}.`, `First step: ${fix}.`],
    flowsA: ['Sort them by who starts the conversation:\n- **Stay on WhatsApp**: proactive notifications, reminders, follow-ups ("your document was approved").\n- **Move to web chat**: self-service (balance, statements), structured forms (payment plans, bookings, address changes) and FAQs.\n- **Either, with a human handoff**: disputes and complaints.',
      'Tell me your top three flows and where each one starts, and I’ll sort them for you.'],
    note: (x) => `(The page already showed them ${x}: do not repeat it.)`, noteSave: 'their savings estimate', noteTest: 'their Stay-or-Move score and plan', noteFlows: 'the article’s table of which flows stay on WhatsApp' },
  es: { expert: 'Hablar con un experto para ahorrar', demoLang: '¿En qué idioma quieres la demo?', demoLangPT: 'Tu demo será en portugués.', demo: 'Reservar una demo', save: '¿Cuánto ahorraría?', test: 'Hacer el test quedarse o mudarse', flows: '¿Qué flujos paso a la web?', sort: 'Ordena mis 3 flujos principales',
    qCountry: '¿En qué país envías la mayoría de mensajes de WhatsApp?', other: 'Otro país',
    qConv: '¿Cuántas conversaciones de WhatsApp gestionas al mes?',
    qMpc: '¿Y cuántos mensajes facturables tiene cada conversación, más o menos? El ejemplo del artículo tiene **4,4**.', mpcKnow: 'No lo sé',
    res: (c) => [`${c.where}, a **${c.rate} USD** por mensaje, Meta te cobra hoy unos **${c.f0} al mes** (${c.m0} mensajes facturables).`,
      `Si llevas el 30% de las conversaciones a un chat web tipo WhatsApp y recortas un tercio de los mensajes del bot, baja a **${c.f1} al mes**.`,
      `Son **${c.y} al año** de ahorro, un ${c.pct}% menos. Juega con los números en la calculadora del artículo.`],
    tq: ['**Origen**: ¿esta conversación empieza mientras el cliente está en tu web o tu app? De 0 (nunca) a 10 (siempre).',
      '**Forma**: ¿es una tarea estructurada con un final claro, como una reserva o un plan de pagos?',
      '**Seguimiento**: ¿puede el cliente terminarla de una vez, sin mensajes tuyos después?',
      '**Identidad**: ¿puedes reconocer al cliente en la web, con un login o un enlace personalizado?'],
    tIntro: 'Elige un flujo y puntúalo. Cuatro preguntas, de 0 a 10.',
    tRes: (s, b, fix) => [`**${s}/40**: ${b}.`, `Primer paso: ${fix}.`],
    flowsA: ['Ordénalos según quién empieza la conversación:\n- **Se quedan en WhatsApp**: avisos proactivos, recordatorios y seguimientos ("tu documento está aprobado").\n- **Pasan al chat web**: autoservicio (saldo, extractos), formularios (planes de pago, reservas, cambios de dirección) y preguntas frecuentes.\n- **Cualquiera, con paso a una persona**: disputas y reclamaciones.',
      'Dime tus tres flujos principales y dónde empieza cada uno, y te los ordeno.'],
    note: (x) => `(The page already showed them ${x}: do not repeat it.)`, noteSave: 'their savings estimate', noteTest: 'their Stay-or-Move score and plan', noteFlows: 'the article’s table of which flows stay on WhatsApp' },
  pt: { expert: 'Falar com um especialista para economizar', demoLang: 'Em qual idioma você quer a demo?', demoLangPT: 'A sua demo vai ser em português.', demo: 'Agendar uma demo', save: 'Quanto eu economizaria?', test: 'Fazer o teste fica ou muda', flows: 'Quais fluxos levo para o site?', sort: 'Organize meus 3 fluxos principais',
    qCountry: 'Em qual país você envia a maior parte das mensagens de WhatsApp?', other: 'Outro país',
    qConv: 'Quantas conversas de WhatsApp você atende por mês?',
    qMpc: 'E mais ou menos quantas mensagens cobradas tem cada conversa? O exemplo do artigo tem **4,4**.', mpcKnow: 'Não sei',
    res: (c) => [`${c.where}, a **US$ ${c.rate}** por mensagem, Meta cobra hoje cerca de **${c.f0} por mês** (${c.m0} mensagens cobradas).`,
      `Levando 30% das conversas para um chat web estilo WhatsApp e cortando um terço das mensagens do bot, cai para **${c.f1} por mês**.`,
      `São **${c.y} por ano** de economia, um corte de ${c.pct}%. Brinque com os números na calculadora do artigo.`],
    tq: ['**Origem**: esta conversa começa enquanto o cliente está no seu site ou app? De 0 (nunca) a 10 (sempre).',
      '**Formato**: é uma tarefa estruturada, com um fim claro, como um agendamento ou um parcelamento?',
      '**Acompanhamento**: o cliente consegue terminar de uma vez, sem mensagens suas depois?',
      '**Identidade**: você consegue reconhecer o cliente no site, com login ou um link personalizado?'],
    tIntro: 'Escolha um fluxo e dê uma nota. Quatro perguntas, de 0 a 10.',
    tRes: (s, b, fix) => [`**${s}/40**: ${b}.`, `Primeiro passo: ${fix}.`],
    flowsA: ['Organize pelos quem começa a conversa:\n- **Ficam no WhatsApp**: avisos proativos, lembretes e acompanhamentos ("seu documento foi aprovado").\n- **Vão para o chat no site**: autoatendimento (saldo, extratos), formulários (parcelamentos, agendamentos, mudança de endereço) e perguntas frequentes.\n- **Qualquer um, com transferência para uma pessoa**: contestações e reclamações.',
      'Me diga os seus três principais fluxos e onde cada um começa, e eu organizo para você.'],
    note: (x) => `(The page already showed them ${x}: do not repeat it.)`, noteSave: 'their savings estimate', noteTest: 'their Stay-or-Move score and plan', noteFlows: 'the article’s table of which flows stay on WhatsApp' }
};
SLIM.pt.flowsA[0] = SLIM.pt.flowsA[0].replace('Organize pelos quem começa', 'Organize por quem começa');
const SLIM_COUNTRIES = { en: [['Spain', 'Spain'], ['United Kingdom', 'United Kingdom'], ['Brazil', 'Brazil'], ['Mexico', 'Mexico'], ['Germany', 'Germany']],
  es: [['España', 'Spain'], ['Reino Unido', 'United Kingdom'], ['Brasil', 'Brazil'], ['México', 'Mexico'], ['Alemania', 'Germany']],
  pt: [['Brasil', 'Brazil'], ['Espanha', 'Spain'], ['Reino Unido', 'United Kingdom'], ['México', 'Mexico'], ['Alemanha', 'Germany']] };
const S = () => SLIM[LANG] || SLIM.en;
const WHERE = { en: { Spain: 'In Spain', 'United Kingdom': 'In the UK', Brazil: 'In Brazil', Mexico: 'In Mexico', Germany: 'In Germany', Other: 'At the rate for other countries' },
  es: { Spain: 'En España', 'United Kingdom': 'En Reino Unido', Brazil: 'En Brasil', Mexico: 'En México', Germany: 'En Alemania', Other: 'Con la tarifa de otros países' },
  pt: { Spain: 'Na Espanha', 'United Kingdom': 'No Reino Unido', Brazil: 'No Brasil', Mexico: 'No México', Germany: 'Na Alemanha', Other: 'Com a tarifa de outros países' } };
const whereOf = (country) => (WHERE[LANG] || WHERE.en)[country] || ({ en: 'In ', es: 'En ', pt: 'Em ' }[LANG] || 'In ') + country;
const isC = () => GEO.tier === 'C';
const noDemoC = (xs) => isC() ? xs.filter((x) => !BOOK_N.has(normQ(x))) : xs;
const chipsHTML = (xs) => noDemoC(xs).map((x) => `<button type="button" class="awe-chip" data-awe-say="${esc(x)}">${esc(x)}</button>`).join('');
/* page-drawn bubbles: a "-" list stays in one bubble; typing dots between bubbles; a newer visitor message stops it */
async function pageSay(lines, chips) {
  const seq = st.userSeq, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && !reduce) { const dots = push(h('<div class="awe-typing" aria-hidden="true"><i></i><i></i><i></i></div>')); await sleep(450); dots.remove(); }
    if (seq !== st.userSeq) return false;
    push(h(`<div class="awe-msg">${md(lines[i])}</div>`)); if (i === 0) ding();
  }
  if (chips) repliesEl.innerHTML = chipsHTML(chips);
  keepFocus(); return true;
}
/* ---------- booking at once ---------- */
function fastStart() {
  st.fastBook = true; st.salesMissed = false;
  st.salesReady = new Promise((r) => (st._salesRes = r));
  clearTimeout(st.fastT); st.fastT = setTimeout(() => fastEnd(true), 25000);
}
function fastEnd(missed) { st.fastBook = false; clearTimeout(st.fastT); st.salesMissed = !!missed; if (st._salesRes) { st._salesRes(); st._salesRes = null; } }
async function reroute() {   /* the agent answered instead of routing: ask again before any booking button reaches the bot */
  st.salesMissed = false; st.fastBook = true; st.rerouting = true;
  const ready = new Promise((r) => (st._salesRes = r)); clearTimeout(st.fastT); st.fastT = setTimeout(() => fastEnd(true), 25000);
  await st.core.sendMessage(withData({ type: 'text', message: T.msgTeam }));
  await ready; st.rerouting = false;
}
/* ---------- savings: 3 chip questions, the page's maths ---------- */
function slimSaveAsk() {
  const c = st.calcIn = st.calcIn || {}, s = S();
  if (!c.rate) { st.pq = 'country'; return pageSay([s.qCountry], [...SLIM_COUNTRIES[LANG].map((x) => x[0]), s.other]); }
  if (!c.conv) { st.pq = 'conv'; return pageSay([s.qConv], ['1,000', '5,000', '25,000', '100,000'].map((x) => LANG === 'en' ? x : x.replace(',', '.'))); }
  if (!c.mpc) { st.pq = 'mpc'; return pageSay([s.qMpc], ['3', LANG === 'en' ? '4.4' : '4,4', '6', '10', s.mpcKnow]); }
  st.pq = null; return slimSaveResult();
}
function slimSaveAnswer(q) {   /* true = the page used the answer; false = not an answer to the question asked → the agent takes it */
  const c = st.calcIn = st.calcIn || {}, nq = normQ(q);
  if (st.pq === 'country') {
    const hit = SLIM_COUNTRIES[LANG].find((x) => normQ(x[0]) === nq), r = hit ? RATES.find((x) => x[0] === hit[1]) : RATES.find(([, , re]) => re.test(q));
    if (r) { c.country = r[0]; c.rate = r[1]; return true; }
    if (nq === normQ(S().other)) { c.country = 'Other'; c.rate = 0.0077; return true; }
    return false;
  }
  const num = (q.match(/\d[\d.,\s]*/) || [''])[0].trim();
  if (st.pq === 'conv' && num) { let n = parseFloat(num.replace(/\s/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')); if (/\b(k|mil|thousand)\b/i.test(q)) n *= 1000; if (n >= 50) { c.conv = n; st.facts.vol = { v: n }; return true; } return false; }
  if (st.pq === 'mpc') {
    if (nq === normQ(S().mpcKnow)) { c.mpc = 4.4; return true; }
    const n = parseFloat(num.replace(',', '.')); if (n > 0 && n <= 30) { c.mpc = n; return true; } return false;
  }
  return false;
}
async function slimSaveResult() {
  const c = st.calcIn, moved = 30, trim = 34;
  const m0 = c.conv * c.mpc, m1 = c.conv * 0.7 * c.mpc * 0.66, f0 = m0 * c.rate, f1 = m1 * c.rate, sv = f0 - f1;
  st.save = Math.round(sv * 12); st.facts.save = { v: money(st.save) + T.perYr }; renderFacts();
  st.slimSave = `${c.country} at $${c.rate}/message · ${fmt(c.conv)} conversations × ${c.mpc} messages · Meta fees now ${money(f0)}/month → ${money(f1)}/month after ${moved}% moved and ${trim}% trimmed · saving ${money(sv)}/month, ${money(sv * 12)}/year`;
  const s = S();
  const ok = await pageSay(s.res({ where: whereOf(c.country), rate: c.rate.toFixed(4).replace('.', LANG === 'en' ? '.' : ','), f0: money(f0), f1: money(f1), m0: fmt(m0), y: money(sv * 12), pct: Math.round(sv / f0 * 100) }), null);
  if (!ok) return;
  saveCard(); st.fixedNote = s.note(s.noteSave);
  try { if (window.savingsCalc && window.savingsCalc.set) { window.savingsCalc.set('conv', c.conv); window.savingsCalc.set('mpc', c.mpc); } } catch (_) {}
  st.answers++; decide('');   /* the next-step card may offer the demo itself: then the chips don't repeat it */
  repliesEl.innerHTML = chipsHTML(thread.querySelector('.awe-nba .awe-cta[data-awe-act="team"]') ? [s.test, s.flows] : [s.expert, s.test, s.flows]);
}
/* ---------- Stay-or-Move Test: 4 chip questions, plan card ---------- */
function slimTestAsk() {
  const s = S(), i = st.tv.length;
  if (i < 4) { st.pq = 'test'; return pageSay(i === 0 ? [s.tIntro, s.tq[0]] : [s.tq[i]], ['0', '3', '5', '7', '10']); }
  st.pq = null; return slimTestResult();
}
function slimTestAnswer(q) { const n = parseInt((q.match(/\b(10|\d)\b/) || [])[1], 10); if (n >= 0 && n <= 10 && /^\D{0,10}(10|\d)\D{0,10}$/.test(q.trim())) { st.tv.push(n); return true; } return false; }
async function slimTestResult() {
  const a = st.tv.slice(0, 4), total = a.reduce((x, y) => x + y, 0), b = band(total), s = S();
  st.sliders = a; st.score = total; st.facts.score = { v: total + '/40' }; renderFacts();
  try { if (window.arrivalTest && window.arrivalTest.set) a.forEach((v, i) => window.arrivalTest.set(i, v)); } catch (_) {}
  const ok = await pageSay(s.tRes(total, T.bands[b].toLowerCase()).slice(0, 1), null);   /* the plan card below carries the steps */
  if (!ok) return;
  planCard(); st.fixedNote = s.note(s.noteTest);
  repliesEl.innerHTML = chipsHTML([s.expert, s.save, s.flows]); st.answers++;
}
/* the starters, the answers to page questions, and their typed variants; returns true when the page answered */
function slimPage(q) {
  const nq = normQ(q), s = S();
  if (st.pq === 'test') { if (slimTestAnswer(q)) { slimTestAsk(); return true; } st.pq = null; return false; }
  if (st.pq) { if (slimSaveAnswer(q)) { slimSaveAsk(); return true; } st.pq = null; return false; }
  const lang = SAVE_N.get(nq) || TEST_N.get(nq) || FLOWS_N.get(nq);
  if (!lang) return false;
  if (lang !== LANG && DICT[lang]) { LANG = lang; T = DICT[LANG]; paint(); }
  if (SAVE_N.has(nq)) { slimSaveAsk(); return true; }
  if (TEST_N.has(nq)) { st.tv = []; slimTestAsk(); return true; }
  pageSay(s.flowsA, [s.sort, s.expert, s.test]).then((ok) => { if (ok) st.fixedNote = s.note(s.noteFlows); });
  return true;
}
/* ---------- the summary for sales, built by the page ---------- */
function pageSummary() {
  const f = st.facts || {}, P = [];
  const msgs = (st.userMsgs || []).map((m) => m.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (msgs.length) P.push('Visitor said: ' + msgs.slice(-6).map((m) => '"' + (m.length > 180 ? m.slice(0, 177) + '…' : m) + '"').join(' / '));
  if (f.why) P.push('Why now: ' + f.why.v);
  if (st.slimSave) P.push('Savings shown: ' + st.slimSave);
  if (st.sliders && st.score != null) P.push(`Stay-or-Move Test: ${st.score}/40 (Origin ${st.sliders[0]}, Shape ${st.sliders[1]}, Follow-up ${st.sliders[2]}, Identity ${st.sliders[3]})`);
  const facts = FACT_ORDER.filter((k) => f[k] && !['why', 'from', 'email'].includes(k)).map((k) => k + ': ' + factVal(k, f[k]));
  if (facts.length) P.push(facts.join(' · '));
  if (st.demoLang) P.push('Demo language: ' + st.demoLang);
  P.push('Page: ' + location.pathname + ' (' + PAGE_LANG0 + '), chat in ' + LANG);
  return P.join('. ').slice(0, 1200);
}
function pageJourney() {
  const d = J(); if (!d) return '';
  return [(d.from === 'direct' ? 'direct' : d.from) + (d.campaign ? ' · ' + d.campaign : ''), d.before && d.before.length ? d.before.join(' → ') : '', 'visit #' + (d.visit || 1)].filter(Boolean).join(' | ');
}
function pageFields() {   /* the page's own figures go to the bot too, so sales sees them even if the agent never wrote them */
  const o = { conversation_summary: pageSummary(), visitor_journey: pageJourney() }, c = st.calcIn || {};
  if (st.slimSave) o.savings_estimate = st.slimSave;
  if (c.conv) o.wa_volume = `${fmt(c.conv)} conversations/month${c.mpc ? ' × ' + c.mpc + ' billable messages' : ''}`;
  if (c.country) o.market = `${c.country} ($${c.rate}/message)`;
  if (st.sliders && st.score != null) o.stay_move_score = `${st.score}/40 (${st.sliders.join(', ')})`;
  return o;
}
/* ---------- demo language on the booking card (same as the home): EN · ES · PT, default = chat language; Brazil goes straight to PT ---------- */
function demoLangPick() {
  const s = S(), br = GEO.cc === 'BR' || (st.calcIn && st.calcIn.country === 'Brazil');
  st.demoLang = br || LANG === 'pt' ? 'Português' : (LANG === 'es' ? 'Español' : 'English');
  if (br) return `<div class="awe-sub" style="margin-top:8px">🇧🇷 ${esc(s.demoLangPT)}</div>`;
  return `<div class="awe-sub" style="margin-top:10px">${esc(s.demoLang)}</div><div class="awe-chips" data-awe-langs style="justify-content:flex-start;margin-top:6px">${['English', 'Español', 'Português'].map((l) => `<button type="button" class="awe-chip${l === st.demoLang ? ' on' : ''}" data-awe-dlang="${l}" aria-pressed="${l === st.demoLang}">${l}</button>`).join('')}</div>`;
}
document.addEventListener('click', (e) => {
  const dl = e.target.closest && e.target.closest('[data-awe-dlang]'); if (!dl) return;
  st.demoLang = dl.dataset.aweDlang;
  dl.parentElement.querySelectorAll('button').forEach((b) => { const on = b === dl; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
}, true);
(() => { const s = document.createElement('style'); s.textContent = '#awe-panel .awe-chips[data-awe-langs] .awe-chip.on{background:#1B2139 !important;color:#fff !important;border-color:#1B2139 !important}'; document.head.appendChild(s); })();
if (/[?&]debug=1/.test(location.search)) window.__awePageFields = pageFields;   /* QA only: read what goes to the bot as custom_data */
/* ================= end Slim ================= */
async function say(text, payload) {
  const q = (text || '').trim(); if (!q) return;
  /* entry_point_conversation_start = the visitor sent a first message (a chip or typed), whether the page or the agent answers it.
     Once per page view. Typed text is never sent to analytics; a chip sends its fixed label. */
  const via = st.via || 'other'; st.via = '';
  emit('entry_point_conversation_start', ENTRY.sales, via === 'chip' ? { trigger: via, chip_label: q.slice(0, 60) } : { trigger: via });
  openPanel('message'); repliesEl.innerHTML = '';
  thread.querySelectorAll('.awe-nba').forEach((n) => n.remove());
  push(h(`<div class="awe-me">${esc(q)}</div>`));
  st.userSeq = (st.userSeq || 0) + 1;
  if (!payload) { followLang(q); (st.userMsgs = st.userMsgs || []).push(q); }
  readUser(q);
  const fast = !payload && BOOK_N.has(normQ(q));   /* booking: the card at once, the text still goes to the agent */
  if (!fast && !payload) { try { if (slimPage(q)) { setWorking(null); return; } } catch (e) { console.warn('[awe] slim', e); st.pq = null; } }   /* answered by the page: nothing sent */
  if (fast) { st.pq = null; fastStart(); st.awaitBook = true; setWorking(null); bookCard(); }
  const saveLine = payload ? '' : readSavings(q); if (!fast) setWorking(guessSection(q));
  const sc = q.match(/\b(\d{1,2})\s*\/\s*40\b/); if (sc && +sc[1] <= 40) { st.score = +sc[1]; st.facts.score = { v: sc[1] + '/40' }; renderFacts(); st.planPending = true; }
  let out = fast && EXPERT_N.has(normQ(q)) ? T.msgTeam : q;
  if (st.ctxSent && !payload && st.sentLang && st.sentLang !== LANG) out = `[Page context: chat language ${LANG}]\n\n` + q;   // the visitor switched language: tell the agent
  if (!payload) st.sentLang = LANG;
  if (!st.ctxSent && !payload) { st.ctxSent = true; let line = window.lbJourney && window.lbJourney.line ? window.lbJourney.line() : ''; line = line ? line.replace(/\]$/, ' · ' + ctxAdd() + ']') : '[Page context: ' + ctxAdd() + ']'; if (MOBILE) line = line.replace(/\]$/, ' · device mobile]'); out = line + '\n\n' + q; }
  if (st.fixedNote && !payload && !fast) { out = out.slice(0, out.length - q.length) + st.fixedNote + '\n' + q; st.fixedNote = ''; }   /* after the context line, right before their words */
  if (!fast) armWatchdog(q);
  try { await deliver(payload ? q : (saveLine ? saveLine + '\n' + out : out), payload); }
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
const SCORE_RX = /\[\[\s*SCORE\s*:\s*(\d{1,2})\s*\]\]/i;
function takeScore(text) {
  const mm = String(text).match(SCORE_RX);
  if (!mm) {   // no marker: a test total stated by the agent ("11/40") still draws the plan card, once
    const t = String(text).match(/\b(\d{1,2})\s*\/\s*40\b/);
    if (t && st.score == null && +t[1] <= 40) { st.score = +t[1]; st.facts.score = { v: t[1] + '/40' }; renderFacts(); st.planPending = true; }
    return text;
  }
  const s = Math.max(0, Math.min(40, +mm[1])); st.score = s; st.facts.score = { v: s + '/40' }; renderFacts(); st.planPending = true;
  return String(text).replace(SCORE_RX, '').replace(/\n{3,}/g, '\n\n').trim();
}
const SAVE_RX = /\[\[\s*SAVE\s*:\s*([\d.,\s]+?)\s*\]\]/i;
function takeSave(text) {
  const mm = String(text).match(SAVE_RX); if (!mm) return text;
  const n = parseFloat(mm[1].replace(/[\s.,](?=\d{3}\b)/g, '').replace(',', '.'));
  const pv = st.pageSave; if (pv) st.pageSave = null;
  if (pv || n > 0) { st.save = pv || n; st.facts.save = { v: money(st.save) + T.perYr }; renderFacts(); st.savePending = true; }
  return String(text).replace(SAVE_RX, '').replace(/\n{3,}/g, '\n\n').trim();
}
async function handleMsg(m, ex, bid) {
  setWorking(null);
  if (st.fastBook) {   /* the booking card is already on screen: only the routing matters */
    if (bid === 'sales_book') { fastEnd(false); if (!thread.querySelector('.awe-book')) bookCard(); return; }
    clearTimeout(st.fastT); st.fastT = setTimeout(() => fastEnd(true), 8000); return;
  }
  let text = takeSave(takeScore(m.message || m.title || ''));
  if (bid === 'team_email') { emailCard(); return; }
  if (bid === 'team_done') { receipts(); return; }
  if (bid === 'sales_book') { if (st.awaitBook && thread.querySelector('.awe-book')) return; bookCard(); return; }
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
    if (st.savePending && ex.is_ai_agent_message) { st.savePending = false; saveCard(); }
    return;
  }
  if (text) { await agentText(text); st.answers++; }
  if (st.planPending && ex.is_ai_agent_message) { st.planPending = false; planCard(); }
    if (st.savePending && ex.is_ai_agent_message) { st.savePending = false; saveCard(); }
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
const FIELD_LINE = /^\s*[*_`]*\s*(conversation_summary|visitor_journey|visitor_intent|channels_wanted|page_lang|page_url|chat_lang|arrival_reason|urgency|comparing|country_tier|subsource|source|savings_estimate|wa_volume|market|wa_flows|stay_move_score)\s*[*_`]*\s*([:=—–-]|$)|^\s*[*_`]*\s*(ventas|soporte|explorando)\s*[*_`]*\s*[—–-]\s|^\s*\[?page context:|^\s*\[\s*options?\b/i;
async function agentText(text) {
  text = String(text).split(/\n/).filter((l) => !FIELD_LINE.test(l)).join('\n');
  const { body, src } = splitSources(text);
  const parts = [];   // a numbered or bulleted list stays in one bubble
  for (const l of body.split(/\n/).map((x) => x.trim()).filter(Boolean)) {
    if (parts.length && /^([-•*]|\d+[.)])\s/.test(l) && /^([-•*]|\d+[.)])\s/.test(parts[parts.length - 1].split('\n').pop())) parts[parts.length - 1] += '\n' + l; else parts.push(l);
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && !reduce) { const dots = push(h('<div class="awe-typing" aria-hidden="true"><i></i><i></i><i></i></div>')); await wait(Math.min(1600, 450 + parts[i].length * 14)); dots.remove(); }
    const el = push(h(`<div class="awe-msg">${md(parts[i])}</div>`));
    if (el.querySelector('a[href*="sign-up"]')) st.signupShown = true;
    if (i === 0) ding();
  }
  readAgent(text);
  for (const part of src.split(/\s*·\s*/)) for (const [id, re] of SECTIONS) if (part && re.test(part) && !st.cited.has(id)) { st.cited.add(id); pointAt(id); return; }
}
function secEl(id) { return document.getElementById(id); }
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
  const mm = q.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil|thousand)?/i); if (!mm) return null;
  let n = parseFloat(mm[1].replace(/[\s]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')); if (mm[2]) n *= 1000;
  if (/semana|week/i.test(q)) n *= 4.3; if (/\b(d[ií]a|day|daily|diario|diários?)\b/i.test(q)) n *= 30;
  return n >= 50 ? n : null;
}
const REASON_RX = [[/balance|saldo|statement|extracto|extrato/i, 'balance'], [/payment plan|plan de pagos?|parcelamento|parcela|instal?ment|cuotas?/i, 'pplan'], [/\bbookings?\b(?!.*demo)|\breservas?\b(?!\s+una\s+demo)|agendamentos?\b|appointments?\b|\bcitas?\b/i, 'booking'], [/faq|preguntas frecuentes|perguntas frequentes|d[uú]vidas|opening hours|horario/i, 'faq'], [/reminder|recordatorio|lembrete|notification|notificaci|aviso/i, 'remind']];
const CHAN_RX = [[/whats ?app/i, 'WhatsApp'], [/web|site|sitio|chat en la web|website/i, 'Web'], [/e-?mail|correo/i, 'Email'], [/instagram/i, 'Instagram']];
function readUser(q) {
  const f = st.facts; let changed = false;
  if (st.awaiting === 'why' && q.length > 2) { f.why = { v: q.length > 70 ? q.slice(0, 68) + '…' : q }; changed = true; st.awaiting = null; }
  const keys = REASON_RX.filter(([re]) => re.test(q)).map(([, k]) => k);
  if (keys.length && !/^(score|puntu|mide|meça|meca|take|haz|hag|fa[cç])/i.test(q)) { st.reasonKeys = [...new Set([...(st.reasonKeys || []), ...keys])].slice(0, 4); f.reasons = { v: st.reasonKeys.map((k) => T.reasons[k]).join(', ') }; changed = true; }
  const ch = CHAN_RX.filter(([re]) => re.test(q)).map(([, k]) => k);
  if (ch.length && /(answer|atend|respond|soporte|support|canal|channel|usamos|we use|usamos|temos|tenemos)/i.test(q)) { f.chan = { v: [...new Set(ch)].join(', ') }; changed = true; }
  const v = parseVolume(q); if (v) { f.vol = { v }; changed = true; }
  if (changed) { renderFacts(); if (planEl && planEl.isConnected) planCard(); }
}
function readAgent(text) {
  const tail = text.slice(-220);
  st.awaiting = /(what made you|what brought you|what got you|qu[eé] te (ha )?(hecho|llevado|llev[oó]|tra[ií]do|trajo)|o que (te |fez você |te fez |trouxe))/i.test(tail) ? 'why' : null;
}
const FACT_ORDER = ['why', 'save', 'score', 'reasons', 'vol', 'chan', 'from'];
function factVal(k, o) { return k === 'vol' ? fmt(o.v) + T.perMo : o.v; }
function renderFacts() {
  const box = panel.querySelector('.awe-facts'), list = panel.querySelector('.awe-facts-list');
  const keys = FACT_ORDER.filter((k) => st.facts[k]);
  box.classList.remove('on'); /* 10-nov (Fabo): the strip stays hidden; facts still feed the plan card and the summary */
  list.innerHTML = keys.map((k) => `<button type="button" class="awe-fact${st.facts[k].guess ? ' guess' : ''}" data-awe-fact="${k}"><i>${esc(T.k[k])}</i>${esc(factVal(k, st.facts[k]))}</button>`).join('');
}
function editFact(btn) {
  const k = btn.dataset.aweFact; const o = st.facts[k]; if (!o) return;
  btn.innerHTML = `<i>${esc(T.k[k])}</i><input value="${esc(k === 'vol' ? String(Math.round(o.v)) : factVal(k, o))}" aria-label="${esc(T.k[k])}">`;
  const inp = btn.querySelector('input'); inp.focus(); inp.select();
  const commit = (sendIt) => {
    const val = inp.value.trim(); if (!val) { renderFacts(); return; }
    st.facts[k] = k === 'vol' ? { v: parseFloat(val) || o.v } : { v: val };
    if (k === 'score') { const n = parseInt(val, 10); if (n >= 0 && n <= 40) st.score = n; }
    if (k === 'reasons') st.reasonKeys = null;
    renderFacts(); if (planEl && planEl.isConnected) planCard();
    if (sendIt) say(T.msgCorr(T.k[k].toLowerCase(), factVal(k, st.facts[k])));
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') renderFacts(); });
  inp.addEventListener('blur', () => commit(false), { once: true });
}

/* ---------- the advise components: their Stay-or-Move result, and their savings (cut from this article) ---------- */
const band = (s) => (s <= 15 ? 0 : s <= 27 ? 1 : 2);
let planEl = null;
function planCard() {
  if (st.score == null) return;
  const b = band(st.score), a = st.sliders;
  let weak = '';
  if (a && a.length === 4) { const m = Math.min(...a); const i = a.indexOf(m); if (m < 7) weak = `<div class="awe-why"><b>${esc(T.weakest)}:</b> ${esc(T.qNames[i])} · ${m}/10</div>`; }
  const html = `<div class="awe-card awe-est"><span class="awe-tag">${esc(T.planH)}</span>
    <div class="awe-big">${st.score}<small> / 40</small></div><div class="awe-sub">${esc(T.bands[b])}</div>
    <div class="awe-sub" style="margin-top:10px;font-weight:700;color:var(--awe-ink)">${esc(T.planStart)}</div>
    <ol style="margin:6px 0 0;padding:0;list-style:none;display:grid;gap:6px">${T.fixes[b].map((x, n) => `<li style="display:flex;gap:10px;align-items:center;font:500 14px/1.35 'DM Sans';color:var(--awe-ink)"><span style="flex-shrink:0;min-width:30px;height:22px;border-radius:6px;background:var(--awe-soft);color:var(--awe-p7);font:700 11px/22px 'DM Sans';text-align:center">${String(n + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ol>
    ${weak}<div class="awe-why"><button type="button" data-awe-point="plan" style="all:unset;cursor:pointer;color:var(--awe-p7);font-weight:700">${esc(T.seePlan)} →</button></div></div>`;
  const card = h(html);
  if (planEl && planEl.isConnected) planEl.replaceWith(card); else push(card);
  planEl = card;
}
let saveEl = null;
function saveCard() {
  if (st.save == null) return;
  const card = h(`<div class="awe-card awe-est"><span class="awe-tag">${esc(T.saveH)}</span>
    <div class="awe-big">${esc(money(st.save))}<small>${esc(T.perYr)}</small></div><div class="awe-sub">${esc(T.saveSub)}</div>
    <div class="awe-why"><button type="button" data-awe-point="calc" style="all:unset;cursor:pointer;color:var(--awe-p7);font-weight:700">${esc(T.seeCalc)} →</button></div></div>`);
  if (saveEl && saveEl.isConnected) saveEl.replaceWith(card); else push(card);
  saveEl = card;
}
function decide(lastText) {
  if (st.teamDone || st.awaiting === 'why' || (/\?\s*$/.test(splitSources(lastText || '').body) && st.answers < 3)) return;
  const f = st.facts; let n = null;
  if (f.vol && f.vol.v >= 10000) n = { k: 'team-vol', p: 'team', s: 'build', why: T.whyTeamVol(fmt(f.vol.v)) };
  else if (st.save != null && st.save >= 5000) n = { k: 'team-save', p: 'team', s: 'build', why: T.whyTeamSave(money(st.save)) };
  else if (st.score != null || st.save != null || st.signupShown) n = { k: 'build', p: 'build', s: 'team', why: T.whyBuild };
  else if (st.answers >= 2) n = { k: 'plan', p: 'plan', s: 'build', why: T.whyPlan };
  if (n && isC()) { if (n.p === 'team') n = { k: 'build', p: 'build', s: 'plan', why: T.whyBuild }; else if (n.s === 'team') n.s = 'plan'; }   /* geo C: never offer the demo */
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
  if (st.demoLang) P.push(({ en: 'Demo language', es: 'Idioma de la demo', pt: 'Idioma da demo' })[LANG] + ': ' + st.demoLang);
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
    ${demoLangPick()}<button type="button" class="awe-cta" data-awe-cal>${esc(T.bookGo)}</button></div>`));
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

/* ---------- the page's own Stay-or-Move Test sliders feed the agent (only .bp2-test: the calculator has its own 2 ranges) ---------- */
function readSliders() {
  const r = [...document.querySelectorAll('.bp2-test input[type=range]')].filter((x) => !x.closest('#awe-panel, #awe-launch') && x.getClientRects().length);
  return r.length === 4 ? r.map((x) => +x.value) : null;
}
document.addEventListener('change', (e) => {
  if (!e.target.matches || !e.target.matches('.bp2-test input[type=range]')) return;
  const a = readSliders(); if (!a) return;
  const s = a.reduce((x, y) => x + y, 0); st.sliders = a; st.facts.score = { v: s + '/40', guess: true }; renderFacts();
  setNudge(T.scored(s), T.msgScore(s, a));
}, true);

function calcMsg(c) {
  return { y: money(c.savingsYear), conv: fmt(c.conversations), mpc: String(c.messagesPerConversation).replace('.', LANG === 'en' ? '.' : ','),
    country: c.country === 'custom' ? '$' + c.rateUSD : c.country, moved: c.movedPct, trim: c.trimmedPct };
}
window.addEventListener('savingscalc:change', (e) => {
  const c = e.detail; if (!c || !(c.savingsYear > 0)) return;
  st.calc = c; st.facts.save = { v: money(c.savingsYear) + T.perYr, guess: true }; renderFacts();
  if (st.section === 'savings' || st.section === 'calc') setNudge(T.calcd(money(c.savingsYear)), T.msgCalc(calcMsg(c)));
});
/* ---------- the bar: section-aware outcome ---------- */
const NUDGE_OF = { tldr: 'tldr', takeaways: 'tldr', why: 'why', which: 'which', 'two-ways': 'two-ways', savings: 'savings', calc: 'savings', test: 'test', move: 'move', plan: 'plan', close: 'plan', faq: 'faq' };
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
    if (active === 'test' && st.sliders) { const s = st.sliders.reduce((x, y) => x + y, 0); setNudge(T.scored(s), T.msgScore(s, st.sliders)); return; }
    if ((active === 'savings' || active === 'calc') && st.calc) { setNudge(T.calcd(money(st.calc.savingsYear)), T.msgCalc(calcMsg(st.calc))); return; }
    const [l, p] = T.nudge[NUDGE_OF[active]]; setNudge(l, p);
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
  e.preventDefault(); const inp = f.querySelector('input'); const v = inp.value.trim() || (inp === launchInput ? inp.dataset.prompt : ''); inp.value = ''; st.via = 'typed'; say(v); keepFocus(true);
});
document.addEventListener('click', (e) => {
  const su = e.target.closest && e.target.closest('a[href*="sign-up"], a[href*="signup"]'); if (su && su.closest('#awe-panel')) emit('entry_point_click', ENTRY.signup);
  const t = e.target.closest ? e.target : null; if (!t) return;
  /* the article's own "Ask the agent" nudges send their prompt; the FAQ one just opens the layer */
  const ask = t.closest('[data-awe-ask]'); if (ask) { e.preventDefault(); const p = ask.dataset.aweAsk; if (p) { st.via = 'cta'; say(p); } else { openPanel('cta'); panel.querySelector('.awe-foot input').focus(); } keepFocus(); return; }
  const chip = t.closest('[data-awe-say]'); if (chip) { st.via = 'chip'; say(chip.dataset.aweSay, chip.dataset.awePayload || undefined); keepFocus(); return; }
  const cal = t.closest('[data-awe-cal]'); if (cal) { openCal(cal); return; }
  const p = t.closest('[data-awe-point]'); if (p) { pointAt(p.dataset.awePoint); return; }
  const a = t.closest('[data-awe-act]'); if (a) { act(a.dataset.aweAct); return; }
  const fct = t.closest('[data-awe-fact]'); if (fct && !fct.querySelector('input')) { editFact(fct); return; }
  if (t.closest('[data-awe-retry]')) { retryLast(); return; }
  if (t.closest('[data-awe-close]')) { closePanel(); return; }
  if (t.closest('[data-awe-open]')) { if (launchInput.value.trim()) { const v = launchInput.value; launchInput.value = ''; st.via = 'typed'; say(v); } else { openPanel('launcher'); panel.querySelector('.awe-foot input').focus(); } return; }
}, true);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (st.open) closePanel(); else { openPanel('shortcut'); panel.querySelector('.awe-foot input').focus(); } }
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
