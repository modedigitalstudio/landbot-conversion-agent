# Landbot Conversion Agent · bundles for landbot.io

The agent bundles are served to Webflow from this repo through the [jsDelivr](https://www.jsdelivr.com/) CDN.
Each page's loader is pasted into Webflow **once**. After that, updating the agent means changing a file here: no more Webflow asset uploads, link swaps, or re-pastes.

| Page | Bundle | Loader (pasted in Webflow) |
| --- | --- | --- |
| `/`, `/es`, `/pt-br` | [`bundles/lb-awe-home.js`](bundles/lb-awe-home.js) | [`webflow/loader-home.html`](webflow/loader-home.html) |
| `/pricing` | [`bundles/lb-awe-pricing.js`](bundles/lb-awe-pricing.js) | [`webflow/loader-pricing.html`](webflow/loader-pricing.html) |
| `/lp/agent-studio` | [`bundles/lb-awe-agent-studio.js`](bundles/lb-awe-agent-studio.js) | [`webflow/loader-agent-studio.html`](webflow/loader-agent-studio.html) |
| `/blog/whatsapp-business-api-pricing-change-october` | [`bundles/lb-awe-wa-pricing.js`](bundles/lb-awe-wa-pricing.js) | [`webflow/loader-blog-wa-pricing.html`](webflow/loader-blog-wa-pricing.html) |
| `/blog/black-friday-chatbot` | [`bundles/lb-awe-bf-chatbot.js`](bundles/lb-awe-bf-chatbot.js) | [`webflow/loader-blog-bf-chatbot.html`](webflow/loader-blog-bf-chatbot.html) (in the Layout v2 article embed) |
| whole site | (none, inline) | [`webflow/site-footer-lb-journey.html`](webflow/site-footer-lb-journey.html) |

## Two branches: staging and main

| Branch | Served on | CDN URL |
| --- | --- | --- |
| `staging` | the `*.webflow.io` staging site | `https://cdn.jsdelivr.net/gh/modedigitalstudio/landbot-conversion-agent@staging/bundles/<file>.js` |
| `main` | landbot.io (production) | `https://cdn.jsdelivr.net/gh/modedigitalstudio/landbot-conversion-agent@main/bundles/<file>.js` |

The loader picks the branch from the hostname, so the same loader works on both sites.
A new bundle goes to `staging` first. After it is tested on webflow.io and approved, it is merged into `main`.

## Updating a bundle

### With the scripts (Mac terminal)

```bash
scripts/update.sh ~/Downloads/agente-home-v4-2026-10-10
```

This copies every `lb-awe-*.txt` in the folder to `bundles/*.js`, commits, and pushes to `staging`. Several folders can be passed at once.
Wait about a minute for the cache purge (see below), test on webflow.io, then:

```bash
scripts/release.sh
```

### From the GitHub website

1. Switch to the **staging** branch (branch menu, top left).
2. Open `bundles/`, then **Add file → Upload files**. Drop the new file, **renamed from `.txt` to `.js` and with exactly the same name** as the one it replaces (e.g. `lb-awe-home.js`). Commit directly to `staging`.
3. Test on webflow.io.
4. To go live: **Pull requests → New pull request**, base `main` ← compare `staging`, then **Merge**.

No Webflow publish is needed for a bundle update: the page loads the new file on its own.

## Cache

- jsDelivr caches branch files for up to 12 hours. The GitHub Action [`purge-jsdelivr.yml`](.github/workflows/purge-jsdelivr.yml) clears that cache on every push to `main` or `staging`, then checks the CDN serves exactly the file in the repo. A green check in **Actions** means the update is out. A red one means the CDN is still stale: run the workflow again (**Actions → Purge jsDelivr cache → Run workflow**).
- The loader fetches with `cache: 'no-cache'`, so visitors' browsers check for a new version on every page view instead of keeping the old one for 7 days.
- To check which version is live, open the CDN URL: the first line says `built YYYY-MM-DD`.

## Installing the loaders in Webflow (once per page)

Use the loader from `webflow/`, not the `loader.js` from the client's package (that one still expects a Webflow asset link).

- **Home:** Pages → Home, ES home and PT-BR home → ⚙️ → Custom code → Before `</body>` tag. Replace the old Conversion Agent loader if there is one.
- **Pricing:** Pages → Pricing → same place. Remove the old `landbot-widget` Embed first (see the client's LEIA-ME).
- **Agent Studio LP:** Pages → lp / agent-studio → same place.
- **WhatsApp pricing post:** Pages → Blog Posts Template → same place. Replace the existing loader that points at `…_lb-awe-wa-pricing.txt`.
- **lb-journey** is pasted inline in Site settings → Custom code → Footer code. It is not on the CDN, so a change to it still needs a re-paste (`scripts/update.sh` warns when that happens).

Publish to staging, test, then publish to production. After this, the old `lb-awe-*.txt` assets in Webflow can be deleted.

## Adding a new page

1. Add the bundle as `bundles/lb-awe-<name>.js`.
2. Copy one of the loaders in `webflow/` to `webflow/loader-<name>.html`, change the path check (`location.pathname`) and the file name in `SRC`.
3. Paste it into the page in Webflow once.

## Notes

- The repo must stay **public**: jsDelivr only serves public GitHub repos. The bundles are already public on landbot.io, and they must never contain API keys or other secrets.
- Renaming the repo or moving it to another account changes every CDN URL, so every loader would need a re-paste.
