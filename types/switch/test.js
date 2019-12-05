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
				["Hello world!", [{type: "None"}]],
			],
			validArgsForConstr: [
				  ["type", [{type: "None", prop: Types.Key.Def()}]],
				  ["type", [{type: "None"}]],
			],
			wrongValuesOfType: [
				{},
				[],
				5,
				"Hello",
				null,
				false,
				true,
				["Hello world!"],
				{type: "None"},
				{type: "None", prop: "Keys_prop Tetv!"},
				{type: "None", prop: 5},
			],
			validValuesOfType: [
				{type: "None", prop: "Keys"},
				{type: "None", prop: "Keys_prop"},
			],
			repeatSelfTest: 1024,
		},
	});
});
