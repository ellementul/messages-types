import { NonConstantTypeError } from '../../core.js'
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

	console.log("	Check subType ...");
	//====================================
	const superArray = Types.Array.Def(Types.Number.Def(100, 0, 0), 10, false);

	// 1. Array с меньшим maxLength и более узким типом элементов — подтип
	const validSubArray = Types.Array.Def(Types.Number.Def(50, 0, 0), 5, false);
	if (!superArray.isSubtype(validSubArray)) 
		throw new Error("Array with smaller maxLength and narrower item type should be subtype");

	// 2. Array с таким же maxLength и типом элементов — подтип (эквивалентен)
	const sameArray = Types.Array.Def(Types.Number.Def(100, 0, 0), 10, false);
	if (!superArray.isSubtype(sameArray)) 
		throw new Error("Array with same constraints should be subtype");

	// 3. Array с большим maxLength — НЕ подтип
	const largerMaxArray = Types.Array.Def(Types.Number.Def(100, 0, 0), 20, false);
	if (superArray.isSubtype(largerMaxArray)) 
		throw new Error("Array with larger maxLength should NOT be subtype");

	// 4. Array с более широким типом элементов — НЕ подтип
	const widerItemArray = Types.Array.Def(Types.Number.Def(200, 0, 0), 10, false);
	if (superArray.isSubtype(widerItemArray)) 
		throw new Error("Array with wider item type should NOT be subtype");

	// 5. Супер запрещает пустые, под разрешает — НЕ подтип
	const allowEmptySubArray = Types.Array.Def(Types.Number.Def(100, 0, 0), 10, true);
	if (superArray.isSubtype(allowEmptySubArray)) 
		throw new Error("Array allowing empty should NOT be subtype when super forbids");

	// 6. Супер разрешает пустые, под запрещает — подтип (строже)
	const superAllowEmpty = Types.Array.Def(Types.Number.Def(100, 0, 0), 10, true);
	const forbidEmptySubArray = Types.Array.Def(Types.Number.Def(100, 0, 0), 10, false);
	if (!superAllowEmpty.isSubtype(forbidEmptySubArray)) 
		throw new Error("Array forbidding empty should be subtype when super allows");

	// 7. Const с валидным массивом — подтип
	const validConstArray = Types.Const.Def([1, 2, 3]);
	if (!superArray.isSubtype(validConstArray)) 
		throw new Error("Valid Const array should be subtype");

	// 8. Const с массивом слишком большой длины — НЕ подтип
	const tooLongConstArray = Types.Const.Def([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
	if (superArray.isSubtype(tooLongConstArray)) 
		throw new Error("Const array exceeding maxLength should NOT be subtype");

	// 9. Const с пустым массивом, когда супер запрещает — НЕ подтип
	const emptyConstArray = Types.Const.Def([]);
	if (superArray.isSubtype(emptyConstArray)) 
		throw new Error("Empty Const array should NOT be subtype when super forbids empty");

	// 10. Const с массивом, содержащим невалидные элементы — НЕ подтип
	const invalidItemConstArray = Types.Const.Def([1, 2, "three"]);
	if (superArray.isSubtype(invalidItemConstArray)) 
		throw new Error("Const array with invalid items should NOT be subtype");

	// 11. Const с числом вместо массива — НЕ подтип
	const numberConst = Types.Const.Def(42);
	if (superArray.isSubtype(numberConst)) 
		throw new Error("Const number should NOT be subtype of Array");
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