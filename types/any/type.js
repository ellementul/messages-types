'use strict';

import CrIndexType from '../index/type.js'
import CrConstType from '../index/type.js'

import { NonConstantTypeError } from '../../core.js'

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

		if(typeof type == "object" || Array.isArray(type))
			return Types.Object.Def(type)

		return Types.Const.Def(type)
	})

	const typeIndex = types.length && Types.Index.Def(types.length)

	var type = {
		rand: rand,
		test: test,
		constValue: constValue,
		preJSON: preJSON
	}

	function rand(){
		if(!types.length)
			return null

		return types[typeIndex.rand()].rand();
	}

	function test(value){
		if(!types.length)
			return false

		var result = types.every(typeItem => typeItem.test(value));
		if(result)
			return { value: value, type: preJSON()};
	}

	function constValue() {
		if (types.length !== 1)
			throw new NonConstantTypeError("Any type must have exactly one subtype to be constant", this);

		try {
			return types[0].constValue();
		} catch (e) {
			if (e instanceof NonConstantTypeError)
				e.pushType(typeName)

			throw e;
		}
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