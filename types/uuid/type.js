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