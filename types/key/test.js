const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);


	var type = Types[ExtendTypes.typeName].Def();
	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
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
			throw test(value);
	}
}



module.exports = Test;