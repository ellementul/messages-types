'use strict';

import Types from "../../core.js";

const typeName = "Const";

var argError = null;

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(constVal){

	if(Types.isCrType(constVal) || Types.isType(constVal) || typeof constVal == "function")
		throw argError(arguments, 'Const value cannot be Type or Function!');

	var type = {
		rand: rand,
		test: test,
		constValue: constValue,
		preJSON: preJSON
	}

	function rand(){
		return constVal;
	}

	function test(value){
		if(value !== constVal)
			return { value: value, type: preJSON()};
	}

	function constValue() {
		return constVal;
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

export default ExtendTypes;