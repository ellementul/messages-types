'use strict';

var typeID = "UIDOFTYPEOFTYPESJS";
var crTypeID = "UIDOFCONSTRUCTOROFTYPEOFTYPESJS";

export class NonConstantTypeError extends Error {
  constructor(message, type) {
    super(message || "Type is not constant");
    this.typeStack = [type];
  }
  
  pushType(type) {
    this.typeStack.push(type)
  }
}

var Types = {
	newType: function (name, CrType, outJSON){
		if(typeof name != "string")
			throw new Error("name isn't String!")

		if(typeof CrType != "function")
			throw new Error("CrType isn't Function!")

		if(typeof outJSON != "function")
			throw new Error("outJSON isn't Function!")

		if(this[name]){
			console.warn("Type " + name + "already created!");
			return;
		}

		var newType = {
			name: name,
			Def: newCreator(CrType),
			outJSON: crOutJSON(outJSON)
		};

		newType[crTypeID] = crTypeID;

		this[name] = newType;

		return this[name];

	},
	outJSON: function (json) {
		if(typeof json == "string")
			json = JSON.parse(json)

		if(this.isCrType(Types[json.name]))
			return Types[json.name].outJSON(json)
		else
			throw "The got object isn't json type!"
	},
	isType: isType,
	isCrType: isCrType,
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

		if(typeof json == "string")
			json = JSON.parse(json)
		
		var type = outJSON(json);
		mixType(type);

		return type
	}
}

function mixType(type){
	if(typeof type !== "object" || typeof type.rand !== "function" || typeof type.test !== "function")
		throw new Error("This is not type!")

	type[typeID] = typeID;
	type.toJSON = crToJSON(type.preJSON)
	type.test = type.test

	if(typeof type.validate !== "function")
		type.validate = function(val) {
			return !type.test(val)
		}

	if(typeof type.constValue !== "function")
		type.constValue = function () {
			const typeName = type.preJSON().name
			throw new NonConstantTypeError(`${typeName} Type is not constant`, typeName)
		}


    if(typeof type.setValue !== "function") {
        type.setValue = function setValue(value) {
            if (type.test(value)) return null
            return Types.Const.Def(value)
        }
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
	return typeof type == "object" && type[typeID] == typeID 
			&& typeof type.rand == "function" 
			&& typeof type.test == "function"
			&& typeof type.preJSON == "function"
			&& typeof type.toJSON == "function";
}

function isCrType(crType){
	return typeof crType == "object" && crType[crTypeID] == crTypeID
			&& typeof crType.Def == "function" 
			&& typeof crType.outJSON == "function";
}

export default Types