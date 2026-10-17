import ExtendTypes from './type.js'

function Test(Types){

	console.log("Type " + ExtendTypes.typeName + " testing...");

	ExtendTypes(Types);

	if(!Types.isType(Types[ExtendTypes.typeName].Def()))
		throw new Error();

	var type = Types[ExtendTypes.typeName].Def();

	var repeat = 1024;

	while(repeat--) if(type.test(type.rand()))
		throw new Error();

	if(!type.test(0) || !type.test("") || !type.test(null) || !type.test())
		throw new Error();

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);


	if(!Types.isType(outJType))
		throw new Error();

	repeat = 1024;
	while(repeat--) if(outJType.test(type.rand()))
		throw new Error();

	repeat = 1024;
	while(repeat--) if(type.test(outJType.rand()))
		throw new Error();

	console.log("	Check subType ...");
	//====================================
	const constTrue = Types.Const.Def(true);
	const constFalse = Types.Const.Def(false);
	const constString = Types.Const.Def("hello");

	// Bool является подтипом самого себя
	if (!type.isSubtype(type)) 
		throw new Error("Bool should be subtype of Bool");

	// Const(true) и Const(false) являются подтипами Bool
	if (!type.isSubtype(constTrue)) 
		throw new Error("Const(true) should be subtype of Bool");
	if (!type.isSubtype(constFalse)) 
		throw new Error("Const(false) should be subtype of Bool");

	// Const со строкой НЕ является подтипом Bool
	if (type.isSubtype(constString)) 
		throw new Error("Const(string) should NOT be subtype of Bool");
}


export default Test