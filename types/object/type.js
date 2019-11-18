  

const typeName = "Object";

var argError = null;

var Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Const)
		CrIndexType(Const);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(sourceObj){

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
		var resultObj = {};

		for(var key in typeObj){
			resultObj[key] = typeObj[key].rand();
		}

		return resultObj;
	}

	function test(testingObj, objsStack){
		return testObj(typeObj, preJSON, testingObj, objsStack);
	}

	function preJSON(){
		type.name = typeName;
		type.struct = {};



		return type;
	}

	return type;

}

function outJSON(preType){
	if(preType.name == typeName)
		return ConstructorType(preType.struct)
	else
		throw new Error("This isn't type " + typeName + "!");
}

module.exports = ExtendTypes;

function reCostructObj(sourceObj, objsStack){

	if(!objsStack)
		objsStack = [];
	
	var funcObj = {};
	objsStack.push(sourceObj);

	for(var key in sourceObj){

		if(Types.isType(sourceObj[key]))
			continue;

		if(!sourceObj || typeof sourceObj[key] !== "object" || !Array.isArray(sourceObj[key]))
			funcObj[key] = Types.Const.Def(sourceObj[key]);
		else if(objsStack.indexOf(sourceObj[key]) !== -1)
			delete funcObj[key];
		else
			funcObj[key] = reCostructObj(sourceObj[key], objsStack);
	}

	objsStack.pop();

	return funcObj;
}

function testObj(typeObj, preJSON, testingObj, objsStack){
	if(!objsStack)
		objsStack = [];

	objsStack.push(testingObj);

	var result = false;

	for(let key in typeObj){
		result = result || typeObj[key].test(testingObj[key]);
	}

	for(let key in testingObj){
		if(!Types.isType(typeObj[key]))
			return { value: testingObj[key], type: preJSON};
	}
}

function objPreJson(typeObj){
	var struct = {};

	for(var key in typeObj){
		if(Types.isType(sourceObj[key]))
			struct[key] = typeObj[key].preJSON();
		else
			struct[key] = objPreJson(typeObj[key]);
	}

	return struct;
}