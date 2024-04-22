import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type "+ ExtendTypes.typeName +" testing ...");

	ExtendTypes(Types);
	

	console.log("	Wrong arguments ...");
	//===================================
	testArg(Types[ExtendTypes.typeName]);
	testArg(Types[ExtendTypes.typeName], 1000);
	testArg(Types[ExtendTypes.typeName], "Hello world!");
	testArg(Types[ExtendTypes.typeName], {});
	testArg(Types[ExtendTypes.typeName], []);
	testArg(Types[ExtendTypes.typeName], 3, 1);
	testArg(Types[ExtendTypes.typeName], 3, 1, -5);
	testArg(Types[ExtendTypes.typeName], 3, 1, 5.5);
	testArg(Types[ExtendTypes.typeName], 1, 100000, 5);



	var type = Types[ExtendTypes.typeName].Def(100000, 1, 5);


	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
		throw new Error();

	type = Types[ExtendTypes.typeName].Def(9, 0, 0);

	type = Types[ExtendTypes.typeName].Def(100000, 1  , type.rand());
	

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
		var type = Type.Def.call(null, arg);
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



export default Test;