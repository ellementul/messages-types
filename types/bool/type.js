'use strict';

const typeName = "Bool";

function ExtendTypes(Core){
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(){

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return Math.random() > 0.5;
	}

	function test(value){
		if(value !== false && value !== true)
			return new Error({ value: value, type: preJSON()});
	}

	function preJSON(){
		type.name = typeName;
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