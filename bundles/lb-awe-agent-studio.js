/* Landbot Conversion Agent · Agent Studio LP (/lp/agent-studio) · built 2026-10-08 */
(() => { if (document.getElementById('awe-style')) return; const s = document.createElement('style'); s.id = 'awe-style'; s.textContent = "\n  :root{--awe-grad:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);--awe-ink:#1B2139;--awe-text:#3A3D5C;--awe-mut:#5D6079;--awe-line:#E5E6EA;--awe-soft:#F4F4FF;--awe-p:#5A60F6;--awe-p7:#4047C4}\n  .awe-orb{flex-shrink:0;width:34px;height:34px;border-radius:50%;position:relative;\n    background:conic-gradient(from 0deg,#5A60F6,#4FCCC2,#F58B0B,#FF3F7B,#5A60F6);animation:awe-spin 7s linear infinite}\n  .awe-orb::after{content:\"\";position:absolute;inset:22%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.9),rgba(255,255,255,.15) 60%,transparent 70%)}\n  .awe-orb.sm{width:24px;height:24px}\n  .awe-orb.work{animation-duration:1.4s}\n  @keyframes awe-spin{to{transform:rotate(360deg)}}\n\n  .awe-compose{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 16px;border-radius:14px;border:1px solid var(--awe-line);background:#fff;transition:border-color .2s,box-shadow .2s}\n  .awe-compose:focus-within{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-compose input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 15px/1.4 'DM Sans';color:var(--awe-ink);padding:8px 0}\n  .awe-compose input::placeholder{color:#9596A7}\n  .awe-send{all:unset;cursor:pointer;width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--awe-grad);color:#fff;font:700 16px/1 'DM Sans'}\n  .awe-chips{display:flex;flex-wrap:wrap;gap:8px}\n  .awe-chip{all:unset;cursor:pointer;padding:7px 13px;border-radius:999px;border:1px solid #CFD1FE;background:#fff;color:var(--awe-p7);font:500 13.5px/1.2 'DM Sans';transition:background .15s,border-color .15s}\n  .awe-chip:hover{background:var(--awe-soft);border-color:var(--awe-p)}\n  .awe-chip:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.35)}\n\n  /* Lava orb (from the orb widget example) */\n  .awe-lava{display:block;position:relative;flex-shrink:0;width:56px;height:56px;border-radius:50%;cursor:pointer}\n  .awe-lava svg{position:absolute;inset:0;width:100%;height:100%;animation:awe-breathe 9s ease-in-out infinite}\n  .awe-lava .g1{animation:awe-mb1 5.2s ease-in-out infinite}.awe-lava .g2{animation:awe-mb2 6s ease-in-out infinite}\n  .awe-lava .g3{animation:awe-mb3 4.6s ease-in-out infinite}.awe-lava .g4{animation:awe-mb4 5.6s ease-in-out infinite}\n  .awe-lava .g5{animation:awe-mb5 4s ease-in-out infinite}\n  .awe-lava.sm{width:30px;height:30px;cursor:default}\n  .awe-lava.work svg{animation-duration:1.6s}\n  @keyframes awe-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}\n  @keyframes awe-mb1{0%,100%{transform:translate(0,0)}33%{transform:translate(64px,38px)}66%{transform:translate(-30px,52px)}}\n  @keyframes awe-mb2{0%,100%{transform:translate(0,0)}33%{transform:translate(-58px,56px)}66%{transform:translate(48px,-26px)}}\n  @keyframes awe-mb3{0%,100%{transform:translate(0,0)}33%{transform:translate(48px,-56px)}66%{transform:translate(-52px,-18px)}}\n  @keyframes awe-mb4{0%,100%{transform:translate(0,0)}33%{transform:translate(-66px,-36px)}66%{transform:translate(40px,44px)}}\n  @keyframes awe-mb5{0%,100%{transform:translate(0,0)}33%{transform:translate(40px,68px)}66%{transform:translate(-44px,28px)}}\n\n  /* Launcher: a compact bar, bottom centre \u2014 reads as a page tool, not a support widget in the corner */\n  #awe-launch{position:fixed;left:50%;bottom:20px;z-index:9000;display:flex;flex-direction:column;align-items:center;gap:8px;transform:translateX(-50%);\n    transition:opacity .3s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-launch.off{opacity:0;transform:translate(-50%,16px);pointer-events:none}\n  #awe-launch.tuck{opacity:0;transform:translate(-50%,28px);pointer-events:none}   /* out of the way while the visitor scrolls down to read */\n  /* LED border: a thin light in the brand colours travels round the bar (no glow \u2014 keep it subtle) */\n  @property --awe-ang{syntax:'<angle>';inherits:false;initial-value:0deg}\n  .awe-pill{position:relative;isolation:isolate;display:flex;align-items:center;gap:10px;padding:4px 4px 4px 4px;border-radius:999px;width:420px;max-width:calc(100vw - 32px);\n    --awe-led:conic-gradient(from var(--awe-ang),rgba(90,96,246,.3) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.3) 210deg,rgba(90,96,246,.3) 360deg);\n    border:1.5px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--awe-led) border-box;\n    box-shadow:0 22px 50px -24px rgba(51,64,94,.45);animation:awe-led 3.6s linear infinite;transition:width .45s cubic-bezier(.21,.78,.36,1),box-shadow .25s}\n  @keyframes awe-led{to{--awe-ang:360deg}}\n  #awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:500px;animation-duration:2.2s}\n  /* LED line on page cards (the sidebar CTA): same travelling light as the bar, drawn as a masked ring so the card keeps its own background */\n  .awe-led-card{position:relative;isolation:isolate}\n  .awe-led-card::before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;\n    background:conic-gradient(from var(--awe-ang),rgba(255,255,255,.14) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(255,255,255,.14) 210deg,rgba(255,255,255,.14) 360deg);\n    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:awe-led 5s linear infinite}\n  .awe-led-card.light::before{background:conic-gradient(from var(--awe-ang),rgba(90,96,246,.25) 0deg,#FF3F7B 45deg,#F58B0B 80deg,#5A60F6 120deg,#4FCCC2 160deg,rgba(90,96,246,.25) 210deg,rgba(90,96,246,.25) 360deg)}\n  .awe-pill-send{all:unset;cursor:pointer;flex-shrink:0;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;\n    background:linear-gradient(135deg,#FF3F7B 0%,#5A60F6 100%);box-shadow:0 10px 22px -8px rgba(90,96,246,.6);transition:transform .2s,box-shadow .2s}\n  .awe-pill-send svg{width:18px;height:18px}\n  .awe-pill-send:hover{transform:scale(1.08);box-shadow:0 14px 26px -8px rgba(90,96,246,.72)}\n  .awe-pill-send:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-pill input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:500 14.5px 'DM Sans';color:var(--awe-ink);padding:10px 0}\n  .awe-pill input::placeholder{color:var(--awe-mut);transition:opacity .25s}\n  .awe-pill.swap input::placeholder{opacity:0}\n  #awe-launch .awe-chips{margin:0;justify-content:center;max-width:500px;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .25s,transform .25s}\n  #awe-launch:focus-within .awe-chips,#awe-launch.wide .awe-chips{opacity:1;transform:none;pointer-events:auto}\n  #awe-launch .awe-chip{background:rgba(255,255,255,.92);box-shadow:0 8px 20px -12px rgba(51,64,94,.35)}\n\n  /* Unread badge on the closed launcher: a reply arrived while the layer was shut */\n  [data-awe-open]{position:relative}\n  .awe-badge{position:absolute;top:-4px;left:-4px;min-width:18px;height:18px;padding:0 5px;box-sizing:border-box;border-radius:999px;background:#E6194B;color:#fff;\n    font:700 11px/18px 'DM Sans';text-align:center;box-shadow:0 0 0 2px #fff;transform:scale(0);transition:transform .25s cubic-bezier(.34,1.56,.64,1);pointer-events:none}\n  .awe-badge.on{transform:scale(1)}\n  .awe-badge.bump{animation:awe-bump .45s ease}\n  @keyframes awe-bump{40%{transform:scale(1.3)}}\n  /* Scrim: dims the page while the layer is open so open vs closed reads at a glance */\n  #awe-scrim{position:fixed;inset:0;z-index:8999;background:rgba(16,20,36,.42);opacity:0;pointer-events:none;transition:opacity .3s ease}\n  #awe-scrim.on{opacity:1;pointer-events:auto}\n  #awe-scrim.on.lift{opacity:.25}\n  /* The layer: a panel that works next to the article */\n  #awe-panel{position:fixed;top:88px;right:24px;bottom:24px;width:440px;z-index:9001;display:flex;flex-direction:column;background:#fff;border-radius:22px;\n    border:1px solid var(--awe-line);box-shadow:0 4px 4px rgba(51,64,94,.06),0 16px 32px rgba(51,64,94,.1),0 32px 64px rgba(51,64,94,.1);overflow:hidden;\n    opacity:0;transform:translateX(28px);pointer-events:none;transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1)}\n  #awe-panel.on{opacity:1;transform:none;pointer-events:auto}\n  /* desktop: the layer opens out of the bar, centred above it */\n  #awe-panel{top:auto;left:50%;right:auto;bottom:20px;width:540px;height:min(680px,calc(100vh - 108px));transform:translate(-50%,28px) scale(.98);transform-origin:50% 100%}\n  #awe-panel.on{transform:translate(-50%,0)}\n  #awe-panel{transition:opacity .25s,transform .45s cubic-bezier(.34,1.56,.64,1),width .35s cubic-bezier(.2,.8,.2,1)}\n  #awe-panel.wide{width:min(720px,calc(100vw - 48px))}\n  .awe-cal{margin:10px -6px 0;border-radius:12px;overflow:hidden;border:1px solid var(--awe-line);background:#fff}\n  .awe-cal{position:relative}\n  .awe-cal::before{content:attr(data-loading);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  /* shown at 80%: the iframe is laid out 25% larger and scaled down, so Calendly keeps its layout and the card stays small */\n  .awe-cal{height:432px}\n  .awe-cal iframe{position:relative;display:block;width:125%;height:540px;border:0;opacity:0;transition:opacity .3s;transform:scale(.8);transform-origin:0 0}\n  .awe-cal.ready iframe{opacity:1}\n  .awe-head{display:flex;align-items:center;gap:12px;padding:14px 14px 12px 16px;border-bottom:1px solid #F7F7F8}\n  .awe-head-t{flex:1;min-width:0}\n  .awe-head-t b{display:block;font:700 15px/1.3 'DM Sans';color:var(--awe-ink)}\n  .awe-status{display:flex;align-items:center;gap:6px;font:500 12px/1.3 'DM Sans';color:var(--awe-mut)}\n  .awe-status::before{content:\"\";width:6px;height:6px;border-radius:50%;background:#52CC57;flex-shrink:0}\n  .awe-status.work::before{background:#F59E0B;animation:awe-pulse 1s ease-in-out infinite}\n  @keyframes awe-pulse{50%{opacity:.3}}\n  .awe-x{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;color:var(--awe-mut);font-size:15px}\n  .awe-x:hover{background:#F7F7F8}.awe-x:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n\n  .awe-facts{display:none;padding:10px 16px 12px;border-bottom:1px solid #F7F7F8;background:linear-gradient(180deg,#FAFAFF,#fff)}\n  .awe-facts.on{display:block;animation:awe-in .4s cubic-bezier(0,0,.2,1)}\n  .awe-facts-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;font:700 10.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--awe-p7)}\n  .awe-facts-h span{font:400 11px 'DM Sans';letter-spacing:0;text-transform:none;color:#9596A7}\n  .awe-facts-list{display:flex;flex-wrap:wrap;gap:6px}\n  .awe-fact{all:unset;cursor:text;display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:8px;background:#fff;border:1px solid var(--awe-line);font:500 12.5px/1.2 'DM Sans';color:var(--awe-ink);animation:awe-in .35s}\n  .awe-fact i{font-style:normal;color:#9596A7;font-size:11.5px}\n  .awe-fact.guess{border-style:dashed}\n  .awe-fact:hover{border-color:#CFD1FE}\n  .awe-fact input{all:unset;width:110px;font:500 12.5px 'DM Sans';color:var(--awe-ink)}\n\n  .awe-thread{flex:1;overflow-y:auto;padding:16px 18px 8px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth}\n  .awe-msg{font:400 14.5px/1.6 'DM Sans';color:var(--awe-text);animation:awe-in .35s cubic-bezier(0,0,.2,1)}\n  /* chat bubbles: the agent's side reads like a conversation, not a document */\n  .awe-msg{align-self:flex-start;max-width:88%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:#F4F5F9;line-height:1.5}\n  .awe-thread .awe-msg + .awe-msg{margin-top:-8px}\n  .awe-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;border-radius:16px 16px 16px 4px;background:#F4F5F9;animation:awe-in .2s}\n  .awe-typing i{width:6px;height:6px;border-radius:50%;background:#9596A7;animation:awe-dot 1s ease-in-out infinite}\n  .awe-typing i:nth-child(2){animation-delay:.15s}.awe-typing i:nth-child(3){animation-delay:.3s}\n  @keyframes awe-dot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}\n  .awe-msg p{margin:0 0 8px}.awe-msg p:last-child{margin:0}\n  .awe-msg ul,.awe-msg ol{margin:4px 0 8px;padding-left:20px}.awe-msg li{margin:2px 0}\n  .awe-msg b,.awe-msg strong{color:var(--awe-ink)}\n  .awe-msg a{color:var(--awe-p);font-weight:700;text-decoration:none;border-bottom:1.5px solid #CFD1FE}\n  .awe-msg a:hover{border-color:var(--awe-p)}\n  .awe-me{align-self:flex-end;max-width:85%;padding:8px 13px;border-radius:16px 16px 4px 16px;background:var(--awe-p);color:#fff;font:500 14px/1.45 'DM Sans';animation:awe-in .25s}\n  @keyframes awe-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\n  .awe-src{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}\n  .awe-src a,.awe-src button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:7px;background:#F7F7F8;font:500 11.5px/1.3 'DM Sans';color:var(--awe-mut);border:1px solid transparent}\n  .awe-src a:hover,.awe-src button:hover{border-color:var(--awe-line);color:var(--awe-ink)}\n  .awe-src em{font-style:normal;font:700 9.5px 'DM Mono',monospace;letter-spacing:.06em;color:var(--awe-p7)}\n  .awe-working{display:flex;align-items:center;gap:10px;font:500 13px 'DM Sans';color:var(--awe-mut)}\n  .awe-working span{background:linear-gradient(90deg,#9596A7,#5A60F6,#9596A7);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:awe-sh 1.6s linear infinite}\n  @keyframes awe-sh{to{background-position:-200% 0}}\n\n  .awe-card{border:1px solid var(--awe-line);border-radius:16px;padding:14px 14px 12px;background:#fff;box-shadow:0 2px 8px rgba(51,64,94,.05);animation:awe-in .45s cubic-bezier(0,0,.2,1)}\n  .awe-tag{display:inline-block;font:700 9.5px/1 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:4px 6px;border-radius:5px;background:#EBECFF;color:var(--awe-p7);margin-bottom:8px}\n  .awe-tag.act{background:#DEF6DF;color:#1B6B1F}\n  .awe-big{font:700 30px/1.1 'DM Sans';letter-spacing:-.02em;color:var(--awe-ink)}\n  .awe-big small{font:500 14px 'DM Sans';color:var(--awe-mut);letter-spacing:0}\n  .awe-sub{font:400 13px/1.5 'DM Sans';color:var(--awe-mut);margin-top:4px}\n  .awe-range{width:100%;margin:12px 0 2px;accent-color:#5A60F6}\n  .awe-rangelab{display:flex;justify-content:space-between;font:500 11px 'DM Mono',monospace;color:#9596A7}\n  .awe-why{margin-top:10px;padding:8px 10px;border-radius:10px;background:#FAFAFF;font:400 12.5px/1.5 'DM Sans';color:var(--awe-mut)}\n  .awe-why b{color:var(--awe-p7)}\n  .awe-cta{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--awe-ink);color:#fff;font:700 14.5px 'DM Sans';transition:transform .15s,box-shadow .15s}\n  .awe-cta:hover{transform:translateY(-1px);box-shadow:0 10px 22px -10px rgba(27,33,57,.6)}\n  .awe-cta:focus-visible{box-shadow:0 0 0 3px rgba(90,96,246,.45)}\n  .awe-alt{display:flex;gap:6px;align-items:center;justify-content:center;margin-top:8px;font:400 12.5px 'DM Sans';color:#9596A7}\n  .awe-alt button,.awe-alt a{all:unset;cursor:pointer;color:var(--awe-p7);font-weight:700}\n  .awe-alt button:hover,.awe-alt a:hover{text-decoration:underline}\n  .awe-field{display:flex;gap:8px;margin-top:10px}\n  .awe-field input{flex:1;min-width:0;border:1px solid var(--awe-line);border-radius:10px;padding:11px 12px;font:500 14px 'DM Sans';color:var(--awe-ink);outline:0}\n  .awe-field input:focus{border-color:var(--awe-p);box-shadow:0 0 0 3px rgba(90,96,246,.15)}\n  .awe-field input[aria-invalid=true]{border-color:#FF3F7B}\n  .awe-field button{all:unset;cursor:pointer;padding:0 14px;border-radius:10px;background:var(--awe-grad);color:#fff;font:700 13.5px 'DM Sans'}\n  .awe-receipt{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-top:1px dashed var(--awe-line);font:400 13px/1.45 'DM Sans';color:var(--awe-text);opacity:0;transform:translateY(4px);transition:opacity .35s,transform .35s}\n  .awe-receipt:first-of-type{border-top:0}\n  .awe-receipt.on{opacity:1;transform:none}\n  .awe-receipt .ok{flex-shrink:0;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#52CC57;color:#fff;font:700 11px 'DM Sans';margin-top:1px}\n  .awe-receipt small{display:block;font:500 11px 'DM Mono',monospace;color:#9596A7}\n\n  .awe-foot{border-top:1px solid #F7F7F8;padding:10px 12px 8px}\n  .awe-foot .awe-compose{margin:0}\n  .awe-foot p{margin:7px 2px 0;font:400 11px/1.4 'DM Sans';color:#9596A7;text-align:center}\n  .awe-foot .awe-chips{margin:0 0 8px}\n\n  /* pointAt(): the agent lights up the part of the article it is reading */\n  .awe-point{position:relative;border-radius:12px;box-shadow:0 0 0 3px rgba(90,96,246,.35),0 0 0 10px rgba(90,96,246,.08);transition:box-shadow .4s}\n  .awe-point::before{content:attr(data-awe-label);position:absolute;top:-12px;left:12px;z-index:2;padding:3px 8px;border-radius:6px;background:var(--awe-p);color:#fff;font:700 10.5px/1.4 'DM Sans';white-space:nowrap}\n  .awe-morph{transition:opacity .3s}\n  .awe-morph.out{opacity:0}\n\n  @media (max-width:900px){\n    #awe-panel{top:auto;left:0;right:0;bottom:0;width:auto;height:90vh;border-radius:22px 22px 0 0;transform:translateY(40px)}\n    #awe-panel.on{transform:none}\n    #awe-panel.wide{width:auto}\n    #awe-launch{left:16px;right:16px;bottom:12px;transform:none;align-items:stretch}\n    #awe-launch.off{transform:translateY(16px)}\n    #awe-launch.tuck{transform:translateY(28px)}\n    .awe-pill,#awe-launch:focus-within .awe-pill,#awe-launch.wide .awe-pill{width:auto;max-width:none}\n    #awe-launch .awe-chips{max-width:none}\n  }\n  @media (prefers-reduced-motion:reduce){.awe-pill,.awe-led-card::before{animation:none}.awe-orb{animation:none}#awe-launch,#awe-panel,#awe-scrim,.awe-badge,.awe-msg,.awe-card{transition:none;animation:none}.awe-lava svg,.awe-lava circle{animation:none!important}}\n  /* What the team will see: the handoff summary under a receipt */\n  .awe-sees{margin-top:10px;border-top:1px dashed var(--awe-line);padding-top:8px;font:400 12.5px/1.55 'DM Sans';color:var(--awe-mut)}\n  .awe-sees summary{cursor:pointer;list-style:none;font:700 10.5px/1.4 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--awe-p7);margin-bottom:4px}\n  .awe-sees summary::-webkit-details-marker{display:none}\n  .awe-sees div{padding:2px 0;word-break:break-word}\n\n/* Home Conversion Agent Master \u00b7 \"glass\" theme for the layer (dark Landbot gradient + frosted bubbles).\n   Loaded after awe-style; every rule is scoped to #awe-panel so the bar on the page keeps its look. */\n#awe-panel{\n  --g-ink:#0F1326; --g-text:rgba(255,255,255,.92); --g-mut:rgba(226,228,255,.66); --g-line:rgba(255,255,255,.16);\n  --g-glass:rgba(255,255,255,.09); --g-glass-hi:rgba(255,255,255,.16);\n  color:var(--g-text); border:1px solid rgba(255,255,255,.14);\n  background:\n    radial-gradient(120% 70% at 0% 0%, rgba(90,96,246,.85) 0%, rgba(90,96,246,0) 55%),\n    radial-gradient(90% 60% at 100% 18%, rgba(79,204,194,.45) 0%, rgba(79,204,194,0) 60%),\n    radial-gradient(80% 55% at 85% 100%, rgba(255,63,123,.38) 0%, rgba(255,63,123,0) 60%),\n    radial-gradient(60% 40% at 10% 92%, rgba(245,139,11,.22) 0%, rgba(245,139,11,0) 60%),\n    linear-gradient(165deg,#24206B 0%,#16193A 48%,#0F1326 100%);\n  box-shadow:0 30px 80px -20px rgba(15,19,38,.65),0 0 0 1px rgba(255,255,255,.04) inset;\n}\n#awe-panel::before{content:\"\";position:absolute;inset:0;pointer-events:none;border-radius:inherit;\n  background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,0) 22%)}\n#awe-panel > *{position:relative}\n#awe-panel p,#awe-panel li,#awe-panel span:not(.awe-badge){color:inherit}   /* the site colours every <p> navy */\n\n/* glass surfaces */\n#awe-panel .awe-msg,#awe-panel .awe-typing,#awe-panel .awe-card,#awe-panel .awe-fact,#awe-panel .awe-chip,#awe-panel .awe-compose,#awe-panel .awe-src a,#awe-panel .awe-src button{\n  -webkit-backdrop-filter:blur(16px) saturate(150%);backdrop-filter:blur(16px) saturate(150%)}\n\n/* head */\n#awe-panel .awe-head{border-bottom:1px solid var(--g-line);background:rgba(255,255,255,.04)}\n#awe-panel .awe-head-t b{color:#fff}\n#awe-panel .awe-status{color:var(--g-mut)}\n#awe-panel .awe-x{color:var(--g-mut)}#awe-panel .awe-x:hover{background:var(--g-glass);color:#fff}\n\n/* what I've understood */\n#awe-panel .awe-facts{background:rgba(255,255,255,.03);border-bottom:1px solid var(--g-line)}\n#awe-panel .awe-facts-h{color:#B9BCFF}#awe-panel .awe-facts-h span{color:var(--g-mut)}\n#awe-panel .awe-fact{background:var(--g-glass);border:1px solid var(--g-line);color:#fff}\n#awe-panel .awe-fact i{color:var(--g-mut)}\n#awe-panel .awe-fact:hover{border-color:rgba(255,255,255,.35)}\n#awe-panel .awe-fact input{color:#fff}\n\n/* conversation */\n#awe-panel .awe-msg{background:var(--g-glass);border:1px solid var(--g-line);color:var(--g-text);\n  box-shadow:0 10px 30px -18px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.12)}\n#awe-panel .awe-msg b,#awe-panel .awe-msg strong{color:#fff}\n#awe-panel .awe-msg a{color:#fff;border-bottom-color:rgba(255,255,255,.45)}\n#awe-panel .awe-me{background:linear-gradient(135deg,#E8417F,#5A60F6);border:0;background-clip:padding-box;\n  box-shadow:0 12px 28px -14px rgba(90,96,246,.8),inset 0 0 0 1px rgba(255,255,255,.14),inset 0 1px 0 rgba(255,255,255,.22)}\n#awe-panel .awe-src a,#awe-panel .awe-src button{background:rgba(255,255,255,.07);color:var(--g-mut);border:1px solid var(--g-line)}\n#awe-panel .awe-src a:hover,#awe-panel .awe-src button:hover{color:#fff;border-color:rgba(255,255,255,.35)}\n#awe-panel .awe-src em{color:#B9BCFF}\n\n/* thinking: the lava orb, faster, next to the three dots */\n#awe-panel .awe-think{align-self:flex-start;display:flex;align-items:center;gap:8px;animation:awe-in .2s}\n#awe-panel .awe-typing{background:var(--g-glass);border:1px solid var(--g-line);padding:11px 13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}\n#awe-panel .awe-typing i{background:rgba(255,255,255,.85)}\n#awe-panel .awe-think-l{font:500 12px 'DM Sans';color:var(--g-mut)}\n#awe-panel .awe-lava.xs{width:32px;height:32px;cursor:default}\n.awe-lava.work svg{animation-duration:3.2s}\n.awe-lava.work .g1{animation-duration:2.1s}.awe-lava.work .g2{animation-duration:2.5s}.awe-lava.work .g3{animation-duration:1.9s}\n.awe-lava.work .g4{animation-duration:2.3s}.awe-lava.work .g5{animation-duration:1.7s}\n#awe-panel .awe-working{display:block}\n#awe-panel .awe-working span{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:inherit;animation:none}\n#awe-panel .awe-working .awe-think-l{background:linear-gradient(90deg,rgba(226,228,255,.55),#fff,rgba(226,228,255,.55));background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:awe-sh 1.6s linear infinite}\n\n/* cards */\n#awe-panel .awe-card{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);\n  box-shadow:0 18px 40px -22px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.16)}\n#awe-panel .awe-card div[style*=\"var(--awe-ink)\"]{color:#fff!important}\n#awe-panel .awe-card b[style]{color:#fff}\n#awe-panel .awe-sub{color:var(--g-mut)}\n#awe-panel .awe-tag{background:rgba(185,188,255,.18);color:#D6D8FF}\n#awe-panel .awe-tag.act{background:rgba(82,204,87,.18);color:#9BEFA0}\n#awe-panel .awe-why{background:rgba(255,255,255,.06);border:1px solid var(--g-line);color:var(--g-mut)}\n#awe-panel .awe-why b{color:#D6D8FF}\n#awe-panel .awe-why a{color:#fff;font-weight:700}\n#awe-panel .awe-cta{background:linear-gradient(135deg,#FF3F7B,#5A60F6);border:0;color:#fff;box-shadow:0 12px 26px -12px rgba(255,63,123,.7),inset 0 1px 0 rgba(255,255,255,.3)}\n#awe-panel .awe-alt{color:var(--g-mut)}#awe-panel .awe-alt button,#awe-panel .awe-alt a{color:#fff}\n#awe-panel .awe-field input{background:rgba(255,255,255,.08);border:1px solid var(--g-line);color:#fff}\n#awe-panel .awe-field input::placeholder{color:var(--g-mut)}\n#awe-panel .awe-receipt{color:var(--g-text);border-top-color:var(--g-line)}\n#awe-panel .awe-receipt small{color:var(--g-mut)}\n#awe-panel .awe-sees,#awe-panel .awe-sees summary{color:var(--g-mut)}\n#awe-panel .awe-cal{border-color:var(--g-line)}\n#awe-panel .awe-chips[data-awe-langs] .awe-chip.on{background:rgba(255,255,255,.9);color:#1B2139;border-color:#fff}\n\n/* footer: chips + compose */\n#awe-panel .awe-foot{border-top:1px solid var(--g-line);background:rgba(255,255,255,.03)}\n#awe-panel .awe-chip{background:var(--g-glass);border:1px solid rgba(255,255,255,.22);color:#fff}\n#awe-panel .awe-chip:hover{background:var(--g-glass-hi);border-color:rgba(255,255,255,.4)}\n#awe-panel .awe-compose{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:5px 5px 5px 18px;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}\n#awe-panel .awe-compose:focus-within{border-color:rgba(255,255,255,.45);box-shadow:0 0 0 3px rgba(90,96,246,.35)}\n#awe-panel .awe-compose input{color:#fff}\n#awe-panel .awe-compose input::placeholder{color:var(--g-mut)}\n#awe-panel .awe-send{border-radius:50%;background:#fff;color:#1B2139}\n#awe-panel .awe-foot p{color:rgba(226,228,255,.5)}\n\n/* scrollbar */\n#awe-panel .awe-thread{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent}\n#awe-panel .awe-thread::-webkit-scrollbar{width:6px}#awe-panel .awe-thread::-webkit-scrollbar-thumb{background:rgba(255,255,255,.22);border-radius:6px}\n\n@media (prefers-reduced-motion: reduce){.awe-lava.work svg,.awe-lava.work circle{animation:none}}\n\n/* ---------- cards the agent writes: sketch of their agent, prompt for a coding agent ---------- */\n#awe-panel .awe-steps{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:8px}\n#awe-panel .awe-steps li{display:flex;gap:10px;align-items:flex-start;font:500 14px/1.45 'DM Sans';color:var(--g-text)}\n#awe-panel .awe-steps li span{flex-shrink:0;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:700 11px 'DM Sans';color:#fff;\n  background:linear-gradient(135deg,#FF3F7B,#5A60F6);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}\n#awe-panel .awe-code{margin:4px 0 0;padding:12px 14px;max-height:220px;overflow:auto;white-space:pre-wrap;word-break:break-word;border-radius:12px;\n  background:rgba(8,10,24,.55);border:1px solid var(--g-line);font:500 12.5px/1.55 'DM Mono',ui-monospace,monospace;color:#E6E7FF}\n#awe-panel .awe-prompt-f{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:10px}\n#awe-panel .awe-prompt-f .awe-sub{margin:0;font-size:12px}\n#awe-panel .awe-prompt-f .awe-chip{flex-shrink:0}\n#awe-panel .awe-theme{font-size:15px}\n\n/* ---------- light theme: same glass, pale Landbot gradient (follows the system; \u2600\ufe0e/\u263e in the head) ---------- */\n#awe-panel.light{\n  --g-text:#2B2F4A; --g-mut:#5D6079; --g-line:rgba(27,33,57,.09); --g-glass:rgba(255,255,255,.62); --g-glass-hi:rgba(255,255,255,.85);\n  color:var(--g-text); border:1px solid rgba(255,255,255,.9);\n  background:\n    radial-gradient(120% 70% at 0% 0%, rgba(90,96,246,.22) 0%, rgba(90,96,246,0) 55%),\n    radial-gradient(90% 60% at 100% 15%, rgba(79,204,194,.20) 0%, rgba(79,204,194,0) 60%),\n    radial-gradient(80% 55% at 85% 100%, rgba(255,63,123,.16) 0%, rgba(255,63,123,0) 60%),\n    radial-gradient(60% 40% at 8% 95%, rgba(245,139,11,.12) 0%, rgba(245,139,11,0) 60%),\n    linear-gradient(170deg,#F6F6FF 0%,#FBFBFF 55%,#FFFFFF 100%);\n  box-shadow:0 30px 80px -24px rgba(51,64,94,.35),0 0 0 1px rgba(255,255,255,.6) inset}\n#awe-panel.light::before{background:linear-gradient(180deg,rgba(255,255,255,.7),rgba(255,255,255,0) 25%)}\n#awe-panel.light .awe-head,#awe-panel.light .awe-facts,#awe-panel.light .awe-foot{background:rgba(255,255,255,.35)}\n#awe-panel.light .awe-head-t b,#awe-panel.light .awe-fact,#awe-panel.light .awe-fact input,#awe-panel.light .awe-msg b,#awe-panel.light .awe-msg strong{color:#1B2139}\n#awe-panel.light .awe-x{color:var(--g-mut)}#awe-panel.light .awe-x:hover{background:rgba(27,33,57,.06);color:#1B2139}\n#awe-panel.light .awe-facts-h{color:#4047C4}\n#awe-panel.light .awe-msg{box-shadow:0 10px 26px -18px rgba(51,64,94,.35),inset 0 1px 0 rgba(255,255,255,.9)}\n#awe-panel.light .awe-msg a{color:#4047C4;border-bottom-color:#CFD1FE}\n#awe-panel.light .awe-src a,#awe-panel.light .awe-src button{background:rgba(255,255,255,.7)}\n#awe-panel.light .awe-src em,#awe-panel.light .awe-why b,#awe-panel.light .awe-tag{color:#4047C4}\n#awe-panel.light .awe-tag{background:rgba(90,96,246,.12)}\n#awe-panel.light .awe-tag.act{background:rgba(82,204,87,.16);color:#1B6B1F}\n#awe-panel.light .awe-typing i{background:#9596A7}\n#awe-panel.light .awe-card{background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.95);box-shadow:0 16px 36px -22px rgba(51,64,94,.4),inset 0 1px 0 #fff}\n#awe-panel.light .awe-card div[style*=\"var(--awe-ink)\"],#awe-panel.light .awe-card b[style]{color:#1B2139!important}\n#awe-panel.light .awe-why{background:rgba(255,255,255,.6)}\n#awe-panel.light .awe-why a,#awe-panel.light .awe-alt button,#awe-panel.light .awe-alt a{color:#4047C4}\n#awe-panel.light .awe-field input{background:rgba(255,255,255,.8);color:#1B2139}\n#awe-panel.light .awe-chip{background:rgba(255,255,255,.7);border:1px solid rgba(90,96,246,.25);color:#4047C4}\n#awe-panel.light .awe-chip:hover{background:#fff;border-color:#5A60F6}\n#awe-panel.light .awe-chips[data-awe-langs] .awe-chip.on{background:#1B2139;color:#fff;border-color:#1B2139}\n#awe-panel.light .awe-compose{background:rgba(255,255,255,.75);border:1px solid rgba(27,33,57,.1)}\n#awe-panel.light .awe-compose input{color:#1B2139}\n#awe-panel.light .awe-send{background:linear-gradient(135deg,#FF3F7B,#5A60F6);color:#fff}\n#awe-panel.light .awe-foot p{color:#9596A7}\n#awe-panel.light .awe-steps li{color:#2B2F4A}\n#awe-panel.light .awe-code{background:#1B2139;color:#E6E7FF;border-color:transparent}\n#awe-panel.light .awe-working .awe-think-l{background-image:linear-gradient(90deg,#9596A7,#5A60F6,#9596A7)}\n#awe-panel.light .awe-thread{scrollbar-color:rgba(27,33,57,.2) transparent}\n\n#awe-panel .awe-alt{flex-wrap:wrap;row-gap:4px}\n"; document.head.appendChild(s); })();

