/*!
 * @mk816017/form-builder v1.1.0 | MIT License | git+https://github.com/zhongyoulu/vue-sfc-rollup-demo.git
 * https://unpkg.com/@mk816017/form-builder@1.1.0/dist/form-builder.js
 */
(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?module.exports=f(require('vuedraggable'),require('@iconify/iconify')):typeof define==='function'&&define.amd?define(['vuedraggable','@iconify/iconify'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,g.FormXXXBuilder=f(g.vuedraggable,g.Iconify));}(this,(function(Draggable, Module){'use strict';function _interopDefaultLegacy(e){return e&&typeof e==='object'&&'default'in e?e:{'default':e}}var Draggable__default=/*#__PURE__*/_interopDefaultLegacy(Draggable);var Module__default=/*#__PURE__*/_interopDefaultLegacy(Module);function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}//
//
//
//
//
//
//
//
//
//
//
var script = /*#__PURE__*/{
  name: 'FormDemo',
  props: {
    id: {
      type: String,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "form-demo"
  }, [_vm._m(0), _vm._v(" "), _c('code', [_vm._v("\n    " + _vm._s(_vm.columns) + "\n  ")])]);
};

var __vue_staticRenderFns__ = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('form', {
    attrs: {
      "action": ""
    }
  }, [_c('button', [_vm._v("Send")])]);
}];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = "data-v-7a2f470a";
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);const Iconify = Module__default['default'].default || Module__default['default'];

const collections = JSON.parse('[]');

collections.forEach(c => Iconify.addCollection(c));var script$1 = /*#__PURE__*/{
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true
    }
  },
  watch: {
    icon: 'updateIcon'
  },
  mounted: function mounted() {
    this.updateIcon(this.icon);
  },
  methods: {
    updateIcon: function updateIcon(icon) {
      var _this = this;

      return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var temp, svg, span;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.$nextTick();

              case 2:
                _this.$refs.el.textContent = '';
                temp = Iconify.default ? Iconify.default : Iconify;
                svg = icon ? temp.renderSVG(icon, {}) : null;

                if (svg) {
                  _this.$refs.el.appendChild(svg);
                } else {
                  span = document.createElement('span');
                  span.className = 'iconify';

                  if (icon) {
                    span.dataset.icon = icon;
                  }

                  _this.$refs.el.appendChild(span);
                }

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    }
  }
};/* script */
var __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('span', {
    ref: "el",
    staticClass: "icon"
  });
};

var __vue_staticRenderFns__$1 = [];
/* style */

var __vue_inject_styles__$1 = undefined;
/* scoped */

var __vue_scope_id__$1 = undefined;
/* module identifier */

var __vue_module_identifier__$1 = undefined;
/* functional template */

var __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);//
//
//
//
//
//
//
//
//
//
//
//
var script$2 = /*#__PURE__*/{
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: function validator(value) {
        return ['text', 'number', 'select', 'select-search', 'radio', 'checkbox'].includes(value);
      }
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  emits: ['input'],
  computed: {
    isInput: function isInput() {
      return ['text', 'number'].includes(this.type);
    }
  },
  methods: {
    update: function update(e) {
      this.$emit('input', e.target.value);
    }
  }
};/* script */
var __vue_script__$2 = script$2;
/* template */

var __vue_render__$2 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('label', {
    class: ['input-row', {
      required: _vm.isRequired
    }]
  }, [_c('div', {
    staticClass: "for"
  }, [_c('p', [_vm._v(_vm._s(_vm.label))])]), _vm._v(" "), _c('div', {
    staticClass: "field"
  }, [_c('div', {
    staticClass: "input"
  }, [_c('input', _vm._b({
    domProps: {
      "value": _vm.value
    },
    on: {
      "input": _vm.update
    }
  }, 'input', _vm.$attrs, false))])])]);
};

var __vue_staticRenderFns__$2 = [];
/* style */

var __vue_inject_styles__$2 = undefined;
/* scoped */

var __vue_scope_id__$2 = undefined;
/* module identifier */

var __vue_module_identifier__$2 = undefined;
/* functional template */

var __vue_is_functional_template__$2 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$2 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);function uuid() {
  var d = Date.now();

  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
}
function deepCopy(obj) {
  if (!obj || _typeof(obj) !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce(function (arr, item, i) {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce(function (newObj, key) {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
}
function json2ObjByKey(json, key) {
  if (!json) return {};
  key = key || 'id';
  return json.reduce(function (acc, obj) {
    var v = obj[key];
    if (v) acc[v] = Object.assign({}, acc[v], deepCopy(obj));
    return acc;
  }, {});
}
function convertOptions(obj) {
  return Object.entries(obj).reduce(function (p, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    return [].concat(_toConsumableArray(p), [{
      value: k,
      text: v
    }]);
  }, []);
}var script$3 = /*#__PURE__*/{
  name: 'ColumnSettingBase',
  components: {
    Field: __vue_component__$2
  },
  props: {
    // 欄位名稱
    name: {
      type: String,
      default: null
    },
    // 欄位說明
    label: {
      type: String,
      default: null
    },
    // 欄位子說明
    subLabel: {
      type: String,
      default: null
    },
    // 欄位屬性
    type: {
      type: String,
      default: null
    },
    // 提示文字
    placeholder: {
      type: String,
      default: null
    },
    // 預設值
    defaultValue: {
      type: String,
      default: null
    },
    // 自動完成
    autocomplete: {
      type: String,
      default: null
    }
  },
  emits: ['update'],
  data: function data() {
    return {
      sync: {
        name: this.name,
        label: this.label,
        subLabel: this.subLabel,
        type: this.type,
        placeholder: this.placeholder,
        defaultValue: this.defaultValue,
        autocomplete: this.autocomplete
      }
    };
  },
  computed: {
    columnTypeOptions: function columnTypeOptions() {
      return convertOptions({
        text: '文字框 (text)',
        number: '數字框 (number)',
        select: '下拉選單 (select)',
        radio: '單選框 (radio)',
        checkbox: '勾選框 (checkbox)'
      });
    }
  },
  watch: {
    sync: {
      handler: function handler(newVal) {
        var temp = Object.entries(newVal).reduce(function (p, _ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              k = _ref2[0],
              v = _ref2[1];

          if (v) p[k] = v;
          return p;
        }, {});
        this.$emit('update', temp);
      },
      deep: true
    }
  }
};/* script */
var __vue_script__$3 = script$3;
/* template */

var __vue_render__$3 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "block block--option"
  }, [_c('fieldset', [_c('legend', [_vm._v("基本設定")]), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '欄位名稱',
      "is-required": ""
    },
    model: {
      value: _vm.sync.name,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "name", $$v);
      },
      expression: "sync.name"
    }
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '欄位屬性',
      "type": 'select',
      "options": _vm.columnTypeOptions,
      "placeholder": "請選擇屬性",
      "is-required": ""
    },
    model: {
      value: _vm.sync.type,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "type", $$v);
      },
      expression: "sync.type"
    }
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '欄位說明',
      "is-required": ""
    },
    model: {
      value: _vm.sync.label,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "label", $$v);
      },
      expression: "sync.label"
    }
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '欄位子說明'
    },
    model: {
      value: _vm.sync.subLabel,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "subLabel", $$v);
      },
      expression: "sync.subLabel"
    }
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '預設值'
    },
    model: {
      value: _vm.sync.defaultValue,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "defaultValue", $$v);
      },
      expression: "sync.defaultValue"
    }
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "label": '提示文字'
    },
    model: {
      value: _vm.sync.placeholder,
      callback: function callback($$v) {
        _vm.$set(_vm.sync, "placeholder", $$v);
      },
      expression: "sync.placeholder"
    }
  })], 1)]);
};

var __vue_staticRenderFns__$3 = [];
/* style */

var __vue_inject_styles__$3 = undefined;
/* scoped */

var __vue_scope_id__$3 = undefined;
/* module identifier */

var __vue_module_identifier__$3 = undefined;
/* functional template */

