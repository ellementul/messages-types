const ExtendTypes = require("./type.js");

function Test(Types){

	console.log("Type " + ExtendTypes.typeName + " testing...");

	ExtendTypes(Types);

	if(!Types.isType(Types[ExtendTypes.typeName].Def()))
		throw new Error();

	var type = Types[ExtendTypes.typeName].Def();

	var repeat = 10;

	while(repeat--) if(type.test(type.rand()))
		throw new Error();

	if(!type.test(0) || !type.test("") || !type.test(null) || !type.test())
		throw new Error();

	

}



module.exports = Test;