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

		if (otherJson.name === "String") {
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