/* ---------------------------------------------------------------------------
   Agentic Web Experience · lb-awe: AGENT STUDIO LP (paid media, landbot.io/lp/agent-studio)
   Front of the landbot-conversion-agent skill, adapted from the home Conversion Agent Master.
   Back: bot "Agent Studio LP Conversion Agent" in the Landbot Sales brand 51550 (f010e6d0…, channel 3525318,
   AI agent e1383584…) run headless via Landbot.Core. The page's own "Talk to an expert"
   CTAs keep their specialist bot (H-1692061); this agent is the sticky bar only.
   Country: time zone (mockup) → window.LB_COUNTRY (Cloudflare header, production) wins.
--------------------------------------------------------------------------- */
try {
if (window.__aweAS) throw new Error('already loaded'); window.__aweAS = 1;
/* the LP does not load DM Sans (the layer's typeface): add it once */
if (![...document.querySelectorAll('link[href*="fonts.googleapis.com/css2"]')].some((l) => /DM\+Sans/.test(l.href))) {
  const fl = document.createElement('link'); fl.rel = 'stylesheet'; fl.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=DM+Mono:wght@500&display=swap'; document.head.appendChild(fl);
}
const CONFIG_URL = 'https://storage.googleapis.com/landbot.pro/v3/H-3525318-907M7Y1SYHT209TQ/index.json';
const SDK_URL = 'https://cdn.landbot.io/landbot-3/landbot-3.0.0.mjs';
/* Sales Entry Points convention (Notion · Growth & Marketing › Site › Conversión on-site) */
const ENTRY = { source: 'web', demo: 'web-lp-agent-studio-sticky-specialist', signup: 'web-lp-agent-studio-sticky-signup' };
const SIGNUP = 'https://app.landbot.io/signup/?utm_medium=conversion_agent&utm_campaign=agent_studio_lp&utm_content=web-lp-agent-studio-sticky-signup';
const BOOK_URL = 'https://calendly.com/landbot-sales/meeting-landbot-expert', HELP_URL = 'https://help.landbot.io/';

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
const EUR = !GEO.cc || /^(AT|BE|BG|HR|CY|CZ|DK|EE|FI|FR|DE|GR|HU|IE|IT|LV|LT|LU|MT|NL|PL|PT|RO|SK|SI|ES|SE|CH|NO|IS|GB)$/.test(GEO.cc);

/* utm_source is the REAL traffic source (from the journey), never a location */
function realSource() { try { const d = window.lbJourney && window.lbJourney.describe && window.lbJourney.describe(); return d && d.from && d.from !== 'direct' ? d.from : ''; } catch (_) { return ''; } }
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
  const p = Object.assign({ entry_point_id: id, entry_point_type: 'sticky / flotante', page_path: location.pathname, country_tier: GEO.tier || 'unknown' }, extra || {});
  try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); } catch (_) {}
  try { if (typeof window.gtag === 'function') window.gtag('event', name, p); } catch (_) {}
}

