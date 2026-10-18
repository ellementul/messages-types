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