'use strict';

const typeName = "Number";
var argError

function ExtendTypes(Core){
	argError = Core.argError;
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(max, min, precis){

	if(typeof min !== 'number' || !isFinite(min)
		||typeof max !== 'number' || !isFinite(max)
		||typeof precis !== 'number' || !isFinite(precis)
		||(max <= min)
		||(precis < 0)
		||(precis > 9)
		||(precis % 1 !== 0))
		throw argError(arguments, 'Wait arguments: max(number), > min(number), precis(0<=number<9)');
	

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return +(((max - min)*Math.random() +  min).toFixed(precis));
	}

	function test(n){
		if(typeof n !== 'number' || !isFinite(n))
			return new Error(JSON.stringify({ value: n, type: preJSON()}, "", 2));
		

		if((n > max)
		||(n < min)
		|| (n.toFixed(precis) != n && n !== 0) )
			return new Error(JSON.stringify({ value: n, type: preJSON()}, "", 2));

		return false;
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = {
			min: min,
			max: max,
			precis: precis
		};
		return type;
	}

	return type;

}

function outJSON(preType){
	var arg = preType.struct;

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(arg.max, arg.min, arg.precis);
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes