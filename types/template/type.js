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