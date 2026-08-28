# Quillcrypt landing page

Standalone static landing page for [quillcrypt.1n4n0.com](https://quillcrypt.1n4n0.com/).

Open `index.html` directly or serve this folder with any static web server. It has no build step or third-party runtime dependency; the visual language uses an oversized magazine-style typographic system, asymmetrical grids, hairline rules, and the Quillcrypt yellow accent.

## Release setup

The landing repo is intentionally independent from the extension and relay repositories.

Before publishing, replace the deployment-owned URLs in `release-config.js` with the approved
Firefox/Chrome store or release URLs. Store URLs open normally; archive URLs retain download
behavior.

Run `npm test` to check local links, metadata assets, demo CTA removal, and the no-external-font
guarantee. Update the canonical/social host in both HTML pages if the production host changes.