var __vue_is_functional_template__$3 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$3 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$3,
  staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);var script$4 = /*#__PURE__*/{
  name: 'ColumnSetting',
  components: {
    // Draggable,
    Icon: __vue_component__$1,
    ColumnSettingBase: __vue_component__$3
  },
  props: {
    idx: {
      type: Number,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    // column: { type: Object, required: true },
    id: {
      type: String,
      required: true
    },
    base: {
      type: Object,
      default: function _default() {
        return {};
      }
    }
  },
  emits: ['update', 'delete'],
  data: function data() {
    return {
      mutableColumn: {
        base: this.base
      },
      isOpen: false,
      placement: 'bottom'
    };
  },
  computed: {
    columnTypeOptions: function columnTypeOptions() {
      return convertOptions({
        text: '文字框 (text)',
        number: '數字框 (number)',
        select: '下拉選單 (select)',
        radio: '單選框 (radio)',
        checkbox: '勾選框 (checkbox)'
      });
    },
    sourceModeOptions: function sourceModeOptions() {
      return convertOptions({
        list: '手動設置',
        api: 'API'
      });
    },
    displayModeOptions: function displayModeOptions() {
      return convertOptions({
        line: 'Line by Line',
        next: 'Next to each others',
        bothSide: 'Stay on each sides in a row (Left - Right)'
      });
    },
    isInput: function isInput() {
      return ['text', 'number'].includes(this.mutableColumn.base.type);
    },
    needItems: function needItems() {
      return ['select', 'radio', 'checkbox'].includes(this.mutableColumn.base.type);
    },
    columnsExcludeSelf: function columnsExcludeSelf() {
      var selfID = this.id;
      return this.columns.filter(function (column) {
        return column.id !== selfID;
      });
    },
    columnsArr: function columnsArr() {
      return json2ObjByKey(this.columns, 'id');
    }
  },
  watch: {
    mutableColumn: {
      handler: function handler(newVal) {
        this.$emit('update', this.idx, _objectSpread2({
          id: this.id
        }, newVal));
      },
      deep: true
    }
  },
  methods: {
    handleDelete: function handleDelete() {
      this.$emit('delete', this.idx);
    },
    handleOpen: function handleOpen() {
      this.isOpen = !this.isOpen;
    },
    addItem: function addItem() {
      this.mutableColumn.data.items.push({
        id: uuid(),
        text: '',
        value: ''
      });
    },
    deleteItem: function deleteItem(index) {
      this.mutableColumn.data.items.splice(index, 1);
    }
  }
};/* script */
var __vue_script__$4 = script$4;
/* template */

var __vue_render__$4 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "card"
  }, [_c('header', {
    staticClass: "card__header"
  }, [_vm._t("header", [_c('div', {
    staticClass: "card__drag"
  }, [_c('Icon', {
    attrs: {
      "icon": "mdi:drag"
    }
  }), _vm._v(" "), _c('span', [_vm._v("#" + _vm._s(_vm.idx + 1))])], 1), _vm._v(" "), _c('div', {
    staticClass: "text-ellipsis"
  }, [_vm._v(_vm._s(_vm.mutableColumn.base.name ? _vm.mutableColumn.base.name : '(請設定欄位名稱)'))]), _vm._v(" "), _c('div', {
    staticClass: "controll"
  }, [_c('div', {
    staticClass: "icon-btn",
    on: {
      "click": _vm.handleOpen
    }
  }, [_c('Icon', {
    attrs: {
      "icon": _vm.isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "icon-btn",
    on: {
      "click": _vm.handleDelete
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "mdi:close-thick"
    }
  })], 1)])], {
    "handleOpen": _vm.handleOpen,
    "isOpen": _vm.isOpen
  })], 2), _vm._v(" "), _c('form', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isOpen,
      expression: "isOpen"
    }],
    staticClass: "card__form",
    attrs: {
      "id": _vm.id
    }
  }, [_c('div', {
    staticClass: "border-top-dashed"
  }, [_c('ColumnSettingBase', _vm._b({
    on: {
      "update": function update($event) {
        _vm.mutableColumn.base = $event;
      }
    }
  }, 'ColumnSettingBase', _vm.mutableColumn.base, false))], 1)])]);
};

var __vue_staticRenderFns__$4 = [];
/* style */

var __vue_inject_styles__$4 = undefined;
/* scoped */

var __vue_scope_id__$4 = undefined;
/* module identifier */

var __vue_module_identifier__$4 = undefined;
/* functional template */

