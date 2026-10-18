This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
types/
  array/
    test.js
    type.js
  bool/
    test.js
    type.js
  buffer/
    test.js
    type.js
  const/
    test.js
    type.js
  index/
    test.js
    type.js
  key/
    test.js
    type.js
  number/
    test.js
    type.js
  object/
    test.js
    type.js
  string/
    test.js
    type.js
  template/
    test.js
    type.js
  union/
    test.js
    type.js
  uuid/
    test.js
    type.js
.gitignore
core.js
core.test.js
index.js
package.json
readme.md
readme.ru.md
test_tool.js
test.mjs
todo.yml
````

# Files

## File: types/union/test.js
````javascript
import { NonConstantTypeError } from '../../core.js'
import ExtendTypes from './type.js'
import KeyTypes from '../key/type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);
	Types.Any = Types.Union

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
		if (!e.typeStack || !e.typeStack.includes("Union") || !e.typeStack.includes("Number")) {
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
````

## File: types/union/type.js
````javascript
'use strict';

import CrIndexType from '../index/type.js'
import CrConstType from '../index/type.js'

import { NonConstantTypeError } from '../../core.js'

const typeName = "Union";

var argError = null;

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;

	if(!Core.Index)
		CrIndexType(Core);

	if(!Core.Const)
		CrConstType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(types){

	if(!Array.isArray(types))
		types = Array.from(arguments)

	types = types.map( type => {
		if(Types.isType(type))
			return type

		if(typeof type == "object" || Array.isArray(type))
			return Types.Object.Def(type)

		return Types.Const.Def(type)
	})

	if(types.length < 1)
		throw argError(arguments, 'Wait Type or Types!')

	const typeIndex = Types.Index.Def(types.length)

	var type = {
		rand: rand,
		test: test,
		constValue: constValue,
		preJSON: preJSON
	}

	function rand(){
		return types[typeIndex.rand()].rand();
	}

	function test(value, path = '$'){
		let isValid = false
		const errors = {}
		const childPath = path + '.[any]'
		for (let i = 0; i < types.length; i++) {
			const itemType = types[i]
			
			const err = itemType.test(value, childPath)
			if(err) {
				const { type } = err
				errors[type.name] = err
			}
			else {
				isValid = true
				break
			}
		}

		if(!isValid)
			return {
				value,
				path: childPath,
				type: preJSON(),
				errors
			}
	}

	function constValue() {
		if (types.length !== 1)
			throw new NonConstantTypeError("Any type must have exactly one subtype to be constant", this);

		try {
			return types[0].constValue();
		} catch (e) {
			if (e instanceof NonConstantTypeError)
				e.pushType(typeName)

			throw e;
		}
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = types.map(typeItem => typeItem.preJSON());
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct.map(itemOutJSON))
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes

function itemOutJSON(preType){
	if(!Types.isCrType(Types[preType.name]))
		throw new Error("Parsing Error! Type with name" + nameType + "is unknowed!");
	return Types[preType.name].outJSON(preType);
}
````

## File: readme.ru.md
````markdown
# Typesjs
Библеотека для тестирования и генерации занчений по заданой типом структуре

## Функциональность ядра
### Создание типа
Эта функция принимает три аргумента:
Первое это имя типа.
Второе это конструктор типа.
Третий конструктор типа из JSON.

Сам тип состоит из трех функций:
Генератор значений
Валидатор
Преобразователь типа в JSON
Отключение тестов
Это свойство представленное изнутри геттером и сеттером, которое если равно False, отключит все тесты, они будут возвращать по умолчанию так же значение False без каких либо реальных проверок.

## Модули
### Bool
Обычный булев тип

### Number
Обычное дробное число, реальный максимум зависит от движка, но нужен не для этого.
Нужен для того чтобы дать конкретные ограничение размеру числа, потому что реальные объекты обычно не имеют каких сверх больших значений, и у любого объекта есть свои пределы. Если эти пределы неизвестны, то это говорит о плохо спроектированных алгоритмах, потому в реальности ограничение у чисел все равно будет, просто будет зависеть от платформы, а не от программиста.
Принимает три параметра: Максимум, Минимум и Количество знаков после десятичной запятой.
Index
Этот тип служит для индексации. Диапазон от нуля до максимума принимаемого как аргумент при определении типа в целых числах. Причем максимальное число никогда не будет достигнуто.

### Alpha
Просто диапазон дробных значений от 0 до 1, точность значения в данном случае будет возложена на платформу, так как обычно это какой диапазон чисел отображенный на отрезок от 0 до 1, в этом случае этот тип лучше не использовать, а использовать изначальный диапазон, например для цвета это от 0 до 255. Но если важно именно такое абстрактное значение, то ограничение на количество десятичных цифр будет только мешать.

### Key
Строка максимальной длиной 256 состоящая из символов a-zA-Z0-9_, дающий максимально совместимый строковой тип, предназначенный для идентификации структуры.
Аргументов у конструктора никаких нет.

### UUID
Тип для uuid
Это обертка над библеотекой https://www.npmjs.com/package/uuid
Для генерации используется uuid v4

### Const
Этот тип работает со строками, числами, Boolean, “null”, “undefined”, просто оборачивая их в тип который по сути является константным значением которое всегда может быть сравнено напрямую.

### Object
Это мета-тип обрабатывающий объекты, конструктор принимает лишь одно значение, это объект по которому будет создан шаблон Объекта.
Вторым необязательным аргументом указываеться должен ли тестр типа игнорировать "лишнии" свойтсва в проверямом объекте
Все вложенные объекты в том числе массивы будут обработаны рекурсивно этим же конструктором. 
Если требуется иное поведение, то массив для начала стоит привести к типу. 
Хотя включение функций вообще не рекомендуется в структуру, тем не менее функция в объекте будет обработана конструктором типа Const
Типы содержащиеся в этом объекте будут включены в шаблон без обработки.
Все значения не имеющие внутренней структуры объекта(строки, числа и т. д.), будут обработаны конструктором типа Const
Если внутри объекта будет найдена ссылка на сам этот объект, или другие циклические зависимости, все они будут проигнорированы, как во время генерирования объектов, так и во время проверки объектов на соответствие типу. Старайтесь избегать циклических зависимостей в структуре.

### Any
Объединение типов, при этом значение должно отвечать структуре одно из перечисленных типов. На вход конструктор типа принимает первым аргументом массив типов и констант.
Констаные значения будут переданы в конструктор констатного типа автоматически
Вложенные массивы и обьекты будут преобразовываться в тип обьекта


### Array
Тип массива, подразумевает что все элементы в массиве одного типа, конструктор типа принимает на вход тип, длину массива, и может ли массив быть пустым. 
Сам массив может быть меньшей длины чем максимальная длина.
Первый аргумент не может быть ничем кроме типа.

### String
Тип строки, его конструктор принимает символьный класс и максимальный размер строки в качестве аргументов.
Символьный класс это строка являющаяся способом перечислить допустимые символы, по факту будет обернута в в регулярное выражение /^[simbol_class]&/, при этом вы не можете использовать отрицание в начале символьного класса как это делается с регулярными выражениями.

### Switch
Этот тип предназначен для создания структуры которая зависит от ключевого свойства, которое и решает какого типа структура будет.
Конструктор типа принимает два аргумента.
Первый аргумент это либо одно значения типа Key, либо массив таких значений. Это набор ключевых свойств объекте отвечающих за тип структуры объекта.
Второй аргумент это  массив объектов, каждый из станет типом структуры. Поэтому каждый объект должен обязательно содержать ключевое свойство(свойства) со значением типа Key, остальные свойства должны быть типами.
````

## File: .gitignore
````
node_modules/*
*.sublime-project
*.sublime-workspace
````

## File: types/buffer/test.js
````javascript
import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'

export default function Test(Types) {
    ExtendTypes(Types)

    if(!Types.isType(Types[ExtendTypes.typeName].Def()))
            throw new Error()

    runTest(Types, {
        typeName: ExtendTypes.typeName,
        tests: {
        wrongConstrArgsArray: [
            ["not a number"],
            [-5],
            [3.14],
            [null],
            [{}],
            [],
            [100, "not boolean"],
            [0, true], // isRequired=true + max=0 → invalid
        ],
        validArgsForConstr: [
            [100],
            [0],
            [1024],
            [50, true],
            [1, true],
            [100, false],
        ],
        wrongValuesOfType: [
            null,
            undefined,
            "string",
            123,
            [],
            {},
            new ArrayBuffer(1025), // too big
            new Uint8Array(1025),
            ...(() => {
            const type = Types.Buffer.Def(10, true);
            return [
                new ArrayBuffer(0),
                new Uint8Array(0),
                new DataView(new ArrayBuffer(0)),
            ];
            })(),
        ],
        validValuesOfType: [
            new ArrayBuffer(0),
            new Uint8Array(0),
            new Uint16Array(10), // 20 bytes
            new Float32Array(5), // 20 bytes
            new DataView(new ArrayBuffer(50)),
            new Uint8Array([1]),
            new ArrayBuffer(1),
        ],
        repeatSelfTest: 100,
        },
    })

    console.log("	Check subType ...");
    //====================================
    const superBuffer = Types.Buffer.Def(1024, false);

    // 1. Buffer с меньшим maxByteLength — подтип
    const smallerBuffer = Types.Buffer.Def(512, false);
    if (!superBuffer.isSubtype(smallerBuffer))
        throw new Error("Buffer with smaller maxByteLength should be subtype");

    // 2. Buffer с таким же maxByteLength — подтип
    const sameBuffer = Types.Buffer.Def(1024, false);
    if (!superBuffer.isSubtype(sameBuffer))
        throw new Error("Buffer with same maxByteLength should be subtype");

    // 3. Buffer с большим maxByteLength — НЕ подтип
    const largerBuffer = Types.Buffer.Def(2048, false);
    if (superBuffer.isSubtype(largerBuffer))
        throw new Error("Buffer with larger maxByteLength should NOT be subtype");

    // 4. Супер isRequired=false, под isRequired=true — подтип (строже)
    const requiredSubBuffer = Types.Buffer.Def(512, true);
    if (!superBuffer.isSubtype(requiredSubBuffer))
        throw new Error("Buffer with isRequired=true should be subtype when super isRequired=false");

    // 5. Супер isRequired=true, под isRequired=false — НЕ подтип
    const strictSuperBuffer = Types.Buffer.Def(1024, true);
    const optionalSubBuffer = Types.Buffer.Def(512, false);
    if (strictSuperBuffer.isSubtype(optionalSubBuffer))
        throw new Error("Buffer with isRequired=false should NOT be subtype when super isRequired=true");

    // 6. Оба isRequired=true — подтип
    const bothRequired = Types.Buffer.Def(512, true);
    if (!strictSuperBuffer.isSubtype(bothRequired))
        throw new Error("Buffer with both isRequired=true should be subtype");

    // 7. Const с валидным ArrayBuffer — подтип
    const validConstBuffer = Types.Const.Def(new Uint8Array(100));
    if (!superBuffer.isSubtype(validConstBuffer))
        throw new Error("Valid Const buffer should be subtype");

    // 8. Const с буфером слишком большого размера — НЕ подтип
    const tooBigConstBuffer = Types.Const.Def(new Uint8Array(2000));
    if (superBuffer.isSubtype(tooBigConstBuffer))
        throw new Error("Const buffer exceeding maxByteLength should NOT be subtype");

    // 9. Const с пустым буфером, когда супер isRequired=true — НЕ подтип
    const emptyConstBuffer = Types.Const.Def(new Uint8Array(0));
    if (strictSuperBuffer.isSubtype(emptyConstBuffer))
        throw new Error("Empty Const buffer should NOT be subtype when super isRequired=true");

    // 10. Const со строкой — НЕ подтип
    const stringConst = Types.Const.Def("hello");
    if (superBuffer.isSubtype(stringConst))
        throw new Error("Const string should NOT be subtype of Buffer");
}
````

## File: types/buffer/type.js
````javascript
const typeName = "Buffer"
let argError = null
let Types = null

function ExtendTypes(Core) {
    Types = Core
    argError = Core.argError
    Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName


function ConstructorType(maxByteLength = 1024, isRequired = false) {
  if (typeof maxByteLength !== 'number' || !Number.isInteger(maxByteLength) || maxByteLength < 0) {
    throw argError(arguments, 'maxByteLength must be a non-negative integer')
  }
  if (typeof isRequired !== 'boolean') {
    throw argError(arguments, 'isRequired must be a boolean')
  }
  if (isRequired && maxByteLength === 0) {
    throw argError(arguments, 'isRequired=true is incompatible with maxByteLength=0')
  }

  function isBinaryData(value) {
    return (
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value)
    )
  }

  function getByteLength(value) {
    if (value instanceof ArrayBuffer) return value.byteLength
    if (ArrayBuffer.isView(value)) return value.byteLength
    return 0
  }

  function rand() {
    const minLen = isRequired ? 1 : 0
    const len = minLen + Math.floor(Math.random() * (maxByteLength - minLen + 1))
    return new Uint8Array(len)
  }

  function test(value) {
    if (!isBinaryData(value)) {
      return { value, type: preJSON(), reason: "not binary data (ArrayBuffer or ArrayBufferView)" }
    }
    const byteLen = getByteLength(value)
    if (byteLen > maxByteLength) {
      return { value, type: preJSON(), reason: `byteLength ${byteLen} exceeds max ${maxByteLength}` }
    }
    if (isRequired && byteLen === 0) {
      return { value, type: preJSON(), reason: "buffer is empty but isRequired=true" }
    }
  }

  function preJSON() {
    return {
      name: typeName,
      struct: { maxByteLength, isRequired }
    }
  }

  function isSubtype(otherType) {
    if (!Types.isType(otherType)) return false
    const otherJson = otherType.preJSON()

    if (otherJson.name === "Buffer") {
      const otherStruct = otherJson.struct
      if (otherStruct.maxByteLength > maxByteLength) return false
      if (isRequired && !otherStruct.isRequired) return false
      return true
    }

    if (otherJson.name === "Const") {
      return !test(otherJson.struct)
    }

    return false
  }

  return { rand, test, preJSON, isSubtype }
}

function outJSON(preType) {
  if (typeof preType === "object" && preType.name === typeName) {
    return ConstructorType(preType.struct.maxByteLength, preType.struct.isRequired)
  }
  throw new Error(`This isn't type ${typeName}!`)
}

export default ExtendTypes
````

## File: types/uuid/test.js
````javascript
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
````

## File: types/uuid/type.js
````javascript
'use strict'
import * as uuid from 'uuid'

const typeName = "UUID"

var argError = null

import CrIndexType from '../index/type.js'

var Types = null

function ExtendTypes(Core){
	Types = Core
	argError = Core.argError
	if(!Core.Index)
		CrIndexType(Core)

	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName

function ConstructorType(){

	var type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === "UUID") {
			return true
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct)
		}

		return false
	}

	function rand(){
		return uuid.v4()
	}

	function test(str){
		if(!uuid.validate(str)){
			return { value: str, type: preJSON()}
		}
	}

	function preJSON(){
		var type = {}
		type.name = typeName
		return type
	}

	return type

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!")
}

export default ExtendTypes
````

## File: core.test.js
````javascript
export default (function (Types){
  crTest("Recognize Index outJSON", () => {
    const type = Types.Index.Def(100)
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
  crTest("Recognize String outJSON", () => {
    const type = Types.String.Def(100)
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
  crTest("Recognize Object outJSON", () => {
    const type = Types.Object.Def({
      string: Types.String.Def(100),
      index: Types.Index.Def(100)
    })
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
})


function crTest(title, testFunc){
	let res = testFunc();

	if(res)
		errorMessage(title, res);
	else
		console.info("  " + title + "...Ok");
}

function errorMessage(title, res){
	throw new Error(title + ': \n' + JSON.stringify(res, "", 2));
}
````

## File: test.mjs
````javascript
import Types from './core.js'

import Template from './types/template/test.js'
import Const from './types/const/test.js'
import Boolean from './types/bool/test.js'
import Number from './types/number/test.js'

import Index from './types/index/test.js'
import Key from './types/key/test.js'
import Object from './types/object/test.js'
import Array from './types/array/test.js'
import Union from './types/union/test.js'
import String from './types/string/test.js'
import Uuid from './types/uuid/test.js'
import TestCore from './core.test.js'

Template(Types)
Const(Types)
Boolean(Types)
Number(Types)
Index(Types)
Key(Types)
Object(Types)
Array(Types)
Union(Types)
String(Types)
Uuid(Types)
TestCore(Types)

console.log("Success!");
````

## File: todo.yml
````yaml
Задчи:
  - Изменить поведение строк:
    - дать возможноть передавать в качестве аргументов только длину
    - сделать дипазон символов по умолчанию для генерации:
      - добавить туда латиницу
      - добавить цифры
      - добавить знаки препинания
      - добавить пробелы
      - Не добавлять табы и переводы строки
    - -----------------------------------------------------
    - дать возможность указать вместо дипазанов символов регулярку
    - Из регулярки извлечь информацию:
      - разбить регулярку на отдельные части
      - для каждой части определить свой тип строки
      - повторить рекурсивно пока каждый подтип строки будет:
        - или диапазоном символов:
          - в случая отрицания, взять стандартный диапазон без отрицаемых символов
        - или строкой-константой
````

## File: types/bool/test.js
````javascript
import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type " + ExtendTypes.typeName + " testing...");

	ExtendTypes(Types);

	if(!Types.isType(Types[ExtendTypes.typeName].Def()))
		throw new Error();

	var type = Types[ExtendTypes.typeName].Def();

	var repeat = 1024;

	while(repeat--) if(type.test(type.rand()))
		throw new Error();

	if(!type.test(0) || !type.test("") || !type.test(null) || !type.test())
		throw new Error();

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);


	if(!Types.isType(outJType))
		throw new Error();

	repeat = 1024;
	while(repeat--) if(outJType.test(type.rand()))
		throw new Error();

	repeat = 1024;
	while(repeat--) if(type.test(outJType.rand()))
		throw new Error();

	console.log("	Check subType ...");
	//====================================
	const constTrue = Types.Const.Def(true);
	const constFalse = Types.Const.Def(false);
	const constString = Types.Const.Def("hello");

	// Bool является подтипом самого себя
	if (!type.isSubtype(type)) 
		throw new Error("Bool should be subtype of Bool");

	// Const(true) и Const(false) являются подтипами Bool
	if (!type.isSubtype(constTrue)) 
		throw new Error("Const(true) should be subtype of Bool");
	if (!type.isSubtype(constFalse)) 
		throw new Error("Const(false) should be subtype of Bool");

	// Const со строкой НЕ является подтипом Bool
	if (type.isSubtype(constString)) 
		throw new Error("Const(string) should NOT be subtype of Bool");
}


export default Test
````

## File: types/key/test.js
````javascript
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
````

## File: index.js
````javascript
import Types from './core.js'

import Template from './types/template/type.js'
import Const from './types/const/type.js'
import Boolean from './types/bool/type.js'
import Number from './types/number/type.js'

import Index from './types/index/type.js'
import Key from './types/key/type.js'
import Object from './types/object/type.js'
import Array from './types/array/type.js'
import Union from './types/union/type.js'
import String from './types/string/type.js'
import Uuid from './types/uuid/type.js'

Template(Types)
Const(Types)
Boolean(Types)
Number(Types)
Index(Types)
Key(Types)
Object(Types)
Array(Types)
// Псевдоним для обратной совместимости
Types.Any = Types.Union
Union(Types)
String(Types)
Uuid(Types)

export default Types
````

## File: test_tool.js
````javascript
export default (function Test(Types, {
	typeName,
	tests: {
		wrongConstrArgsArray,
		validArgsForConstr,
		wrongValuesOfType,
		validValuesOfType,
		repeatSelfTest
	},
}){

	console.log("\n\nType "+ typeName +" testing: ", "\n");

	it("Check isCrType", ()=>
		Types.isCrType(Types[typeName])
	);
	
	crTest('Wrong arguments for constructor', () => 
		testArrayArgs(Types[typeName].Def, wrongConstrArgsArray)
	);

	crTest('Right arguments for constructor', () => 
		testArrayArgs(Types[typeName].Def, validArgsForConstr, true)
	);


	var type = Types[typeName].Def.apply(null, validArgsForConstr[0]);


	it("Check isType", ()=>
		Types.isType(type)
	);

	crTestValues('Wrong arguments for validation of type', type.test, wrongValuesOfType);

	crTestValues('Validate values for validation of type', type.test, validValuesOfType, true);



	let selfTest =  () => type.test(type.rand());

	crRepeatTest('Self-test of type', selfTest, repeatSelfTest, true);


	var jType = type.toJSON();
	var outJType = Types[typeName].outJSON(jType);

	it("Check isType of JSON", ()=>
		Types.isType(outJType)
	);

	selfTest =  () => type.test(outJType.rand());
	crRepeatTest('Self-test rand of JSON', selfTest, repeatSelfTest, true);

	selfTest =  () => outJType.test(type.rand());
	crRepeatTest('Self-test test of JSON', selfTest, repeatSelfTest, true);

	selfTest =  () => outJType.test(outJType.rand());
	crRepeatTest('Self-test type of JSON', selfTest, repeatSelfTest, true);

	crTestValues('Validate values with .validate (should be true)', type.validate, validValuesOfType, false);
	crTestValues('Validate values with .validate (should be false)', type.validate, wrongValuesOfType, true);
});



function crTestValues(title, testFunc, values, isShouldFalse){

	crTest(title, () =>{
		let resArr =  [];

		if(isShouldFalse)
			resArr = values.map(value => testFunc(value)).filter(res => res);
		else
			resArr = values.filter(value => !testFunc(value));

		if(resArr.length)
			return {
				errors: resArr,
				message: "Errors of call",
			}
	});
}

function crRepeatTest(title, testFunc, repeat, isShouldFalse){

	crTest(title, () =>{
		let resArr = Array(repeat).fill(false);
		let errors = [];

		if(isShouldFalse)
			errors = resArr.map(testFunc).filter(res => res);
		else
			errors = resArr.filter(() => !testFunc());
			

		if(errors.length)
			return {
				errors,
				message: "Errors repeat",
			}
	});
}

function it(title, testFunc){
	crTest(title, () =>{
		if(!testFunc())
			return {message: 'The statement is incorrect'};
	});
}

function crTest(title, testFunc){
	let res = testFunc();

	if(res)
		errorMessage(title, res);
	else
		console.info("  " + title + "...Ok");
}

function errorMessage(title, res){
	throw new Error(title + ': \n' + JSON.stringify(res, "", 2));
}

function testArrayArgs(testingFunc, arrayArgs, right){
	let errors = [];
	let resArr = [];

	arrayArgs.map(args => {
		let {error, res} = testArgs(testingFunc, args);
		if((right && error) || (!right && !error))
			errors.push({
				wrongArgs: args,
				result: res,
				error: error.message,
			});
	});

	if(errors.length)
		return  {
			errors,
			message: "Incorrectly processed wrong arguments",
		};
}

function testArgs(testingFunc, args){
	let error = false;
	let res = null;

	try{
		res = testingFunc.apply(null, args);
	}
	catch(e){
		error = e;
	}

	return {error, res};
}
````

## File: types/array/test.js
````javascript
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
````

## File: types/index/test.js
````javascript
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
````

## File: types/number/test.js
````javascript
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
````

## File: types/number/type.js
````javascript
'use strict';

const typeName = "Number";
import Types from "../../core.js"
var argError

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(max, min, precis){

	if(typeof min !== 'number' || !isFinite(min)
		||typeof max !== 'number' || !isFinite(max)
		||typeof precis !== 'number' || !isFinite(precis)
		||(max <= min)
		||(precis < 0)
		||(precis > 9)
		||(precis % 1 !== 0))
		throw argError(arguments, 'Wait arguments: max(number), > min(number), precis(0<=number<9)');
	

	var type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false;
		const otherJson = otherType.preJSON();

		if (otherJson.name === "Number") {
			return (
				otherJson.struct.min >= min &&
				otherJson.struct.max <= max &&
				otherJson.struct.precis <= precis
			);
		}

		if (otherJson.name === "Index") {
			// Диапазон Index: [0, max). Должен помещаться в [min, max] супертипа.
			return 0 >= min && otherJson.struct.max - 1 <= max;
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct);
		}

		return false;
	}

	function rand(){
		return +(((max - min)*Math.random() +  min).toFixed(precis));
	}

	function test(n){
		if(typeof n !== 'number' || !isFinite(n))
			return { value: n, type: preJSON() }
		

		if((n > max)
		||(n < min)
		|| (n.toFixed(precis) != n && n !== 0) )
			return { value: n, type: preJSON() }

		return false;
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = {
			min: min,
			max: max,
			precis: precis
		};
		return type;
	}

	return type;

}

function outJSON(preType){
	var arg = preType.struct;

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(arg.max, arg.min, arg.precis);
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes
````

## File: types/bool/type.js
````javascript
'use strict';

import Types from "../../core.js"
const typeName = "Bool"

function ExtendTypes(Core){
	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName;

function ConstructorType(){

	var type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === "Bool")
			return true

		if (otherJson.name === "Const")
			return typeof otherJson.struct === "boolean"

		return false
	}

	function rand(){
		return Math.random() > 0.5;
	}

	function test(value){
		if(value !== false && value !== true)
			return { value: value, type: preJSON()};
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType()
	else
		throw new Error("This isn't boolean type!");
}

export default ExtendTypes;
````

## File: types/index/type.js
````javascript
'use strict'

const typeName = "Index"
import Types from "../../core.js"
var argError

function ExtendTypes(Core){
	argError = Core.argError
	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName

function ConstructorType(max){

	if(typeof max !== 'number' || !isFinite(max)
		||(max <= 0)
		||(max % 1 !== 0))
		throw argError(arguments, 'Wait arguments: max(int>0)')
	

	var type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === "Index") {
			return otherJson.struct.max <= max
		}

		if (otherJson.name === "Number") {
			// Number.max < Index.max, т.к. Number допускает n==max, а Index отвергает n>=max
			return (
				otherJson.struct.min >= 0 &&
				otherJson.struct.max < max &&
				otherJson.struct.precis === 0
			)
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct)
		}

		return false
	}

	function rand(){
		return Math.floor(max * Math.abs(Math.random() - 0.01))
	}

	function test(n){
		if(typeof n !== 'number' || !isFinite(n))
			return { value: n, type: preJSON()}
		

		if(n >= max || n < 0 || n % 1 !== 0)
			return { value: n, type: preJSON()}

		return false
	}

	function preJSON(){
		var type = {}
		type.name = typeName
		type.struct = {
			max: max
		}
		return type
	}

	return type

}

function outJSON(preType){
	var arg = preType.struct

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(arg.max)
	else
		throw new Error("This isn't type " + typeName + "!")
}

export default ExtendTypes
````

## File: types/string/test.js
````javascript
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
````

## File: types/array/type.js
````javascript
import { NonConstantTypeError } from '../../core.js'
import CrIndexType from '../index/type.js'

const typeName = "Array"

var argError = null

var Types = null

function ExtendTypes(Core){
	Types = Core
	argError = Core.argError
	if(!Core.Index)
		CrIndexType(Core)

	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName

function ConstructorType(itemType, maxLength, is_empty){

	var maxLengthType = Types.Index.Def(1024*1024)	

	if(!Types.isType(itemType)
		|| maxLengthType.test(maxLength))
		throw argError(arguments, 'Wait args (Type, maxLength<1024*1024 [, isEmptyArray])')

	var lengthType = Types.Index.Def(maxLength + 1)

	var type = {
		rand,
		test,
		constValue,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === typeName) {
			const otherStruct = otherJson.struct
			
			if (otherStruct.maxLength > maxLength) return false
			if (!is_empty && otherStruct.is_empty) return false
			
			// Рекурсивная проверка типа элементов
			const subItemType = Types.outJSON(otherStruct.type)
			return itemType.isSubtype(subItemType)
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct)
		}

		return false
	}

	function rand(){
		var length = lengthType.rand()
		var arr = []

		if(!is_empty)
			arr.push(itemType.rand())

		while(arr.length < length)
			arr.push(itemType.rand())

		return arr
	}

	function test(arr, path = '$'){
		if(!Array.isArray(arr))
			return { value: arr, type: preJSON(), path}

		if((arr.length > maxLength) || (!is_empty && arr.length == 0))
			return { length: arr.length, type: preJSON(), path}

		let err_arr = null
		for (let i = 0; i < arr.length; i++) {
			const childPath = path + '[' + i + ']'
			err_arr = itemType.test(arr[i], childPath)
			if(err_arr){
				err_arr.path = err_arr.path || childPath
				break
			}
		}

		if(err_arr)
			return err_arr
	}

	function constValue() {
		try {
			return [itemType.constValue()]
		} catch (e) {
			if (e instanceof NonConstantTypeError)
				e.pushType(typeName)

			throw e
		}
	}

	function preJSON(){
		var type = {}
		type.name = typeName
		type.struct = {type: itemType.preJSON(), maxLength: maxLength, is_empty: is_empty}
		return type
	}

	return type

}

function outJSON(preType){
	var struct = preType.struct
	var nameType = struct.type.name

	if(!Types.isCrType(Types[nameType]))
		throw new Error("Parsing Error! Type with name" + nameType + "is unknowed!")

	var type = Types[nameType].outJSON(struct.type)

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(type, struct.maxLength, struct.is_empty)
	else
		throw new Error("This isn't type " + typeName + "!")
}

export default ExtendTypes
````

## File: types/const/test.js
````javascript
import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);

	var value = 1000;
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName], Types[ExtendTypes.typeName].Def(value));
	testArg(Types[ExtendTypes.typeName], () => {});


	value = "Hello world!";

	var type = Types[ExtendTypes.typeName].Def(value);

	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type) || !Types.isType(Types.Const.Def()))
		throw new Error();

	console.log("	Check subType ...")
	//====================================
	if(!type.isSubtype(Types[ExtendTypes.typeName].Def(value)))
		throw new Error()

	if(type.isSubtype(Types[ExtendTypes.typeName].Def("Bye!")))
		throw new Error()

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 1024;

	repeatSelfTest(type.rand, type.test, repeat);


	console.log("  Check constValue method ...");
	//====================================
	if(type.constValue() !== value)
		throw new Error("constValue() doesn't return the correct constant value");

	console.log("	Check toJSON ...");
	//====================================

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

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
			throw test(value);
	}
}



export default Test;
````

## File: types/const/type.js
````javascript
'use strict';

import Types from "../../core.js"

const typeName = "Const";

var argError = null;

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(constVal){

	if(Types.isCrType(constVal) || Types.isType(constVal) || typeof constVal == "function")
		throw argError(arguments, 'Const value cannot be Type or Function!');

	var type = {
		rand,
		test,
		constValue,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false;
		const otherJson = otherType.preJSON();
		
		return otherJson.name === typeName && otherJson.struct === constVal
	}

	function rand(){
		return constVal;
	}

	function test(value){
		if(value !== constVal)
			return { value: value, type: preJSON()};
	}

	function constValue() {
		return constVal;
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = constVal;
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes;
````

## File: types/key/type.js
````javascript
'use strict';

const typeName = "Key";

var argError = null;

import CrNumberType from '../number/type.js'

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Number)
		CrNumberType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(min = 0){

	if(typeof min !== 'number' || !isFinite(min)
		||(min < 0)
		||(min % 1 !== 0))
		throw argError(arguments, 'Wait arguments: min(int>=0)');

	var chars = crChars()
	var indexType = Types.Index.Def(chars.length)
	var regEx =  /^[a-zA-Z0-9_]*$/

	var type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false;
		const otherJson = otherType.preJSON();

		if (otherJson.name === "Key")
			return otherJson.struct.min >= min;
		

		if (otherJson.name === "Const")
			return !test(otherJson.struct)

		return false
	}

	function rand(){
		var size = min + indexType.rand();

		var str = '';
		while(size){
			var randIndex = indexType.rand()
			var charNum = chars[randIndex];
			str += String.fromCharCode(charNum);
			size--;
		}

		return str;
	}

	function test(str){
		if(typeof(str) !== 'string'
		||str.length > 256
		||str.length < min
		||!regEx.test(str)){
			return { value: str, type: preJSON()}
		}
	}

	function preJSON(){
		var type = {}
		type.name = typeName
		type.struct = { min }
		return type
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct.min)
	else
		throw new Error("This isn't type " + typeName + "!");
}


function crChars(){
	var arr_chars = rangeInArr(("a").charCodeAt(0), ("z").charCodeAt(0));

	arr_chars = arr_chars.concat(rangeInArr(("A").charCodeAt(0), ("Z").charCodeAt(0)));

	arr_chars = arr_chars.concat(rangeInArr(("0").charCodeAt(0), ("9").charCodeAt(0)));

	arr_chars.push(("_").charCodeAt(0));

	return arr_chars;
}


function rangeInArr(beg, end){
	if(beg > end){
		var tmp = beg;
		beg = end;
		end = tmp;
	}

	var arr = [];
	for(var i = beg; i <= end; i++){
		arr.push(i);
	}

	return arr;
}

export default ExtendTypes
````

## File: types/string/type.js
````javascript
'use strict'

const typeName = "String"

let argError = null

let Types = null

function ExtendTypes(Core){
	Types = Core
	argError = Core.argError
	if(!Core.Index)
		CrIndexType(Core)

	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName

function ConstructorType(maxLength = 16384){

	let maxLengthType = Types.Index.Def(1024 * 1024)

	if(maxLengthType.test(maxLength - 1))
		throw argError(arguments, 'Wait args ( maxLength(1024*1024>=Index>0) )')

	let lengthType = Types.Index.Def(maxLength)

	let type = {
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === typeName) {
			return otherJson.struct.maxLength <= maxLength
		}

		if (otherJson.name === "UUID") {
			return maxLength >= 36
		}

		if (otherJson.name === "Key") {
			return maxLength >= 256
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct)
		}

		return false
	}

	function rand(){
		let length = lengthType.rand()

		if(length < 1)
			length++

		var str = ''
		const hexChars = '0123456789abcdef'

		while(length--){
			str += hexChars[Math.floor(Math.random() * 16)]
		}

		return str
	}

	function test(str){
		if((typeof(str) !== 'string')
			|| lengthType.test(str.length - 1)
		)
			return { value: str, type: preJSON()}
		

		return  false
	}

	function preJSON(){
		var type = {}
		type.name = typeName
		type.struct = {
			maxLength,
		}
		return type
	}

	return type

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct.maxLength)
	else
		throw new Error("This isn't type " + typeName + "!")
}

export default ExtendTypes
````

## File: types/template/type.js
````javascript
'use strict';

const typeName = "Core";

let argError = null;

let Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(hello){

	if(typeof hello !== "string")
		throw argError(arguments, 'Wait args (String)');

	let type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return hello;
	}

	function test(value){
		if(value !== hello)
			return { value: value, type: preJSON()};
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = hello;
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes;
````

## File: types/template/test.js
````javascript
import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'

export default (function Test(Types){

	ExtendTypes(Types);

	runTest(Types, {
		typeName: ExtendTypes.typeName,
		tests: {
			wrongConstrArgsArray: [
				[{}],
				[[]],
				[5],
				[null],
				[false],
				[true],
			],
			validArgsForConstr: [
				["Hello world!"]  
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				"Hello",
				null,
				false,
				true,
			],
			validValuesOfType: ["Hello world!"],
			repeatSelfTest: 1024,
		},
	});
});
````

## File: types/object/type.js
````javascript
import { NonConstantTypeError } from '../../core.js'
import CrConstType from '../index/type.js'
import CrConstBuffer from '../buffer/type.js'

const typeName = "Object"

var argError = null

var Types = null

function ExtendTypes(Core){
	Types = Core
	argError = Core.argError

	if(!Core.Const)
		CrConstType(Core)

	if(!Core.Buffer)
		CrConstBuffer(Core)

	Core.newType(typeName, ConstructorType, outJSON)
}

ExtendTypes.typeName = typeName

function ConstructorType(sourceObj, non_strict_key){
	const non_strict_keys = non_strict_key

	if(!sourceObj || typeof sourceObj !== "object")
		throw argError(arguments, "Argument isn't Object!" )
	

	var typeObj = reCostructObj(sourceObj)

	var type = {
		name: typeName,
		rand,
		test,
		constValue,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false
		const otherJson = otherType.preJSON()

		if (otherJson.name === typeName) {
			const otherStruct = otherJson.struct
			const strictSuper = !non_strict_keys
			const strictSub = !otherJson.__non_strict_keys
			
			// Если супер строгий, а под нестрогий — подтип шире, не подходит
			if (strictSuper && !strictSub) return false
			
			// Все ключи супертипа должны присутствовать в подтипе
			for (const key in typeObj) {
				const superValueType = typeObj[key]
				
				// Если ключ был удалён из-за циклической ссылки — пропускаем
				if (superValueType === undefined) continue;
				if (!(key in otherStruct)) return false;

				const subValueType = Types.outJSON(otherStruct[key])
				
				if (!superValueType.isSubtype(subValueType)) return false
			}
			
			// Если оба строгие — в подтипе не должно быть лишних ключей
			if (strictSuper && strictSub) {
				for (const key in otherStruct) 
					if (!(key in typeObj)) return false
			}
			
			return true;
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct);
		}

		return false;
	}

	function rand(){
		return genObj(typeObj)
	}

	function test(testingObj, path = '$'){
		return testObj(typeObj, testingObj, null, non_strict_keys, path)
	}
	
	function constValue(){
		return constValueObj(typeObj)
	}


	function preJSON(){
		var type = {name: typeName};
		type.struct = objPreJson(typeObj);
		type.__non_strict_keys = non_strict_keys;
		return type;
	}

	return type

}

function outJSON(preType){

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(objOutJson(preType.struct), preType.__non_strict_keys)
	else
		throw new Error("This isn't type " + typeName + "!")
}

export default ExtendTypes

function reCostructObj(sourceObj, objsStack){

	if(!objsStack)
		objsStack = []
	
	var funcObj = {}
	objsStack.push(sourceObj)

	for(var key in sourceObj){

		if(Types.isType(sourceObj[key])){
			funcObj[key] = sourceObj[key]
			continue
		}

		if (sourceObj[key] instanceof ArrayBuffer || ArrayBuffer.isView(sourceObj[key])) {
			funcObj[key] = Types.Buffer.Def(sourceObj[key].byteLength, false)
			continue
		}

		if(!sourceObj || (typeof sourceObj[key] !== "object" && !Array.isArray(sourceObj[key]))){
			funcObj[key] = Types.Const.Def(sourceObj[key])
		}
		else if(objsStack.indexOf(sourceObj[key]) !== -1)
			delete funcObj[key]
		else
			funcObj[key] = reCostructObj(sourceObj[key], objsStack)
	}

	objsStack.pop()

	return funcObj
}

function testObj(typeObj, testingObj, objsStack, non_strict_keys, path){

	if(!testingObj || (typeof testingObj !== "object" && !Array.isArray(testingObj)))
		return { 
			messege: "This has to be object!",
			path: path,
			value: testingObj, 
			type: { 
				name: typeName, 
				struct: objPreJson(typeObj)
			}
		}

	if(!objsStack)
		objsStack = []

	objsStack.push(testingObj)

	var result = false

	for(let key in typeObj){
		let childPath = path + '.' + key

		if(Types.isType(typeObj[key]))
			result = typeObj[key].test(testingObj[key], childPath)
		else
			result = testObj(typeObj[key], testingObj[key], objsStack, non_strict_keys, childPath)

		if(result) {
			result.path = result.path || childPath
			return result
		}		
	}

	for(let key in testingObj){
		if(objsStack.indexOf(testingObj[key]) !== -1)
			continue

		if(!Types.isType(typeObj[key]) && !non_strict_keys)
			return { 
				messege: "Here cannot value!", 
				key: key,
				path: path + '.' + key, 
				value: testingObj[key], 
				type: {
					name: typeName, 
					struct: typeObj[key] ? objPreJson(typeObj[key]) : "Not type for this key!"
				}
			}
	}

	return result

}

function genObj(typeObj){
	var resultObj = {}

	for(var key in typeObj){
		if(Types.isType(typeObj[key]))
			resultObj[key] = typeObj[key].rand()
		else 
			resultObj[key] = genObj(typeObj[key])
	}

	return resultObj
}

function constValueObj(typeObj) {
	const result = {}

	for (const key in typeObj) {
		try {
			if(Types.isType(typeObj[key]))
				result[key] = typeObj[key].constValue()
			else
				result[key] = constValueObj(typeObj[key])
		} catch(err) {
			if (err instanceof NonConstantTypeError) {
				err.pushType(typeName)
				err.pushType(`key: ${key}`)
			}

			throw err
		}
	}

	return result
}

function objPreJson(typeObj){
	var struct = {}

	for(var key in typeObj){
		if(Types.isType(typeObj[key]))
			struct[key] = typeObj[key].preJSON()
		else{
			struct[key] = objPreJson(typeObj[key])
		}
	}

	return struct
}

function objOutJson(jsonObj){
	var obj = {}

	for(var key in jsonObj){
		var propJsonObj = jsonObj[key]

		if(typeof propJsonObj != "object")
				throw new Error("Invalid scheme JSON, wrong value: " + propJsonObj + " with key: " + key)

		if(propJsonObj.name && Types[propJsonObj.name] && Types.isCrType(Types[propJsonObj.name])){
			obj[key] = Types[propJsonObj.name].outJSON(propJsonObj)
		}
		else{
			obj[key] = objOutJson(propJsonObj)
		}
	}

	return obj
}
````

## File: readme.md
````markdown
# Types.js

A library for testing and generating values based on type-defined structures.

## Core Functionality

### Creating a Type

The core function accepts three arguments:
1. **Type name** (string)
2. **Type constructor** (function)
3. **JSON deserializer** (function)

Each type consists of three methods:
- **`.rand()`** — generates a random valid value
- **`.validate(value)`** — validates a value return true if it is valid
- **`.test(value)`** — validates a value against the type (returns error object or `undefined`)
- **`.toJSON()`** — serializes the type to JSON-compatible format

---

## Built-in Types

### `Bool`
Standard boolean type (`true` / `false`).

### `Number`
Floating-point number with constraints:
- `min`: minimum allowed value
- `max`: maximum allowed value
- `precision`: number of decimal digits (0–9)

> **Note**: Use this to enforce realistic numeric bounds in your data structures.

### `Index`
Integer in range `[0, max)`.  
Useful for array indices or enumeration.

### `Alpha`
Float in range `[0, 1]`.  
No precision control — relies on platform float representation.

### `Key`
String (max 256 chars) matching `/^[a-zA-Z0-9_]+$/`.  
Ideal for identifiers, keys, or safe property names.

### `UUID`
Generates and validates UUID v4 strings using the [`uuid`](https://www.npmjs.com/package/uuid) package.

### `Const`
Wraps a primitive value (`string`, `number`, `boolean`, `null`, `undefined`, `function`) as an immutable constant.  
Validation is strict equality (`===`).

### `Object`
Meta-type for plain objects.  
Constructor accepts:
- `templateObject`: object used to infer the structure
- `nonStrict` (optional): if `true`, ignores extra properties during validation

**Behavior**:
- Nested objects/arrays are processed recursively.
- Primitives → wrapped in `Const`.
- Functions → treated as `Const`.
- Existing types inside the object → preserved as-is.
- Cyclic references → ignored (not included in generated or validated objects).

### `Array`
Homogeneous array type. Constructor:
- `itemType`: type of each element (must be a valid `Types` type)
- `maxLength`: maximum number of elements
- `allowEmpty`: if `false`, array must contain at least one element

### `String`
Constrained string type. Constructor:
- `symbolClass`: character class (e.g., `"a-zA-Z0-9"`, `"\\w"`)
- `maxLength`: maximum string length

> The symbol class is compiled into a regex: `/^[symbolClass]+$/`

### `Any`
Union type. Accepts an array of types/constants.  
Value must match **at least one** of them.

### `Switch`
Discriminated union (tagged union). Constructor:
- `keyProps`: string or array of property names that act as discriminators
- `typeObjects`: array of object templates, each **must include** the discriminator(s)

Example:
```js
import Types from '@ellementul/message-types';

// Define a message structure
const MessageType = Types.Object.Def({
  id: Types.Key.Def(),
  timestamp: Types.Number.Def(1700000000, 1600000000, 0),
  payload: Types.Any.Def([
    Types.String.Def(256),
    Types.Buffer.Def(2048, true) // non-empty binary data
  ])
});

// Generate a valid message
const msg = MessageType.rand();
console.log(msg); 

// Validate
console.log(MessageType.validate(msg)) // true

// Serialize type
const json = MessageType.toJSON();
const RestoredType = Types.outJSON(json);
console.log(RestoredType.validate(msg)); // true
```
````

## File: types/object/test.js
````javascript
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


	console.log("	Check subType ...");
	//====================================
	const superObj = Types.Object.Def({
		name: Types.String.Def(100),
		age: Types.Number.Def(150, 0, 0)
	});

	// 1. Object с такими же ключами и типами — подтип (эквивалентен)
	const sameObj = Types.Object.Def({
		name: Types.String.Def(100),
		age: Types.Number.Def(150, 0, 0)
	});
	if (!superObj.isSubtype(sameObj)) 
		throw new Error("Object with same structure should be subtype");

	// 2. Object с более узкими типами зн…, 3]);
	if (superObj.isSubtype([1, 2, 3])) 
		throw new Error("Const array should NOT be subtype of Object");

	// 10. Вложенные объекты — рекурсивная проверка
	const nestedSuperObj = Types.Object.Def({
		user: Types.Object.Def({
			name: Types.String.Def(100)
		})
	});
	const nestedSubObj = Types.Object.Def({
		user: Types.Object.Def({
			name: Types.String.Def(50)
		})
	});
	if (!nestedSuperObj.isSubtype(nestedSubObj)) 
		throw new Error("Nested object with narrower types should be subtype");
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
````

## File: core.js
````javascript
'use strict';

var typeID = "UIDOFTYPEOFTYPESJS";
var crTypeID = "UIDOFCONSTRUCTOROFTYPEOFTYPESJS";

export class NonConstantTypeError extends Error {
  constructor(message, type) {
    super(message || "Type is not constant");
    this.typeStack = [type];
  }
  
  pushType(type) {
    this.typeStack.push(type)
  }
}

var Types = {
	newType: function (name, CrType, outJSON){
		if(typeof name != "string")
			throw new Error("name isn't String!")

		if(typeof CrType != "function")
			throw new Error("CrType isn't Function!")

		if(typeof outJSON != "function")
			throw new Error("outJSON isn't Function!")

		if(this[name]){
			console.warn("Type " + name + "already created!");
			return;
		}

		var newType = {
			name: name,
			Def: newCreator(CrType),
			outJSON: crOutJSON(outJSON)
		};

		newType[crTypeID] = crTypeID;

		this[name] = newType;

		return this[name];

	},
	outJSON: function (json) {
		if(typeof json == "string")
			json = JSON.parse(json)

		if(this.isCrType(Types[json.name]))
			return Types[json.name].outJSON(json)
		else
			throw "The got object isn't json type!"
	},
	isType: isType,
	isCrType: isCrType,
	argError: function argError(wrong_arg, mess){
		if(mess === undefined) mess = '';
		var ER = new TypeError('Argument type is wrong! Arguments(' + forArg(wrong_arg) + ');' + mess);
		ER.wrong_arg = wrong_arg;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, argError);
		}

		return ER;

		function forArg(args){
			var str_args = '';
			for(var i = 0; i < args.length; i++){
				str_args += typeof(args[i]) + ': ' + args[i] + '; ';
			}
			return str_args;
		}
	}
};

function newCreator(CrType){	
	return function(){

		var type = CrType.apply(CrType, arguments);
		mixType(type);
		
		return type;
	};
}

function crOutJSON(outJSON){
	return function(json){

		if(typeof json == "string")
			json = JSON.parse(json)
		
		var type = outJSON(json);
		mixType(type);

		return type
	}
}

function mixType(type){
	if(typeof type !== "object" || typeof type.rand !== "function" || typeof type.test !== "function")
		throw new Error("This is not type!")

	type[typeID] = typeID;
	type.toJSON = crToJSON(type.preJSON)
	type.test = type.test

	if(typeof type.validate !== "function")
		type.validate = function(val) {
			return !type.test(val)
		}

	if(typeof type.constValue !== "function")
		type.constValue = function () {
			const typeName = type.preJSON().name
			throw new NonConstantTypeError(`${typeName} Type is not constant`, typeName)
		}


    if(typeof type.setValue !== "function") {
        type.setValue = function setValue(value) {
            if (type.test(value)) return null
            return Types.Const.Def(value)
        }
    }
}

function crToJSON(preJSON){
	return function(tabs){
		var preJson = Object.assign({}, preJSON());
		delete preJson.toJSON;
		return JSON.stringify(preJson, "", tabs);
	}
}

function isType(type) {
	return typeof type == "object" && type[typeID] == typeID 
			&& typeof type.rand == "function" 
			&& typeof type.test == "function"
			&& typeof type.preJSON == "function"
			&& typeof type.toJSON == "function";
}

function isCrType(crType){
	return typeof crType == "object" && crType[crTypeID] == crTypeID
			&& typeof crType.Def == "function" 
			&& typeof crType.outJSON == "function";
}

export default Types
````

## File: package.json
````json
{
  "name": "@ellementul/message-types",
  "version": "3.9.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "node ./test.mjs"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ellementul/messages-types.git"
  },
  "keywords": [
    "types",
    "tests",
    "messages"
  ],
  "author": "ellementul",
  "license": "ISC",
  "dependencies": {
    "uuid": "^9.0.0"
  }
}
````
