"use strict";

var T = Object.types;
console.info('-----------------------------------------------------');
console.info("Тестирование строк: ");
console.info("	Значения по умолчанию: " + revisType(T.str, 10));
console.info("	С набором символов: " + revisType(T.str('[0-9a-zA-Z]'), 10));
console.info("	С большим набором символов: " + revisType(T.str('[0-акеу]'), 10));
console.info("	С рандомным набором символов: " + revisType(T.str('[' + T.str('[0-9a-zA-Z-]').rand()  + ']'), 100));
console.info("	С установленной длиной: " + revisType(T.str('[' + T.str('[0-9a-zA-Z-]').rand()  + ']', 100), 100));
console.info();

var str_type = T.str('[' + T.str('[0-9a-zA-Z-]').rand()  + ']', 100);
console.info("Генерация и обратимость документации: " + revisType(T.outDoc(str_type.doc()), 100));


function revisType(type, count){
	
	while(count--){
		var value = type.rand();
		if(!type.test(value)){
			console.log("Проверяющий тип: ");
			console.log(type.doc());
			console.log("Не прошедшее проверку значение: " + value);
			return false;
		}
	}
	
	return true;
}
