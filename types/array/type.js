'use strict';

const typeName = "Array";

import CrIndexType from '../index/type.js'

var argError = null;

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Index)
		CrIndexType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(itemType, maxLength, is_empty){

	var maxLengthType = Types.Index.Def(1024*1024);	

	if(!Types.isType(itemType)
		|| maxLengthType.test(maxLength))
		throw argError(arguments, 'Wait args (Type, maxLength<1024*1024 [, isEmptyArray])');

	var lengthType = Types.Index.Def(maxLength + 1);

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		var length = lengthType.rand();
		var arr = [];

		if(!is_empty)
			arr.push(itemType.rand());

		while(arr.length < length)
			arr.push(itemType.rand());

		return arr;
	}

	function test(arr){
		if(!Array.isArray(arr))
			return { value: arr, type: preJSON()};

		if((arr.length > maxLength) || (!is_empty && arr.length == 0))
			return { length: arr.length, type: preJSON()};

		var err_arr = arr.map(itemType.test).filter(item => item);

		if(err_arr.length)
			return { wrong_values: err_arr, type: preJSON()};
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = {type: itemType.preJSON(), maxLength: maxLength, is_empty: is_empty};
		return type;
	}

	return type;

}

function outJSON(preType){
	var struct = preType.struct;
	var nameType = struct.type.name;

	if(!Types.isCrType(Types[nameType]))
		throw new Error("Parsing Error! Type with name" + nameType + "is unknowed!");

	var type = Types[nameType].outJSON(struct.type);

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(type, struct.maxLength, struct.is_empty);
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes