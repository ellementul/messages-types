const Types = require('./core.js');

require('./types/template/test.js')(Types);
require('./types/const/test.js')(Types);
require('./types/bool/test.js')(Types);
require('./types/number/test.js')(Types);
require('./types/index/test.js')(Types);
require('./types/key/test.js')(Types);
require('./types/object/test.js')(Types);
require('./types/array/test.js')(Types);
require('./types/any/test.js')(Types);
require('./types/string/test.js')(Types);
require('./types/switch/test.js')(Types);
require('./types/uuid/test.js')(Types);

require('./core.test.js')(Types);


console.log("Success!");