/* ---------- sections of the LP (ids on the page; the two unnamed ones found by their content) ---------- */
const unnamed = (re) => [...document.querySelectorAll('section:not([id])')].find((x) => re.test(x.textContent || ''));
const SECTIONS = [
  ['hero', 'header', { en: 'Agent Studio', es: 'Agent Studio', pt: 'Agent Studio' }], ['demo', '#demo', { en: 'See it in action', es: 'Míralo en acción', pt: 'Veja em ação' }],
  ['phases', '#phases', { en: 'How it works', es: 'Cómo funciona', pt: 'Como funciona' }], ['guarantee', '#guarantee', { en: 'Guarantee', es: 'Garantía', pt: 'Garantia' }],
  ['month', '#proof', { en: 'Six months', es: 'Seis meses', pt: 'Seis meses' }], ['value', '#value', { en: 'Where value adds up', es: 'Dónde se suma el valor', pt: 'Onde o valor se soma' }],
  ['team', () => unnamed(/conversation engineer|engenheiro de conversa|ingeniero de conversaci/i), { en: 'The team', es: 'El equipo', pt: 'A equipa' }],
  ['security', () => unnamed(/SOC\s*2/), { en: 'Security', es: 'Seguridad', pt: 'Segurança' }],
  ['why', '#proof-team', { en: 'Why Landbot', es: 'Por qué Landbot', pt: 'Porquê Landbot' }], ['fit', '#fit', { en: 'Is it for you', es: '¿Es para ti?', pt: 'É para si?' }],
  ['book', '#book', { en: 'How to start', es: 'Cómo empezar', pt: 'Como começar' }], ['faq', '#faq', { en: 'FAQ', es: 'Preguntas', pt: 'Perguntas' }]
];
const SRC_MAP = [[/how it works|cómo funciona|como funciona|first month|primer mes/i, 'phases'], [/guarant|garant/i, 'guarantee'], [/six months|seis meses/i, 'month'], [/value|valor/i, 'value'],
  [/team|equipo|equipa/i, 'team'], [/secur|segur/i, 'security'], [/why landbot|por qu[eé] landbot|porqu[eê] landbot/i, 'why'], [/\bfit\b|encaj|encaix|for you|para ti|para si/i, 'fit'],
  [/faq|pregunta|pergunta/i, 'faq'], [/action|acción|ação|example|ejemplo|exemplo/i, 'demo']];
const secEl = (id) => { const s = SECTIONS.find((x) => x[0] === id); return !s ? null : typeof s[1] === 'function' ? s[1]() : document.querySelector(s[1]); };

