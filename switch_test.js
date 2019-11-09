"use strict";
(function(){
	if(typeof module == "object"){
		require('./switch_type.js');
	}

	var T = Object.types;

	var TypeSwit = T.swit;

	console.info('-----------------------------------------------------');
	console.info("Тестирование SwitchType: ");
	console.info("	Тестирование значения по умолчанию: " + revisType(TypeSwit, 1));

	var switch_key = "type_key";

	var typeOne = T.obj({
		type_key: "One",
		reset: 1234
	});

	var typeTwo = T.obj({
		type_key: "Two",
		reset: {
			ru: "Ret",
			tret: 1234,
		}
	});

	var typeThree = T.obj({
		firstKey: "Add",
		secondKey: "Rest",
		reset: {
			ru: "Ret",
			rest: "Add",
			tret: 1234,
		}
	});

	var typeFour = T.obj({
		firstKey: "Del",
		secondKey: "Rest",
		reset: {
			ru: "Ret",
			rest: "Del",
			tret: 1234,
		}
	});

	var types_arr = [typeOne, typeTwo];
	TypeSwit = T.swit(switch_key, types_arr);

	console.info("	Тестирование кастомных обьектов: " + revisType(TypeSwit, 100));
	console.info();

	/*types_arr = [typeThree, typeFour];
	TypeSwit = T.swit(["firstKey","secondKey"], types_arr);

	console.info("	Тестирование обьектов c несколькими ключами: " + revisType(TypeSwit, 100));
	console.info();*/


	console.info("	Генерация и обратимость документации: " + revisType(T.outDoc(TypeSwit.doc()), 100));


	function revisType(type, count){
		while(count--){
			var value = type.rand();
			var test_value = type.test(value);
			if(test_value){
				console.log("Проверяющий тип: ");
				console.log(JSON.stringify(type.doc(), "", 2));
				console.log("Не прошедшее проверку значение: " + value);
				console.log("Вывод ошибки: " +  JSON.stringify(test_value, "", 2));
				throw new Error("Тесты закончились неудачей!");
			}
		}

		return true;
	}
})();