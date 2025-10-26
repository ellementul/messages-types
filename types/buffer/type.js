'use strict';

const typeName = "Buffer";
let argError = null;
let Types = null;

function ExtendTypes(Core) {
  Types = Core;
  argError = Core.argError;
  Core.newType(typeName, ConstructorType, outJSON);
}
ExtendTypes.typeName = typeName;


function ConstructorType(maxByteLength = 1024, isRequired = false) {
  if (typeof maxByteLength !== 'number' || !Number.isInteger(maxByteLength) || maxByteLength < 0) {
    throw argError(arguments, 'maxByteLength must be a non-negative integer');
  }
  if (typeof isRequired !== 'boolean') {
    throw argError(arguments, 'isRequired must be a boolean');
  }
  if (isRequired && maxByteLength === 0) {
    throw argError(arguments, 'isRequired=true is incompatible with maxByteLength=0');
  }

  function isBinaryData(value) {
    return (
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value)
    );
  }

  function getByteLength(value) {
    if (value instanceof ArrayBuffer) return value.byteLength;
    if (ArrayBuffer.isView(value)) return value.byteLength;
    return 0;
  }

  function rand() {
    const minLen = isRequired ? 1 : 0;
    const len = minLen + Math.floor(Math.random() * (maxByteLength - minLen + 1));
    return new Uint8Array(len);
  }

  function test(value) {
    if (!isBinaryData(value)) {
      return { value, type: preJSON(), reason: "not binary data (ArrayBuffer or ArrayBufferView)" };
    }
    const byteLen = getByteLength(value);
    if (byteLen > maxByteLength) {
      return { value, type: preJSON(), reason: `byteLength ${byteLen} exceeds max ${maxByteLength}` };
    }
    if (isRequired && byteLen === 0) {
      return { value, type: preJSON(), reason: "buffer is empty but isRequired=true" };
    }
  }

  function preJSON() {
    return {
      name: typeName,
      struct: { maxByteLength, isRequired }
    };
  }

  return { rand, test, preJSON };
}

function outJSON(preType) {
  if (typeof preType === "object" && preType.name === typeName) {
    return ConstructorType(preType.struct.maxByteLength, preType.struct.isRequired);
  }
  throw new Error(`This isn't type ${typeName}!`);
}

export default ExtendTypes;