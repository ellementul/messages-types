(function(){
	if(typeof(Object.types) !== "object") return;

	var T = Object.types;
	var Doc = T.doc;

	var def_key = "type";
	var def_types_object = {obj: T.obj};

	function tConst(Type){
		if(typeof (Type) === "function" && Type.is_creator)
			return Type;

		if(Array.isArray(Type) || (typeof(Type) == "object" && Type !== null))
			return T.obj(Type);
		else
			return T.const(Type);
	}


	function randSwitch(key, types_object){

		var rand_key = T.any(Object.keys(types_object)).rand;

		return function(){
			var type_key = rand_key();

			var obj = types_object[type_key].rand();
			obj[key] = type_key;

			return obj;
		}
	}

	function testSwitch(key, types_object){

		return function(obj){

			if(typeof obj !== "object" || obj === null ){
				var err = this.doc();
				err.params = "Value is not object!";
				return err;
			}

			if(!(key in obj)){
				var err = this.doc();
				err.params = "Not needed switchkey!";
				return err;
			}

			if(!(obj[key] in types_object)){
				var err = this.doc();
				err.params = "Unknowed value in Object[switchkey]!";
				return err;
			}

			var res = types_object[obj[key]].test(obj);
			if(res){
				var err = this.doc();
				err.params = {};
				err.params[obj[key]] = res;
				return err;
			}

			return false;
		}
	}

	function docSwitch(key, types_object){
		var doc_types = {};

		for(var i in types_object){
			doc_types[i] = types_object[i].doc();
		}

		return T.doc.gen.bind(null, "swit", 
		{ 
			switch_key: key, 
			types_object: doc_types,
		});
	}

	function newSwitch(key, types_object){
		if(typeof key !== "string"
			|| typeof types_object !== "object"
			|| !types_object)
			throw T.error(arguments, 'Wait arguments: String, Object');

		var funcObj = {};

		for(var key_value in types_object){
			funcObj[key_value] = tConst(types_object[key_value]);
		}

		return{
			test: testSwitch(key, funcObj),
			rand: randSwitch(key, funcObj),
			doc: docSwitch(key, funcObj)
		}
	}

	T.newType('swit',
	{
		name: "Switch",
		arg: ["switch_key", "types_object"],
		params: {
				switch_key: {type: 'String', get default_value(){return def_types_object}},
				types_object: {type: 'Object', default_value: def_key}
		}
	},
	{
		New: newSwitch,
		test: testSwitch(def_key, def_types_object),
		rand: randSwitch(def_key, def_types_object),
		doc: docSwitch(def_key, def_types_object)
	});
})();