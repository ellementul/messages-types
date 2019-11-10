'use strict';

var typeID = "UIDOFTYPEOFTYPESJS";

var isTest = true;

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
			Def: newCreator(CrType),
			outJSON: crOutJSON(outJSON)
		};

		this[name] = newType;

		return this[name];

	},
	isType: isType,
	get isTest(){return isTest},
	set isTest(val){isTest = !!val},
	argError: function argError(wrong_arg, mess){
		if(mess === undefined) mess = '';
		var ER = new TypeError('Argument type is wrong! Arguments(' + forArg(wrong_arg) + ');' + mess);
		ER.wrong_arg = wrong_arg;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, argError);
		}

		return ER;

		function forArg(args){
			var str_args = '';
			for(var i = 0; i < args.length; i++){
				str_args += typeof(args[i]) + ': ' + args[i] + '; ';
			}
			return str_args;
		}
	}
};

function newCreator(CrType){	
	return function(){

		var type = CrType.apply(CrType, arguments);
		mixType(type);
		
		return type;
	};
}



function crOutJSON(outJSON){
	return function(json){
		var type = outJSON(JSON.parse(json));
		mixType(type);

		return type;
	}
}

function mixType(type){
	type[typeID] = typeID;
	type.toJSON = crToJSON(type.preJSON);
	type.test = wrapTest(type.test);
}

function wrapTest(test){
	return function(val){
		if(isTest)
			return test(val);
		return false;
	}
}

function crToJSON(preJSON){
	return function(tabs){
		var preJson = Object.assign({}, preJSON());
		delete preJson.toJSON;
		return JSON.stringify(preJson, "", tabs);
	}
}

function isType(type) {
	return type[typeID] == typeID 
			&& typeof type.rand == "function" 
			&& typeof type.test == "function" 
			&& typeof type.toJSON == "function";
}

module.exports = Types;