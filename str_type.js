//Craf String
(function(){
	if(typeof(Object.types) !== "object") return;
	
	var T = Object.types;
	var Doc = T.doc;
	                    
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
			
		var result = [];
		
		var beg_char = parse_str[0];
		for(var i = 1; i <= parse_str.length; i++){
			
			if(parse_str[i-1] !== '\\'
				&&parse_str[i] === '-'
				&&parse_str[i+1]){
				i++;
				var end_char = parse_str[i];
				
				result.concat(rangeInArr(beg_char.charCodeAt(0), end_char.charCodeAt(0)));
				
				i++;
			}else{
				result.push(beg_char.charCodeAt(0));
			}
			
			beg_char = parse_str[i];
		}
		return result;
	}

	function randChars(chars_arr, size){
		size = T.int(size, 1).rand();
		var str = '';
		while(size){
			str +=String.fromCharCode(chars_arr.rand_i);
			size--;
		}
		return str;
	}

	function randStr(range, size){

		var parse_range = (range.source).match(/.*\[(.[^\]]*)\].*/);
		
		if(!parse_range) throw argTypeError(arguments, 'Wait arguments: range(RegExp(/[\w]/)), size(0<=number)');
		
		var chars = parseRange(parse_range[1]);
		
		return randChars.bind(null, chars, size);


	}

	function testStr(range, size){
		return function(str){return  typeof(str) == 'string' && (str.length <= size) && range.test(str);}
	}

	function docStr(range, size){
		return T.doc.gen.bind(null, "str", { range: range, length: size});
	}

	var def_size = 17;
	var def_range = /[w]/;

	function newStr(range, size){
		if(range === null) range = def_range;
		if(size === undefined) size = def_size;
		
		if(typeof(range) == "string") range = new RegExp(range);
		if(!T.pos.test(size) || !(range instanceof RegExp)){
				throw argTypeError(arguments, 'Wait arguments: range(RegExp), size(0<=number)');
		}
			
		return {
			rand: randStr(range, size),
			test: testStr(range, size),
			doc: docStr(range, size)
		};
	}



	T.newType('str', 'String', {
		New: newStr, 
		test: testStr(def_range, def_size), 
		rand: randStr(def_range, def_size), 
		doc: docStr(def_range, def_size)
	});
})();
