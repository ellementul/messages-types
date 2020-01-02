'use strict';

const typeName = "Switch";

let argError = null;

let Types = null;

const CrIndexType  =  require('../index/type.js');
const CrKeyType  =  require('../key/type.js');

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Index)
		CrIndexType(Core);
	if(!Core.Key)
		CrKeyType(Core);
	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(keyProps, typeObjs){

	let keyType = Types.Key.Def();

	if(!Array.isArray(keyProps))
		keyProps = [keyProps];

	if(keyProps.some(keyType.test))
		throw argError(arguments, 'Wait the first argument Key || Array(Key)');

	if(!Array.isArray(typeObjs))
		throw argError(arguments, 'Wait second argument Array!');

	let keyArr = [];

	let err = msg => argError(arguments, 'Wait second argument Array( Object{ [Key]: Key, prop: Type, ... }), ...); ' + msg);

	let typeObjArr = typeObjs.map((sructObj, objIndex) => {
		if(typeof sructObj != "object")
			throw err("Item " + objIndex + " in Array isn't Object");

		let obj = {};

		keyArr[objIndex] = {};
		keyProps.forEach(keyProp =>{
			if(keyType.test(sructObj[keyProp]))
				throw err("Item " + objIndex + "." + keyProp + " isn't Key");
			else
				keyArr[objIndex][keyProp] = sructObj[keyProp];
		});
		
		for (let key in sructObj){
			if(keyProps.indexOf(key) == -1){

				if(Types.isType(sructObj[key]))
					obj[key] = sructObj[key];
				else
					throw err("Item " + objIndex + "." + key + " isn't Type");
			}
		}

		return obj;
	});

	let indexType = Types.Index.Def(keyArr.length);
		

	let type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		let index = indexType.rand();

		let obj = {};

		let keyObj = keyArr[index];
		for(let keyProp in keyObj)
				obj[keyProp] = keyObj[keyProp];
		
		let sructObj = typeObjArr[index];
		for (let key in sructObj){
			obj[key] = sructObj[key].rand();
		}

		return obj;
	}

	function test(obj){
		
		if(typeof obj != "object" || obj === null)
			return { value: obj, type: preJSON()};

		if(keyProps.some(keyProp => keyType.test(obj[keyProp])))
			return { value: obj, type: preJSON()};

		let err = { value: obj, type: preJSON()};
		let is_right = false;

		keyArr.forEach((keyObj, index) =>{
			if(is_right)
				return;
			
			let is_right_keys = true;
			for(let keyProp in keyObj)
				is_right_keys = is_right_keys && (keyObj[keyProp] == obj[keyProp]);

			if(is_right_keys){

				let is_right_values = true;
				for(let key in typeObjArr[index]){
					if(typeObjArr[index][key].test(obj[key])){
						err = { errKey: key, value: obj[key], type: typeObjArr[index][key].preJSON(), switchKeys: keyObj};
						is_right_values = false;
					}
				}

				if(is_right_values)
					is_right = true;
			} 

		});

		if(!is_right)
			return err;

		return;
	}

	function preJSON(){
		var type = {};
		type.name = typeName;

		let tempObjArr = typeObjs.map(sructObj => {
			let obj = {};
			for (let key in sructObj){
				if(Types.isType(sructObj[key]))
					obj[key] = sructObj[key].preJSON();
				else
					obj[key] = sructObj[key];
			}

			return obj;
		});

		type.struct = { keyProps, tempObjArr };
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName){

		let ObjsArr = preType.struct.tempObjArr.map(jsonObj => {
			let obj = {};

			for(var key in jsonObj){
				var propJsonObj = jsonObj[key];

				if(propJsonObj.name && Types[propJsonObj.name] && Types.isCrType(Types[propJsonObj.name])){
					obj[key] = Types[propJsonObj.name].outJSON(propJsonObj);
				}
				else
					obj[key] = propJsonObj;
			}

			return obj;
		});
		
		return ConstructorType(preType.struct.keyProps, ObjsArr);
	}
	else
		throw new Error("This isn't type " + typeName + "!");
}

module.exports = ExtendTypes;