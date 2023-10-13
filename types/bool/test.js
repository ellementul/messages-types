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

}


export default Test