const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type template testing ...");

	ExtendTypes(Types);

	if(!Types.isType(Types[ExtendTypes.typeName].Def()))
		throw new Error();

	var value = "Hello world!";
	var type = Types[ExtendTypes.typeName].Def(value);

	var repeat = 10;

	while(repeat--) if(type.test(type.rand()))
		throw new Error();

	var jType = type.toJSON();
	var outJType = Types[ExtendTypes.typeName].outJSON(jType);


	if(!Types.isType(outJType))
		throw new Error();

	repeat = 10;
	while(repeat--) if(outJType.test(type.rand()))
		throw new Error();

	repeat = 10;
	while(repeat--) if(type.test(outJType.rand()))
		throw new Error();
}



module.exports = Test;