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