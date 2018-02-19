require("./mof.js");
var i = 1000;
var arr = [1,2];
while(i--) if(arr.indexOf(arr.rand_i()) == -1) throw new Error('Рандомный эллемент не содержится в массиве');

var arr = Array.create(7, 10);

if((arr.length != 10) || arr.some(function(item){return (item != 7);})) throw new Error('Заполнение массива константой не работает!');

function inc(i, arr){return {i: i, arr: arr};}

var arr2 = Array.create(inc, 10);

if((arr2.length != 10) || arr2.some(function(item, i, arr){return (item.i != i || item.arr != arr);})) throw new Error('Заполнение массива фукнцией не работает!');

var arr3 = [];

for(var i = 0; i < 100; i++){
	arr3.add(i);
}

for(var i = 0; i < 100; i = i+2){
	arr3.dell(i);
}

for(var i = 98; i >= 0; i = i-2){
	arr3.add(i);
}

if(!arr3.every(function(item, i){return i == item;})) throw new Error("Режим добавления в массиве не работает!");



console.log("Тестирование завершено успешно!");
