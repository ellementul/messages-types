'use strict';

var typeID = "UIDOFTYPEOFTYPESJS";

var Types = {
	newType: function (name, CrType, outJSON){
		if(typeof name != "string")
			throw new Error("name isn't String!")

		if(typeof CrType != "function")
			throw new Error("CrType isn't Function!")

		if(typeof outJSON != "function")
			throw new Error("outJSON isn't Function!")

		if(this[name])
			throw new Error("Name isn't free!")

		var newType = {
			name: name,
			def: newCreator(CrType),
			outJSON: outJSON
		};

		this[name] = newType;

		return this[name];

	},
	isType: isType
};

function newCreator(CrType){	
	return function(){

		var type = CrType.apply(CrType, arguments);
		type[typeID] = typeID;
		
		return type;
	};
}

function isType(type) {
	return type[typeID] == typeID 
			&& typeof type.rand == "function" 
			&& typeof type.test == "function" 
			&& typeof type.toJSON == "function";
}

module.exports = Types;