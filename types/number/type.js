'use strict';

const typeName = "Number";
import Types from "../../core.js"
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
		rand,
		test,
		preJSON,
		isSubtype
	}

	function isSubtype(otherType) {
		if (!Types.isType(otherType)) return false;
		const otherJson = otherType.preJSON();

		if (otherJson.name === "Number") {
			return (
				otherJson.struct.min >= min &&
				otherJson.struct.max <= max &&
				otherJson.struct.precis <= precis
			);
		}

		if (otherJson.name === "Index") {
			// Диапазон Index: [0, max). Должен помещаться в [min, max] супертипа.
			return 0 >= min && otherJson.struct.max - 1 <= max;
		}

		if (otherJson.name === "Const") {
			return !test(otherJson.struct);
		}

		return false;
	}

	function rand(){
		return +(((max - min)*Math.random() +  min).toFixed(precis));
	}

	function test(n){
		if(typeof n !== 'number' || !isFinite(n))
			return { value: n, type: preJSON() }
		

		if((n > max)
		||(n < min)
		|| (n.toFixed(precis) != n && n !== 0) )
			return { value: n, type: preJSON() }

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