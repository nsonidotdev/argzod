# argzod

## 0.6.1

### Patch Changes

- 6739203: Some small fixes

    - unknown options are now passed to the `action` callback
    - fix getting values from multiple value styles for one option (can only be one value style)
    - enhance bundled options parsing: first option consuming any value (single or many) will get other characters of a bunndle to its value

## 0.6.0

### Minor Changes

- 1c87739: Option parsing types.
  Add ability to define how option values should be parsed (boolean, single, many)
  `boolean` expects no arguments, but if some of them are passed then they are treated as positional arguments
  `single` does the same as boolean, but it expects 1 value and followed are treated as positional arguments.
  `many` adds all followed arguments to its value

### Patch Changes

- e088a75: maxValues for `many` option parse type

## 0.5.2

### Patch Changes

- 04786ef: Basic help text message

## 0.5.1

### Patch Changes

- 053ffa8: Ability to pass custom error messages and onError handler
- ac79b9d: Less error codes and code refactoring
- 5a1fceb: Colorized errors and warnings. Error grouping by levels

## 0.5.0

### Minor Changes

- 593fc2f: Added support for attached values for short options.
  Examples:
  `-ovalue` -> `{ o: value }` assuming option `o` is defined and `v` is not
  `-abvalue` -> `{ a: "", b: value }` assuming `a` and `b` options are defined and `v` is not.

## 0.4.2

### Patch Changes

- dcd4ec2: Republish due to missing build in 0.4.1

## 0.4.1

### Patch Changes

- 4bbc50b: Option names can be array of strings instead of record with short and long fields

## 0.4.0

### Minor Changes

- 8348841: Introduced Option Values Grouping
  **Overview**
  Option values can now be grouped into an array in the following cases:

    1. **Space-Separated Values**: Options provided with space-separated values (e.g., `--option val1 val2`) are now grouped.
    2. **Inline and Repeated Options**: Options provided with repeated inline syntax (e.g., `--option=val1 --option=val2`) are also grouped.

    **Details**
    Each value in these cases is validated independently. For example:

    - In `--option val1 val2`, both `val1` and `val2` are parsed and validated individually using `option.schema.parse(val1)` and `option.schema.parse(val2)`.
    - Similarly, in `--option=val1 --option=val2`, each value is parsed separately.

    **Key Behavioral Changes**

    - Previously, space-separated option values were parsed as a single string (e.g., `"val1 val2"`). Now, these values are split, grouped, and parsed individually.
    - In action callbacks, `options[name]` will now return either:
        - The return type of your schema (as before), for a single value.
        - An array of the schema's return type, for grouped values.

## 0.3.1

### Patch Changes

- a4a46ac: Republish (missing build on 0.3.0)

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