const DICT = {
  en: { rec: 'Tell me what you’d want an agent to <b>move</b> for your business: I’ll sketch what we’d build, how the first month goes, and tell you honestly whether you need us or should build it yourself.',
    back: 'Welcome back. ', phPanel: 'Ask a follow-up', reading: 'Reading', theSite: 'this page', online: 'Online · answers from this page', working: 'Working on it',
    facts: 'What I’ve understood', edit: 'tap to correct', nba: 'What makes most sense now', why: 'Why', or: 'or',
    build: 'Start building free →', demo: 'Book the 30-min call', fit: 'Is Agent Studio for me?',
    whyDemo: '30 minutes with a Solution Engineer: a diagnosis, not a demo. You leave with a straight recommendation, including “build it yourself”.',
    whyBuild: 'With someone who can own it, the platform is faster and costs a fraction: free plan, no card.', whyFit: 'Three quick questions and I’ll tell you honestly which side you’re on, before anyone talks scope.',
    mail: 'Where should the team reach you?', mailSub: 'A Solution Engineer replies within one business day, with everything you told me already on the table.', mailPh: 'you@company.com', sendIt: 'Send', mailBad: 'That doesn’t look like an email yet.',
    done: 'Done. Here’s what changed', r1: 'Request saved in Landbot', r1s: 'Inbox · Agent Studio LP agent', r2: 'Context attached', r3: 'Follow-up promised', r3s: 'within one business day · Agent Studio team',
    foot: 'Answers only from this page · nothing is shared until you book or leave an email.',
    fromSite: 'AGENT STUDIO', pointLabel: 'Reading this with you',
    msgDemo: 'I’d like to book the 30-minute call.', msgFit: 'Is Agent Studio right for me?', msgCorr: (k, v) => `Quick correction: ${k} is ${v}.`,
    nudge: { hero: ['Tell me your goal · I’ll sketch your agent', 'This is what I’d want an agent to do for us:'],
      demo: ['Picture it on your site · 1 question', 'What would this look like for my business?'],
      phases: ['Your first month, for your case · 1 question', 'How would the first month work for us?'],
      guarantee: ['How the refund works · straight answer', 'What exactly does the refund cover?'],
      month: ['Hours model or us? · honest answer', 'Why is this better than buying a bank of hours?'],
      value: ['Find your biggest leak · 2 questions', 'Where do we lose most conversions?'],
      team: ['Who’d work on your account · 1 min', 'Who would actually work on our agent?'],
      security: ['Check it fits your compliance · 1 question', 'We’re a regulated business. How do you handle data and advice?'],
      why: ['What if we leave? · straight answer', 'What happens to the agent if we stop the service?'],
      fit: ['Am I a fit? · 3 questions', 'Is Agent Studio right for me?'],
      book: ['Am I a fit? · 3 questions', 'Is Agent Studio right for me?'],
      faq: ['Ask what the FAQ doesn’t cover', 'I have a question the FAQ doesn’t answer:'] },
    k: { why: 'Why here', use: 'Process', ind: 'Business', stakes: 'At stake', crm: 'Systems', vol: 'Volume', fit: 'Fit', country: 'Country', from: 'Came from' }, teamSees: 'What the team will see', direct: 'direct', volU: '/mo', guessed: 'guessed',
    oneMore: 'Yes, one more question', USE: { leads: 'Qualify inbound leads', book: 'Book advisers / meetings', support: 'Support volume' },
    STAKES: { revenue: 'Revenue', cost: 'Expensive workload', compliance: 'Compliance risk' },
    calLoading: 'Loading the calendar…', bookH: 'Book 30 min with a Solution Engineer', bookSub: 'A diagnosis, not a demo. They’ll have this conversation on hand, so no starting from zero.',
    demoLang: 'Which language for the call?', demoLangPT: 'Your call will be in Portuguese.', bookGo: 'Choose a time →', booked: 'I’ve booked a time', mailInstead: 'Email me instead',
    bookedMsg: 'Great, see you there. The Solution Engineer will have this conversation on hand.', freeToo: 'Meanwhile you can start free on the platform and bring what you build to the call.',
    supH: 'This one’s for our support team', supSub: 'They can look at your account and sort it fastest. The help center has guides and a way to reach them.', supGo: 'Open the help center →', backQ: 'Back to my questions',
    resetL: 'New conversation', mailSkip: 'No thanks, keep chatting', mailSkipped: 'Skipped. Carrying on.',
    more: 'Continue ↓', sketchH: 'Your agent · sketch', planH: 'Your first month · for your case', fitH: 'Fit check', promptH: 'Prompt', promptSub: '', copy: 'Copy', copied: 'Copied ✓',
    V: { fit: 'Agent Studio fit', hybrid: 'Hybrid', build: 'Build it yourself' }, Vsub: { fit: 'Book the call: you leave with a plan for your case.', hybrid: 'We’ll tell you on the call which side you’re on, before anyone talks scope.', build: 'Honestly: build it in Landbot. Faster, and a fraction of the cost.' },
    themeL: 'Light mode', themeD: 'Dark mode', sent: 'Cards seen',
    starters: ['Is Agent Studio for me?', 'Sketch my agent', 'How the first month works'] },
  es: { rec: 'Cuéntame qué querrías que un agente <b>moviera</b> en tu negocio: te esbozo lo que construiríamos, cómo va el primer mes, y te digo con honestidad si nos necesitas o te conviene construirlo tú.',
    back: 'Hola de nuevo. ', phPanel: 'Haz otra pregunta', reading: 'Leyendo', theSite: 'esta página', online: 'En línea · responde con esta página', working: 'Trabajando en ello',
    facts: 'Lo que he entendido', edit: 'toca para corregir', nba: 'Lo que tiene más sentido ahora', why: 'Por qué', or: 'o',
    build: 'Empezar gratis →', demo: 'Reservar la llamada de 30 min', fit: '¿Agent Studio es para mí?',
    whyDemo: '30 minutos con un Solution Engineer: un diagnóstico, no una demo. Sales con una recomendación directa, incluida «constrúyelo tú».',
    whyBuild: 'Si tienes a alguien que lo lleve, la plataforma es más rápida y cuesta una fracción: plan gratis, sin tarjeta.', whyFit: 'Tres preguntas rápidas y te digo con honestidad en qué lado estás, antes de hablar de alcance.',
    mail: '¿Dónde te contacta el equipo?', mailSub: 'Un Solution Engineer responde en un día laborable, con todo lo que me has contado ya sobre la mesa.', mailPh: 'tu@empresa.com', sendIt: 'Enviar', mailBad: 'Eso todavía no parece un email.',
    done: 'Hecho. Esto es lo que ha cambiado', r1: 'Solicitud guardada en Landbot', r1s: 'Inbox · agente de la LP Agent Studio', r2: 'Contexto adjunto', r3: 'Seguimiento prometido', r3s: 'en un día laborable · equipo de Agent Studio',
    foot: 'Responde solo con esta página · no se comparte nada hasta que reserves o dejes un email.',
    fromSite: 'AGENT STUDIO', pointLabel: 'Leyendo esto contigo',
    msgDemo: 'Quiero reservar la llamada de 30 minutos.', msgFit: '¿Agent Studio es para mí?', msgCorr: (k, v) => `Corrijo: ${k} es ${v}.`,
    nudge: { hero: ['Cuéntame tu objetivo · te esbozo tu agente', 'Esto es lo que querría que un agente hiciera por nosotros:'],
      demo: ['Imagínalo en tu web · 1 pregunta', '¿Cómo sería esto en mi negocio?'],
      phases: ['Tu primer mes, para tu caso · 1 pregunta', '¿Cómo sería el primer mes con nosotros?'],
      guarantee: ['Cómo funciona el reembolso · respuesta directa', '¿Qué cubre exactamente el reembolso?'],
      month: ['¿Bolsa de horas o vosotros? · respuesta honesta', '¿Por qué es mejor que comprar una bolsa de horas?'],
      value: ['Encuentra tu mayor fuga · 2 preguntas', '¿Dónde perdemos más conversiones?'],
      team: ['Quién trabajaría en tu cuenta · 1 min', '¿Quién trabajaría de verdad en nuestro agente?'],
      security: ['Comprueba tu compliance · 1 pregunta', 'Somos un negocio regulado. ¿Cómo gestionáis los datos y el asesoramiento?'],
      why: ['¿Y si lo dejamos? · respuesta directa', '¿Qué pasa con el agente si dejamos el servicio?'],
      fit: ['¿Encajo? · 3 preguntas', '¿Agent Studio es para mí?'],
      book: ['¿Encajo? · 3 preguntas', '¿Agent Studio es para mí?'],
      faq: ['Pregunta lo que no cubre el FAQ', 'Tengo una pregunta que el FAQ no responde:'] },
    k: { why: 'Por qué vino', use: 'Proceso', ind: 'Negocio', stakes: 'En juego', crm: 'Sistemas', vol: 'Volumen', fit: 'Encaje', country: 'País', from: 'Vino de' }, teamSees: 'Lo que verá el equipo', direct: 'directo', volU: '/mes', guessed: 'deducido',
    oneMore: 'Sí, una pregunta más', USE: { leads: 'Cualificar leads entrantes', book: 'Agendar asesores / reuniones', support: 'Volumen de soporte' },
    STAKES: { revenue: 'Ingresos', cost: 'Carga de trabajo cara', compliance: 'Riesgo de compliance' },
    calLoading: 'Cargando el calendario…', bookH: 'Reserva 30 min con un Solution Engineer', bookSub: 'Un diagnóstico, no una demo. Tendrán esta conversación a mano, así que no empiezas de cero.',
    demoLang: '¿En qué idioma quieres la llamada?', demoLangPT: 'Tu llamada será en portugués.', bookGo: 'Elegir hora →', booked: 'Ya he reservado', mailInstead: 'Prefiero que me escribáis',
    bookedMsg: 'Genial, nos vemos ahí. El Solution Engineer tendrá esta conversación a mano.', freeToo: 'Mientras, puedes empezar gratis en la plataforma y traer lo que montes a la llamada.',
    supH: 'Esto es cosa de nuestro equipo de soporte', supSub: 'Pueden mirar tu cuenta y resolverlo antes. En el centro de ayuda tienes guías y cómo contactarles.', supGo: 'Abrir el centro de ayuda →', backQ: 'Volver a mis preguntas',
    resetL: 'Nueva conversación', mailSkip: 'No, gracias, sigo con el chat', mailSkipped: 'Omitido. Seguimos.',
    more: 'Continuar ↓', sketchH: 'Tu agente · esbozo', planH: 'Tu primer mes · para tu caso', fitH: 'Test de encaje', promptH: 'Prompt', promptSub: '', copy: 'Copiar', copied: 'Copiado ✓',
    V: { fit: 'Encaja con Agent Studio', hybrid: 'Híbrido', build: 'Constrúyelo tú' }, Vsub: { fit: 'Reserva la llamada: sales con un plan para tu caso.', hybrid: 'En la llamada te decimos en qué lado estás, antes de hablar de alcance.', build: 'Con honestidad: constrúyelo en Landbot. Más rápido y a una fracción del coste.' },
    themeL: 'Modo claro', themeD: 'Modo oscuro', sent: 'Tarjetas vistas',
    starters: ['¿Agent Studio es para mí?', 'Esbózame mi agente', 'Cómo va el primer mes'] },
  pt: { rec: 'Conte-me o que gostaria que um agente <b>movesse</b> no seu negócio: esboço o que construiríamos, como corre o primeiro mês, e digo-lhe com honestidade se precisa de nós ou se é melhor construir você mesmo.',
    back: 'Que bom vê-lo de novo. ', phPanel: 'Faça outra pergunta', reading: 'A ler', theSite: 'esta página', online: 'Online · responde com esta página', working: 'A trabalhar nisso',
    facts: 'O que entendi', edit: 'toque para corrigir', nba: 'O que faz mais sentido agora', why: 'Porquê', or: 'ou',
    build: 'Começar grátis →', demo: 'Agendar a chamada de 30 min', fit: 'Agent Studio é para mim?',
    whyDemo: '30 minutos com um Solution Engineer: um diagnóstico, não uma demo. Sai com uma recomendação direta, incluindo «construa você».',
    whyBuild: 'Se tem alguém para cuidar disso, a plataforma é mais rápida e custa uma fração: plano grátis, sem cartão.', whyFit: 'Três perguntas rápidas e digo-lhe com honestidade de que lado está, antes de falar de escopo.',
    mail: 'Onde a equipa pode falar consigo?', mailSub: 'Um Solution Engineer responde em um dia útil, com tudo o que me contou já em cima da mesa.', mailPh: 'voce@empresa.com', sendIt: 'Enviar', mailBad: 'Isso ainda não parece um e-mail.',
    done: 'Pronto. Isto é o que mudou', r1: 'Pedido guardado em Landbot', r1s: 'Inbox · agente da LP Agent Studio', r2: 'Contexto anexado', r3: 'Retorno combinado', r3s: 'em um dia útil · equipa Agent Studio',
    foot: 'Responde só com esta página · nada é partilhado até agendar ou deixar um e-mail.',
    fromSite: 'AGENT STUDIO', pointLabel: 'A ler isto consigo',
    msgDemo: 'Quero agendar a chamada de 30 minutos.', msgFit: 'Agent Studio é para mim?', msgCorr: (k, v) => `Corrigindo: ${k} é ${v}.`,
    nudge: { hero: ['Conte-me o seu objetivo · esboço o seu agente', 'Isto é o que gostaria que um agente fizesse por nós:'],
      demo: ['Imagine-o no seu site · 1 pergunta', 'Como seria isto no meu negócio?'],
      phases: ['O seu primeiro mês, para o seu caso · 1 pergunta', 'Como seria o primeiro mês connosco?'],
      guarantee: ['Como funciona o reembolso · resposta direta', 'O que cobre exatamente o reembolso?'],
      month: ['Banco de horas ou vocês? · resposta honesta', 'Porque é melhor do que comprar um banco de horas?'],
      value: ['Encontre a sua maior fuga · 2 perguntas', 'Onde perdemos mais conversões?'],
      team: ['Quem trabalharia na sua conta · 1 min', 'Quem trabalharia de facto no nosso agente?'],
      security: ['Confirme o seu compliance · 1 pergunta', 'Somos um negócio regulado. Como tratam os dados e o aconselhamento?'],
      why: ['E se sairmos? · resposta direta', 'O que acontece ao agente se pararmos o serviço?'],
      fit: ['Encaixo? · 3 perguntas', 'Agent Studio é para mim?'],
      book: ['Encaixo? · 3 perguntas', 'Agent Studio é para mim?'],
      faq: ['Pergunte o que o FAQ não cobre', 'Tenho uma pergunta que o FAQ não responde:'] },
    k: { why: 'Porque veio', use: 'Processo', ind: 'Negócio', stakes: 'Em jogo', crm: 'Sistemas', vol: 'Volume', fit: 'Encaixe', country: 'País', from: 'Veio de' }, teamSees: 'O que a equipa vai ver', direct: 'direto', volU: '/mês', guessed: 'deduzido',
    oneMore: 'Sim, mais uma pergunta', USE: { leads: 'Qualificar leads', book: 'Agendar consultores / reuniões', support: 'Volume de suporte' },
    STAKES: { revenue: 'Receita', cost: 'Carga de trabalho cara', compliance: 'Risco de compliance' },
    calLoading: 'A carregar o calendário…', bookH: 'Agende 30 min com um Solution Engineer', bookSub: 'Um diagnóstico, não uma demo. Terão esta conversa à mão, por isso ninguém começa do zero.',
    demoLang: 'Em que idioma quer a chamada?', demoLangPT: 'A sua chamada será em português.', bookGo: 'Escolher horário →', booked: 'Já agendei', mailInstead: 'Prefiro que me escrevam',
    bookedMsg: 'Ótimo, até lá. O Solution Engineer vai ter esta conversa à mão.', freeToo: 'Entretanto pode começar grátis na plataforma e trazer o que construir para a chamada.',
    supH: 'Isto é com a nossa equipa de suporte', supSub: 'Podem ver a sua conta e resolver mais depressa. A central de ajuda tem guias e uma forma de falar com eles.', supGo: 'Abrir a central de ajuda →', backQ: 'Voltar às minhas perguntas',
    resetL: 'Nova conversa', mailSkip: 'Não, obrigado, continuo no chat', mailSkipped: 'Ignorado. Continuamos.',
    more: 'Continuar ↓', sketchH: 'O seu agente · esboço', planH: 'O seu primeiro mês · para o seu caso', fitH: 'Teste de encaixe', promptH: 'Prompt', promptSub: '', copy: 'Copiar', copied: 'Copiado ✓',
    V: { fit: 'Encaixa no Agent Studio', hybrid: 'Híbrido', build: 'Construa você' }, Vsub: { fit: 'Agende a chamada: sai com um plano para o seu caso.', hybrid: 'Na chamada dizemos-lhe de que lado está, antes de falar de escopo.', build: 'Com honestidade: construa-o em Landbot. Mais rápido e a uma fração do custo.' },
    themeL: 'Modo claro', themeD: 'Modo escuro', sent: 'Cartões vistos',
    starters: ['Agent Studio é para mim?', 'Esboce o meu agente', 'Como corre o primeiro mês'] }
};

