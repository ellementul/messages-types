(function(){
	if(typeof(Object.types) !== "object") return;

	var T = Object.types;
	var Doc = T.doc;

	var def_key = "type";
	var def_keys_arr = ["None"];
	var def_types_arr = [T.obj({type: "None"})];


	function randSwitch(key, keys_arr, types_arr){

		var rand_key = T.pos(keys_arr.length).rand;

		return function(){

			return types_arr[rand_key()].rand();
		}
	}

	function testSwitch(key, keys_arr, types_arr){

		return function(obj){

			if(typeof obj !== "object" || obj === null ){
				var err = this.doc();
				err.error = "Value is not object!";
				return err;
			}

			if(!(key in obj)){
				var err = this.doc();
				err.error = "Not needed switchkey!";
				return err;
			}
			var index = keys_arr.indexOf(obj[key]);
			if(index === -1){
				var err = this.doc();
				err.error = "Unknowed value in Object[switchkey]!";
				return err;
			}

			var res = types_arr[index].test(obj);
			if(res)
				return res;

			return false;
		}
	}

	function docSwitch(key, keys_arr, types_arr){

		var doc_types = types_arr.map(type=>type.doc());

		return T.doc.gen.bind(null, "swit", 
		{ 
			switch_key: key, 
			types: doc_types,
		});
	}

	var error_text = 'Wait arguments: (String, [Type, Type, ...])';

	function newSwitch(key, types_arr){

		if(typeof key !== "string")
			throw T.error(arguments, 'Argument is not String! ' + error_text);

		if(!Array.isArray(types_arr))
			throw T.error(arguments, 'Argument is not Array! ' + error_text);

		if(!types_arr.length)
			throw T.error(arguments, 'Array is empty! ' + error_text);

		var keys_arr = [];

		types_arr = types_arr.map(function(Type, i, arr){
			
			if(!T.isType(Type))
				throw T.error('Index Item: ' + i, ' Wait Type in Array', error_text);
			
			var docType = Type.doc();

			if(docType.name !== "Object")
				throw T.error('Index Item: ' + i, 'Wait Type of Structure: {' + key + ': "String", ...}');
			
			if(!docType.params.types[key])
				throw T.error('Index Item: ' + i, 'Wait Type of Structure: {' + key + ': "String", ...}');

			var doc_key = docType.params.types[key];

			if(doc_key.name !== "Constant")
				throw T.error('Index Item: ' + i, 'Wait Type of Structure: {' + key + ': "String", ...}');
			
			if(!doc_key.params.value)
				throw T.error('Index Item: ' + i, 'Wait Type of Structure: {' + key + ': "String", ...}');

			keys_arr[i] = doc_key.params.value;

			return Type;
		});

		return{
			test: testSwitch(key, keys_arr, types_arr),
			rand: randSwitch(key, keys_arr, types_arr),
			doc: docSwitch(key, keys_arr, types_arr)
		}
	}

	T.newType('swit',
	{
		name: "Switch",
		arg: ["switch_key", "types"],
		params: {
			switch_key: {type: 'String', def_key},
			types: {type: '[Type, Type, ...]', default_value: def_types_arr}
		}
	},
	{
		New: newSwitch,
		test: testSwitch(def_key, def_keys_arr, def_types_arr),
		rand: randSwitch(def_key, def_keys_arr, def_types_arr),
		doc: docSwitch(def_key, def_keys_arr, def_types_arr)
	});
})();