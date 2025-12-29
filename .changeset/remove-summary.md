---
'@content-reviewer/core': patch
'@content-reviewer/cli': patch
---

Remove summary field from ReviewResult

BREAKING CHANGE: The `summary` field has been removed from `ReviewResult`. This field was redundant as issues already contain all necessary information, and it caused inconsistency when severity filtering was applied.
