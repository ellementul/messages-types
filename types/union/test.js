import { NonConstantTypeError } from '../../core.js'
import ExtendTypes from './type.js'
import KeyTypes from '../key/type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...")

	ExtendTypes(Types)
	Types.Any = Types.Union

	if(!Types.Key)
		KeyTypes(Types)

	console.log("	Check isCrType ...")
	//===================================
	if(!Types.isCrType(Types[ExtendTypes.typeName]))
		throw new Error()

	
	const testType = Types.Key.Def()
	const testArr = [1,2]
	const testObj = { ex: "ex" }
	const type = Types[ExtendTypes.typeName].Def([5, testType, testArr, testObj])


	console.log("	Check isType ...")
	//===================================
	if(!Types.isType(type))
		throw new Error()

	console.log("	Check wrong value ...")
	//====================================
	
	if(!type.test([]))
		throw new Error()

	if(!type.test())
		throw new Error()

	console.log("	Check valid value ...")
	//====================================

	if(type.test("Key"))
		throw new Error()

	if(type.test(5))
		throw new Error()
	

	console.log("	Check slef-test ...")
	//====================================
	var repeat = 1024

	repeatSelfTest(type.rand, type.test, repeat)

	var jType = type.toJSON()
	var outJType = Types[ExtendTypes.typeName].outJSON(jType)

	console.log("  Check constValue method ...")
	//====================================
	// Тест с одним константным подтипом
	var constSubType = Types.Const.Def(42)
	var anyTypeWithConst = Types.Any.Def([constSubType])
	try {
		var result = anyTypeWithConst.constValue()
		if (result !== 42) {
			throw new Error("constValue() should return 42 for Any with one constant subtype")
		}
	} catch (e) {
		throw new Error("constValue() shouldn't throw error for Any with one constant subtype: " + e.message)
	}

	// Тест с несколькими подтипами
	var anyTypeWithMultiple = Types.Any.Def([Types.Const.Def(1), Types.Const.Def(2)])
	try {
		anyTypeWithMultiple.constValue()
		throw new Error("constValue() should throw error for Any with multiple subtypes")
	} catch (e) {
		if (e.message !== "Any type must have exactly one subtype to be constant") {
			throw new Error("Expected specific error message for multiple subtypes, got: " + e.message)
		}
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError for multiple subtypes")
		}
	}

	// Тест с одним не-константным подтипом (используем примитивный тип Number)
	var nonConstSubType = Types.Number.Def(100, 0, 0)
	var anyTypeWithNonConst = Types.Any.Def([nonConstSubType])
	try {
		anyTypeWithNonConst.constValue()
		throw new Error("constValue() should throw error for Any with one non-constant subtype")
	} catch (e) {
		if (!(e instanceof NonConstantTypeError)) {
			throw new Error("Expected NonConstantTypeError, got different error: " + e.message)
		}
		// Проверяем, что в стеке типов есть информация о текущем типе
		if (!e.typeStack || !e.typeStack.includes("Union") || !e.typeStack.includes("Number")) {
			throw new Error("Error should contain type stack with 'Any' type")
		}
	}

	console.log("	Check toJSON ...")
	//====================================

	if(!Types.isType(outJType))
		throw new Error()

	repeatSelfTest(outJType.rand, type.test, repeat)

	repeatSelfTest(type.rand, outJType.test, repeat)


	console.log("	Check Union as supertype (isSubtype) ...")
	//====================================
	
	// 1. Union([Number, String]) как супертип для Number — true
	const unionNumStr = Types.Union.Def([Types.Number.Def(100, 0, 0), Types.String.Def(100)])
	if (!unionNumStr.isSubtype(Types.Number.Def(100, 0, 0))) 
		throw new Error("Union([Number, String]) should NOT be supertype of Number")

	// 2. Union([Number, Number]) как супертип для Number — true (оба подходят)
	const unionNumNum = Types.Union.Def([Types.Number.Def(50, 0, 0), Types.Number.Def(100, 0, 0)])
	if (!unionNumNum.isSubtype(Types.Number.Def(100, 0, 0))) 
		throw new Error("Union([Number, Number]) should be supertype of Number")

	// 3. Union([Const(1), Const(2)]) как супертип для Number — false
	const unionConsts = Types.Union.Def([Types.Const.Def(1), Types.Const.Def(2)])
	if (unionConsts.isSubtype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union([Const(1), Const(2)]) should be supertype of Number")

	// 4. Union([Const(1), Const("a")]) как супертип для Number — false
	const unionMixedConsts = Types.Union.Def([Types.Const.Def(1), Types.Const.Def("a")])
	if (unionMixedConsts.isSubtype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union([Const(1), Const('a')]) should NOT be supertype of Number")

	// 5. Union как супертип для другого Union — true (все варианты покрываются)
	const superUnion = Types.Union.Def([Types.Number.Def(100, 0, 0), Types.String.Def(100), Types.Bool.Def()])
	const subUnion = Types.Union.Def([Types.Number.Def(50, 0, 0), Types.String.Def(50)])
	if (!superUnion.isSubtype(subUnion)) 
		throw new Error("Union should be supertype of narrower Union")

	// 6. Union как супертип для другого Union — false (не все покрываются)
	const narrowUnion = Types.Union.Def([Types.Number.Def(100, 0, 0)])
	const wideUnion = Types.Union.Def([Types.Number.Def(100, 0, 0), Types.String.Def(100)])
	if (narrowUnion.isSubtype(wideUnion)) 
		throw new Error("Narrow Union should NOT be supertype of wider Union")

	console.log("	Check Union as subtype (isSupertype) ...")
	//====================================

	// 7. Union([Const(1), Const(2)]) как подтип для Number — true
	if (!unionConsts.isSupertype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union([Const(1), Const(2)]) should be subtype of Number")

	// 8. Union([Const(1), Const("a")]) как подтип для Number — false
	if (unionMixedConsts.isSupertype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union([Const(1), Const('a')]) should NOT be subtype of Number")

	// 9. Union([Number(5), Number(10)]) как подтип для Number(10) — true
	const unionNarrowNums = Types.Union.Def([Types.Number.Def(5, 0, 0), Types.Number.Def(10, 0, 0)])
	if (!unionNarrowNums.isSupertype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union of narrow Numbers should be subtype of wider Number")

	// 10. Union([Number(5), Number(15)]) как подтип для Number(10) — false
	const unionWideNums = Types.Union.Def([Types.Number.Def(5, 0, 0), Types.Number.Def(15, 0, 0)])
	if (unionWideNums.isSupertype(Types.Number.Def(10, 0, 0))) 
		throw new Error("Union with Number(15) should NOT be subtype of Number(10)")

	console.log("	Check delegation via core wrapper ...")
	//====================================

	// 11. Number.isSubtype(Union) — через обертку в ядре
	if (!Types.Number.Def(10, 0, 0).isSubtype(Types.Union.Def([Types.Number.Def(7, 0, 0), Types.Number.Def(9, 0, 0)]))) 
		throw new Error("Number should be subtype of Union containing Number")

	// 12. Number.isSubtype(Union) — false
	if (Types.Number.Def(10, 0, 0).isSubtype(Types.Union.Def([Types.String.Def(100), Types.Bool.Def()]))) 
		throw new Error("Number should NOT be subtype of Union without Number")

	// 13. Const.isSubtype(Union) — через обертку - false
	if (Types.Const.Def(5).isSubtype(Types.Union.Def([Types.Number.Def(10, 0, 0), Types.String.Def(100)]))) 
		throw new Error("Const(5) should be subtype of Union containing Number")

	// 14. Object.isSubtype(Union) — через обертку
	const objType = Types.Object.Def({}, true)
	if (!objType.isSubtype(Types.Union.Def([Types.Object.Def({a: Types.Number.Def(100, 0, 0)}), Types.Object.Def({a: Types.Number.Def(50, 0, 0)})]))) 
		throw new Error("Object should be subtype of Union containing compatible Object")

	// 15. Array.isSubtype(Union) — через обертку
	const arrType = Types.Array.Def(Types.Number.Def(10, 0, 0), 10)
	if (!arrType.isSubtype(Types.Union.Def([Types.Array.Def(Types.Number.Def(5, 0, 0), 5), arrType]))) 
		throw new Error("Array should be subtype of Union containing compatible Array")

	console.log("	Check complex combinations ...")
	//====================================

	// 16. Вложенные Union-ы
	const nestedUnion = Types.Union.Def([
		Types.Union.Def([Types.Number.Def(5, 0, 0), Types.String.Def(50)]),
		Types.Bool.Def()
	])
	if (!nestedUnion.isSupertype(Types.Union.Def([Types.Number.Def(10, 0, 0), Types.String.Def(100), Types.Bool.Def()]))) 
		throw new Error("Nested Union should be subtype of wider Union")

	// 17. Object с вложенными Union-ами
	const objWithUnion = Types.Object.Def({
		value: Types.Union.Def([Types.Number.Def(5, 0, 0), Types.String.Def(50)])
	})
	const superObjWithUnion = Types.Object.Def({
		value: Types.Union.Def([Types.Number.Def(10, 0, 0), Types.String.Def(100), Types.Bool.Def()])
	})
	if (!superObjWithUnion.isSubtype(objWithUnion)) 
		throw new Error("Object with narrower Union should be subtype of Object with wider Union")

}

function testArg(Type, arg){
	var error = null

	try{
		Type.Def.call(null, arg)
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
			throw new Error(JSON.stringify(test(value), "", 2))
	}
}



export default Test