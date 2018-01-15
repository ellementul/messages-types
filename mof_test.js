require("./mof.js");
var i = 1000;
var arr = [1,2];
while(i--) if(arr.indexOf(arr.rand_i()) == -1) throw new Error('Рандомный эллемент не содержится в массиве');
