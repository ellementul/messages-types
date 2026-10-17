import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...")

	ExtendTypes(Types)
	

	console.log("	Wrong arguments ...")
	//===================================
	testArg(Types[ExtendTypes.typeName])
	testArg(Types[ExtendTypes.typeName], "Hello world!")
	testArg(Types[ExtendTypes.typeName], {})
	testArg(Types[ExtendTypes.typeName], [])


	var type = Types[ExtendTypes.typeName].Def(100000)


	console.log("	Check isType ...")
	//===================================
	if(!Types.isType(type))
		throw new Error()

	type = Types[ExtendTypes.typeName].Def(type.rand())
	

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

	type = Types[ExtendTypes.typeName].Def(1)

	console.log("	Check range ...")
	//====================================
	
	repeatSelfTest(type.rand, type.test, repeat)


	console.log("	Check subType ...");
	//====================================
	const superIndex = Types.Index.Def(100); // диапазон [0, 99]

	// 1. Index с меньшим max — подтип
	const smallerIndex = Types.Index.Def(50);
	if (!superIndex.isSubtype(smallerIndex)) 
		throw new Error("Index with smaller max should be subtype");

	// 2. Index с таким же max — подтип (эквивалентен)
	const sameIndex = Types.Index.Def(100);
	if (!superIndex.isSubtype(sameIndex)) 
		throw new Error("Index with same max should be subtype");

	// 3. Index с большим max — НЕ подтип
	const largerIndex = Types.Index.Def(150);
	if (superIndex.isSubtype(largerIndex)) 
		throw new Error("Index with larger max should NOT be subtype");

	// 4. Number с целыми в диапазоне [0, max-1] — подтип
	const validNumber = Types.Number.Def(99, 0, 0); // max=99 < 100
	if (!superIndex.isSubtype(validNumber)) 
		throw new Error("Integer Number within range should be subtype");

	// 5. Number с max == Index.max — НЕ подтип (Number допускает 100, Index отвергает)
	const edgeNumber = Types.Number.Def(100, 0, 0);
	if (superIndex.isSubtype(edgeNumber)) 
		throw new Error("Number with max == Index.max should NOT be subtype");

	// 6. Number с дробной точностью — НЕ подтип
	const floatNumber = Types.Number.Def(50, 0, 2);
	if (superIndex.isSubtype(floatNumber)) 
		throw new Error("Float Number should NOT be subtype of Index");

	// 7. Number с min < 0 — НЕ подтип
	const negativeNumber = Types.Number.Def(50, -10, 0);
	if (superIndex.isSubtype(negativeNumber)) 
		throw new Error("Number with negative min should NOT be subtype of Index");

	// 8. Const с валидным целым — подтип
	const validConst = Types.Const.Def(42);
	if (!superIndex.isSubtype(validConst)) 
		throw new Error("Valid integer Const should be subtype");

	// 9. Const с числом вне диапазона — НЕ подтип
	const outOfRangeConst = Types.Const.Def(150);
	if (superIndex.isSubtype(outOfRangeConst)) 
		throw new Error("Const out of range should NOT be subtype");

	// 10. Const с дробным числом — НЕ подтип
	const floatConst = Types.Const.Def(3.14);
	if (superIndex.isSubtype(floatConst)) 
		throw new Error("Float Const should NOT be subtype of Index");
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