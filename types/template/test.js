const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);

	console.log("	Check isCrType ...");
	//===================================
	if(!Types.isCrType(Types[ExtendTypes.typeName]))
		throw new Error();

	var value = 1000;
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName], value);


	value = "Hello world!";

	var type = Types[ExtendTypes.typeName].Def(value);

	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
		throw new Error();

	console.log("	Check wrong value ...");
	//====================================
	
	if(!type.test([]))
		throw new Error();
	

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 1024;

	repeatSelfTest(type.rand, type.test, repeat);

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

	console.log("	Check toJSON ...");
	//====================================

	if(!Types.isType(outJType))
		throw new Error();

	repeatSelfTest(outJType.rand, type.test, repeat);

	repeatSelfTest(type.rand, outJType.test, repeat);
}

function testArg(Type, arg){
	var error = null;

	try{
		var type = Type.Def.apply(null, arg);
	}
	catch(e){
		var error = e;
	}
	if(!error)
		throw new Error();
}

function repeatSelfTest(rand, test, repeat){
	repeat = Math.abs(repeat);

	while(repeat--){
		let value = rand();
		if(test(value))
			throw new Error(JSON.stringify(test(value), "", 2));
	}
}



module.exports = Test;