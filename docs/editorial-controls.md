# Editing updates and features

Sign in at `/admin` with the existing custom admin credentials. Open **Updates & features**, search for an update, then select it.

- Edit headline, summary, provider, model, section, announcement date and the plain-text detail article.
- Upload a PNG, JPEG or WebP (maximum 5 MB), or enter an HTTPS image URL. Add descriptive alt text, ownership/credit and an optional source/license link. Use only permitted images. Uploads are stored in R2 and served through a constrained image endpoint.
- Add up to four stats, each with a value, descriptive label, HTTPS evidence link and an as-of date. Distinguish vendor-reported results from independently verified measurements. The preview and public article show linked stat callouts.
- Review the live preview and choose **Save & publish changes**. This immediately changes the feed and detail page. Use **Restore imported version** to remove an override; confirmation is required.

The original URL remains the stable article/discussion identifier. Admin overrides use separate D1 settings records, so automated research and RSS refreshes preserve them. Restoring the imported version uses the latest research/feed content. Resetting an article does not delete uploaded files. Drafting manually published blog posts remains available in the Publish tab.

The main updates feed uses compact rows with a left thumbnail at desktop and mobile widths. Existing comments, reactions, bookmarks and sharing stay attached to the same URLs. Initial stat callouts for Habitat storage and MiniMax launch prices link to the original provider announcements and carry their evidence dates.

## Verification

`node scripts/check-editorial.mjs` runs isolated, in-memory route checks (no live requests): admin/origin guards, stat and image-attribution validation, persistence/reset, upload type checks and image retrieval. The test replaces only external auth/storage boundaries. It does not test the pre-existing password implementation or a live Cloudflare account.
