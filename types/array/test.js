import { NonConstantTypeError } from '../../core.js';
import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);

	console.log("	Check isCrType ...");
	//===================================
	if(!Types.isCrType(Types[ExtendTypes.typeName]))
		throw new Error();
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName], 1000);
	testArg(Types[ExtendTypes.typeName], Types.Index.Def(15));
	testArg(Types[ExtendTypes.typeName], Types.Index.Def(15), "500");

	var typeWithEmpty = Types[ExtendTypes.typeName].Def(Types.Index.Def(15), 2, true);
	var type = Types[ExtendTypes.typeName].Def(typeWithEmpty, 1024);

	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type) || !Types.isType(typeWithEmpty))
		throw new Error();
	
	console.log("	Check wrong value ...");
	//====================================
	
	if(!type.test([]) 
		|| !type.test([], [13, 14], [16]))
		throw new Error();

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 10;

	repeatSelfTest(type.rand, type.test, repeat);

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

	console.log("   Check constValue method ...");

	//====================================
	// Тест с константным типом элементов
	var constItemType = Types.Const.Def(42);
	var constArrayType = Types.Array.Def(constItemType, 10);
	try {
		var result = constArrayType.constValue();
		if (!Array.isArray(result) || result.length !== 1 || result[0] !== 42) {
			throw new Error("constValue() should return [42] for array with constant item type");
		}
	} catch (e) {
		throw new Error("constValue() shouldn't throw error for array with constant item type: " + e.message);
	}

	// Тест с не-константным типом элементов (используем примитивный тип Number)
	var nonConstItemType = Types.Number.Def(100, 0, 0);
	var nonConstArrayType = Types.Array.Def(nonConstItemType, 10);
	try {
		nonConstArrayType.constValue();
		throw new Error("constValue() should throw error for array with non-constant item type");
	} catch (e) {
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError, got different error: " + e.message);
		}
		// Проверяем, что в стеке типов есть информация о текущем типе
		if (!e.typeStack || !e.typeStack.includes("Array") || !e.typeStack.includes("Number")) {
			throw new Error("Error should contain type stack with 'Array' type");
		}
	}

	console.log("	Check toJSON ...");
	//====================================

	if(!Types.isType(outJType))
		throw new Error();

	repeatSelfTest(outJType.rand, type.test, repeat);

	repeatSelfTest(type.rand, outJType.test, repeat);
}

function testArg(Type, arg){
	var error = null;

	try{
		var type = Type.Def.call(null, arg);
	}
	catch(e){
		var error = e;
	}
	if(!error)
		throw new Error();
}

function repeatSelfTest(rand, test, repeat){
	repeat = Math.abs(repeat);

	while(repeat--){
		let value = rand();
		if(test(value))
			throw new Error(JSON.stringify(test(value), "", 2));
	}
}



export default Test