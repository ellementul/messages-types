import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...")

	ExtendTypes(Types)


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
	const validUuidConst = Types.Const.Def("123e4567-e89b-12d3-a456-426614174000")
	const invalidUuidConst = Types.Const.Def("not-a-uuid")
	const stringType = Types.String.Def(36)
	const keyType = Types.Key.Def()

	// 1. UUID является подтипом самого себя
	if (!type.isSubtype(type)) 
		throw new Error("UUID should be subtype of UUID")

	// 2. Const с валидным UUID — подтип
	if (!type.isSubtype(validUuidConst)) 
		throw new Error("Const with valid UUID should be subtype")

	// 3. Const с невалидной строкой — НЕ подтип
	if (type.isSubtype(invalidUuidConst)) 
		throw new Error("Const with invalid UUID should NOT be subtype")

	// 4. String — НЕ подтип (это надтип)
	if (type.isSubtype(stringType)) 
		throw new Error("String should NOT be subtype of UUID")

	// 5. Key — НЕ подтип (форматы несовместимы, Key не содержит дефисов)
	if (type.isSubtype(keyType)) 
		throw new Error("Key should NOT be subtype of UUID")
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