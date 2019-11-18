const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);

	console.log("	Check isCrType ...");
	//===================================
	if(!Types.isCrType(Types[ExtendTypes.typeName]))
		throw new Error();
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName], 1000);
	testArg(Types[ExtendTypes.typeName], Types.Index.Def(15));
	testArg(Types[ExtendTypes.typeName], Types.Index.Def(15), "500");


	var value = "Hello world!";

	var typeWithEmpty = Types[ExtendTypes.typeName].Def(Types.Index.Def(15), 2, true);
	var type = Types[ExtendTypes.typeName].Def(typeWithEmpty, 1024);

	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type) || !Types.isType(typeWithEmpty))
		throw new Error();
	
	console.log("	Check wrong value ...");
	//====================================
	
	if(!type.test([]) 
		|| !type.test([], [13, 14], [16]))
		throw new Error();

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 10;

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