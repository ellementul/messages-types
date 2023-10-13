import ExtendTypes from './type.js'
import runTest from '../../test_tool.js'

export default (function Test(Types){

	ExtendTypes(Types);

	runTest(Types, {
		typeName: ExtendTypes.typeName,
		tests: {
			wrongConstrArgsArray: [
				[{}],
				[[]],
				[5],
				[null],
				[false],
				[true],
			],
			validArgsForConstr: [
				["Hello world!"]  
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				"Hello",
				null,
				false,
				true,
			],
			validValuesOfType: ["Hello world!"],
			repeatSelfTest: 1024,
		},
	});
});
