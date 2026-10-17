import ExtendTypes from './type.js'
import String from '../string/type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...")
	
	ExtendTypes(Types)
	String(Types)


	var type = Types[ExtendTypes.typeName].Def()
	

	console.log("	Check isType ...")
	//===================================
	if(!Types.isType(type))
		throw new Error()

	

	console.log("	Check slef-test ...")
	//====================================
	var repeat = 1024

	repeatSelfTest(type.rand, type.test, repeat)

	var jType = type.toJSON()
	var outJType = Types[ExtendTypes.typeName].outJSON(jType)

	console.log("	Check toJSON ...")
	//====================================

	if(!Types.isType(outJType))
		throw new Error()

	repeatSelfTest(outJType.rand, type.test, repeat)

	repeatSelfTest(type.rand, outJType.test, repeat)

	console.log("	Check subType ...")
	//====================================
	const superKey = Types.Key.Def(5) // min длина 5

	// 1. Key с большим min — подтип (строже)
	const stricterKey = Types.Key.Def(10)
	if (!superKey.isSubtype(stricterKey)) 
		throw new Error("Key with larger min should be subtype")

	// 2. Key с таким же min — подтип (эквивалентен)
	const sameKey = Types.Key.Def(5)
	if (!superKey.isSubtype(sameKey)) 
		throw new Error("Key with same min should be subtype")

	// 3. Key с меньшим min — НЕ подтип (разрешает более короткие строки)
	const looserKey = Types.Key.Def(0)
	if (superKey.isSubtype(looserKey)) 
		throw new Error("Key with smaller min should NOT be subtype")

	// 4. Const с валидным ключом (длина >= 5, только a-zA-Z0-9_) — подтип
	const validConst = Types.Const.Def("valid_key_123")
	if (!superKey.isSubtype(validConst)) 
		throw new Error("Valid Const key should be subtype")

	// 5. Const со строкой короче min — НЕ подтип
	const shortConst = Types.Const.Def("ok")
	if (superKey.isSubtype(shortConst)) 
		throw new Error("Const key shorter than min should NOT be subtype")

	// 6. Const с недопустимыми символами (например, дефис) — НЕ подтип
	const invalidCharConst = Types.Const.Def("invalid-key")
	if (superKey.isSubtype(invalidCharConst)) 
		throw new Error("Const key with invalid chars should NOT be subtype")

	// 7. String — НЕ подтип (String шире, чем Key)
	const stringType = Types.String.Def(256)
	if (superKey.isSubtype(stringType)) 
		throw new Error("String should NOT be subtype of Key")
}

function repeatSelfTest(rand, test, repeat){
	repeat = Math.abs(repeat)

	while(repeat--){
		let value = rand()
		if(test(value))
			throw test(value)
	}
}



export default Test