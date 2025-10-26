import CrConstType from '../index/type.js'
import CrConstBuffer from '../buffer/type.js'

const typeName = "Object";

var argError = null;

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;

	if(!Core.Const)
		CrConstType(Core)

	if(!Core.Buffer)
		CrConstBuffer(Core)

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(sourceObj, non_strict_key){
	const non_strict_keys = non_strict_key

	if(!sourceObj || typeof sourceObj !== "object")
		throw argError(arguments, "Argument isn't Object!" );
	

	var typeObj = reCostructObj(sourceObj);

	var type = {
		name: typeName,
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		return genObj(typeObj);
	}

	function test(testingObj, objsStack){
		return testObj(typeObj, testingObj, objsStack, non_strict_keys);
	}

	function preJSON(){
		var type = {name: typeName};
		type.struct = objPreJson(typeObj);
		return type;
	}

	return type;

}

function outJSON(preType){

	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(objOutJson(preType.struct));
	else
		throw new Error("This isn't type " + typeName + "!");
}

export default ExtendTypes

function reCostructObj(sourceObj, objsStack){

	if(!objsStack)
		objsStack = [];
	
	var funcObj = {};
	objsStack.push(sourceObj);

	for(var key in sourceObj){

		if(Types.isType(sourceObj[key])){
			funcObj[key] = sourceObj[key];
			continue;
		}

		if (sourceObj[key] instanceof ArrayBuffer || ArrayBuffer.isView(sourceObj[key])) {
			funcObj[key] = Types.Buffer.Def(sourceObj[key].byteLength, false)
			continue;
		}

		if(!sourceObj || (typeof sourceObj[key] !== "object" && !Array.isArray(sourceObj[key]))){
			funcObj[key] = Types.Const.Def(sourceObj[key]);
		}
		else if(objsStack.indexOf(sourceObj[key]) !== -1)
			delete funcObj[key];
		else
			funcObj[key] = reCostructObj(sourceObj[key], objsStack);
	}

	objsStack.pop();

	return funcObj;
}

function testObj(typeObj, testingObj, objsStack, non_strict_keys){

	if(!testingObj || (typeof testingObj !== "object" && !Array.isArray(testingObj)))
		return { 
			messege: "This has to be object!",
			value: testingObj, 
			type: { 
				name: typeName, 
				struct: objPreJson(typeObj)
			}
		}

	if(!objsStack)
		objsStack = [];

	objsStack.push(testingObj);

	var result = false;

	for(let key in typeObj){

		if(Types.isType(typeObj[key]))
			result = typeObj[key].test(testingObj[key])
		else
			result = testObj(typeObj[key], testingObj[key], objsStack, non_strict_keys)

		if(result)
			return result
		
	}

	for(let key in testingObj){
		if(objsStack.indexOf(testingObj[key]) !== -1)
			continue;

		if(!Types.isType(typeObj[key]) && !non_strict_keys)
			return { 
				messege: "Here cannot value!", 
				key: key, 
				value: testingObj[key], 
				type: {
					name: typeName, 
					struct: objPreJson(typeObj[key])
				}
			}
	}

	return result;

}

function genObj(typeObj){
	var resultObj = {};

	for(var key in typeObj){
		if(Types.isType(typeObj[key]))
			resultObj[key] = typeObj[key].rand();
		else 
			resultObj[key] = genObj(typeObj[key]);
	}

	return resultObj;
}

function objPreJson(typeObj){
	var struct = {};

	for(var key in typeObj){
		if(Types.isType(typeObj[key]))
			struct[key] = typeObj[key].preJSON();
		else{
			struct[key] = objPreJson(typeObj[key]);
		}
	}

	return struct;
}

function objOutJson(jsonObj){
	var obj = {};

	for(var key in jsonObj){
		var propJsonObj = jsonObj[key];

		if(typeof propJsonObj != "object")
				throw new Error("Invalid scheme JSON, wrong value: " + propJsonObj + " with key: " + key);

		if(propJsonObj.name && Types[propJsonObj.name] && Types.isCrType(Types[propJsonObj.name])){
			obj[key] = Types[propJsonObj.name].outJSON(propJsonObj);
		}
		else{
			obj[key] = objOutJson(propJsonObj);
		}
	}

	return obj;
}