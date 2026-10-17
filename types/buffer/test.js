import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'

export default function Test(Types) {
    ExtendTypes(Types)

    if(!Types.isType(Types[ExtendTypes.typeName].Def()))
            throw new Error()

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
    })

    console.log("	Check subType ...");
    //====================================
    const superBuffer = Types.Buffer.Def(1024, false);

    // 1. Buffer с меньшим maxByteLength — подтип
    const smallerBuffer = Types.Buffer.Def(512, false);
    if (!superBuffer.isSubtype(smallerBuffer))
        throw new Error("Buffer with smaller maxByteLength should be subtype");

    // 2. Buffer с таким же maxByteLength — подтип
    const sameBuffer = Types.Buffer.Def(1024, false);
    if (!superBuffer.isSubtype(sameBuffer))
        throw new Error("Buffer with same maxByteLength should be subtype");

    // 3. Buffer с большим maxByteLength — НЕ подтип
    const largerBuffer = Types.Buffer.Def(2048, false);
    if (superBuffer.isSubtype(largerBuffer))
        throw new Error("Buffer with larger maxByteLength should NOT be subtype");

    // 4. Супер isRequired=false, под isRequired=true — подтип (строже)
    const requiredSubBuffer = Types.Buffer.Def(512, true);
    if (!superBuffer.isSubtype(requiredSubBuffer))
        throw new Error("Buffer with isRequired=true should be subtype when super isRequired=false");

    // 5. Супер isRequired=true, под isRequired=false — НЕ подтип
    const strictSuperBuffer = Types.Buffer.Def(1024, true);
    const optionalSubBuffer = Types.Buffer.Def(512, false);
    if (strictSuperBuffer.isSubtype(optionalSubBuffer))
        throw new Error("Buffer with isRequired=false should NOT be subtype when super isRequired=true");

    // 6. Оба isRequired=true — подтип
    const bothRequired = Types.Buffer.Def(512, true);
    if (!strictSuperBuffer.isSubtype(bothRequired))
        throw new Error("Buffer with both isRequired=true should be subtype");

    // 7. Const с валидным ArrayBuffer — подтип
    const validConstBuffer = Types.Const.Def(new Uint8Array(100));
    if (!superBuffer.isSubtype(validConstBuffer))
        throw new Error("Valid Const buffer should be subtype");

    // 8. Const с буфером слишком большого размера — НЕ подтип
    const tooBigConstBuffer = Types.Const.Def(new Uint8Array(2000));
    if (superBuffer.isSubtype(tooBigConstBuffer))
        throw new Error("Const buffer exceeding maxByteLength should NOT be subtype");

    // 9. Const с пустым буфером, когда супер isRequired=true — НЕ подтип
    const emptyConstBuffer = Types.Const.Def(new Uint8Array(0));
    if (strictSuperBuffer.isSubtype(emptyConstBuffer))
        throw new Error("Empty Const buffer should NOT be subtype when super isRequired=true");

    // 10. Const со строкой — НЕ подтип
    const stringConst = Types.Const.Def("hello");
    if (superBuffer.isSubtype(stringConst))
        throw new Error("Const string should NOT be subtype of Buffer");
}