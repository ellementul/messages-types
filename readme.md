# Types.js

A library for testing and generating values based on type-defined structures.

## Core Functionality

### Creating a Type

The core function accepts three arguments:
1. **Type name** (string)
2. **Type constructor** (function)
3. **JSON deserializer** (function)

Each type consists of three methods:
- **`.rand()`** — generates a random valid value
- **`.validate(value)`** — validates a value return true if it is valid
- **`.test(value)`** — validates a value against the type (returns error object or `undefined`)
- **`.toJSON()`** — serializes the type to JSON-compatible format

#### Disabling Tests

The library provides a global flag `Types.isTest`.  
If set to `false`, all `.test()` calls return `false` immediately without validation — useful for production builds.

---

## Built-in Types

### `Bool`
Standard boolean type (`true` / `false`).

### `Number`
Floating-point number with constraints:
- `min`: minimum allowed value
- `max`: maximum allowed value
- `precision`: number of decimal digits (0–9)

> **Note**: Use this to enforce realistic numeric bounds in your data structures.

### `Index`
Integer in range `[0, max)`.  
Useful for array indices or enumeration.

### `Alpha`
Float in range `[0, 1]`.  
No precision control — relies on platform float representation.

### `Key`
String (max 256 chars) matching `/^[a-zA-Z0-9_]+$/`.  
Ideal for identifiers, keys, or safe property names.

### `UUID`
Generates and validates UUID v4 strings using the [`uuid`](https://www.npmjs.com/package/uuid) package.

### `Const`
Wraps a primitive value (`string`, `number`, `boolean`, `null`, `undefined`, `function`) as an immutable constant.  
Validation is strict equality (`===`).

### `Object`
Meta-type for plain objects.  
Constructor accepts:
- `templateObject`: object used to infer the structure
- `nonStrict` (optional): if `true`, ignores extra properties during validation

**Behavior**:
- Nested objects/arrays are processed recursively.
- Primitives → wrapped in `Const`.
- Functions → treated as `Const`.
- Existing types inside the object → preserved as-is.
- Cyclic references → ignored (not included in generated or validated objects).

### `Array`
Homogeneous array type. Constructor:
- `itemType`: type of each element (must be a valid `Types` type)
- `maxLength`: maximum number of elements
- `allowEmpty`: if `false`, array must contain at least one element

### `String`
Constrained string type. Constructor:
- `symbolClass`: character class (e.g., `"a-zA-Z0-9"`, `"\\w"`)
- `maxLength`: maximum string length

> The symbol class is compiled into a regex: `/^[symbolClass]+$/`

### `Any`
Union type. Accepts an array of types/constants.  
Value must match **at least one** of them.

### `Switch`
Discriminated union (tagged union). Constructor:
- `keyProps`: string or array of property names that act as discriminators
- `typeObjects`: array of object templates, each **must include** the discriminator(s)

Example:
```js
const MsgType = Types.Switch.Def("kind", [
  { kind: "text", content: Types.String.Def("\\w", 100) },
  { kind: "binary", payload: Types.Buffer.Def(1024) }
]);