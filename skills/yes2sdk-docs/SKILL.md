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

A concrete error message or symptom is better answered by the `$yes2sdk-diagnose`
skill than by keyword search.
