import { NonConstantTypeError } from '../../core.js'
import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName]);
	testArg(Types[ExtendTypes.typeName], "Hello!");
	testArg(Types[ExtendTypes.typeName], 256);
	testArg(Types[ExtendTypes.typeName], null);
	testArg(Types[ExtendTypes.typeName], false);
	testArg(Types[ExtendTypes.typeName], {
		func: function(){}
	});


	var value = {
		str: "Gert",
		num: 1234,
		arr: [1, 2, 3, 4, 5]
	};

	value.obj = value;

	var type = Types[ExtendTypes.typeName].Def(value);

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
		throw new Error();

	console.log("	Check isn't Object value ...");
	//====================================
	type.test(0)

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 1024;

	repeatSelfTest(type.rand, type.test, repeat);

	console.log("	  Check non-strcit ...");
	//====================================
	const non_strcit_type = Types[ExtendTypes.typeName].Def(value, true);
	const non_strcit_mutations = () => {
		const obj = non_strcit_type.rand()
		obj.otherProperty = "otherProperty"
		return obj
	}
	
	repeatSelfTest(non_strcit_mutations, non_strcit_type.test, repeat);
	

	console.log("	Check toJSON ...");
	//====================================
	value = {
		str: "Gert",
		num: 1234,
		arr: [1, 2, 3, 4, 5]
	};
	value.obj = value;

	type = Types[ExtendTypes.typeName].Def(value);
	
	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

	if(!Types.isType(outJType))
		throw new Error();

	repeatSelfTest(outJType.rand, type.test, repeat);

	repeatSelfTest(type.rand, outJType.test, repeat);

	console.log("  Check constValue method with circular references ...");
	//====================================
	// Тест с константными свойствами
	var constSubType = Types.Const.Def(42);
	var objTypeWithConst = Types.Object.Def({ value: constSubType });
	try {
		var result = objTypeWithConst.constValue();
		if (result.value !== 42) {
			throw new Error("constValue() should return { value: 42 } for object with constant property");
		}
	} catch (e) {
		throw new Error("constValue() shouldn't throw error for object with constant property: " + e.message);
	}

	// Тест с не-константным свойством (используем примитивный тип Number)
	var nonConstSubType = Types.Number.Def(100, 0, 0);
	var objTypeWithNonConst = Types.Object.Def({ value: nonConstSubType });
	try {
		objTypeWithNonConst.constValue();
		throw new Error("constValue() should throw error for object with non-constant property");
	} catch (e) {
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError, got different error: " + e.message);
		}
		if (!e.typeStack || !e.typeStack.includes("Object")) {
			throw new Error("Error should contain type stack with 'Object' type");
		}
	}

	// Тест с циклической зависимостью
	// Создаем два объекта, ссылающихся друг на друга
	var objA = { prop: null };
	var objB = { prop: objA };
	objA.prop = objB;

	try {
		var cyclicObjType = Types.Object.Def(objA);
		cyclicObjType.constValue();
	} catch (e) {
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError for circular reference, got: " + e.message);
		}
		if (e.message !== "Circular reference detected") {
			throw new Error("Expected 'Circular reference detected' message, got: " + e.message);
		}
	}

	// Тест с вложенными объектами
	var nestedConstType = Types.Const.Def(100);
	var nestedObjType = Types.Object.Def({
		level1: Types.Object.Def({
			level2: Types.Object.Def({
				value: nestedConstType
			})
		})
	});
	try {
		var nestedResult = nestedObjType.constValue();
		if (nestedResult.level1.level2.value !== 100) {
			throw new Error("constValue() should correctly handle deeply nested constant objects");
		}
	} catch (e) {
		throw new Error("constValue() shouldn't throw error for deeply nested constant objects: " + e.message);
	}

	console.log("  Check constValue method with INDIRECT circular references ...");
	//====================================
	// Тест с косвенной циклической зависимостью между разными объектами
	// Создаем три объекта, образующих цикл: A -> B -> C -> A
	var objA = { name: "A", next: null };
	var objB = { name: "B", next: null };
	var objC = { name: "C", next: null };

	objA.next = objB;  // A ссылается на B
	objB.next = objC;  // B ссылается на C
	objC.next = objA;  // C ссылается на A (замыкаем цикл)

	// Создаем тип на основе objA
	var cyclicType = Types.Object.Def(objA);

	try {
		console.log("Trying to get constValue() for object with indirect circular reference...");
		var result = cyclicType.constValue()
	} catch (e) {
		if (e.message.includes("Maximum call stack size exceeded") || 
			e.message.includes("stack overflow")) {
			console.error("CRITICAL ERROR: Stack overflow detected!");
			console.error("This proves that the implementation doesn't handle indirect circular references");
			console.error("The function entered infinite recursion and crashed");
			throw new Error("Function failed to handle indirect circular dependencies");
		} else if (e instanceof NonConstantTypeError && e.message === "Circular reference detected") {
			console.log("Test passed - circular reference was properly detected and handled");
		} else {
			throw new Error("Unexpected error type: " + e.message);
		}
	}

	// Тест с вложенными циклами разной глубины
	var deepObj1 = { level: 1, next: null };
	var deepObj2 = { level: 2, next: null };
	var deepObj3 = { level: 3, next: null };
	var deepObj4 = { level: 4, next: null };

	deepObj1.next = deepObj2;
	deepObj2.next = deepObj3;
	deepObj3.next = deepObj4;
	deepObj4.next = deepObj2; // Цикл начинается с уровня 2

	var deepCyclicType = Types.Object.Def(deepObj1);

	try {
		console.log("Trying to get constValue() for deeply nested indirect circular reference...");
		deepCyclicType.constValue();
	} catch (e) {
		if (e.message.includes("Maximum call stack size exceeded")) {
			console.error("CRITICAL ERROR: Stack overflow in deep nesting!");
			throw new Error("Deeply nested circular references are not handled");
		} else if (e instanceof NonConstantTypeError) {
			console.log("Deep nesting test passed - circular reference was detected at correct depth");
			// Проверяем, что стек содержит правильные имена типов
			if (!e.typeStack || e.typeStack.length < 3) {
				throw new Error("Error stack doesn't contain enough type information for deep nesting");
			}
		}
	}

	console.log("  Check binary data handling ...");
	const binaryObj = {
		buffer1: new Uint8Array([1, 2, 3]),
		buffer2: new ArrayBuffer(10),
		buffer3: new DataView(new ArrayBuffer(5)),
		regular: "still works"
	};

	const binaryType = Types[ExtendTypes.typeName].Def(binaryObj);

	if (!Types.isType(binaryType)) throw new Error("binaryType is not valid");

	const generated = binaryType.rand();

	if (binaryType.test(generated)) throw new Error("Validation failed for generated binary object");

	const json = binaryType.toJSON();
	const restoredType = Types[ExtendTypes.typeName].outJSON(json);
	if (!Types.isType(restoredType)) throw new Error("Restored type is not valid");
	const restoredVal = restoredType.rand();
	if (restoredType.test(restoredVal)) throw new Error("Restored type validation failed");
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
		if(test(value)){
			throw new Error(JSON.stringify(test(value), "", 2));
		}
	}
}



export default Test