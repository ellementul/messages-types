'use strict';

const typeName = "Const";

var argError = null;

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(constVal){

	if(typeof constVal !== "string"
		&& typeof constVal !== "number"
		&& typeof constVal !== "boolean"
		&& typeof constVal !== "function"
		&& constVal)
		throw argError(arguments, 'Wait argument is string || number || boolean || null || undefined || function');

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return constVal;
	}

	function test(value){
		if(value !== constVal)
			return { value: value, type: preJSON()};
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

module.exports = ExtendTypes;