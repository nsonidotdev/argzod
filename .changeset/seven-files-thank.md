---
"argzod": minor
---

Introduced support for inline option values
Example:
`--option=value` // option: "value"
`--option="value1 value2"` // option: "value1 value2"
`-o=value` // Error: short options don't support inline values
`--option="value1" value2` // Error: can't combine option value styles (inline + space-separated)
