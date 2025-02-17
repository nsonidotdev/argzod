---
'argzod': minor
---

Option parsing types.
Add ability to define how option values should be parsed (boolean, single, many)
`boolean` expects no arguments, but if some of them are passed then they are treated as positional arguments
same goes for `single`, but it expects 1 value and followed are treated as positional arguments.
`many` adds all followed arguments to its value
