console.info("Тестирование типов: " +
	(function(){
		
		var types = [T.bool, T.pos, T.int, T.num, T.str, false, null, 567, 'str'];
		var AnyType = T.any(types);
		var ex = AnyType.rand();
		if(!AnyType.test(ex)){
			console.error('Первый тест', ex);
			return false;
		}
		
		
		var temple = T.obj.rand();
		var i = 7;
		while(i){
			i--;
			var key = T.str.rand();
			if(key) temple[key] = types.rand();
		}
		
		var Ob = T.obj(temple);
		ex = Ob.rand();
		if(!Ob.test(ex)){
			console.error('Второй тест', ex);
			return false;
		}
		
		var tmpDoc = JSON.parse(JSON.stringify(Ob.doc()));
		var newOb = T.outDoc(tmpDoc);
		ex = newOb.rand();
		if(!Ob.test(ex)){
			console.error('Третий тест', ex);
			return false;
		}
		
		return true;
	})());
