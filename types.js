'use strict';
(function(){
		if(typeof(module) == "object"){
			module.exports = new Types();
		}

		if(typeof(window) == "object"){
			window.types = new Types();
		}
        
            function Types(){
				if(typeof(Object.types) == "object") return Object.types;
				
				var T = this;
                var Doc = {
                    types:{
						'bool':{
							name: "Boolean",
							arg: []
						},
                        'pos': {
							name: "Position",
							arg: ['max'],
							params: {max: {type: 'pos', default_value: Number.MAX_SAFE_INTEGER}}
								
						},
                        
                        'int': {
							name: "Integer",
							arg: ["max", "min", "step"],
							params: {
									max: {type: 'int', default_value: Number.MAX_SAFE_INTEGER},
                                    min: {type: 'int', default_value: Number.MIN_SAFE_INTEGER},
                                    step: {type: 'pos', default_value: 1}
                                }
                        },
                        
                        'num': {
							name: "Number",
							arg: ["max", "min", "precis"],
							params: {
									max: {type: 'num', default_value: Number.MAX_SAFE_INTEGER},
                                    min: {type: 'num', default_value: Number.MIN_SAFE_INTEGER},
                                    precis: {type: 'pos', default_value: 7}
								}
                        },
                        'str': {
							name: "String",
							arg: ["range", "length"],
							params: {
									range: {type: 'RegExp || str', default_value: /[0-9a-zA-Z_]/}, 
									length: {type: 'pos', default_value: 17}
								}
                        },
                        'arr': {
							name: "Array",
							arg: ["types", "size", "fixed"],
							params: {
									types: {type: "Type || [Type, Type...]", get default_value(){return T.pos}},
									size: {type: 'pos', default_value: 7},
									fixed: {type: 'bool', default_value: true}
								}
                        },
                        'const': {
							name: "Constant",
							arg: ["value"],
							params: { value: {type: "Something", default_value: null}}
						},
                        'any': {
							name: "MixType",
							arg: ["types"],
							params: {
									types: {type: "Type, Type... || [Type, Type...]", get default_value(){return [T.pos, T.str]}}
								}
						},
						'obj': {
							name: "Object",
							arg: ["types"],
							params: {types: {type: "Object", default_value: {}}}
						}, 
                        'func': {
							name: "Function",
							params : {
								context: {type: 'object||null', default_value: null},
								input: {type: "Type || [Type, Type...]", get default_value(){return T.pos}},
								output: {type: "Type", get default_value(){return T.str}}
							}
                        }
                    },
                    getConst: function(name_type, name_limit){
                        return this.types[name_type].params[name_limit].default_value;
                    } 
                };
                Doc.genDoc = (function(name, params){return {Name: this.types[name].name, Params: params}}).bind(Doc);
                
                Object.freeze(Doc);
                this.doc = Doc.types;
                

                
                //Erros
                function argTypeError(wrong_arg, mess){
                    if(mess === undefined) mess = '';
                    var ER = new TypeError('Argument type is wrong! Arguments(' + forArg(wrong_arg) + ');' + mess);
                    ER.wrong_arg = wrong_arg;
                    
                    if (Error.captureStackTrace) {
                        Error.captureStackTrace(ER, argTypeError);
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
                
                function typeSyntaxError(wrong_str, mess){
                    if(mess === undefined) mess = '';
                    var ER = new SyntaxError('Line: ' + wrong_str + '; ' + mess);
                    ER.wrong_arg = wrong_str;
                    
                    if (Error.captureStackTrace) {
                        Error.captureStackTrace(ER, typeSyntaxError);
                    }
                    
                    return ER;
                }
                
                
                var T = this;
                //Craft object.protype
                function constProp(name_prop, value, vis){
                    if(vis === undefined) vis = true;
                    if(typeof value === "object") Object.freeze(value);
                    Object.defineProperty(this, name_prop, {
                            value: value,
                            enumerable: vis
                        });
                }
                function getSet(name, getter, setter){
                    if(typeof setter == "function"){
                        Object.defineProperty(this, name, {
                            get: getter,
                            set: setter,
                            enumerable: true,
                            configurable: true
                        });
                    }else{
                        Object.defineProperty(this, name, {
                            get: getter,
                            enumerable: true,
                            configurable: true
                        });
                    }
                }
                
                constProp.call(Object.prototype, '_addConst', constProp, false);
                Object.prototype._addConst('_addGetSet', getSet, false);

                Object.defineProperty(Object, 'types', {
					value: T,
					enumerable: true
				});
                
                
                if(typeof(Object.prototype.toSource) !== "function"){
                    Object.defineProperty(Object.prototype, 'toSource',{
                        value: function(){
                                var str = '{';
                                for(var key in this){
                                    str += ' ' + key + ': ' + this[key] + ',';
                                }
                                if(str.length > 2) str = str.slice(0, -1) + ' ';
                                return str + '}';
                            },
                        enumerable: false
                    });
                }
                
                
                if(typeof(Object.values) !== "function"){
                    var val_Obj = function(obj){
                        var vals = [];
                        
                        for (var key in obj) {
                            vals.push(obj[key]);
                        }
                        
                        return vals;
                    };
                    
                     Object._addConst('values', val_Obj.bind(Object));
                }
                
                //Craft RegExp.prototype
                
                RegExp.prototype._addConst('toJSON', function(){
					return this.source;
				});
                
                
                function CreateCreator(New, test, rand, doc){
                    var creator;
                    if(typeof New === "function"){
                        creator = function(){
                            var tmp_obj = New.apply({}, arguments);
                            var new_creator = new CreateCreator(New);
                            for(var key in tmp_obj){
                                new_creator._addConst(key, tmp_obj[key]);
                            }
                            return new_creator;
                        };
                    }else creator = function(){return creator};
                    
                    creator._addConst('is_creator', true);
                    if(typeof test === "function") creator._addConst('test', test);
                    if(typeof rand === "function") creator._addConst('rand', rand);
                    if(typeof doc === "function") creator._addConst('doc', doc);
                    
                    return creator;
                }
                this.newType = CreateCreator;
                this.newType.doc = '(constructor, funcTest, funcRand, funcDoc)';
                
             
                
                //Craft Boolean
                    this.bool = new CreateCreator(
						null,
                        function(value){
                            return (typeof value === 'boolean');
                        },
                        function(){
                            return !(Math.round(Math.random()));
                        },
                        Doc.genDoc.bind(null, "bool")
                    );  
                        
                
                
                //Craft Const
                    function docConst(val){
                        
                        if(typeof(val) === "object" && val !== null){
                            val = 'Object';
                        }
                        if(typeof(val) === "function"){
                            val = val.toString();
                        }
                        return Doc.genDoc.bind(null,"const", {value: val});
                    }
                    function newConst(val){
                        return {
                            rand: function(){return val},
                            test: function(v){return val === v},
                            doc: docConst(val)
                        };
                    }
                    var def_const = newConst(Doc.getConst('const', 'value'));
                    this.const = new CreateCreator(newConst, def_const.test, def_const.rand, def_const.doc);
                       
                    function tConst(Type){    
                        if(typeof (Type) !== "function" || !Type.is_creator){
							if(Array.isArray(Type)){
								
								return T.arr(Type);
								
							}else if(typeof(Type) == "object" && Type !== null){
                                
                                return T.obj(Type);
                                
							}else return T.const(Type);
                        }else{
                            return Type;
                        }
                    }
                
                
                //Craft Number
                    var randNum = function(max, min, precis){
                        return function(){
                            return +(((max - min)*Math.random() +  min).toFixed(precis));
                        }
                    };
                    
                    var testNum = function(max, min, precis){
                        return function(n){
                            if(typeof n !== 'number' || !isFinite(n)){
                                return false;
                            }
                              
                            if((n > max)
                                ||(n < min)
                                || (n.toFixed(precis) != n && n !== 0) ){
                                    
                                return false;
                            } 
                            return true;
                          };
                    };
                    
                    var docNum = function(max, min, precis){
						return Doc.genDoc.bind(null, "num", {"max": max, "min": min, "precis": precis});
                    }
                    
                    var max_def_n = Doc.getConst('num', 'max');
                    var min_def_n = Doc.getConst('num', 'min');
                    var precis_def = Doc.getConst('num', 'precis');
                    
                    this.num = new CreateCreator(
                        function(max, min, precis){
                            if(max === null) max = max_def_n;
                            if(min === undefined||min === null) min = min_def_n;
                            if(precis === undefined) precis = precis_def;
                            
                            if((typeof min !== 'number' || !isFinite(min))
                                ||(typeof max !== 'number' || !isFinite(max))
                                ||(typeof precis !== 'number' || !isFinite(precis))
                                ||(precis < 0)
                                ||(precis > 9) 
                                ||(precis % 1 !== 0)){
                                throw argTypeError(arguments, 'Wait arguments: min(number), max(number), precis(0<=number<9)');
                            }
                            if(min > max){
                                var t = min;
                                min = max;
                                max = t;
                            }
                            
                            return {
                                test: testNum(max, min, precis),
                                rand: randNum(max, min, precis),
                                doc: docNum(max, min, precis)
                            }
                        },
                        testNum(max_def_n, min_def_n, precis_def),
                        randNum(max_def_n, min_def_n, precis_def),
                        docNum(max_def_n, min_def_n, precis_def)
                    );
                    
                    var randInt = function(max, min, precis){
                        return function(){
                            return Math.floor( Math.round((max - min)*Math.random() +  min) / precis)*precis;
                        }
                    };
                    
                     var testInt = function(max, min, precis){
                        return function(n){
                            if(typeof n !== 'number' || !isFinite(n)){
                                return false;
                            }
                              
                            if((n > max)
                                ||(n < min)
                                ||((n % precis) !== 0) ){
                                    
                                return false;
                            } 
                            return true;
                          };
                    };
                    
                    var docInt = function(max, min, step){
                        
							return Doc.genDoc.bind(null, "int", {"max": max, "min": min, "step": step});
                        
                    }
                    
                    var max_def = Doc.getConst('int', 'max');
                    var min_def = Doc.getConst('int', 'min');
                    var step_def = Doc.getConst('int', 'step');
                    
                    this.int = new CreateCreator(
                        function(max, min, step){
                            
                            if(max === null) max = max_def;
                            if(min === undefined||min === null) min = min_def;
                            if(step === undefined) step = step_def;
                            
                            if((typeof min !== 'number' || !isFinite(min))
                                ||(typeof max !== 'number' || !isFinite(max))
                                ||(Math.round(min) !== min)
                                ||(Math.round(max) !== max)
                                ||(step <= 0)
                                ||(Math.round(step) !== step)){
                                throw argTypeError(arguments, 'Wait arguments: min(int), max(int), step(int>0)');
                            }
                            if(min > max){
                                var t = min;
                                min = max;
                                max = t;
                            }
                            
                            return {
                                test: testInt(max, min, step),
                                rand: randInt(max, min, step),
                                doc: docInt(max, min, step)
                            }
                        },
                        testInt(max_def, min_def, step_def),
                        randInt(max_def, min_def, step_def),
                        docInt(max_def, min_def, step_def)
                    );
                    
                    var docPos = function(max, min, step){
                        
							return Doc.genDoc.bind(null, "pos", {"max": max});
                        
                    }
                    
                    var max_def_p = Doc.getConst('pos', 'max')
                    this.pos = new CreateCreator(
                        function(max){
                            
                            if(max === null) max = max_def_p;
                            
                            if((typeof max !== 'number' || !isFinite(max))
                                ||(max < 0)){
                                throw argTypeError(arguments, 'Wait arguments: min(pos), max(pos), step(pos>0)');
                            }
                            
                            return {
                                test: testInt(max, 0, 1),
                                rand: randInt(max, 0, 1),
                                doc: docPos(max)
                            }
                        },
                        testInt(max_def_p, 0, 1),
                        randInt(max_def_p, 0, 1),
                        docPos(max_def_p)
                    );
                
                
                //Craft Range
                    function SetOfNumbers(isFunc, x, y){
                        var beg = 0;
                        var end = 0;
                        var step = 1;
                        
                        if(typeof(isFunc) !== "function"){
                            isFunc = function(val){return(typeof(val) === "number")}
                        }
                        
                        if(isFunc(x)) beg = x;
                        if(isFunc(y)) end = y;
                        if(beg > end){
                            var min = end;
                            end = beg;
                            beg = min;
                        }
                        
						{//Getters and Setters
							this._addGetSet('beg',
									function(){return beg;}
							);
							this._addGetSet('end',
									function(){return end;}
							);
							this._addGetSet('length', function(){return end - beg;});
						}     
                   
                        function inRange(val){
                            return (beg <= val && val <= end);
                        }
                        this._addConst('in', inRange);
                    
                        
                        function isCrossRange(R){
                            if(!(R instanceof SetOfNumbers)) throw new TypeError('Wait class object "Range"!'); 
                            if(this.in(R.beg) && this.in(R.end)){
                                return true;
                            }
                            if(R.in(this.beg) && R.in(this.end)){
                                return false;
                            }
                            if(this.in(R.beg) || this.in(R.end)){
                                if(this.in(R.beg)){
                                    return -1;
                                }else{
                                    return 1;
                                }
                            }
                            return null;
                        }
                        this._addConst('isCross', isCrossRange);
                        
                        function Concat(R){
                            var is_cross = this.isCross(R);
                            if(is_cross === null) return false;
                            
                            if(is_cross === -1){
                                return new SetOfNumbers(isFunc, this.beg, R.end);
                            }
                            if(is_cross === 1){
                                return new SetOfNumbers(isFunc, R.beg, this.end);
                            }
                            
                            if(is_cross){
                                return this;
                            }else return R;
                        }
                        this._addConst('concat', Concat);
                        
                        function And(R){
                            var is_cross = this.isCross(R);
                            if(is_cross === null) return false;
                            
                            if(is_cross === -1){
                                return new SetOfNumbers(isFunc, R.beg, this.end);
                            }
                            if(is_cross === 1){
                                return new SetOfNumbers(isFunc, this.beg, R.end);
                            }
                            
                            if(is_cross){
                                return R;
                            }else return this;
                        }
                        this._addConst('and', And);
                        
                        function randStep(){
                            var length = Math.floor(this.length / step);
                            
                            var rand = T.pos(length).rand;
                            
                            return rand()*step + beg;
                        }
                        this._addConst('rand_step', randStep);
                        
                        return this;
                    }
                    
                    function testRange(isFunc){
                        return function(R){ return (R instanceof SetOfNumbers)&&isFunc(R.beg)&&isFunc(R.end) };
                    }
                    
                    function randRange(creator){
                        return function(){return new SetOfNumbers(creator.test, creator.rand(), creator.rand());}
                    }
                    
                    function NewRange(max, min, precis){
                        var num = this.num(max, min, precis);
                        return {
                            'new': function(x,y){ return new SetOfNumbers(num.test, x, y)},
                            test: testRange(num.test),
                            rand: randRange(num),
                            doc: DocRange(num.doc)
                        };
                    }
                    
                    function DocRange(num_doc){
                        return function(){return {Name: "Range", Params: {Limits: num_doc().Params}};};
                    }
                    
                    var Many = SetOfNumbers.bind(null, null);
                    
                    if(typeof(global) == "object"){
						global.Many = SetOfNumbers.bind(null, null);
					}

					if(typeof(window) == "object"){
						window.Many = SetOfNumbers.bind(null, null);
					}
                    
                    this.range = new CreateCreator(NewRange.bind(this), 
                        testRange(function(val){return(typeof(val) === "number")}), 
                        randRange(this.num),
                        DocRange(this.num.doc)
                    );
                
                
                //Craf String
                    
                    function replaceSpecChar(c){
                        switch(c){
                            case 'w': return 'a-zA-Z0-9_';
                            case 'd': return '0-9';
                            case 's': return '\\t\\n\\v\\f\\r ';
                            
                            default: return c;
                        }
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
                                var range = new Many(beg_char.charCodeAt(0), end_char.charCodeAt(0));
                                
                                var is_concat = false;
                                for(var j = 0; j < result.length; j++){
                                    var arr_concat = range.concat(result[j]);
                                    if(arr_concat){
                                        result[j] = arr_concat;
                                        is_concat = true;
                                        break;
                                    }
                                }
                                
                                if(!is_concat) result.push(range);
                                i++;
                            }else{
                                result.push( new Many(beg_char.charCodeAt(0), beg_char.charCodeAt(0)) );
                            }
                            beg_char = parse_str[i];
                        }
                        return result;
                    }
                    
                    function randChars(chars_arr, size){
                        size = T.int(size, 1).rand();
                        var num = T.pos(chars_arr.length - 1).rand;
                        var str = '';
                        while(size){
                            str +=String.fromCharCode(chars_arr[num()].rand_step());
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
                        return Doc.genDoc.bind(null, "str", { range: range, length: size});
                    }
                    
                    var def_size = Doc.getConst('str', 'length');
                    var def_range = Doc.getConst('str', 'range');
                    
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
                    
                    
                    
                    this.str = new CreateCreator(
						newStr, 
						testStr(def_range, def_size), 
						randStr(def_range, def_size), 
						docStr(def_range, def_size)
					);
				
                
                
                //Craft Array
                
                    function randIndex(){
                        var rand = T.pos(this.length - 1).rand;
                        return this[rand()];
                    }
                    Array.prototype._addConst('rand', randIndex);
                    
                    
                    function createArr(val, length, is_call){
                        var arr = [];
                        
                        if(!length) length = 1;
                        
                        if(typeof val == 'function' && is_call){
                            for(var i = 0; i < length; i++){
                                arr.push(val(i, arr));
                            }
                        }else{
                            
                            for(var i = 0; i < length; i++){
                                arr.push(val);
                            }
                        }
                        
                        return arr;
                    }
                    Array._addConst('create', createArr);
                    
                    
                    function randArray(Type, size, is_fixed){
                        var randSize = function (){return size};
                        if(!is_fixed){
                            randSize = T.pos(size).rand;
                        }
                        
                        
                        if(Array.isArray(Type)){
                            var now_size = randSize();
                            
                            return function(){
                                var arr = [];
                                var type_size = Type.length;
                                
                                for(var i = 0, j = 0; i < now_size; i++){
                                    
                                    arr.push(Type[j].rand());
                                    
                                    j++;
                                    if(j >= type_size){
                                        j = 0;
                                    } 
                                }
                                return arr;
                            }
                        }
                        
                        
                        
                        return function(){
                            var arr = [];
                            
                            var push = arr.push;
                            arr.push = function(val){if(arr.length === size || !Type.test(val)){return false}; push.call(arr, val); return arr.length;}
                            
                            var now_size = randSize();
                            for(var i = 0; i < now_size; i++){
                                arr.push(Type.rand(i, arr));
                            }
                            
                            return arr;
                        }
                        
                    }
                    
                    function testArray(Type, size, is_fixed){
                        
                        if(Array.isArray(Type)){
                            return function(arr){
                                var right = (arr.length === Type.length) || !is_fixed;
                                
                                if(right){
                                    for(var i = 0; i < arr.length; i++){
                                        right = right && Type[i].test(arr[i]);
                                    }
                                }
                                return right;
                            }
                        }
                        
                        return function(arr){
                            if( (!Array.isArray(arr)) || (arr.length > size) || (is_fixed&&(arr.length !== size)) ) return false;
                            return arr.every(Type.test);
                        }
                    }
                    
                    function docArray(Type, size, is_fixed){
						var type_docs = [];
                        if(Array.isArray(Type)){
                            var cont = Type.length;
                            for(var i = 0; i < cont; i++){
                                type_docs.push(Type[i].doc());  
                            }
                        }else{
                            type_docs = Type.doc();
                        }
                        
                        return Doc.genDoc.bind(null, "arr", {types: type_docs, size: size, fixed: is_fixed});
                        
                    }
                    
                    
                    var def_Type = Doc.getConst('arr', 'types');
                    var def_Size = Doc.getConst('arr', 'size');
                    var def_fixed = Doc.getConst('arr', 'fixed');
                    
                    function newArray(Type, size, is_fixed){
                        if(Type === null) Type = def_Type;
                        if(is_fixed === undefined) is_fixed = def_fixed;
                        
                        if(Array.isArray(Type)){
                            if((size === undefined||size === null) && is_fixed) size = Type.length;
                            
                            Type.forEach(function(item, i, arr){arr[i] = tConst(item);}); 
                        }else{
                            if((size === undefined||size === null) && is_fixed) size = 1;
                            Type = tConst(Type);
                        }
                        
                        if(!T.pos.test(size)){
                                throw argTypeError(arguments, 'Wait arguments: Type||null, size(0<=number<2e+6)||null||undefined, is_fixed(boolean||undefined)');
                        }
                        
                        return {
                            test: testArray(Type, size, is_fixed),
                            rand: randArray(Type, size, is_fixed),
                            doc: docArray(Type, size, is_fixed)
                        };
                    }
                    
                    this.arr = new CreateCreator(
						newArray, 
						testArray(def_Type, def_Size, def_fixed), 
						randArray(def_Type, def_Size, def_fixed), 
						docArray(def_Type, def_Size, def_fixed)
					);
                    
                    
				
                
                //Craft Any
                    function randAny(arr){
                        return function(){
                            return arr.rand().rand();
                        }
                    }
                  
                    function testAny(arr){
                        return function(val){
                            return arr.some(function(i){return i.test(val)});
                        }
                    }
                    
                    function docAny(Types){
                        
                        var cont = Types.length;
                        var type_docs = [];
                        for(var i = 0; i < cont; i++){
                            type_docs.push(Types[i].doc());  
                        }
                        
                        return Doc.genDoc.bind(null, "any", {types: type_docs});
                    }
					
					var def_types = Doc.getConst('arr', 'types');
                    function newAny(arr){
                        if(!Array.isArray(arr) || arguments.length > 1) arr = arguments;
                        
                        var len = arr.length;
                        var arr_types = [];
                        for(var i = 0; i < len; i++){
                            arr_types[i] = tConst(arr[i]);
                        }
                        
                        return{
                            test: testAny(arr_types),
                            rand: randAny(arr_types),
                            doc: docAny(arr_types)
                        }
                    }
                    
                    this.any = new CreateCreator(
						newAny, 
						testAny(def_types), 
						randAny(def_types), 
						docAny(def_types)
					);
                
                
                //Craft Object
                
                    function randObj(funcObj){
                        return function(){
                            var obj = {};
                            for(var key in funcObj){
                                obj[key] = funcObj[key].rand();
                            }
                            return obj;
                        };
                    }
                    
                    function testObj(funcObj){
                        return function(obj){
                            var right = (typeof obj === "object" && obj !== null);
                            if(right){
                                
                                for(var key in funcObj){
                                    right = right && funcObj[key].test(obj[key]);
                                }
                            }
                            return right;
                        };
                    }
                    
                    function docOb(funcObj){
                        var doc_obj = {};
                        
                        for(var key in funcObj){
                                doc_obj[key] = funcObj[key].doc();
                        }
					
                        return Doc.genDoc.bind(null, "obj", {types: doc_obj});
                    }
                    
                    function NewObj(tempObj){
                        if(typeof tempObj !== 'object') throw argTypeError(arguments, 'Wait arguments: tempObj(Object)');
                        
                        var begObj = {};
                        var funcObj = {};
                        for(var key in tempObj){
							funcObj[key] = tConst(tempObj[key]);
                        }
                        
                        return{
                            test: testObj(funcObj),
                            rand: randObj(funcObj),
                            doc: docOb(funcObj)
                        }
                    }
                    this.obj = new CreateCreator(NewObj, 
						function(obj){return typeof obj === "object"}, 
						randObj({}), 
						Doc.genDoc.bind(null, "obj")
					);
                
                
                
                //Craft Function
                    
                    function randFunc(context, input, output){
                        return function(){
                            return (function(){
                                var arg_arr = [];
                                for(var i = 0; i < arguments.length; i++){
                                    arg_arr.push(arguments[i]);
                                }
                                
                                if(!input(arg_arr)){
                                    throw argTypeError(arguments);
                                }
                                return output();
                            }).bind(context());
                        }
                    }
                    
                    function testFunc(context, input, output){
                        return function(func, value){
                            if(typeof(func) !== "function") return false;
                            var len = 10;
                            if(T.pos.test(value)&&value < 8)  len = Math.pow(10, value);
                            
                            var right = true;
                            while(len && right){
                                len--;
                                right = right && output(func.apply(context(), input()));
                            }
                            return right;
                        }
                    }
                    
                    function docFunc(context, input, output){
							
                        return Doc.genDoc.bind(null, "func", { context: context.doc(), input: input.doc(), output: output.doc()});
                    }
                    
                    var def_Cont = tConst(Doc.getConst('func', 'context'));
                    var def_in = T.arr(Doc.getConst('func', 'input'), null);
                    var def_out = Doc.getConst('func', 'output');
                    
                    function newFunc(context, input, output, variat){
                        if(context === undefined) context = def_Cont;
                        if(input === undefined||input === null) input = def_in;
                        if(output === undefined) context = def_out;
                        
                        context = tConst(context);
                        
                        var size = null;
                        if(Array.isArray(input) && variat){
                            var size = input.length;
                        }
                        input = T.arr(input, size, !variat);
                        
                        output = tConst(output);
                        
                        return{
                            test: testFunc(context.rand, input.rand, output.test),
                            rand: randFunc(context.rand, input.test, output.rand),
                            doc: docFunc(context, input, output)
                        }
                    }
                    var tmp_obj = {
						test: function(func){return typeof(func) === "function"},
						rand: function(){return function(){}},
						doc: Doc.genDoc.bind(null, "func")
					};
                    this.func = new CreateCreator(
						function(){return tmp_obj}, 
						tmp_obj.test,
						tmp_obj.rand,
						tmp_obj.doc
					);
                
            //Craft Type out to  Document
                
                T.names = {};
                for(var key in Doc.types){
					T.names[Doc.types[key].name] = key;
				}
				
				this.outDoc = function(tmp){
					if(!('Name' in tmp)) throw new Error();
					var type = tmp.Name;
					
					if('Params' in tmp){
						var params = tmp.Params;
						switch(T.names[type]){
							case 'obj': {
								var new_obj = {};
								for(var key in params.types){
									new_obj[key] = T.outDoc(params.types[key]);
								}
								params.types = new_obj;
								break;
							}
							case 'any':
							case 'arr': {
								if(Array.isArray(params.types)){
									params.types = params.types.map(T.outDoc.bind(T));	
								}else params.types = T.outDoc(params.types);
							}
						}
						return getSimpleType(T.names[type], params);
					}
					return getSimpleType(T.names[type], {});
				}
				
				function getSimpleType(name, params){
					var arg = [];
					Doc.types[name].arg.forEach(function(key, i){arg[i] = params[key];});
					return T[name].apply(T, arg);
				};
                
            //Support Declarate Function
            
                function findeParse(str, beg, end){
                    var point_beg = str.indexOf(beg);
                    if(~point_beg){
                        
                        var point_end = point_beg;
                        var point_temp = point_beg;
                        var level = 1;
                        var breakWhile = false;
                        while(!breakWhile){
                            breakWhile = true;
                            
                            if(~point_temp) point_temp = str.indexOf(beg, point_temp + 1);
                            if(~point_end) point_end = str.indexOf(end, point_end + 1);
                            
                            if(point_temp < point_end){
                                
                                if(point_temp > 0){
                                    breakWhile = false;
                                    if(str[point_temp - 1] !== '\\') level = level+1;
                                    
                                }
                                
                                
                                if(point_end > 0){
                                    breakWhile = false;
                                    if(str[point_end - 1] !== '\\') level = level-1;
                                    if(level == 0){
                                        return [point_beg, point_end];
                                    }
                                }
                            }else{
                                if(point_end > 0){
                                    breakWhile = false;
                                    if(str[point_end - 1] !== '\\') level = level-1;
                                    if(level == 0){
                                        return [point_beg, point_end];
                                    }
                                }
                                
                                if(point_temp > 0){
                                    breakWhile = false;
                                    if(str[point_temp - 1] !== '\\') level = level+1;
                                    
                                }
                            }
                        }
                    }
                    return false;
                }
                
            }
})();
