export default (function Test(Types, {
	typeName,
	tests: {
		wrongConstrArgsArray,
		validArgsForConstr,
		wrongValuesOfType,
		validValuesOfType,
		repeatSelfTest
	},
}){

	console.log("\n\nType "+ typeName +" testing: ", "\n");

	it("Check isCrType", ()=>
		Types.isCrType(Types[typeName])
	);
	
	crTest('Wrong arguments for constructor', () => 
		testArrayArgs(Types[typeName].Def, wrongConstrArgsArray)
	);

	crTest('Right arguments for constructor', () => 
		testArrayArgs(Types[typeName].Def, validArgsForConstr, true)
	);


	var type = Types[typeName].Def.apply(null, validArgsForConstr[0]);


	it("Check isType", ()=>
		Types.isType(type)
	);

	crTestValues('Wrong arguments for validation of type', type.test, wrongValuesOfType);

	crTestValues('Validate values for validation of type', type.test, validValuesOfType, true);



	let selfTest =  () => type.test(type.rand());

	crRepeatTest('Self-test of type', selfTest, repeatSelfTest, true);


	var jType = type.toJSON();
	var outJType = Types[typeName].outJSON(jType);

	it("Check isType of JSON", ()=>
		Types.isType(outJType)
	);

	selfTest =  () => type.test(outJType.rand());
	crRepeatTest('Self-test rand of JSON', selfTest, repeatSelfTest, true);

	selfTest =  () => outJType.test(type.rand());
	crRepeatTest('Self-test test of JSON', selfTest, repeatSelfTest, true);

	selfTest =  () => outJType.test(outJType.rand());
	crRepeatTest('Self-test type of JSON', selfTest, repeatSelfTest, true);
});



function crTestValues(title, testFunc, values, isShouldFalse){

	crTest(title, () =>{
		let resArr =  [];

		if(isShouldFalse)
			resArr = values.map(value => testFunc(value)).filter(res => res);
		else
			resArr = values.filter(value => !testFunc(value));

		if(resArr.length)
			return {
				errors: resArr,
				message: "Errors of call",
			}
	});
}

function crRepeatTest(title, testFunc, repeat, isShouldFalse){

	crTest(title, () =>{
		let resArr = Array(repeat).fill(false);
		let errors = [];

		if(isShouldFalse)
			errors = resArr.map(testFunc).filter(res => res);
		else
			errors = resArr.filter(() => !testFunc());
			

		if(errors.length)
			return {
				errors,
				message: "Errors repeat",
			}
	});
}

function it(title, testFunc){
	crTest(title, () =>{
		if(!testFunc())
			return {message: 'The statement is incorrect'};
	});
}

function crTest(title, testFunc){
	let res = testFunc();

	if(res)
		errorMessage(title, res);
	else
		console.info("  " + title + "...Ok");
}

function errorMessage(title, res){
	throw new Error(title + ': \n' + JSON.stringify(res, "", 2));
}

function testArrayArgs(testingFunc, arrayArgs, right){
	let errors = [];
	let resArr = [];

	arrayArgs.map(args => {
		let {error, res} = testArgs(testingFunc, args);
		if((right && error) || (!right && !error))
			errors.push({
				wrongArgs: args,
				result: res,
				error: error.message,
			});
	});

	if(errors.length)
		return  {
			errors,
			message: "Incorrectly processed wrong arguments",
		};
}

function testArgs(testingFunc, args){
	let error = false;
	let res = null;

	try{
		res = testingFunc.apply(null, args);
	}
	catch(e){
		error = e;
	}

	return {error, res};
}