const lpLang = () => { const c = window.__asLPc, l = (c && c.state && c.state.lang) || document.documentElement.getAttribute('data-aslang') || 'en'; return l === 'pt' || l === 'pt-br' ? 'pt' : l === 'es' ? 'es' : 'en'; };
let PAGE_LANG = lpLang();
let LANG = (() => { const q = new URLSearchParams(location.search).get('lang'); return DICT[q] ? q : PAGE_LANG; })();
let T = DICT[LANG];

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
  es: [/[¿¡ñ]/, /\b(hola|gracias|qué|cuánto|cuanto|cómo|quiero|tengo|necesito|precio|cuesta|puedo|mis|nuestro|empresa|mensajes|usted|vale|una|unos|las|los|del|pero|hay|muy|soy|somos|hablar|ventas|ya|funciona|también|dónde|cuándo|y|el|la|es|todavía|aún|al|nos|unas|mes|queremos|para|lo|tenemos|hacer|citas|visitas|equipo|personas|sí|vamos|hora|reservar|llamada|asesores|me|interesa|correduría)\b/gi],
  pt: [/[ãõç]|\bvocê\b/i, /\b(olá|oi|obrigad[oa]|quanto|como|quero|tenho|preciso|preço|custa|posso|meu|minha|nosso|nossa|empresa|mensagens|com|uma|um|por|pelo|pela|mas|tem|muito|sou|somos|falar|vendas|já|funciona|também|onde|quando|e|o|é|ainda|do|da|na|mês|queremos|para|isso|fazer|equipa|pessoas|não|são|consigo|connosco|vocês|agendar|chamada|reunião|gostaria|horário|corretora|seguros)\b/gi],
  en: [/(?!)/, /\b(hello|hi|thanks|what|how|much|will|does|the|my|our|we|need|want|cost|price|company|messages|can|is|i|with|to|and|for|it|you|this|do|are|talk|sales|already|customer|working|of|in|yet|team|people|yes|let's|lets|pick|time|call|book|sure|sounds|good|please|would|like|go|ahead|thanks|ok|okay|that|works|right|who|when|why|which|have|has|our|us|be)\b/gi],
};
function detectLang(q) {
  q = String(q).replace(/\S+@\S+|https?:\/\/\S+|\b[\w-]+\.(com|io|es|net|org|br)\b/gi, ' ');   // emails, links and domains say nothing about the language
  if ((q.match(/\p{L}/gu) || []).length < 3) return null;
  const score = {};
  for (const [l, [strong, words]] of Object.entries(LANG_CUES)) score[l] = (strong.test(q) ? 2 : 0) + (q.match(words) || []).length;
  const [best, second] = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const short = q.trim().split(/\s+/).length <= 2;
  return best[1] > second[1] && (best[1] >= 2 || short) ? best[0] : null;
}
new MutationObserver(() => { const l = lpLang(); if (l === PAGE_LANG) return; PAGE_LANG = l; if (!st.typed && DICT[l]) { LANG = l; T = DICT[LANG]; paint(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-aslang', 'lang'] });
function followLang(q) { st.typed = true; const l = detectLang(q); if (l && l !== LANG && DICT[l]) { LANG = l; T = DICT[LANG]; paint(); } }
const fmt = (n) => Math.round(n).toLocaleString(LANG === 'en' ? 'en-US' : LANG === 'pt' ? 'pt-BR' : 'es-ES');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const h = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

let visits = 0;
try { visits = +(localStorage.getItem('awe-as-visits') || 0); localStorage.setItem('awe-as-visits', String(visits + 1)); } catch (_) {}
const st = { core: null, boot: null, facts: {}, awaiting: null, answers: 0, nbaKey: '', open: false, t0: Date.now(), teamDone: false, section: '', cited: new Set(), items: new Set(), mailMode: 'team', hot: 0 };
const J = () => (window.lbJourney && window.lbJourney.describe && window.lbJourney.describe()) || null;
function initFacts() {
  try { const d = J(); if (d && d.from) st.facts.from = { v: d.from === 'direct' ? T.direct : d.from, guess: true }; } catch (_) {}
  if (GEO.cc) st.facts.country = { cc: GEO.cc, guess: true };
}
initFacts();

/* ---------- the context line the agent reads with the first message ---------- */
function contextLine() {
  const add = [`page Agent Studio paid landing`, `page language ${PAGE_LANG}`, `chat language ${LANG}`];
  if (MOBILE) add.push('device mobile');
  if (GEO.cc) add.push(`country ${countryName(GEO.cc, 'en')} (inferred from ${GEO.how}) · geo ${GEO.tier}`);
  if (st.restarted && st.userMsgs && st.userMsgs.length) add.push('conversation continues; earlier the visitor said: ' + st.userMsgs.slice(-5).map((m) => '"' + m.slice(0, 140) + '"').join(' / '));
  const base = window.lbJourney && window.lbJourney.line ? window.lbJourney.line().replace('before this article', 'before this landing') : '';
  return base ? base.replace(/\]$/, ' · ' + add.join(' · ') + ']') : '[Page context: ' + add.join(' · ') + ']';
}

/* ---------- back: the real bot, headless ---------- */
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
    cfg.customData = Object.assign({}, cfg.customData, { source: ENTRY.source, subsource: ENTRY.demo, country: GEO.cc || '', country_tier: GEO.tier || '', page_lang: PAGE_LANG });
    const core = new LB.Core(cfg);
    st.core = core; st.real = true;
    let greetRes; const greeted = new Promise((r) => (greetRes = r)); st._greet = greetRes;
    const gen = st.gen = (st.gen || 0) + 1;
    core.pipelines.$readableSequence.subscribe((m) => { if (gen !== st.gen) return; try { onMsg(m); } catch (e) { console.warn('[awe]', e); } });
    await core.init(cfg);
    await Promise.race([greeted, sleep(8000)]);
  })();
  return st.boot;
}
/* a fresh Landbot session (the SDK keeps none in the browser): used to leave the email step or to start over */
async function restartSession() {
  clearTimeout(st.wd);
  if (st.more) { const m = st.more; st.more = null; m(false); }
  try { if (st.core) st.core.destroy(); } catch (_) {}
  st.gen = (st.gen || 0) + 1;
  Object.assign(st, { boot: null, core: null, greeted: false, ctxSent: false, flowBtns: null, greetBtns: null, chain: Promise.resolve() });
}
/* the booking's Calendly references ride on the next message as custom_data, so the bot can look the invitee up (Xavi, 8-oct-2026) */
function withData(m) { const d = st.nextData; st.nextData = null; if (d) m.custom_data = d; return m; }
const calRefs = (d) => { const p = (d && d.payload) || {}; return { calendly_invitee: (p.invitee && p.invitee.uri) || '', calendly_event: (p.event && p.event.uri) || '' }; };
async function deliver(text, payload) {
  await boot();
  const list = st.flowBtns || st.greetBtns;   // the buttons of the LAST fixed block, not the greeting's (both use $0, $1…)
  const btn = payload && list && list.find((b) => b.payload === payload);
  /* the payload moves the flow; the label is the visitor's own words, so the agent keeps their language */
  return st.core.sendMessage(withData(payload ? { type: 'button', message: text || (btn && btn.text), payload } : { type: 'text', message: text }));
}

/* ---------- UI: lava orb bar, layer ---------- */
const starterChips = () => T.starters.map((l) => `<button type="button" class="awe-chip" data-awe-say="${esc(l)}">${esc(l)}</button>`).join('');
let gooN = 0;
const LAVA = (cls) => { const id = 'aweGoo' + (++gooN); return `<span class="awe-lava ${cls || ''}" aria-hidden="true">
  <svg viewBox="0 0 300 300"><defs><filter id="${id}"><feGaussianBlur in="SourceGraphic" stdDeviation="13" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"/></filter></defs>
  <g filter="url(#${id})"><circle class="g1" cx="150" cy="150" r="52" fill="#F58B0B"/><circle class="g2" cx="178" cy="170" r="40" fill="#636BFC"/><circle class="g3" cx="135" cy="120" r="34" fill="#4FCCC2"/><circle class="g4" cx="120" cy="175" r="28" fill="#FF3F7B"/><circle class="g5" cx="180" cy="125" r="24" fill="#F58B0B"/></g></svg></span>`; };
const launch = h(`<div id="awe-launch" class="tuck" role="region" aria-label="Landbot AI"><div class="awe-chips" data-awe-starters></div>
  <form class="awe-pill" data-awe-form><button type="button" data-awe-open style="all:unset;cursor:pointer;border-radius:50%">${LAVA()}</button><input type="text" autocomplete="off"><button type="submit" class="awe-pill-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg></button></form></div>`);
const panel = h(`<aside id="awe-panel" role="dialog" aria-label="Landbot AI" aria-hidden="true">
  <div class="awe-head">${LAVA('sm')}<div class="awe-head-t"><b>Landbot AI</b><span class="awe-status"></span></div>
    <button type="button" class="awe-x" data-awe-reset aria-label="New conversation" title="New conversation">↺</button><button type="button" class="awe-x awe-theme" data-awe-theme aria-label="Theme"></button><button type="button" class="awe-x" data-awe-close aria-label="Close">✕</button></div>
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
  st.section = ''; syncLaunch(); renderFacts();
}
const thread = panel.querySelector('.awe-thread'), statusEl = panel.querySelector('.awe-status'), headOrb = panel.querySelector('.awe-head .awe-lava');
const repliesEl = panel.querySelector('[data-awe-replies]');
const push = (el) => { thread.appendChild(el); requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; }); return el; };
function openPanel() {
  emit('entry_point_click', ENTRY.demo);
  if (st.unread) setUnread(0);
  if (!st.open) { st.open = true; panel.classList.add('on'); scrim.classList.add('on'); panel.setAttribute('aria-hidden', 'false'); syncLaunch(); }
  if (!thread.children.length) {
    const d = J();
    const ctx = d && d.from && d.from !== 'direct' ? `<div class="awe-src"><button type="button" data-awe-fact="from"><em>${esc(T.k.from)}</em>${esc(d.from)}</button></div>` : '';
    push(h(`<div class="awe-msg"><p>${visits > 0 ? T.back : ''}${T.rec}</p>${ctx}</div>`));
    repliesEl.innerHTML = starterChips();
  }
}
function closePanel() { st.open = false; panel.classList.remove('on', 'wide'); scrim.classList.remove('on', 'lift'); panel.setAttribute('aria-hidden', 'true'); syncLaunch(); }
function setWorking(label) {
  thread.querySelectorAll('.awe-working').forEach((n) => n.remove());
  if (!label) { statusEl.textContent = T.online; statusEl.classList.remove('work'); headOrb.classList.remove('work'); return; }
  statusEl.textContent = T.working + '…'; statusEl.classList.add('work'); headOrb.classList.add('work');
  push(h(`<div class="awe-working">${thinkHTML(T.reading + ' ' + label + '…')}</div>`));
}
/* thinking = the lava orb (faster, .work) + three dots; the label says what it is reading */
const thinkHTML = (label) => `<div class="awe-think" aria-hidden="true">${LAVA('xs work')}<div class="awe-typing"><i></i><i></i><i></i></div>${label ? `<span class="awe-think-l">${esc(label)}</span>` : ''}</div>`;
function guessSection(q) {
  const sec = (id) => '“' + SECTIONS.find((x) => x[0] === id)[2][LANG] + '”';
  if (/price|cost|precio|cuesta|preço|custa|cuánto|quanto|refund|reembols|guarant|garant/i.test(q)) return sec('faq');
  if (/month|mes|mês|week|semana|how long|cuánto tarda|quanto tempo|how it works|cómo funciona|como funciona/i.test(q)) return sec('phases');
  if (/hours|horas|agency|agencia|agência/i.test(q)) return sec('month');
  if (/data|datos|dados|gdpr|rgpd|soc|regulat|regula|compliance|fca/i.test(q)) return sec('security');
  if (/who|quién|quem|team|equipo|equipa/i.test(q)) return sec('team');
  if (/for me|para mí|para mim|fit|encaj|encaix|myself|yo mismo|eu mesmo/i.test(q)) return sec('fit');
  if (/leave|stop|dejar|parar|own|dueño|propriet/i.test(q)) return sec('why');
  return T.theSite;
}

/* ---------- sending ---------- */
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function skipMail(card) {   // leave the flow's email step: it accepts only an email, so a new session takes over
  card.dataset.done = 'skip'; card.querySelectorAll('input,button').forEach((x) => (x.disabled = true));
  card.querySelector('.awe-mail-skip')?.remove();
  card.appendChild(h(`<div class="awe-sub" style="margin-top:8px">${esc(T.mailSkipped)}</div>`));
  st.restarted = true; await restartSession();
}
async function say(text, payload) {
  const q = (text || '').trim(); if (!q) return;
  if (st.more) { const m = st.more; st.more = null; m(false); }
  const pendingMail = thread.querySelector('.awe-mail:not([data-done])');
  if (pendingMail && !payload) {
    if (EMAIL_RX.test(q)) { const f = pendingMail.querySelector('form'); f.querySelector('input').value = q; f.requestSubmit(); return; }
    await skipMail(pendingMail);
  }
  if (!payload) (st.userMsgs = st.userMsgs || []).push(q);
  openPanel(); repliesEl.innerHTML = '';
  thread.querySelectorAll('.awe-nba').forEach((n) => n.remove());
  push(h(`<div class="awe-me">${esc(q)}</div>`));
  if (!payload) followLang(q); readUser(q); setWorking(guessSection(q));
  let out = q;
  if (!st.ctxSent && !payload) { st.ctxSent = true; out = contextLine() + '\n\n' + q; }
  armWatchdog(q);
  try { await deliver(payload ? q : out, payload); }
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
  if (ts < st.t0 - 5000) return;
  if (m.author_type === 'user') return;
  const ex = m.extra || {}; const bid = String(ex.id || '').replace(/_\d+$/, '');
  if (!st.greeted && m.type === 'dialog' && !ex.is_ai_agent_message) {
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
  if (m.type === 'dialog' && (m.buttons || []).length && !ex.is_ai_agent_message) st.flowBtns = m.buttons.map((t, i) => ({ text: t, payload: (m.payloads || [])[i] }));
  if (bid === 'team_email') { emailCard(); return; }
  if (bid === 'team_done') { receipts(); return; }
  if (bid === 'sales_book') { bookCard(); return; }
  if (bid === 'sales_booked') { await agentText(T.bookedMsg); return; }
  if (bid === 'support_route') { supportCard(); return; }
  if (bid === 'team_more') { repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.oneMore)}" data-awe-payload="$0">${esc(T.oneMore)}</button>`; return; }
  if (m.type === 'dialog' && (m.buttons || []).length) {
    st.lastBtns = m.buttons;
    const labels = new Set(m.buttons.map((b) => String(b).trim().toLowerCase()));
    const clean = text.split(/\n/).filter((l) => !labels.has(l.replace(/^[-•*\d.)\s]+/, '').trim().toLowerCase())).join('\n').trim();
    if (clean) { await agentText(clean); st.answers++; }
    repliesEl.innerHTML = m.buttons.map((b) => `<button type="button" class="awe-chip" data-awe-say="${esc(b)}">${esc(b)}</button>`).join('');
    maybePlan(ex);
    return;
  }
  if (text) { await agentText(text); st.answers++; maybePlan(ex); decide(text); }
}
function md(src) {
  src = src.replace(/(?:\[[^\]]*\]\()?(?:[^\n:]{0,40}?→\s*:?\s*)?(https:\/\/app\.landbot\.io\/sign-?up\/?(?:[^\s)]*[^\s).,;:])?)\)?/g, (_, u) => `[${T.build}](${u})`);
  const inline = (s) => esc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) => `<a href="${tagUrl(u.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${t}</a>`)
    .replace(/(^|[\s(*])(https?:\/\/[^\s<)*]+)/g, (_, pre, u) => { const clean = u.replace(/[.,;:]+$/, ''), tail = u.slice(clean.length); return `${pre}<a href="${tagUrl(clean.replace(/&amp;/g, '&')).replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${clean}</a>${tail}`; })
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|\s)\*([^*\s][^*]*)\*(?=\s|$)/g, '$1<i>$2</i>');
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
  for (const part of s.split(/\s*[·,]\s*/)) for (const [re, id] of SRC_MAP) if (re.test(part) && !seen.has(id)) {
    seen.add(id);
    if (id === 'pricing') chips.push(`<a href="${location.origin.includes('landbot.io') ? '' : 'https://landbot.io'}/pricing" target="_blank" rel="noopener"><em>${T.fromSite}</em>Pricing</a>`);
    else { const sec = SECTIONS.find((x) => x[0] === id); chips.push(`<button type="button" data-awe-point="${id}"><em>${T.fromSite}</em>${esc(sec[2][LANG])}</button>`); }
    break;
  }
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
function flowCard(lines) {
  st.items.add('sketch');
  return h(`<div class="awe-card awe-flow"><span class="awe-tag">${esc(T.sketchH)}</span>
    <ol class="awe-steps">${lines.map((l, i) => `<li><span>${i + 1}</span>${esc(l.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, ''))}</li>`).join('')}</ol></div>`);
}
function promptCard(code) {
  st.items.add('prompt');
  const card = h(`<div class="awe-card awe-prompt"><span class="awe-tag">${esc(T.promptH)}</span>
    <pre class="awe-code"></pre><div class="awe-prompt-f"><span class="awe-sub">${esc(T.promptSub)}</span><button type="button" class="awe-chip" data-awe-copy>${esc(T.copy)}</button></div></div>`);
  card.querySelector('pre').textContent = code.trim();
  return card;
}
const FIELD_LINE = /^\s*[*_`]*\s*(conversation_summary|visitor_journey|channels_wanted|page_lang|industry|stakes|why_help|internal_owner|current_setup|systems|fit_verdict|arrival_reason|use_case|channel|team_size|monthly_volume|urgency|comparing|country_tier|subsource|source|bot_use_case|wa_number_approved)\s*[*_`]*\s*[:=]/i;
async function agentText(text) {
  text = String(text).split(/\n/).filter((l) => !FIELD_LINE.test(l)).join('\n');   // a field the agent saves must never be shown to the visitor
  const g = st.gen;   // a reply from a session that was restarted stops drawing
  const { body: raw, src } = splitSources(text);
  const blocks = [];   // fenced blocks the agent writes: ```flow (sketch) and ```prompt (for a coding agent)
  /* Landbot strips backticks, so the agent marks blocks as [[FLOW]]…[[/FLOW]] and [[PROMPT]]…[[/PROMPT]] (``` kept as a fallback) */
  const body = raw
    .replace(/\[\[\s*(FLOW|PROMPT|FIT|PLAN)\s*\]\]([\s\S]*?)(?:\[\[\s*\/\s*\1\s*\]\]|$)/gi, (_, kind, code) => { blocks.push({ kind: kind.toLowerCase(), code }); return '\n§§' + (blocks.length - 1) + '\n'; })
    .replace(/```\s*(flow|prompt)?[^\n]*\n([\s\S]*?)```/gi, (_, kind, code) => { blocks.push({ kind: (kind || 'prompt').toLowerCase(), code }); return '\n§§' + (blocks.length - 1) + '\n'; });
  const parts = [];   // a numbered or bulleted list stays in ONE bubble; every other line is its own bubble
  const LINES = body.split(/\n/).map((x) => x.trim()).filter(Boolean), ITEM = /^(?:\d+[.)]|[-•*])\s+/;
  LINES.forEach((l, j) => {
    const isItem = ITEM.test(l), prev = parts[parts.length - 1], nextItem = ITEM.test(LINES[j + 1] || '');
    if (prev && prev.list && (isItem || (nextItem && !/^§§/.test(l)))) prev.lines.push(l);   // a step's own explanation line stays with it
    else parts.push({ list: isItem, lines: [l] });
  });
  for (let i = 0; i < parts.length; i++) parts[i] = parts[i].lines.join('\n');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CHUNK = 3;
  for (let i = 0; i < parts.length; i++) {
    if (g !== st.gen) return;
    if (i > 0 && i % CHUNK === 0) {   // long reply: let them read, then continue on their tap
      const go = await new Promise((res) => { st.more = res; repliesEl.innerHTML = `<button type="button" class="awe-chip awe-more" data-awe-more>${esc(T.more)}</button>`; });
      st.more = null; repliesEl.innerHTML = '';
      if (!go) return;   // they wrote something else: drop the rest
    }
    if (i > 0 && !reduce) { const dots = push(h(thinkHTML(''))); await sleep(Math.min(1600, 450 + parts[i].length * 14)); dots.remove(); if (g !== st.gen) return; }
    const bm = parts[i].match(/^§§(\d+)$/);
    if (bm) { const b = blocks[+bm[1]]; const ls = b.code.split(/\n/).map((l) => l.trim()).filter(Boolean); push(b.kind === 'flow' ? flowCard(ls) : b.kind === 'plan' ? planCard(ls) : b.kind === 'fit' ? fitCard(ls) : promptCard(b.code)); if (i === 0) ding(); continue; }
    push(h(`<div class="awe-msg">${md(parts[i])}${i === parts.length - 1 ? sourceChips(src) : ''}</div>`));
    if (i === 0) ding();
  }
  readAgent(text);
  for (const part of src.split(/\s*[·,]\s*/)) for (const [re, id] of SRC_MAP) if (part && id !== 'pricing' && id !== 'hero' && re.test(part) && !st.cited.has(id)) { st.cited.add(id); pointAt(id); return; }
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
  if (!/(visit|lead|chat|conversa|messag|mensag|mensaj|month|mes|mês|tráfico|tráfego|traffic)/i.test(q)) return null;
  const mm = q.match(/(\d{1,3}(?:[.,\s]\d{3})+|\d+(?:[.,]\d+)?)\s*(k|mil|thousand)?/i); if (!mm) return null;
  let n = parseFloat(mm[1].replace(/[\s]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')); if (mm[2]) n *= 1000;
  return n >= 50 ? n : null;
}
function parseSize(q) {
  if (/under 10|menos de 10|less than 10|solo|freelance|just me|sólo yo|só eu/i.test(q)) return 5;
  if (/\b10\s*[–-]\s*50\b/.test(q)) return 30; if (/\b51\s*[–-]\s*500\b/.test(q)) return 200; if (/500\s*\+|\+\s*500|more than 500|más de 500|mais de 500/i.test(q)) return 600;
  const mm = q.match(/(\d{1,5})\s*[-‑ ]?\s*(people|persons|employees|staff|person|personas|empleados|pessoas|funcionários|colaboradores|agents?|agentes|team|equipo|time)/i);
  return mm ? +mm[1] : null;
}
const USE_RX = [[/book|agend|cita|consulta|appointment|meeting|reuni|advis|asesor|consultor/i, 'book'], [/support|soporte|suporte|tickets?|atención al cliente|atendimento|resolv/i, 'support'], [/lead|cualific|qualif|captar|convert|conversion|conversión|conversão|enquir|consulta|inbound|traffic|tráfico|tráfego/i, 'leads']];
const STAKES_RX = [[/compliance|regulat|regula|fca|gdpr|rgpd|risk|riesgo|risco/i, 'compliance'], [/revenue|ingres|receita|sales|ventas|vendas|pipeline|money|dinero/i, 'revenue'], [/workload|carga|cost|coste|custo|hours|horas|team.{0,10}(week|time)|tiempo/i, 'cost']];
const IND_RX = [[/mortgage|hipotec|broker|corredor|protection|insur|segur|financ/i, 'Financial services'], [/saas|software/i, 'SaaS'], [/e-?commerce|shop|tienda|loja/i, 'Ecommerce'], [/real estate|inmobil|imobili|property|propert/i, 'Real estate'],
  [/health|salud|saúde|clinic|clínica/i, 'Health'], [/educa|school|universi|escuela|curso/i, 'Education'], [/travel|viaj|hotel|turism/i, 'Travel'], [/auto|car dealer|concesionari/i, 'Automotive']];
function readUser(q) {
  const f = st.facts; let changed = false;
  if (/(team|equipo|time)\b.{0,25}(write|email|escrib|escrev)|que me escrib|que me escrevam|write to me|email me/i.test(q)) st.mailMode = 'team';
  if (/demo|call|llamada|chamada|ligação|meeting|reuni|precio|price|preço|cost|cuesta|custa|quote|presupuesto|orçamento|proposal|propuesta|proposta|contract|contrato|scope|alcance|escopo|when can|cuándo|quando|this (week|month)|esta semana|este mes|urgent/i.test(q)) st.hot++;
  if (st.awaiting === 'why' && q.length > 2) { f.why = { v: q.length > 70 ? q.slice(0, 68) + '…' : q }; changed = true; st.awaiting = null; }
  if (!f.use) for (const [re, u] of USE_RX) if (re.test(q)) { f.use = { k: u }; changed = true; break; }
  for (const [re, k] of STAKES_RX) if (re.test(q)) { if (!f.stakes || f.stakes.k !== k) { f.stakes = { k }; changed = true; } break; }
  if (!f.ind) for (const [re, v2] of IND_RX) if (re.test(q)) { f.ind = { v: v2 }; changed = true; break; }
  const v = parseVolume(q); if (v) { f.vol = { v }; changed = true; }
  const crm = ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho', 'Dynamics', 'Zendesk', 'Intercom', 'Calendly', 'Google Calendar', 'Outlook', 'WhatsApp', 'Airtable', 'Google Sheets'].filter((t) => new RegExp(t.split(' ').pop(), 'i').test(q));
  if (crm.length) { f.crm = { v: crm.join(', ') }; changed = true; }
  const cc = countryFromText(q); if (cc && (!f.country || f.country.cc !== cc || f.country.guess)) { f.country = { cc }; changed = true; }
  if (changed) renderFacts();
}
function countryFromText(q) {
  const NAMES = { GB: /\b(uk|united kingdom|england|reino unido|inglaterra|london|londres)\b/i, ES: /\b(spain|españa|espanha|madrid|barcelona)\b/i, US: /\b(usa|united states|estados unidos|eeuu|eua)\b/i, MX: /\b(m[eé]xico)\b/i,
    BR: /\b(brazil|brasil|s[aã]o paulo)\b/i, PT: /\b(portugal|lisboa|lisbon)\b/i, AR: /\b(argentina)\b/i, CO: /\b(colombia|col[oô]mbia)\b/i, CL: /\b(chile)\b/i, PE: /\b(per[uú])\b/i, IT: /\b(italy|italia|itália)\b/i,
    FR: /\b(france|francia|frança)\b/i, DE: /\b(germany|alemania|alemanha)\b/i, NL: /\b(netherlands|holland|países bajos|holanda)\b/i, IN: /\b(india|índia)\b/i, IE: /\b(ireland|irlanda)\b/i };
  for (const [cc, re] of Object.entries(NAMES)) if (re.test(q)) return cc;
  return '';
}
function readAgent(text) {
  const tail = text.slice(-220);
  st.awaiting = /(what (made|brought|got) you|qu[eé] te (ha )?(hecho|llevado|llev[oó]|tra[ií]do|trajo)|o que (te )?(trouxe|fez)|por que voc[eê])/i.test(tail) ? 'why' : null;
}
const FACT_ORDER = ['why', 'use', 'ind', 'stakes', 'vol', 'crm', 'fit', 'country', 'from'];
function factVal(k, o) {
  if (k === 'use') return o.k ? T.USE[o.k] : o.v; if (k === 'stakes') return o.k ? T.STAKES[o.k] : o.v; if (k === 'fit') return o.k ? T.V[o.k] : o.v;
  if (k === 'vol') return fmt(o.v) + T.volU;
  if (k === 'country') return countryName(o.cc, LANG) + (o.guess ? ' · ' + T.guessed : '');
  return o.v;
}
function renderFacts() {
  const box = panel.querySelector('.awe-facts'), list = panel.querySelector('.awe-facts-list');
  const keys = FACT_ORDER.filter((k) => st.facts[k]);
  box.classList.toggle('on', keys.some((k) => !st.facts[k].guess));
  list.innerHTML = keys.map((k) => `<button type="button" class="awe-fact${st.facts[k].guess ? ' guess' : ''}" data-awe-fact="${k}"><i>${esc(T.k[k])}</i>${esc(factVal(k, st.facts[k]))}</button>`).join('');
}
function editFact(btn) {
  const k = btn.dataset.aweFact; const o = st.facts[k]; if (!o) return;
  btn.innerHTML = `<i>${esc(T.k[k])}</i><input value="${esc(k === 'vol' ? String(o.v) : factVal(k, o).replace(' · ' + T.guessed, ''))}" aria-label="${esc(T.k[k])}">`;
  const inp = btn.querySelector('input'); inp.focus(); inp.select();
  const commit = (sendIt) => {
    const val = inp.value.trim(); if (!val) { renderFacts(); return; }
    if (k === 'vol') st.facts[k] = { v: parseFloat(val) || o.v };
    else if (k === 'country') st.facts[k] = { cc: countryFromText(val) || o.cc, label: val };
    else if (k === 'use') { const u = USE_RX.find(([re]) => re.test(val)); st.facts[k] = u ? { k: u[1] } : { v: val }; }
    else if (k === 'fit') { const v2 = verdictKey(val); st.facts[k] = v2 ? { k: v2 } : { v: val }; st.verdict = v2 || st.verdict; }
    else if (k === 'stakes') { const sk = STAKES_RX.find(([re]) => re.test(val)); st.facts[k] = sk ? { k: sk[1] } : { v: val }; }
    else st.facts[k] = { v: val };
    renderFacts();
    if (sendIt) say(T.msgCorr(T.k[k].toLowerCase(), k === 'country' ? val : factVal(k, st.facts[k])));
  };
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(true); } if (e.key === 'Escape') renderFacts(); });
  inp.addEventListener('blur', () => commit(false), { once: true });
}
const tierNow = () => (st.facts.country && !st.facts.country.guess ? geoOf(st.facts.country.cc) : GEO.tier);

