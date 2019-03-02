"use strict";
(function(){
	if(typeof module == "object"){
		require("./types.js");
	}

	var T = Object.types;

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


	var tmp_obj = {};
	var valOrType = function(type, is_val){
		if(is_val){
			return type.rand();
		}else{
			return type;
		}
	};
	var ter = 17;
	while(ter--){

		tmp_obj["" + T.pos(111).rand()] = valOrType(types_arr.rand_i());
	}
	var obj_type = T.obj(tmp_obj);
	console.log("Тестирование объектов: " + revisType(obj_type, 10));
	console.log("	Одноуровневнего: " + revisType(obj_type, 10));

	tmp_obj.recur1 = obj_type;
	obj_type = T.obj(tmp_obj);
	console.log("	Двухуровневнего: " + revisType(obj_type, 10));

	tmp_obj.recur2 = obj_type;
	obj_type = T.obj(tmp_obj);
	console.log("	Трехуровневого: " + revisType(obj_type, 10));

	obj_type = T.obj({a: tmp_obj, b: tmp_obj.recur2, c: tmp_obj.recur1});
	console.log("	Многоуровневого: " + revisType(obj_type, 10));
	console.info();


	var tmp_doc = obj_type.doc();
	console.log("Восстановление типа по документации: " + revisType(T.outDoc(tmp_doc), 10));
	console.info();



	function revisType(type, count){
		while(count--){
			var value = type.rand();
			var test_value = type.test(value);
			if(test_value){
				console.log("Проверяющий тип: ");
				console.log(type.doc());
				console.log("Не прошедшее проверку значение: " + value);
				console.log("Вывод ошибки: " +  JSON.stringify(test_value));
				throw new Error("Тесты закончились неудачей!");
			}
		}

		return true;
	}
})();
