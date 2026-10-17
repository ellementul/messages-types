import ExtendTypes from './type.js'
import Index from '../index/type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...")

	ExtendTypes(Types)
	Index(Types)
	

	console.log("	Wrong arguments ...")
	//===================================
	testArg(Types[ExtendTypes.typeName])
	testArg(Types[ExtendTypes.typeName], 1000)
	testArg(Types[ExtendTypes.typeName], "Hello world!")
	testArg(Types[ExtendTypes.typeName], {})
	testArg(Types[ExtendTypes.typeName], [])
	testArg(Types[ExtendTypes.typeName], 3, 1)
	testArg(Types[ExtendTypes.typeName], 3, 1, -5)
	testArg(Types[ExtendTypes.typeName], 3, 1, 5.5)
	testArg(Types[ExtendTypes.typeName], 1, 100000, 5)



	var type = Types[ExtendTypes.typeName].Def(100000, 1, 5)


	console.log("	Check isType ...")
	//===================================
	if(!Types.isType(type))
		throw new Error()

	type = Types[ExtendTypes.typeName].Def(9, 0, 0)

	type = Types[ExtendTypes.typeName].Def(100000, 1  , type.rand())
	

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
	const superType = Types.Number.Def(100, 0, 2) // max=100, min=0, precis=2

	// 1. Number с более узким диапазоном и меньшей точностью — подтип
	const validSubNumber = Types.Number.Def(50, 10, 1)
	if (!superType.isSubtype(validSubNumber)) 
		throw new Error("Narrower Number should be subtype")

	// 2. Number с большим максимумом — НЕ подтип
	const invalidMaxNumber = Types.Number.Def(150, 0, 2)
	if (superType.isSubtype(invalidMaxNumber)) 
		throw new Error("Number with larger max should NOT be subtype")

	// 3. Number с большей точностью (больше знаков) — НЕ подтип
	const invalidPrecisNumber = Types.Number.Def(100, 0, 4)
	if (superType.isSubtype(invalidPrecisNumber)) 
		throw new Error("Number with higher precis should NOT be subtype")

	// 4. Const с валидным числом — подтип
	const validConst = Types.Const.Def(42)
	if (!superType.isSubtype(validConst)) 
		throw new Error("Valid Const number should be subtype")

	// 5. Const с числом вне диапазона — НЕ подтип
	const invalidConst = Types.Const.Def(200)
	if (superType.isSubtype(invalidConst)) 
		throw new Error("Const number out of range should NOT be subtype")

	// 6. Const со строкой — НЕ подтип
	const stringConst = Types.Const.Def("42")
	if (superType.isSubtype(stringConst)) 
		throw new Error("Const string should NOT be subtype of Number")

	// 7. Index с диапазоном, полностью входящим в Number — подтип
	const validIndex = Types.Index.Def(50) // диапазон [0, 49], что внутри [0, 100]
	if (!superType.isSubtype(validIndex)) 
		throw new Error("Index within Number range should be subtype")

	// 8. Index с максимумом, превышающим максимум Number — НЕ подтип
	const invalidIndexMax = Types.Index.Def(150) // выходит за max=100
	if (superType.isSubtype(invalidIndexMax)) 
		throw new Error("Index exceeding Number max should NOT be subtype")

	// 9. Number с min > 0, а Index всегда начинается с 0 — НЕ подтип
	const positiveNumber = Types.Number.Def(100, 10, 0) // min=10
	const zeroBasedIndex = Types.Index.Def(50) // начинается с 0
	if (positiveNumber.isSubtype(zeroBasedIndex)) 
		throw new Error("Index starting at 0 should NOT be subtype of Number with min > 0")
}

function testArg(Type, arg){
	var error = null

	try{
		var type = Type.Def.call(null, arg)
	}
	catch(e){
		var error = e
	}
	if(!error)
		throw new Error()
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