/* ---------- the advise component: the fit verdict (Agent Studio fit · Hybrid · Build it yourself) ---------- */
function verdictKey(line) {
  const l = String(line).toLowerCase();
  if (/build it yourself|constr[uú]yelo t[uú]|construa (voc[eê]|o)|build-fit|by yourself|t[uú] mismo/.test(l)) return 'build';
  if (/hybrid|h[ií]brido/.test(l)) return 'hybrid';
  if (/agent studio|fit|encaj|encaix/.test(l)) return 'fit';
  return '';
}
function fitCard(lines) {
  const k = verdictKey(lines[0]) || 'hybrid';
  st.verdict = k; st.items.add('fit'); st.facts.fit = { k }; renderFacts();
  const reasons = lines.slice(verdictKey(lines[0]) ? 1 : 0).slice(0, 3);
  return h(`<div class="awe-card awe-est awe-fit" data-v="${k}"><span class="awe-tag">${esc(T.fitH)}</span>
    <div style="font:700 19px/1.25 'DM Sans';color:var(--awe-ink)">${esc(T.V[k])}</div>
    <ul class="awe-steps" style="margin-top:8px">${reasons.map((r) => `<li><span>✓</span>${esc(r.replace(/^\s*(?:\d+[.)]|[-•*✓])\s*/, ''))}</li>`).join('')}</ul>
    <div class="awe-why"><b>→</b> ${esc(T.Vsub[k])}</div>
    ${k === 'build' ? `<a class="awe-cta" href="${tagUrl(SIGNUP)}" target="_blank" rel="noopener">${esc(T.build)}</a>` : `<button type="button" class="awe-cta" data-awe-act="demo">${esc(T.demo)}</button>`}</div>`);
}
function planCard(lines) {
  st.items.add('plan');
  const c = flowCard(lines); c.querySelector('.awe-tag').textContent = T.planH; return c;
}
function maybePlan() {}
const fitDemo = () => tierNow() !== 'C' && st.verdict !== 'build';
function decide(lastText) {
  st.lastText = lastText;
  if (st.teamDone || /\?\s*$/.test(splitSources(lastText || '').body.replace(/[*_\s]+$/, '')) || st.awaiting === 'why') return;
  let n = null;
  if (st.verdict) return;   // the fit card carries the next step itself
  else if (st.hot >= 1 && st.answers >= 2 && fitDemo()) n = { k: 'demo', p: 'demo', s: ['fit'], why: T.whyDemo };   // asked about price, dates or the call: the call answers it
  else if (st.answers >= 2 || st.items.size) n = { k: 'fit', p: 'fit', s: ['demo'], why: T.whyFit };                 // low friction first: the honest fit check
  if (!n || n.k === st.nbaKey) return;
  st.nbaKey = n.k;
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const btn = (a, primary) => a === 'build'
    ? `<a ${primary ? 'class="awe-cta" ' : ''}href="${tagUrl(SIGNUP)}" target="_blank" rel="noopener">${esc(T.build)}</a>`
    : `<button type="button" ${primary ? 'class="awe-cta" ' : ''}data-awe-act="${a}">${esc(T[a])}</button>`;
  push(h(`<div class="awe-card awe-nba"><span class="awe-tag act">${esc(T.nba)}</span>
    <div class="awe-why" style="margin-top:0"><b>${esc(T.why)}:</b> ${esc(n.why)}</div>
    ${btn(n.p, true)}${n.s.length ? `<div class="awe-alt">${n.s.map((a) => esc(T.or) + ' ' + btn(a, false)).join(' · ')}</div>` : ''}</div>`));
  repliesEl.innerHTML = '';
}
function act(a) { if (a === 'demo') say(T.msgDemo); else if (a === 'fit') say(T.msgFit); }

