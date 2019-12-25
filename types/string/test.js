const ExtendTypes = require("./type.js");
const runTest = require("../../test_tool.js");

module.exports = (function Test(Types){

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
				["Hello world!"],
				[5, "Hello world!"],
				["a-za-D", 15],
				["Hello world!", 0],
			],
			validArgsForConstr: [
				["a-z", 15],
				["^Hello world!", 5],
				["\\w", 12],
				["1", 1]
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				undefined,
				null,
				false,
				true,
				"Hello", //Upper case is wrong!
			],
			validValuesOfType: [
				"hell",
				"helloworld",
			],
			repeatSelfTest: 1024,
		},
	});
});
