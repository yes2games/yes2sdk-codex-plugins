---
name: yes2sdk-docs
description: Searches the Yes2SDK documentation. Use for an open-ended Yes2SDK docs question when no more specific skill fits.
---

# Searching the Yes2SDK docs

1. Call `yes2sdk:search_docs` with the user's query.
2. Present the top matches: for each, the doc slug, the heading, and a one-line
   excerpt.
3. If a result looks like the full answer, offer to pull it with
   `yes2sdk:get_quickstart` (a platform guide) or `yes2sdk:get_api_reference` (a
   module's method signatures).

For a JavaScript/TypeScript question (Phaser, three.js, vanilla, `@yes2games/js`, the
local-dev mock), also point the user at https://developer.yes2games.com/docs/javascript.
An install question goes to `$yes2sdk-install`, not to search.

A concrete error message or symptom is better answered by the `$yes2sdk-diagnose`
skill than by keyword search.
