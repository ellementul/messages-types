const Core = require("./core.js");

function CrType(){
	return {
		rand: function(){},
		test: function(){},
		toJSON: function(){}
	};
}
var Type = Core.newType("Name", CrType, function(){});

if(!Core.isType(Type.def()))
	throw new Error();

console.log("Core test is successful!");