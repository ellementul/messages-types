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