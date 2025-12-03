import { NonConstantTypeError } from '../../core.js'
import ExtendTypes from './type.js'
import KeyTypes from '../key/type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);

	if(!Types.Key)
		KeyTypes(Types);

	console.log("	Check isCrType ...");
	//===================================
	if(!Types.isCrType(Types[ExtendTypes.typeName]))
		throw new Error();

	
	const testType = Types.Key.Def();
	const testArr = [1,2]
	const testObj = { ex: "ex" }
	const type = Types[ExtendTypes.typeName].Def([5, testType, testArr, testObj])


	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
		throw new Error();

	console.log("	Check wrong value ...");
	//====================================
	
	if(!type.test([]))
		throw new Error();

	if(!type.test())
		throw new Error();

	console.log("	Check valid value ...");
	//====================================

	if(type.test("Key"))
		throw new Error()

	if(type.test(5))
		throw new Error()

	if(Types[ExtendTypes.typeName].Def().test())
		throw new Error()
	

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 1024;

	repeatSelfTest(type.rand, type.test, repeat);

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

	console.log("  Check constValue method ...");
	//====================================
	// Тест с одним константным подтипом
	var constSubType = Types.Const.Def(42);
	var anyTypeWithConst = Types.Any.Def([constSubType]);
	try {
		var result = anyTypeWithConst.constValue();
		if (result !== 42) {
			throw new Error("constValue() should return 42 for Any with one constant subtype");
		}
	} catch (e) {
		throw new Error("constValue() shouldn't throw error for Any with one constant subtype: " + e.message);
	}

	// Тест с несколькими подтипами
	var anyTypeWithMultiple = Types.Any.Def([Types.Const.Def(1), Types.Const.Def(2)]);
	try {
		anyTypeWithMultiple.constValue();
		throw new Error("constValue() should throw error for Any with multiple subtypes");
	} catch (e) {
		if (e.message !== "Any type must have exactly one subtype to be constant") {
			throw new Error("Expected specific error message for multiple subtypes, got: " + e.message);
		}
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError for multiple subtypes");
		}
	}

	// Тест с одним не-константным подтипом (используем примитивный тип Number)
	var nonConstSubType = Types.Number.Def(100, 0, 0);
	var anyTypeWithNonConst = Types.Any.Def([nonConstSubType]);
	try {
		anyTypeWithNonConst.constValue();
		throw new Error("constValue() should throw error for Any with one non-constant subtype");
	} catch (e) {
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError, got different error: " + e.message);
		}
		// Проверяем, что в стеке типов есть информация о текущем типе
		if (!e.typeStack || !e.typeStack.includes("Any") || !e.typeStack.includes("Number")) {
			throw new Error("Error should contain type stack with 'Any' type");
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
		Type.Def.call(null, arg);
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



export default Test;