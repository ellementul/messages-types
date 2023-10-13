import Types from './core.js'

import Template from './types/template/test.js'
import Const from './types/const/test.js'
import Boolean from './types/bool/test.js'
import Number from './types/number/test.js'

import Index from './types/index/test.js'
import Key from './types/key/test.js'
import Object from './types/object/test.js'
import Array from './types/array/test.js'
import Any from './types/any/test.js'
import String from './types/string/test.js'
import Switch from './types/switch/test.js'
import Uuid from './types/uuid/test.js'
import TestCore from './core.test.js'

Template(Types)
Const(Types)
Boolean(Types)
Number(Types)
Index(Types)
Key(Types)
Object(Types)
Array(Types)
Any(Types)
String(Types)
Switch(Types)
Uuid(Types)
TestCore(Types)

console.log("Success!");