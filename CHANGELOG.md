# argzod

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
