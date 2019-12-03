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
