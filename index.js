import Types from './core.js'

import Template from './types/template/type.js'
import Const from './types/const/type.js'
import Boolean from './types/bool/type.js'
import Number from './types/number/type.js'

import Index from './types/index/type.js'
import Key from './types/key/type.js'
import Object from './types/object/type.js'
import Array from './types/array/type.js'
import Union from './types/union/type.js'
import String from './types/string/type.js'
import Uuid from './types/uuid/type.js'

Template(Types)
Const(Types)
Boolean(Types)
Number(Types)
Index(Types)
Key(Types)
Object(Types)
Array(Types)
// Псевдоним для обратной совместимости
Types.Any = Types.Union
Union(Types)
String(Types)
Uuid(Types)

export default Types