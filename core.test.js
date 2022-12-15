module.exports = (function (Types){
  crTest("Recognize Index outJSON", () => {
    const type = Types.Index.Def(100)
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
  crTest("Recognize String outJSON", () => {
    const type = Types.String.Def("\\w", 100)
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
  crTest("Recognize Object outJSON", () => {
    const type = Types.Object.Def({
      string: Types.String.Def("\\w", 100),
      index: Types.Index.Def(100)
    })
    const json_type = type.toJSON() 
    return !Types.isType(Types.outJSON(json_type))
  })
})


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