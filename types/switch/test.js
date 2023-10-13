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
				["Hello world!"],
				["Hello world!", [{type: "None"}]],
			],
			validArgsForConstr: [
				[["type", "struct"], [{type: "None", struct: "T", prop: Types.Key.Def()}, {type: "Non", struct: "R", pro: Types.Key.Def()}]],
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
				{type: "None", prop: "Keys"},
			],
			validValuesOfType: [
				{type: "None", struct: "T", prop: "Keys"},
				{type: "Non", struct: "R", pro: "Keys_prop"},
			],
			repeatSelfTest: 1024,
		},
	});
});
