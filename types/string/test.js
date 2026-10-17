import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'
import UUID from '../uuid/type.js'

export default (function Test(Types){

	ExtendTypes(Types)
	UUID(Types)

	runTest(Types, {
		typeName: ExtendTypes.typeName,
		tests: {
			wrongConstrArgsArray: [
				[{}],
				[[]],
				[null],
				[false],
				[true],
				["Hello world!"],
				[-1],
				[0],
			],
			validArgsForConstr: [
				[],
				[15],
				[5],
				[12],
				[1],
				[1024]
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				undefined,
				null,
				false,
				true
			],
			validValuesOfType: [
				"hell",
				"helloworld",
				"Hello!",
				"Hello \n\r\t type!"
			],
			repeatSelfTest: 1024,
		},
	})

	console.log("	Check subType ...")
	//====================================
	const superString = Types.String.Def(512)

	// 1. String с меньшим maxLength — подтип
	const smallerString = Types.String.Def(256)
	if (!superString.isSubtype(smallerString)) 
		throw new Error("String with smaller maxLength should be subtype")

	// 2. String с таким же maxLength — подтип (эквивалентен)
	const sameString = Types.String.Def(512)
	if (!superString.isSubtype(sameString)) 
		throw new Error("String with same maxLength should be subtype")

	// 3. String с большим maxLength — НЕ подтип
	const largerString = Types.String.Def(1024)
	if (superString.isSubtype(largerString)) 
		throw new Error("String with larger maxLength should NOT be subtype")

	// 4. Key с maxLength >= 256 — подтип
	const wideString = Types.String.Def(256)
	const keyType = Types.Key.Def()
	if (!wideString.isSubtype(keyType)) 
		throw new Error("Key should be subtype of String with maxLength >= 256")

	// 5. Key с maxLength < 256 — НЕ подтип
	const narrowString = Types.String.Def(100)
	if (narrowString.isSubtype(keyType)) 
		throw new Error("Key should NOT be subtype of String with maxLength < 256")

	// 5.1. UUID с maxLength >= 36 — подтип
	const uuidType = Types.UUID.Def()
	const stringForUuid = Types.String.Def(36)
	if (!stringForUuid.isSubtype(uuidType)) 
		throw new Error("UUID should be subtype of String with maxLength >= 36")

	// 5.2. UUID с maxLength < 36 — НЕ подтип
	const stringTooShortForUuid = Types.String.Def(35)
	if (stringTooShortForUuid.isSubtype(uuidType)) 
		throw new Error("UUID should NOT be subtype of String with maxLength < 36")

	// 6. Const с валидной строкой (длина <= maxLength) — подтип
	const validConst = Types.Const.Def("hello world")
	if (!superString.isSubtype(validConst)) 
		throw new Error("Valid Const string should be subtype")

	// 7. Const со строкой длиннее maxLength — НЕ подтип
	const tooLongConst = Types.Const.Def("a".repeat(600))
	if (superString.isSubtype(tooLongConst)) 
		throw new Error("Const string exceeding maxLength should NOT be subtype")

	// 8. Const с числом — НЕ подтип
	const numberConst = Types.Const.Def(42)
	if (superString.isSubtype(numberConst)) 
		throw new Error("Const number should NOT be subtype of String")
})
