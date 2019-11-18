const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName]);
	testArg(Types[ExtendTypes.typeName], "Hello!");
	testArg(Types[ExtendTypes.typeName], 256);
	testArg(Types[ExtendTypes.typeName], null);
	testArg(Types[ExtendTypes.typeName], false);


	var value = {
		helllo: "World"
	};

	var type = Types[ExtendTypes.typeName].Def(value);

	value = {
		str: "Gert",
		num: 1234/*,
		obj: type,
		arr: [1, 2, 3, 4, 5],
		func: function(){}*/
	};
	

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
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