var __vue_is_functional_template__$4 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$4 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$4,
  staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);var script$5 = /*#__PURE__*/{
  name: 'FormSetting',
  components: {
    Draggable: Draggable__default['default'],
    ColumnSetting: __vue_component__$4
  },
  props: {
    columns: {
      type: Array,
      required: true
    },
    handleDelete: {
      type: Function,
      default: null
    }
  },
  emits: ['update'],
  data: function data() {
    return {
      mutableColumns: []
    };
  },
  watch: {
    mutableColumns: {
      handler: function handler(newVal) {
        this.$emit('update', newVal);
      },
      deep: true
    }
  },
  created: function created() {
    var _this = this;

    this.columns.forEach(function (column) {
      _this.mutableColumns.push(_objectSpread2({
        id: uuid()
      }, column));
    });
  },
  methods: {
    handleAdd: function handleAdd() {
      this.mutableColumns.push({
        id: uuid()
      });
    },
    invokeUpdate: function invokeUpdate(idx, newVal) {
      this.$set(this.mutableColumns, idx, _objectSpread2({
        id: this.mutableColumns[idx].id
      }, newVal));
    },
    invokeDelete: function invokeDelete(idx) {
      var _this2 = this;

      var allowFunc = function allowFunc() {
        _this2.mutableColumns.splice(idx, 1);
      };

      if (this.handleDelete) {
        this.handleDelete(idx, allowFunc);
      } else {
        var column = this.mutableColumns[idx];
        var showMsg = "\u78BA\u5B9A\u522A\u9664\u6B04\u4F4D #".concat(idx + 1, " [").concat(column.base.name ? column.base.name : column.id, "] ?");
        if (confirm(showMsg)) allowFunc();
      }
    },
    getColumnTemp: function getColumnTemp() {
      return {
        id: uuid(),
        //欄位識別碼
        info: {
          name: '',
          // 欄位名稱
          label: '',
          // 欄位說明
          subLabel: '',
          // 欄位子說明
          type: '',
          // 欄位屬性
          placeholder: null,
          // 提示文字
          defaultValue: null,
          // 預設值
          autocomplete: null // 自動完成

        },
        // data: {
        //   srcMode: 'list', // 資料來源模式 ['api', 'list']
        //   displayMode: '', // 顯示模式 ['line', 'next', 'bothSide']
        //   // select
        //   api: {
        //     url: '',
        //     textKey: '',
        //     valueKey: '',
        //   },
        //   // select/radio/checkbox
        //   items: [
        //     // { text: '1', value: '1' }
        //   ],
        // },
        // 規則
        rule: {
          required: null,
          // 必填
          minimum: null,
          // 字元下限
          maximum: null,
          // 字元上限
          regex: null,
          // 驗證格式
          sameAs: null,
          // 與..相符
          limit: null // 選擇上限 [多選框選項]

        },
        // 客製化訊息 (取代規則預設訊息)
        msg: {// required: null,
          // minimum: null,
          // maximum: null,
          // regex: null,
          // sameAs: null,
        },
        // 顯示條件
        conditions: [// {
          //   triggerID: 'babyNum',
          //   findOne: ['1', '2', '3', '4'], // 滿足其一
          //   findAll: ['1', '2', '3', '4'], // 滿足全部
          //   // other...
          // },
          // multiple..
        ],
        // 其他檢查設定
        requiredSync: [],
        // 連動必填元素 (如果自身有值，其元素必填)
        requiredCheck: [],
        // 自身必填檢查 (來自其他元素的 requiredSync)
        sameAsReverseCheck: [] // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.sameAs)

      };
    }
  }
};/* script */
var __vue_script__$5 = script$5;
/* template */

var __vue_render__$5 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "form-setting"
  }, [_vm._v("\n  " + _vm._s(_vm.mutableColumns) + "\n  "), _c('Draggable', {
    attrs: {
      "animation": "300",
      "ghost-class": "ghost",
      "handle": ".card__drag"
    },
    model: {
      value: _vm.mutableColumns,
      callback: function callback($$v) {
        _vm.mutableColumns = $$v;
      },
      expression: "mutableColumns"
    }
  }, _vm._l(_vm.mutableColumns, function (column, idx) {
    return _c('ColumnSetting', _vm._b({
      key: column.id,
      attrs: {
        "idx": idx,
        "columns": _vm.mutableColumns
      },
      on: {
        "update": _vm.invokeUpdate,
        "delete": _vm.invokeDelete
      }
    }, 'ColumnSetting', column, false));
  }), 1), _vm._v(" "), _c('button', {
    staticClass: "btn btn--add",
    on: {
      "click": _vm.handleAdd
    }
  }, [_vm._v("✚")])], 1);
};

var __vue_staticRenderFns__$5 = [];
/* style */

var __vue_inject_styles__$5 = undefined;
/* scoped */

var __vue_scope_id__$5 = undefined;
/* module identifier */

var __vue_module_identifier__$5 = undefined;
/* functional template */

var __vue_is_functional_template__$5 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$5 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$5,
  staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, __vue_script__$5, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);//
