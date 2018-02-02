require("./mof.js");
var i = 1000;
var arr = [1,2];
while(i--) if(arr.indexOf(arr.rand_i()) == -1) throw new Error('Рандомный эллемент не содержится в массиве');

var arr = Array.create(7, 10);

if((arr.length != 10) || arr.some(function(item){return (item != 7);})) throw new Error('Заполнение массива константой не работает!');

function inc(i, arr){return {i: i, arr: arr};}

var arr2 = Array.create(inc, 10);

if((arr2.length != 10) || arr2.some(function(item, i, arr){return (item.i != i || item.arr != arr);})) throw new Error('Заполнение массива фукнцией не работает!');

console.log("Тестирование завершено успешно!");
