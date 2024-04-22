import ExtendTypes from './type.js'

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
		str: "Gert",
		num: 1234,
		arr: [1, 2, 3, 4, 5],
		func: function(){}
	};

	value.obj = value;

	var type = Types[ExtendTypes.typeName].Def(value);

	console.log("	Check isType ...");
	//===================================
	if(!Types.isType(type))
		throw new Error();

	

	console.log("	Check slef-test ...");
	//====================================
	var repeat = 1024;

	repeatSelfTest(type.rand, type.test, repeat);

	console.log("	  Check non-strcit ...");
	//====================================
	const non_strcit_type = Types[ExtendTypes.typeName].Def(value, true);
	const non_strcit_mutations = () => {
		const obj = non_strcit_type.rand()
		obj.otherProperty = "otherProperty"
		return obj
	}
	
	repeatSelfTest(non_strcit_mutations, non_strcit_type.test, repeat);
	

	console.log("	Check toJSON ...");
	//====================================
	value = {
		str: "Gert",
		num: 1234,
		arr: [1, 2, 3, 4, 5]
	};
	value.obj = value;

	type = Types[ExtendTypes.typeName].Def(value);
	
	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);

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
		if(test(value)){
			throw new Error(JSON.stringify(test(value), "", 2));
		}
	}
}



export default Test