var script$6 = /*#__PURE__*/{
  name: 'RecordControls',
  components: {
    Icon: __vue_component__$1
  },
  props: {
    recordName: {
      type: String,
      required: true
    },
    recordLimit: {
      type: Number,
      default: 5
    },
    data: {
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
      required: true
    }
  },
  emits: ['update'],
  data: function data() {
    return {
      record: [],
      recordIdx: -1
    };
  },
  computed: {
    hasThis: function hasThis() {
      return this.recordIdx > -1 && this.recordIdx < this.record.length;
    },
    hasPrev: function hasPrev() {
      return this.recordIdx > 0;
    },
    hasNext: function hasNext() {
      return this.recordIdx < this.record.length - 1;
    }
  },
  created: function created() {
    this.getRecord();
  },
  methods: {
    removeRecord: function removeRecord() {
      localStorage.removeItem(this.recordName);
    },
    getRecord: function getRecord() {
      this.record = JSON.parse(localStorage.getItem(this.recordName)) || []; // if (!this.record || !this.record.length) {
      //   this.record = [];
      //   this.addToRecord();
      // }

      this.restoreLast();
    },
    addToRecord: function addToRecord() {
      this.record.push({
        created: new Date().toLocaleString(),
        data: deepCopy(this.data)
      });

      if (this.record.length > this.recordLimit) {
        this.record = this.record.slice(0 - this.recordLimit);
      }

      localStorage.setItem(this.recordName, JSON.stringify(this.record));
      this.restoreLast();
    },
    restoreThis: function restoreThis() {
      this.setTargetInfo(this.recordIdx);
    },
    restorePrev: function restorePrev() {
      this.setTargetInfo(this.recordIdx - 1);
    },
    restoreNext: function restoreNext() {
      this.setTargetInfo(this.recordIdx + 1);
    },
    restoreLast: function restoreLast() {
      this.setTargetInfo(this.record.length - 1);
    },
    setTargetInfo: function setTargetInfo(idx) {
      var temp = idx > -1 && idx < this.record.length ? this.record[idx].data : null;
      if (!temp) return;
      this.recordIdx = idx;
      this.$emit('update', deepCopy(temp));
    }
  }
};/* script */
var __vue_script__$6 = script$6;
/* template */

var __vue_render__$6 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "control-bar"
  }, [_c('button', {
    on: {
      "click": _vm.addToRecord
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "mdi:content-save"
    }
  })], 1), _vm._v(" "), _c('button', {
    attrs: {
      "disabled": !_vm.hasPrev
    },
    on: {
      "click": _vm.restorePrev
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "ri:arrow-go-back-fill"
    }
  })], 1), _vm._v(" "), _c('button', {
    attrs: {
      "disabled": !_vm.hasNext
    },
    on: {
      "click": _vm.restoreNext
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "ri:arrow-go-forward-fill"
    }
  })], 1), _vm._v(" "), _c('button', {
    attrs: {
      "disabled": !_vm.hasThis
    },
    on: {
      "click": _vm.restoreThis
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "mdi:restore"
    }
  })], 1), _vm._v(" "), _c('span', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.hasThis,
      expression: "hasThis"
    }]
  }, [_vm._v("\n    " + _vm._s(_vm.recordIdx + 1) + " / " + _vm._s(_vm.recordLimit) + " 筆 : " + _vm._s(_vm.record[_vm.recordIdx] && _vm.record[_vm.recordIdx].created) + "\n  ")]), _vm._v(" "), _c('div', [_vm._v("(localStorage 紀錄最後 " + _vm._s(_vm.recordLimit) + " 筆存檔)")])]);
};

var __vue_staticRenderFns__$6 = [];
/* style */

var __vue_inject_styles__$6 = undefined;
/* scoped */

var __vue_scope_id__$6 = undefined;
/* module identifier */

var __vue_module_identifier__$6 = undefined;
/* functional template */

var __vue_is_functional_template__$6 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__$6 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$6,
  staticRenderFns: __vue_staticRenderFns__$6
}, __vue_inject_styles__$6, __vue_script__$6, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);var components=/*#__PURE__*/Object.freeze({__proto__:null,FormDemo: __vue_component__,FormSetting: __vue_component__$5,RecordControls: __vue_component__$6});var install = function install(Vue) {
  Object.entries(components).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        componentName = _ref2[0],
        component = _ref2[1];

    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()
var components$1=/*#__PURE__*/Object.freeze({__proto__:null,'default': install,FormDemo: __vue_component__,FormSetting: __vue_component__$5,RecordControls: __vue_component__$6});// only expose one global var, with component exports exposed as properties of
// that global var (eg. plugin.component)

Object.entries(components$1).forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      componentName = _ref2[0],
      component = _ref2[1];

  if (componentName !== 'default') {
    install[componentName] = component;
  }
});return install;})));