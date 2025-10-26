import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'

export default function Test(Types) {
  ExtendTypes(Types);
  runTest(Types, {
    typeName: ExtendTypes.typeName,
    tests: {
      wrongConstrArgsArray: [
        ["not a number"],
        [-5],
        [3.14],
        [null],
        [{}],
        [],
        [100, "not boolean"],
        [0, true], // isRequired=true + max=0 → invalid
      ],
      validArgsForConstr: [
        [100],
        [0],
        [1024],
        [50, true],
        [1, true],
        [100, false],
      ],
      wrongValuesOfType: [
        null,
        undefined,
        "string",
        123,
        [],
        {},
        new ArrayBuffer(1025), // too big
        new Uint8Array(1025),
        ...(() => {
          const type = Types.Buffer.Def(10, true);
          return [
            new ArrayBuffer(0),
            new Uint8Array(0),
            new DataView(new ArrayBuffer(0)),
          ];
        })(),
      ],
      validValuesOfType: [
        new ArrayBuffer(0),
        new Uint8Array(0),
        new Uint16Array(10), // 20 bytes
        new Float32Array(5), // 20 bytes
        new DataView(new ArrayBuffer(50)),
        new Uint8Array([1]),
        new ArrayBuffer(1),
      ],
      repeatSelfTest: 100,
    },
  });
}