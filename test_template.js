const ExtendTypes = require("./type_template.js");

function Test(Types){

	ExtendTypes(Types);

	if(!Types.isType(Types[ExtendTypes.typeName].Def()))
		throw new Error();

	var value = "Hello world!";
	var type = Types[ExtendTypes.typeName].Def(value);

	if(type.test(type.rand()))
		throw new Error();

	console.log("Type " + ExtendTypes.typeName + " test is successful!");

}



module.exports = Test;