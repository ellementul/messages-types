'use strict';

import CrIndexType from '../index/type.js'
import CrConstType from '../index/type.js'

const typeName = "Any";

var argError = null;

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;

	if(!Core.Index)
		CrIndexType(Core);

	if(!Core.Const)
		CrConstType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(types){

	if(!Array.isArray(types))
		types = Array.from(arguments);

	types = types.map( type => {
		if(Types.isType(type))
			return type

		return Types.Const.Def(type)
	})

	if(!Types.isType(types[0]))
		throw argError(arguments, 'Wait args Array[Type||Const||undefined, ... Type||Const||undefined]');

	const typeIndex = Types.Index.Def(types.length)

	var type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return types[typeIndex.rand()].rand();
	}

	function test(value){
		var result = types.every(typeItem => typeItem.test(value));
		if(result)
			return { value: value, type: preJSON()};
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = types.map(typeItem => typeItem.preJSON());
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct.map(itemOutJSON))
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes

function itemOutJSON(preType){
	if(!Types.isCrType(Types[preType.name]))
		throw new Error("Parsing Error! Type with name" + nameType + "is unknowed!");
	return Types[preType.name].outJSON(preType);
}