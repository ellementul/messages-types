'use strict';

const typeName = "Hello";

function ExtendTypes(Core){
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(hello){

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
		throw new Error("Unknowed type!");
}

module.exports = ExtendTypes;