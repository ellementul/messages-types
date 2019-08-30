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
	console.info();


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