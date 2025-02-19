---
'argzod': patch
---

Some small fixes

- unknown options are now passed to the `action` callback
- fix getting values from multiple value styles for one option (can only be one value style)
- enhance bundled options parsing: first option consuming any value (single or many) will get other characters of a bunndle to its value
