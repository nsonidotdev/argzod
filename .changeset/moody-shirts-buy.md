---
'argzod': minor
---

Added support for attached values for short options.
Examples:
`-ovalue` -> `{ o: value }` assuming option `o` is defined and `v` is not
`-abvalue` -> `{ a: "", b: value }` assuming `a` and `b` options are defined and `v` is not.
