'use strict';

const typeName = "Key";

var argError = null;

import CrNumberType from '../number/type.js'

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Number)
		CrNumberType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(min = 0){

	if(typeof min !== 'number' || !isFinite(min)
		||(min < 0)
		||(min % 1 !== 0))
		throw argError(arguments, 'Wait arguments: min(int>=0)');

	var chars = crChars()
	var indexType = Types.Index.Def(chars.length)
	var regEx =  /^[a-zA-Z0-9_]*$/

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		var size = min + indexType.rand();

		var str = '';
		while(size){
			var randIndex = indexType.rand()
			var charNum = chars[randIndex];
			str += String.fromCharCode(charNum);
			size--;
		}

		return str;
	}

	function test(str){
		if(typeof(str) !== 'string'
		||str.length > 256
		||!regEx.test(str)){
			return { value: str, type: preJSON()};
		}
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
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!");
}


function crChars(){
	var arr_chars = rangeInArr(("a").charCodeAt(0), ("z").charCodeAt(0));

	arr_chars = arr_chars.concat(rangeInArr(("A").charCodeAt(0), ("Z").charCodeAt(0)));

	arr_chars = arr_chars.concat(rangeInArr(("0").charCodeAt(0), ("9").charCodeAt(0)));

	arr_chars.push(("_").charCodeAt(0));

	return arr_chars;
}


function rangeInArr(beg, end){
	if(beg > end){
		var tmp = beg;
		beg = end;
		end = tmp;
	}

	var arr = [];
	for(var i = beg; i <= end; i++){
		arr.push(i);
	}

	return arr;
}

export default ExtendTypes