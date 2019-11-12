'use strict';

const typeName = "Index";
var argError

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(max){

	if(typeof max !== 'number' || !isFinite(max)
		||(max <= 0)
		||(max % 1 !== 0))
		throw argError(arguments, 'Wait arguments: max(int>0)');
	

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return Math.floor(max * Math.random() - 0.01);
	}

	function test(n){
		if(typeof n !== 'number' || !isFinite(n))
			return new Error(JSON.stringify({ value: n, type: preJSON()}, "", 2));
		

		if(n > max || n < 0 || n % 1 !== 0)
			return new Error(JSON.stringify({ value: n, type: preJSON()}, "", 2));

		return false;
	}

	function preJSON(){
		type.name = typeName;
		type.struct = {
			max: max
		};
		return type;
	}

	return type;

}

function outJSON(preType){
	var arg = preType.struct;

	if(preType.name == typeName)
		return ConstructorType(arg.max);
	else
		throw new Error("This isn't type " + typeName + "!");
}

module.exports = ExtendTypes;