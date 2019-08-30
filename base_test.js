"use strict";
(function(){
	if(typeof module == "object"){
		require("./types.js");
	}

	var T = Object.types;

	var tested_obj = {};
	var tests_arr = [T.obj({a: 1}).test];
	console.log("	Check binding type functions: " + !!tests_arr[0](tested_obj));

	console.info("Тестирование чисел: ");

	var rand_limit = T.pos.rand();
	var pos = T.pos(rand_limit);
	//Этот тип предназначен для индексирования, поэтому важно чтобы индекс на границе диапазона не считался валидным.
	console.info("	Индексовых: " + (revisType(pos, 1000) && !!pos.test(rand_limit)) );


	var int = T.int(T.int.rand(), T.int.rand(), T.int(null, 1).rand());
	console.info("	Целых: " + revisType(int, 10000) );

	var number = T.num(T.num.rand(), T.num.rand(), T.pos(9).rand());
	console.info("	Дробных: " + revisType(number, 1000));
	console.info();

	var any_types = T.any(pos, "none", int, number, null, 78);
	var types_arr = [pos, "none", int, number, null, 78, "aggdgegf", "bwgffefkv", "ивамфаамиа"];
	var any_type = T.any(types_arr);
	console.log("Тестирование смешаного типа: " + (revisType(any_types, 10) && revisType(any_type, 10)));
	console.info();

	console.log("Тестирование массива: ");
	console.log("	С одним типом: ");
	var arr = T.arr(pos, 10, true);
	console.log("		Фиксированный: " + revisType(arr, 10));
	var arr = T.arr(pos, 10, false);
	console.log("		Нефиксированный: " + revisType(arr, 10));
	console.log("	С последовательностью типов: ");
	var arr = T.arr(types_arr, 10, true);
	console.log("		Фиксированный: " + revisType(arr, 10));
	var arr = T.arr(types_arr, 10, false);
	console.log("		Нефиксированный: " + revisType(arr, 10));
	console.info();


	var originObj = {};
	var valOrType = function(type, is_val){
		if(is_val){
			return type.rand();
		}else{
			return type;
		}
	};

	var count_keys = 17;
	while(count_keys--)
		originObj["" + T.pos(111).rand()] = valOrType(randIndex(types_arr));
	
	var objType = T.obj(originObj);
	console.log("Тестирование объектов: ");
	console.log("	Одноуровневнего: " + revisType(objType, 10));


	originObj.intoType = objType;
	originObj.intoObj = {a: 67};
	originObj.intoSecondObj = {a: objType, b: {ert: 53, gert: {gert: 456}}};

	objType = T.obj(originObj);
	console.log("	Многоуровневого: " + revisType(objType, 10));

	originObj.intoObj = {a: 67, cyc: originObj};
	originObj.intoSecondObj = {a: objType, b: {ert: 53, gert: {gert: 456}, cyc: originObj}};

	objType = T.obj(originObj);
	console.log("	С циклическими ссылками: " + revisType(objType, 10));  
	console.info();




	var tmp_doc = objType.doc();
	console.log("Восстановление типа по документации: " + revisType(T.outDoc(tmp_doc), 10));
	console.info();

	function randIndex(arr){
		var rand = Math.round((arr.length - 1) * Math.random());
		return arr[rand];
	}

	function revisType(type, count){
		while(count--){
			var value = type.rand();
			var test_value = type.test(value);
			if(test_value){
				console.log("Проверяющий тип: ");
				console.log(type.doc());
				console.log("Не прошедшее проверку значение: " + JSON.stringify(value));
				console.log("Вывод ошибки: " +  JSON.stringify(test_value));
				throw new Error("Тесты закончились неудачей!");
			}
		}

		return true;
	}
})();
