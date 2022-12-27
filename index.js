const Types = require('./core.js');

require('./types/template/type.js')(Types);
require('./types/const/type.js')(Types);
require('./types/bool/type.js')(Types);
require('./types/number/type.js')(Types);
require('./types/index/type.js')(Types);
require('./types/key/type.js')(Types);
require('./types/object/type.js')(Types);
require('./types/array/type.js')(Types);
require('./types/any/type.js')(Types);
require('./types/string/type.js')(Types);
require('./types/switch/type.js')(Types);
require('./types/uuid/type.js')(Types);

module.exports = Types;