function emailCard() {
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  if (thread.querySelector('.awe-mail:not([data-done])')) return;
  const card = push(h(`<div class="awe-card awe-mail"><span class="awe-tag act">ACTION</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink)">${esc(st.mailMode === 'team' ? T.mail : T.mailSendH)}</div><div class="awe-sub">${esc(st.mailMode === 'team' ? T.mailSub : T.mailSendSub)}</div>
    <form class="awe-field"><input type="email" required placeholder="${esc(T.mailPh)}" aria-label="Email" autocomplete="email"><button type="submit">${esc(T.sendIt)}</button></form>
    <div class="awe-sub" data-err style="color:#BE2257;display:none">${esc(T.mailBad)}</div>
    <div class="awe-alt awe-mail-skip"><button type="button" data-awe-mailskip>${esc(T.mailSkip)}</button></div></div>`));
  const form = card.querySelector('form'), inp = form.querySelector('input');
  setTimeout(() => inp.focus({ preventScroll: true }), 300);
  form.addEventListener('submit', (e) => {
    e.preventDefault(); const v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { inp.setAttribute('aria-invalid', 'true'); card.querySelector('[data-err]').style.display = 'block'; return; }
    card.dataset.done = '1'; form.querySelectorAll('input,button').forEach((x) => (x.disabled = true));
    st.facts.email = { v }; push(h(`<div class="awe-me">${esc(v)}</div>`)); setWorking(T.theSite);
    emit('entry_point_lead', ENTRY.demo, { lead_type: st.mailMode === 'team' ? 'team_email' : 'send_by_email', items: [...st.items].join(',') });
    deliver(v).catch((err) => console.warn('[awe]', err));
  });
}
/* Calendly's "anything that will help prepare" is seen and edited by the visitor: only what they told us, readable. Nothing internal (tier, guessed country, visits, journey): that reaches sales through the bot fields. */
function prepNote() {
  const f = st.facts, P = [];
  if (f.why) P.push(T.k.why + ': ' + f.why.v);
  const facts = FACT_ORDER.filter((k) => f[k] && !f[k].guess && !['why', 'from', 'email', 'country'].includes(k)).map((k) => T.k[k] + ': ' + factVal(k, f[k]));

  if (facts.length) P.push(facts.join(' · '));
  if (st.demoLang) P.push(({ en: 'Call language', es: 'Idioma de la llamada', pt: 'Idioma da chamada' })[LANG] + ': ' + st.demoLang);
  return P.join(' | ');
}
function handoffLines() {
  const d = J(), f = st.facts, L = [];
  if (f.why) L.push(T.k.why + ': ' + f.why.v);
  if (d) { L.push(T.k.from + ': ' + (d.from === 'direct' ? T.direct : d.from) + (d.campaign ? ' · ' + d.campaign : '')); if (d.before.length) L.push('→ ' + d.before.join(' → ')); L.push(d.visit > 1 ? '#' + d.visit + ' · ' + (d.firstDaysAgo ? d.firstDaysAgo + 'd' : '0d') : '#1'); }
  const facts = FACT_ORDER.filter((k) => f[k] && !['why', 'from', 'email'].includes(k)).map((k) => T.k[k] + ': ' + factVal(k, f[k]));
  if (facts.length) L.push(facts.join(' · '));
  if (st.items.size) L.push(T.sent + ': ' + [...st.items].join(', '));
  if (st.demoLang) L.push('Call language: ' + st.demoLang);   // the tier stays internal: bot field country_tier
  return L;
}

