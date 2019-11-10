'use strict';

const typeName = "Hello";

var argError = null;

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(hello){

	if(typeof hello !== "string")
		throw argError(arguments, 'Wait string "Hello world!"');

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return hello;
	}

	function test(value){
		if(value !== hello)
			return new Error({ value: value, type: preJSON()});
	}

	function preJSON(){
		type.name = typeName;
		type.struct = hello;
		return type;
	}

	return type;

}

function outJSON(preType){
	if(preType.name == typeName)
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!");
}

module.exports = ExtendTypes;