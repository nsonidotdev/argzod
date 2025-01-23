# argzod

## 0.3.0

### Minor Changes

- 5481f48: Introduced support for inline option values
  Example:
  `--option=value` // option: "value"
  `--option="value1 value2"` // option: "value1 value2"
  `-o=value` // Error: short options don't support inline values
  `--option="value1" value2` // Error: can't combine option value styles (inline + space-separated)

## 0.2.0

### Minor Changes

- 1e00bb0: Update core types and variables. No backward compatibility

### Patch Changes

- a3bbae6: pass more data to command action callback fucntion

## 0.1.0

### Minor Changes

- f5684d5: Bundled options support
  - `-a -b -c` can now be written as `-abc`
  - `-abc value` is parsed as `-a -b -c value`.
