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
				[null],
				[false],
				[true],
				["Hello world!"],
				[-1],
				[0],
			],
			validArgsForConstr: [
				[],
				[15],
				[5],
				[12],
				[1],
				[1024]
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				undefined,
				null,
				false,
				true
			],
			validValuesOfType: [
				"hell",
				"helloworld",
				"Hello!",
				"Hello \n\r\t type!"
			],
			repeatSelfTest: 1024,
		},
	});
});
