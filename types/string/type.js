'use strict';

const typeName = "String";

let argError = null;

let Types = null;

function ExtendTypes(Core){
	Types = Core;
	argError = Core.argError;
	if(!Core.Index)
		CrIndexType(Core);

	Core.newType(typeName, ConstructorType, outJSON);
}

ExtendTypes.typeName = typeName;

function ConstructorType(symbolClass, maxLength){

	let maxLengthType = Types.Index.Def(1024 * 1024);

	if(typeof symbolClass !== "string" || maxLengthType.test(maxLength - 1))
		throw argError(arguments, 'Wait args ( SymbolClass(String), maxLength(1024*1024>=Index>0) )');
	
	if(symbolClass[0] == "^")
		symbolClass = "\\" + symbolClass;

	let rangeSimbol = parseRange(symbolClass);
	let indexRangeType = Types.Index.Def(rangeSimbol.length);

	let checkedRegExp = new RegExp('^[' + symbolClass + ']+$');
	let lengthType = Types.Index.Def(maxLength);


	let type = {
		rand: rand,
		test: test,
		preJSON: preJSON
	}

	function rand(){
		let length = lengthType.rand();

		if(length < 1)
			length++;

		var str = '';

		while(length--){
			var der = rangeSimbol[indexRangeType.rand()];
			str +=String.fromCharCode(der);
		}

		return str;
	}

	function test(str){
		if((typeof(str) !== 'string')
			|| lengthType.test(str.length - 1)
			|| !checkedRegExp.test(str)
		)
			return { value: str, type: preJSON()};
		

		return  false;
	}

	function preJSON(){
		var type = {};
		type.name = typeName;
		type.struct = {
			symbolClass, 
			maxLength,
		};
		return type;
	}

	return type;

}

function outJSON(preType){
	if(typeof preType == "object" && preType.name == typeName)
		return ConstructorType(preType.struct.symbolClass, preType.struct.maxLength);
	else
		throw new Error("This isn't type " + typeName + "!");
}

function replaceSpecChar(c){
	switch(c){
		case 'w': return 'a-zA-Z0-9_';
		case 'd': return '0-9';
		case 's': return '\\t\\n\\v\\f\\r ';

		default: return c;
	}
}

function rangeInArr(beg, end){
	if(beg > end){
		var tmp = beg;
		beg = end;
		end = tmp;
	}

	var arr = [];
	for(var i = beg; i <= end; i++){
		arr.push(i);
	}

	return arr;
}

function parseRange(parse_str){
	if(/\\./.test(parse_str)){
			parse_str = parse_str.replace(/\\(.)/g, function(str, char){ return replaceSpecChar(char);});
	}

	let result = [];

	let beg_char = parse_str[0];
	for(let i = 1; i <= parse_str.length; i++){

		if(parse_str[i-1] !== '\\'
			&&parse_str[i] === '-'
			&&parse_str[i+1]){
			i++;
			let end_char = parse_str[i];

			let arr_chars = rangeInArr(beg_char.charCodeAt(0), end_char.charCodeAt(0));
			result = result.concat(arr_chars);

			i++;
		}else{
			result.push(beg_char.charCodeAt(0));
		}

		beg_char = parse_str[i];
	}
	return result;
}

module.exports = ExtendTypes;