/* ---------- booking: language choice, then Calendly inside the chat ---------- */
function bookCard() {
  thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const cc = st.facts.country ? st.facts.country.cc : GEO.cc, br = cc === 'BR';
  st.demoLang = br || LANG === 'pt' ? 'Português' : (LANG === 'es' ? 'Español' : 'English');
  const langPick = br ? `<div class="awe-sub" style="margin-top:8px">🇧🇷 ${esc(T.demoLangPT)}</div>`
    : `<div class="awe-sub" style="margin-top:10px">${esc(T.demoLang)}</div><div class="awe-chips" data-awe-langs style="justify-content:flex-start;margin-top:6px">${['English', 'Español', 'Português'].map((l) => `<button type="button" class="awe-chip${l === st.demoLang ? ' on' : ''}" data-awe-dlang="${l}" aria-pressed="${l === st.demoLang}">${l}</button>`).join('')}</div>`;
  const freeToo = tierNow() === 'C' ? `<div class="awe-why"><b>+</b> ${esc(T.freeToo)} <a href="${tagUrl(SIGNUP)}" target="_blank" rel="noopener">${esc(T.build)}</a></div>` : '';
  push(h(`<div class="awe-card awe-book"><span class="awe-tag act">CALL</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink)">${esc(T.bookH)}</div><div class="awe-sub">${esc(T.bookSub)}</div>
    ${langPick}<button type="button" class="awe-cta" data-awe-cal>${esc(T.bookGo)}</button>${freeToo}</div>`));
  st.lastBtns = ['$0', '$1'];
  repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.mailInstead)}" data-awe-payload="$1">${esc(T.mailInstead)}</button>`;
}
function calUrl() {
  const q = new URLSearchParams({ embed_type: 'Inline', embed_domain: location.hostname || 'landbot.io', hide_gdpr_banner: '1', hide_event_type_details: '1', hide_landing_page_details: '1', primary_color: '5a60f6', text_color: '1b2139', utm_medium: 'conversion_agent', utm_campaign: 'agent_studio_lp', utm_content: ENTRY.demo });
  if (realSource()) q.set('utm_source', realSource());
  if (st.facts.email) q.set('email', st.facts.email.v);
  /* the Calendly event asks a1 = WhatsApp phone (required, left to the visitor) and a2 = "anything that will help prepare" (required): the summary goes in a2 */
  const prep = prepNote();
  if (prep) q.set('a2', prep.slice(0, 900));
  return `${BOOK_URL}?${q}`;
}
function openCal(btn) {
  const card = btn.closest('.awe-book'); if (!card || card.querySelector('iframe')) return;
  btn.remove(); const lp = card.querySelector('[data-awe-langs]'); if (lp) lp.querySelectorAll('button').forEach((b) => (b.disabled = true));
  const wrap = h(`<div class="awe-cal" data-loading="${esc(T.calLoading)}"><iframe src="${calUrl()}" title="${esc(T.bookH)}" loading="eager"></iframe></div>`);
  wrap.querySelector('iframe').addEventListener('load', () => wrap.classList.add('ready'), { once: true });
  const free = card.querySelector('.awe-why'); if (free) card.insertBefore(wrap, free); else card.appendChild(wrap); st.calOpen = true;
  setTimeout(() => thread.scrollTo({ top: thread.scrollTop + card.getBoundingClientRect().top - thread.getBoundingClientRect().top - 8, behavior: 'smooth' }), 380);
}
function closeCal(booked) {
  const card = thread.querySelector('.awe-book'); panel.classList.remove('wide'); st.calOpen = false; if (!card) return;
  const cal = card.querySelector('.awe-cal'); if (cal) cal.remove();
  if (booked) {
    emit('entry_point_booking', ENTRY.demo, { demo_language: st.demoLang });
    card.querySelector('.awe-tag').textContent = 'CALL ✓';
    card.appendChild(h(`<div class="awe-receipt on"><span class="ok">✓</span><div>${esc(T.booked)}<small>Calendly · ${esc(T.bookH)} · ${esc(st.demoLang || '')}</small></div></div>`));
    card.appendChild(h(`<details class="awe-sees" open><summary>${esc(T.teamSees)}</summary>${handoffLines().map((l) => `<div>${esc(l)}</div>`).join('')}</details>`));
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
  repliesEl.innerHTML = `<button type="button" class="awe-chip" data-awe-say="${esc(T.backQ)}" data-awe-payload="$0">${esc(T.backQ)}</button>`;
}
function receipts() {
  st.teamDone = true; thread.querySelectorAll('.awe-nba').forEach((x) => x.remove());
  const ctx = FACT_ORDER.filter((k) => st.facts[k] && k !== 'email').map((k) => factVal(k, st.facts[k])).join(' · ') || '—';
  const card = push(h(`<div class="awe-card"><span class="awe-tag act">ACTION ✓</span>
    <div style="font:700 16px/1.3 'DM Sans';color:var(--awe-ink);margin-bottom:6px">${esc(T.done)}</div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(T.r1)}<small>${esc(T.r1s)}</small></div></div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(T.r2)}<small>${esc(ctx)}</small></div></div>
    <div class="awe-receipt"><span class="ok">✓</span><div>${esc(st.mailMode === 'team' ? T.r3 : T.r3Send)}<small>${esc(st.mailMode === 'team' ? T.r3s : T.r3sSend)}</small></div></div>
    <details class="awe-sees"><summary>${esc(T.teamSees)}</summary>${handoffLines().map((l) => `<div>${esc(l)}</div>`).join('')}</details></div>`));
  card.querySelectorAll('.awe-receipt').forEach((r, i) => setTimeout(() => r.classList.add('on'), 450 * (i + 1)));
}

/* ---------- the bar: section-aware outcome; waits for the hero to finish its own "thinking" ---------- */
function setNudge(label, prompt) {
  if (window.innerWidth < 560) label = label.split(' · ')[0];
  if (launchInput.dataset.prompt === prompt && launchInput.placeholder === label) return;
  pill.classList.add('swap');
  setTimeout(() => { launchInput.placeholder = label; launchInput.setAttribute('aria-label', label); launchInput.dataset.prompt = prompt; pill.classList.remove('swap'); }, 200);
}
let ready = false;   // law 4: one thing asking for attention. On this LP the bar appears ONLY once the visitor scrolls the hero out of view: no timer (Fabo, 5-oct-2026).
function reveal() { if (ready) return; ready = true; st.justRevealed = true; setTimeout(() => { st.justRevealed = false; }, 1200); launch.classList.remove('tuck'); syncLaunch(); }
(() => {
  const hero = document.querySelector('header');
  if (!hero) { window.addEventListener('scroll', () => { if (window.scrollY > window.innerHeight) reveal(); }, { passive: true }); return; }
  const check = () => { if (!ready && hero.getBoundingClientRect().bottom <= 0) reveal(); };
  window.addEventListener('scroll', check, { passive: true }); check();   // also when the page opens already scrolled past it
})();
function syncLaunch() {
  launch.classList.toggle('off', st.open);
  if (ready && !st.open && !launch.classList.contains('tuck')) emit('entry_point_view', ENTRY.demo);
  let active = 'hero';
  for (const [id] of SECTIONS) { const el = secEl(id); const r = el && el.getBoundingClientRect(); if (r && r.height > 0 && r.top < window.innerHeight * 0.45) active = id; }
  const key = active + (window.innerWidth < 560 ? ':s' : ':l');
  if (key !== st.section) { st.section = key; const [l, p] = T.nudge[active]; setNudge(l, p); }
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
  const dl = t.closest('[data-awe-dlang]'); if (dl) { st.demoLang = dl.dataset.aweDlang; dl.parentElement.querySelectorAll('button').forEach((b) => { const on = b === dl; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); return; }
  if (t.closest('[data-awe-reset]')) { newConversation(); return; }
  const sk = t.closest('[data-awe-mailskip]'); if (sk) { const card = sk.closest('.awe-mail'); skipMail(card).then(() => { repliesEl.innerHTML = starterChips(); keepFocus(true); }); return; }
  if (t.closest('[data-awe-more]')) { if (st.more) st.more(true); keepFocus(); return; }
  const cp = t.closest('[data-awe-copy]'); if (cp) { const code = cp.closest('.awe-prompt').querySelector('pre').textContent; try { navigator.clipboard.writeText(code); } catch (_) {} cp.textContent = T.copied; emit('entry_point_click', ENTRY.signup, { action: 'copy_prompt' }); setTimeout(() => { cp.textContent = T.copy; }, 1800); return; }
  const th = t.closest('[data-awe-theme]'); if (th) { setTheme(panel.classList.contains('light') ? 'dark' : 'light', true); return; }
  const chip = t.closest('[data-awe-say]'); if (chip && chip.dataset.aweSay === T.mailInstead) { st.mailMode = 'team'; st.fromBook = true; }
  if (chip) { say(chip.dataset.aweSay, chip.dataset.awePayload || undefined); keepFocus(); return; }
  const cal = t.closest('[data-awe-cal]'); if (cal) { openCal(cal); return; }
  const p = t.closest('[data-awe-point]'); if (p) { pointAt(p.dataset.awePoint); return; }
  const a = t.closest('[data-awe-act]'); if (a) { act(a.dataset.aweAct); return; }
  const fct = t.closest('[data-awe-fact]'); if (fct && !fct.querySelector('input')) { editFact(fct); return; }
  if (t.closest('[data-awe-retry]')) { retryLast(); return; }
  if (t.closest('[data-awe-close]')) { closePanel(); return; }
  if (t.closest('[data-awe-open]')) { if (launchInput.value.trim()) { const v = launchInput.value; launchInput.value = ''; say(v); } else { openPanel(); panel.querySelector('.awe-foot input').focus(); } return; }
});
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); reveal(); if (st.open) closePanel(); else { openPanel(); panel.querySelector('.awe-foot input').focus(); } }
  if (e.key === 'Escape' && st.open) closePanel();
});
window.addEventListener('scroll', syncLaunch, { passive: true });
let lastY = window.scrollY, tuckT = 0;
window.addEventListener('scroll', () => {
  if (!ready || st.justRevealed) return;
  const y = window.scrollY, down = y > lastY + 6, up = y < lastY - 6;
  if (down || up) lastY = y;
  const busy = st.open || st.unread || launch.contains(document.activeElement);
  if (down && y > 240 && !busy) launch.classList.add('tuck');
  if (up || busy) launch.classList.remove('tuck');
  clearTimeout(tuckT); tuckT = setTimeout(() => launch.classList.remove('tuck'), 900);
}, { passive: true });
window.addEventListener('resize', syncLaunch);
/* step aside while something else owns the screen: the cookie panel (CookieFirst <dialog>), any open dialog,
   or the LP's own specialist modal. One thing asking for attention. */
const OVERLAYS = 'dialog[open], [class*="cookiefirst" i], #as-bm.as-open';   // #as-bm = the page's own "Talk to an expert" modal (specialist bot)
function overlayOpen() {
  for (const el of document.querySelectorAll(OVERLAYS)) {
    if (el.closest('#awe-panel, #awe-launch')) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 200 && r.height > 80 && (el.matches(':target') || el.matches('dialog[open]') || (getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0'))) return true;   // home modals open via #hash (:target) and fade in
  }
  return false;
}
setInterval(() => {
  const busy = overlayOpen();
  if (busy && st.open) closePanel();
  launch.classList.toggle('aside', busy);
}, 400);
const asideCss = document.createElement('style'); asideCss.textContent = '#awe-launch.aside{opacity:0!important;pointer-events:none!important;transform:translate(-50%,28px)!important}'; document.head.appendChild(asideCss);
/* consent withdrawn (functional off) from the cookie panel: the agent leaves the page */
function consentGone() { const c = window.CookieFirst; return !!(c && c.consent && c.hasConsented && !c.consent.functional); }
['cf_consent', 'cf_consent_loaded'].forEach((ev) => window.addEventListener(ev, () => setTimeout(() => {
  if (!consentGone()) return;
  closePanel(); [launch, panel, scrim].forEach((n) => n && n.remove());
}, 50)));
async function newConversation() {
  await restartSession();
  Object.assign(st, { restarted: false, userMsgs: [], answers: 0, nbaKey: '', items: new Set(), verdict: null, teamDone: false, hot: 0, mailMode: 'team', fromBook: false, demoLang: null, cited: new Set(), awaiting: null, facts: {} });
  initFacts(); thread.innerHTML = ''; repliesEl.innerHTML = ''; setWorking(null); renderFacts(); openPanel(); keepFocus(true);
}
function setTheme(t, remember) {
  const light = t === 'light'; panel.classList.toggle('light', light);
  const r = panel.querySelector('[data-awe-reset]'); r.setAttribute('aria-label', T.resetL); r.title = T.resetL;
  const b = panel.querySelector('[data-awe-theme]'); b.textContent = light ? '☾' : '☀︎'; b.setAttribute('aria-label', light ? T.themeD : T.themeL); b.title = b.getAttribute('aria-label');
  if (remember) { try { localStorage.setItem('awe-theme', t); } catch (_) {} }
}
const mqLight = matchMedia('(prefers-color-scheme: light)');
let savedTheme = null; try { savedTheme = localStorage.getItem('awe-theme'); } catch (_) {}
setTheme(savedTheme || (mqLight.matches ? 'light' : 'dark'));
mqLight.addEventListener('change', (e) => { let s2 = null; try { s2 = localStorage.getItem('awe-theme'); } catch (_) {} if (!s2) setTheme(e.matches ? 'light' : 'dark'); });
paint();
window.lbAweAS = { geo: GEO, lang: () => LANG, st, decide, detectLang };   // for debugging only
} catch (err) { if (String(err && err.message) !== 'already loaded') console.warn('[awe] layer failed', err); }
