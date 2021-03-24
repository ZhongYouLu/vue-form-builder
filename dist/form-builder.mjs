/*!
 * @mk816017/form-builder v1.1.0 | MIT License | git+https://github.com/zhongyoulu/vue-sfc-rollup-demo.git
 * https://unpkg.com/@mk816017/form-builder@1.1.0/dist/form-builder.mjs
 */
import VueSelect from 'vue-select';
import Fuse from 'fuse.js';
import { createPopper } from '@popperjs/core';
import Iconify from '@iconify/iconify';
import Draggable from 'vuedraggable';

// https://github.com/ai/nanoid
const nanoid = (t = 21) => {
  let e = '',
      r = crypto.getRandomValues(new Uint8Array(t));

  for (; t--;) {
    let n = 63 & r[t];
    e += n < 36 ? n.toString(36) : n < 62 ? (n - 26).toString(36).toUpperCase() : n < 63 ? '_' : '-';
  }

  return e;
}; // 千位符

const thousandSeparator = val => {
  if (!val) return val;
  const parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.'); // return Number(val).toLocaleString();
}; // If you use JavaScript according to ECMAScript 2020 or later, see optional chaining.

const deepCopy = obj => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
}; // obj Array 轉 obj

const arr2ObjByKey = (arr, key = 'id') => {
  return arr.reduce((acc, obj) => {
    const v = obj[key];
    if (!v) return acc;
    acc[v] = acc[v] ? { ...acc[v],
      ...obj
    } : obj;
    return acc;
  }, {});
}; // nested obj 轉 key-value pairs

const nested2Pairs = (obj, propKey) => {
  return Object.entries(obj).reduce((acc, [k, v]) => ({ ...acc,
    [k]: v[propKey]
  }), {});
}; // key-value pairs 轉 obj Array

const pairs2Arr = (obj, vKey, kKey = 'id') => {
  return Object.entries(obj).reduce((acc, [k, v]) => acc.concat({
    [kKey]: k,
    [vKey]: v
  }), []);
}; // obj 轉 obj Array
function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true; // it's a number

  if (typeof obj === 'number') return false; // Assume if it has a length property with a non-zero value
  // that that property is correct.

  if (obj.length > 0) return false;
  if (obj.length === 0) return true; // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.

  if (typeof obj !== 'object') return true; // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9

  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}
function clearEmpties(obj) {
  Object.entries(obj).forEach(([key, val]) => val && typeof val === 'object' && clearEmpties(val) || val && val instanceof File || (val == null || val === '') && delete obj[key]);
  return isEmpty(obj) ? null : obj;
} // eslint-disable-next-line no-unused-vars
function arrRemoveValue(arr, val) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => item !== val);
}
function arrRemoveValues(arr, valArr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => !valArr.includes(item));
}
function arrRemoveValueByKey(arr, key, val) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(obj => obj[key] !== val);
}
function arrRemoveValuesByKey(arr, key, valArr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(obj => !valArr.includes(obj[key]));
}
function arrRemoveByIdx(arr, idx) {
  if (idx === -1) return arr;
  const length = arr.length;

  if (idx === 0) {
    arr = arr.slice(1);
  } else if (idx === length - 1) {
    arr = arr.slice(0, length - 1);
  } else {
    arr = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
  }

  return arr;
}
function arrRemoveItemByKey(arr, key, val) {
  if (!Array.isArray(arr)) return arr;
  const idx = arr.findIndex(obj => obj[key] === val);
  return arrRemoveByIdx(arr, idx);
}
function arrUpdateItemByKey(arr, key, val, newObj) {
  if (!Array.isArray(arr)) return arr;
  const idx = arr.findIndex(obj => obj[key] === val);
  return idx >= 0 ? [...arr.slice(0, idx), { ...arr[idx],
    ...newObj
  }, ...arr.slice(idx + 1)] : arr;
}
const difference = (arr1, arr2) => arr1.filter(x => !arr2.includes(x));

//
var script$q = /*#__PURE__*/{
  name: 'FormMainLogic',

  provide() {
    return {
      collect: this.collect,
      setCollect: this.setCollect,
      toggleCollect: this.toggleCollect,
      typeOptions: this.typeOptions,
      typeIcons: this.typeIcons,
      getTypeConstraint: this.getTypeConstraint,
      convertOptions: this.convertOptions
    };
  },

  inject: [// 控制對話框 (可選)
  'handleConfirm'],
  props: {
    // 欄位群
    columns: {
      type: Array,
      required: true
    }
  },
  emits: ['update:columns'],

  data() {
    return {
      collect: {}
    };
  },

  computed: {
    // 最終欄位群 (去除不必要的屬性)
    finalColumns() {
      return this.columns.map(column => Object.entries(column).reduce((acc, [k, v]) => {
        if (isEmpty(v)) return acc;

        if (k === 'rule') {
          const {
            msg,
            ...newRule
          } = v;

          if (msg) {
            const newMsg = Object.entries(msg).reduce((acc, [k, v]) => {
              if (v && newRule[k]) acc[k] = v;
              return acc;
            }, {});
            if (!isEmpty(newMsg)) newRule['msg'] = newMsg;
          }

          v = newRule;
        } else if (k === 'data') {
          const {
            items,
            api,
            ...newItem
          } = v;

          switch (newItem.srcMode) {
            case 'api':
              newItem['api'] = api;
              break;

            case 'list':
              newItem['items'] = items;
              break;
          }

          v = newItem;
        } else if (k === 'condition') {
          // TODO:
          console.log(k, v);
        }

        if (!isEmpty(v)) acc[k] = v;
        return acc;
      }, {}));
    },

    typeConfig() {
      // https://www.w3schools.com/tags/tag_input.asp
      return {
        text: {
          text: '文字框',
          icon: 'carbon:string-text'
        },
        number: {
          text: '數字框',
          icon: 'carbon:string-integer'
        },
        date: {
          text: '日期框',
          icon: 'carbon:calendar'
        },
        radio: {
          text: '單選框',
          icon: 'carbon:radio-button-checked'
        },
        checkbox: {
          text: '複選框',
          icon: 'carbon:checkbox-checked'
        },
        select: {
          text: '下拉選單',
          icon: 'carbon:list'
        },
        file: {
          text: '檔案',
          icon: 'ic:baseline-attach-file'
        } // ------------------
        // password: { text: '密碼框', icon: 'carbon:password' },
        // email: { text: '電子郵件輸入欄位', icon: '' },
        // date: { text: '日期輸入欄位', icon: '' },
        // tel: { text: '電話號碼輸入欄位', icon: '' },
        // url: { text: '網址輸入欄位', icon: '' },
        // file: { text: '檔案上傳', icon: '' },

      };
    },

    typeOptions() {
      return this.convertOptions(nested2Pairs(this.typeConfig, 'text'));
    },

    typeIcons() {
      return { ...nested2Pairs(this.typeConfig, 'icon'),
        undefined: 'carbon:unknown'
      };
    }

  },
  // 監聽連動 [Side Effect]
  watch: {
    columns(a, b) {
      const diffIds = difference(a.map(c => c.id), Object.keys(this.collect));

      if (diffIds.length) {
        diffIds.map(id => {
          this.$set(this.collect, id, {});
        });
      } // 減少


      const deductIds = difference(b.map(c => c.id), a.map(c => c.id));

      if (deductIds.length) {
        a.forEach(c => {
          // 如果有規則
          if (c.rule) {
            // 與...相符
            if (deductIds.includes(c.rule.sameAs)) c.rule.sameAs = null;
          } // 如果有條件


          if (c.condition) {
            // 連動必填
            c.condition.requiredSync = arrRemoveValues(c.condition.requiredSync, deductIds); // 顯示

            c.condition.display = arrRemoveValuesByKey(c.condition.display, 'triggerID', deductIds);
          }
        });
      }
    }

  },
  methods: {
    convertOptions(obj) {
      return pairs2Arr(obj, 'text', 'value');
    },

    getTypeConstraint(type) {
      return {
        isText: type === 'text',
        isNumber: type === 'number',
        isDate: type === 'date',
        isCheckbox: type === 'checkbox',
        isFile: type === 'file',
        isInput: ['text', 'number', 'date'].includes(type),
        needItems: ['select', 'radio', 'checkbox'].includes(type),
        filterSame: columns => columns.filter(c => c.type === type)
      };
    },

    // 更新欄位群
    emitUpdate(newColumns, note) {
      console.log(`${note && `[${note}] `}update:columns`, newColumns);
      const cleanColumns = newColumns.map(c => clearEmpties(c));
      this.$emit('update:columns', cleanColumns);
    },

    // 呼叫更新欄位群
    invokeUpdateColumns(newColumns) {
      this.emitUpdate(newColumns, 'invokeUpdateColumns');
    },

    // 呼叫新增欄位
    invokeAdd() {
      const emptyColumn = {
        id: nanoid(6)
      };
      const newColumns = this.columns.concat(emptyColumn);
      this.emitUpdate(newColumns, 'invokeAdd');
    },

    // 呼叫更新欄位
    invokeUpdate(id, newColumn) {
      const newColumns = arrUpdateItemByKey(this.columns, 'id', id, newColumn);
      this.emitUpdate(newColumns, 'invokeUpdate');
    },

    // 呼叫刪除欄位
    invokeRemove(id) {
      // 確認刪除函式
      const allowFunc = () => {
        const newColumns = arrRemoveValueByKey(this.columns, 'id', id);
        this.emitUpdate(newColumns, 'invokeRemove');
      };

      const idx = this.columns.findIndex(c => c.id === id);
      const {
        name
      } = this.columns[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${name || id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },

    checkCollect(columnId, key) {
      if (this.collect[columnId][key] === undefined) {
        this.$set(this.collect[columnId], key, null);
      }
    },

    toggleCollect(columnId, key) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = !this.collect[columnId][key];
    },

    setCollect(columnId, key, val) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = val;
    }

  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

/* script */
const __vue_script__$q = script$q;
/* template */

var __vue_render__$q = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', [_vm._t("default", null, {
    "columns": _vm.columns,
    "finalColumns": _vm.finalColumns,
    "invokeUpdateColumns": _vm.invokeUpdateColumns,
    "invokeAdd": _vm.invokeAdd,
    "invokeUpdate": _vm.invokeUpdate,
    "invokeRemove": _vm.invokeRemove
  })], 2);
};

var __vue_staticRenderFns__$q = [];
/* style */

const __vue_inject_styles__$q = undefined;
/* scoped */

const __vue_scope_id__$q = undefined;
/* module identifier */

const __vue_module_identifier__$q = undefined;
/* functional template */

const __vue_is_functional_template__$q = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$q = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$q,
  staticRenderFns: __vue_staticRenderFns__$q
}, __vue_inject_styles__$q, __vue_script__$q, __vue_scope_id__$q, __vue_is_functional_template__$q, __vue_module_identifier__$q, false, undefined, undefined, undefined);

//
var script$p = /*#__PURE__*/{
  name: 'Icon',
  props: {
    icon: {
      type: String,
      required: true
    },
    isBtn: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    icon: 'updateIcon'
  },

  mounted() {
    this.updateIcon(this.icon);
  },

  methods: {
    async updateIcon(icon) {
      await this.$nextTick();
      this.$refs.el.textContent = '';
      const temp = Iconify.default ? Iconify.default : Iconify;
      const svg = icon ? temp.renderSVG(icon, {}) : null;

      if (svg) {
        this.$refs.el.appendChild(svg);
      } else {
        const span = document.createElement('span');
        span.className = 'iconify';

        if (icon) {
          span.dataset.icon = icon;
        }

        this.$refs.el.appendChild(span);
      }
    }

  }
};

/* script */
const __vue_script__$p = script$p;
/* template */

var __vue_render__$p = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('span', {
    ref: "el",
    staticClass: "icon",
    class: {
      'icon--btn': _vm.isBtn
    },
    on: {
      "click": function ($event) {
        $event.preventDefault();
        return _vm.$emit('click');
      }
    }
  });
};

var __vue_staticRenderFns__$p = [];
/* style */

const __vue_inject_styles__$p = undefined;
/* scoped */

const __vue_scope_id__$p = undefined;
/* module identifier */

const __vue_module_identifier__$p = undefined;
/* functional template */

const __vue_is_functional_template__$p = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$p = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$p,
  staticRenderFns: __vue_staticRenderFns__$p
}, __vue_inject_styles__$p, __vue_script__$p, __vue_scope_id__$p, __vue_is_functional_template__$p, __vue_module_identifier__$p, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$o = /*#__PURE__*/{
  name: 'FieldText',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    },
    // The size attribute specifies the width (in characters) of an input field
    maxlength: {
      type: Number,
      default: null
    } // The maxlength attribute specifies the maximum number of characters allowed in an input field

  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    }
  }
};

/* script */
const __vue_script__$o = script$o;
/* template */

var __vue_render__$o = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "input"
  }, [_c('input', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model.trim",
      value: _vm.mutableValue,
      expression: "mutableValue",
      modifiers: {
        "trim": true
      }
    }],
    attrs: {
      "type": "text",
      "maxlength": _vm.maxlength
    },
    domProps: {
      "value": _vm.mutableValue
    },
    on: {
      "input": function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.mutableValue = $event.target.value.trim();
      },
      "blur": function ($event) {
        return _vm.$forceUpdate();
      }
    }
  }, 'input', _vm.$attrs, false))]);
};

var __vue_staticRenderFns__$o = [];
/* style */

const __vue_inject_styles__$o = undefined;
/* scoped */

const __vue_scope_id__$o = undefined;
/* module identifier */

const __vue_module_identifier__$o = undefined;
/* functional template */

const __vue_is_functional_template__$o = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$o = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$o,
  staticRenderFns: __vue_staticRenderFns__$o
}, __vue_inject_styles__$o, __vue_script__$o, __vue_scope_id__$o, __vue_is_functional_template__$o, __vue_module_identifier__$o, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$n = /*#__PURE__*/{
  name: 'FieldNumber',
  inheritAttrs: false,
  props: {
    value: {
      type: Number,
      default: null
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    step: {
      type: Number,
      default: null
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    }
  }
};

/* script */
const __vue_script__$n = script$n;
/* template */

var __vue_render__$n = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "input"
  }, [_c('input', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model.number",
      value: _vm.mutableValue,
      expression: "mutableValue",
      modifiers: {
        "number": true
      }
    }],
    attrs: {
      "type": "number",
      "min": _vm.min,
      "max": _vm.max,
      "step": _vm.step
    },
    domProps: {
      "value": _vm.mutableValue
    },
    on: {
      "input": function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.mutableValue = _vm._n($event.target.value);
      },
      "blur": function ($event) {
        return _vm.$forceUpdate();
      }
    }
  }, 'input', _vm.$attrs, false))]);
};

var __vue_staticRenderFns__$n = [];
/* style */

const __vue_inject_styles__$n = undefined;
/* scoped */

const __vue_scope_id__$n = undefined;
/* module identifier */

const __vue_module_identifier__$n = undefined;
/* functional template */

const __vue_is_functional_template__$n = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$n = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$n,
  staticRenderFns: __vue_staticRenderFns__$n
}, __vue_inject_styles__$n, __vue_script__$n, __vue_scope_id__$n, __vue_is_functional_template__$n, __vue_module_identifier__$n, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$m = /*#__PURE__*/{
  name: 'FieldDate',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: null
    },
    min: {
      type: String,
      default: null
    },
    max: {
      type: String,
      default: null
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    }
  }
};

/* script */
const __vue_script__$m = script$m;
/* template */

var __vue_render__$m = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "input"
  }, [_c('input', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model.trim",
      value: _vm.mutableValue,
      expression: "mutableValue",
      modifiers: {
        "trim": true
      }
    }],
    attrs: {
      "type": "date",
      "min": _vm.min,
      "max": _vm.max
    },
    domProps: {
      "value": _vm.mutableValue
    },
    on: {
      "input": function ($event) {
        if ($event.target.composing) {
          return;
        }

        _vm.mutableValue = $event.target.value.trim();
      },
      "blur": function ($event) {
        return _vm.$forceUpdate();
      }
    }
  }, 'input', _vm.$attrs, false))]);
};

var __vue_staticRenderFns__$m = [];
/* style */

const __vue_inject_styles__$m = undefined;
/* scoped */

const __vue_scope_id__$m = undefined;
/* module identifier */

const __vue_module_identifier__$m = undefined;
/* functional template */

const __vue_is_functional_template__$m = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$m = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$m,
  staticRenderFns: __vue_staticRenderFns__$m
}, __vue_inject_styles__$m, __vue_script__$m, __vue_scope_id__$m, __vue_is_functional_template__$m, __vue_module_identifier__$m, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$l = /*#__PURE__*/{
  name: 'RadioRow'
};

/* script */
const __vue_script__$l = script$l;
/* template */

var __vue_render__$l = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "radio-row"
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$l = [];
/* style */

const __vue_inject_styles__$l = undefined;
/* scoped */

const __vue_scope_id__$l = undefined;
/* module identifier */

const __vue_module_identifier__$l = undefined;
/* functional template */

const __vue_is_functional_template__$l = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$l = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$l,
  staticRenderFns: __vue_staticRenderFns__$l
}, __vue_inject_styles__$l, __vue_script__$l, __vue_scope_id__$l, __vue_is_functional_template__$l, __vue_module_identifier__$l, false, undefined, undefined, undefined);

//
var script$k = /*#__PURE__*/{
  name: 'FieldRadio',
  components: {
    RadioRow: __vue_component__$l
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    textKey: {
      type: String,
      default: 'text'
    },
    valueKey: {
      type: String,
      default: 'value'
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    }
  }
};

/* script */
const __vue_script__$k = script$k;
/* template */

var __vue_render__$k = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('RadioRow', _vm._l(_vm.options, function (option) {
    return _c('label', {
      key: option[_vm.valueKey]
    }, [_c('input', _vm._b({
      directives: [{
        name: "model",
        rawName: "v-model",
        value: _vm.mutableValue,
        expression: "mutableValue"
      }],
      attrs: {
        "type": "radio"
      },
      domProps: {
        "value": option[_vm.valueKey],
        "checked": _vm._q(_vm.mutableValue, option[_vm.valueKey])
      },
      on: {
        "change": function ($event) {
          _vm.mutableValue = option[_vm.valueKey];
        }
      }
    }, 'input', _vm.$attrs, false)), _vm._v(" "), _c('span', [_vm._v(_vm._s(option[_vm.textKey]))])]);
  }), 0);
};

var __vue_staticRenderFns__$k = [];
/* style */

const __vue_inject_styles__$k = undefined;
/* scoped */

const __vue_scope_id__$k = undefined;
/* module identifier */

const __vue_module_identifier__$k = undefined;
/* functional template */

const __vue_is_functional_template__$k = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$k = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$k,
  staticRenderFns: __vue_staticRenderFns__$k
}, __vue_inject_styles__$k, __vue_script__$k, __vue_scope_id__$k, __vue_is_functional_template__$k, __vue_module_identifier__$k, false, undefined, undefined, undefined);

//
var script$j = /*#__PURE__*/{
  name: 'FieldCheckbox',
  components: {
    RadioRow: __vue_component__$l
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    yes: {
      type: [String, Number, Boolean],
      default: 1
    },
    no: {
      type: [String, Number, Boolean],
      default: 0
    },
    text: {
      type: String,
      default: 'Yes'
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(val) {
        this.$emit('input', val);
      }

    }
  }
};

/* script */
const __vue_script__$j = script$j;
/* template */

var __vue_render__$j = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('RadioRow', [_c('label', [_c('input', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.mutableValue,
      expression: "mutableValue"
    }],
    attrs: {
      "type": "checkbox",
      "true-value": _vm.yes,
      "false-value": _vm.no
    },
    domProps: {
      "checked": Array.isArray(_vm.mutableValue) ? _vm._i(_vm.mutableValue, null) > -1 : _vm._q(_vm.mutableValue, _vm.yes)
    },
    on: {
      "change": function ($event) {
        var $$a = _vm.mutableValue,
            $$el = $event.target,
            $$c = $$el.checked ? _vm.yes : _vm.no;

        if (Array.isArray($$a)) {
          var $$v = null,
              $$i = _vm._i($$a, $$v);

          if ($$el.checked) {
            $$i < 0 && (_vm.mutableValue = $$a.concat([$$v]));
          } else {
            $$i > -1 && (_vm.mutableValue = $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
          }
        } else {
          _vm.mutableValue = $$c;
        }
      }
    }
  }, 'input', _vm.$attrs, false)), _vm._v(" "), _c('span', [_vm._v(_vm._s(_vm.text))])])]);
};

var __vue_staticRenderFns__$j = [];
/* style */

const __vue_inject_styles__$j = undefined;
/* scoped */

const __vue_scope_id__$j = undefined;
/* module identifier */

const __vue_module_identifier__$j = undefined;
/* functional template */

const __vue_is_functional_template__$j = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$j = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$j,
  staticRenderFns: __vue_staticRenderFns__$j
}, __vue_inject_styles__$j, __vue_script__$j, __vue_scope_id__$j, __vue_is_functional_template__$j, __vue_module_identifier__$j, false, undefined, undefined, undefined);

//
var script$i = /*#__PURE__*/{
  name: 'FieldCheckboxMulti',
  components: {
    RadioRow: __vue_component__$l
  },
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    textKey: {
      type: String,
      default: 'text'
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: -1
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(val) {
        this.$emit('input', val);
      }

    }
  }
};

/* script */
const __vue_script__$i = script$i;
/* template */

var __vue_render__$i = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('RadioRow', _vm._l(_vm.options, function (option) {
    return _c('label', {
      key: option[_vm.valueKey]
    }, [_c('input', _vm._b({
      directives: [{
        name: "model",
        rawName: "v-model",
        value: _vm.mutableValue,
        expression: "mutableValue"
      }],
      attrs: {
        "type": "checkbox",
        "disabled": _vm.disabled || _vm.limit > -1 && _vm.value.length === _vm.limit && !_vm.value.includes(option[_vm.valueKey])
      },
      domProps: {
        "value": option[_vm.valueKey],
        "checked": Array.isArray(_vm.mutableValue) ? _vm._i(_vm.mutableValue, option[_vm.valueKey]) > -1 : _vm.mutableValue
      },
      on: {
        "change": function ($event) {
          var $$a = _vm.mutableValue,
              $$el = $event.target,
              $$c = $$el.checked ? true : false;

          if (Array.isArray($$a)) {
            var $$v = option[_vm.valueKey],
                $$i = _vm._i($$a, $$v);

            if ($$el.checked) {
              $$i < 0 && (_vm.mutableValue = $$a.concat([$$v]));
            } else {
              $$i > -1 && (_vm.mutableValue = $$a.slice(0, $$i).concat($$a.slice($$i + 1)));
            }
          } else {
            _vm.mutableValue = $$c;
          }
        }
      }
    }, 'input', _vm.$attrs, false)), _vm._v(" "), _c('span', [_vm._v(_vm._s(option[_vm.textKey] || "(" + option[_vm.valueKey] + ")"))])]);
  }), 0);
};

var __vue_staticRenderFns__$i = [];
/* style */

const __vue_inject_styles__$i = undefined;
/* scoped */

const __vue_scope_id__$i = undefined;
/* module identifier */

const __vue_module_identifier__$i = undefined;
/* functional template */

const __vue_is_functional_template__$i = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$i = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$i,
  staticRenderFns: __vue_staticRenderFns__$i
}, __vue_inject_styles__$i, __vue_script__$i, __vue_scope_id__$i, __vue_is_functional_template__$i, __vue_module_identifier__$i, false, undefined, undefined, undefined);

//
var script$h = /*#__PURE__*/{
  name: 'FieldSelect',
  components: {
    VueSelect
  },
  inheritAttrs: false,
  props: {
    // https://vue-select.org/api/props.html#options
    value: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    // ---------------------------------------------
    textKey: {
      type: String,
      default: 'text'
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    selectable: {
      type: Function,
      default: null
    },
    // 是否可選處理
    reduce: {
      type: Function,
      default: null
    },
    // 轉換對象處理 (傳遞給 v-model binding 或 @input event.)
    getOptionLabel: {
      type: Function,
      default: null
    },
    // 生成項目文字處理
    resetOnOptionsChange: {
      type: [Function, Boolean],
      default: false
    },
    // 項目更新是否重置所選值處理
    // ---------------------------------------------
    clearable: {
      type: Boolean,
      default: false
    },
    // 是否可清除所選
    searchable: {
      type: Boolean,
      default: false
    },
    // 是否可查詢項目
    // ---------------------------------------------
    filterable: {
      type: Boolean,
      default: true
    },
    // When true, existing options will be filtered by the search text. Should not be used in conjunction with taggable.
    fuseKeys: {
      type: Array,
      default: () => ['name']
    },
    // 模糊查詢欄位
    // ---------------------------------------------
    taggable: {
      type: Boolean,
      default: false
    },
    // Enable/disable creating options from searchInput.
    pushTags: {
      type: Boolean,
      default: false
    },
    // When true, newly created tags will be added to the options list.
    createOption: {
      type: Function,
      default: null
    },
    // User defined function for adding Options
    optionCreatedFlag: {
      type: Boolean,
      default: false
    },
    // ---------------------------------------------
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    // Close a dropdown when an option is chosen. Set to false to keep the dropdown open
    noDrop: {
      type: Boolean,
      default: false
    } // Disable the dropdown entirely.

  },
  emits: ['input'],

  data() {
    return {
      placement: 'bottom'
    };
  },

  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    },

    mutableOptions() {
      return this.options;
    },

    tempSelectable() {
      if (this.selectable !== null) return this.selectable; // multiple

      if (this.multiple) return option => !(this.value || []).includes(option[this.valueKey]); // default

      return () => true;
    },

    tempReduce() {
      if (this.reduce !== null) return this.reduce; // default

      return option => option[this.valueKey];
    },

    tempGetOptionLabel() {
      // Label text is used for filtering comparison and displaying.
      // If you only need to adjust the display, you should use the option and selected-option slots.
      if (this.getOptionLabel !== null) return this.getOptionLabel; // default

      return option => option[this.textKey] || `(${option[this.valueKey]})`;
    },

    tempCreatedOption() {
      if (this.createOption !== null) return this.createOption;
      return option => {
        const newOption = {
          [this.valueKey]: nanoid(6),
          [this.textKey]: option
        };
        console.log('tempCreatedOption', newOption);
        return newOption; // return option;
      };
    },

    fuseSearch() {
      if (!this.filterable || !this.searchable) return null;
      return (options, search) => {
        const fuse = new Fuse(options, {
          keys: this.fuseKeys,
          shouldSort: true
        });
        return search.length ? fuse.search(search).map(({
          item
        }) => item) : fuse.list;
      };
    }

  },
  methods: {
    handleInput(v) {
      console.log('handleInput', v);
      this.mutableValue = v;
    },

    optionSelected(option) {
      console.log('optionSelected', option); // this.mutableValue = option[this.valueKey];
    },

    optionCreated(option) {
      console.log('optionCreated', option);

      if (this.optionCreatedFlag) {
        // const newOption = { [this.valueKey]: nanoid(6), ...option };
        this.mutableOptions.push(option); // console.log(this.mutableOptions.length);
        // this.$nextTick(function () {
        //   this.mutableValue = newOption[this.valueKey];
        // });
      }
    },

    withPopper(dropdownList, component, {
      width
    }) {
      /**
       * We need to explicitly define the dropdown width since
       * it is usually inherited from the parent with CSS.
       */
      dropdownList.style.width = width;
      /**
       * Here we position the dropdownList relative to the $refs.toggle Element.
       *
       * The 'offset' modifier aligns the dropdown so that the $refs.toggle and
       * the dropdownList overlap by 1 pixel.
       *
       * The 'toggleClass' modifier adds a 'drop-up' class to the Vue Select
       * wrapper so that we can set some styles for when the dropdown is placed
       * above.
       */

      const popper = createPopper(component.$refs.toggle, dropdownList, {
        placement: this.placement,
        modifiers: [{
          name: 'offset',
          options: {
            offset: [0, -1]
          }
        }, {
          name: 'toggleClass',
          enabled: true,
          phase: 'write',

          fn({
            state
          }) {
            component.$el.classList.toggle('drop-up', state.placement === 'top');
          }

        }]
      });
      /**
       * To prevent memory leaks Popper needs to be destroyed.
       * If you return function, it will be called just before dropdown is removed from DOM.
       */

      return () => popper.destroy();
    }

  }
};

/* script */
const __vue_script__$h = script$h;
/* template */

var __vue_render__$h = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('VueSelect', {
    attrs: {
      "value": _vm.mutableValue,
      "options": _vm.mutableOptions,
      "placeholder": _vm.placeholder,
      "autocomplete": _vm.autocomplete,
      "disabled": _vm.disabled,
      "multiple": _vm.multiple,
      "label": _vm.textKey,
      "selectable": _vm.tempSelectable,
      "reduce": _vm.tempReduce,
      "get-option-label": _vm.tempGetOptionLabel,
      "reset-on-options-change": _vm.resetOnOptionsChange,
      "clearable": _vm.clearable,
      "searchable": _vm.searchable,
      "filterable": _vm.filterable,
      "filter": _vm.fuseSearch,
      "taggable": _vm.taggable,
      "push-tags": _vm.pushTags,
      "create-option": _vm.tempCreatedOption,
      "close-on-select": _vm.closeOnSelect,
      "no-drop": _vm.noDrop,
      "append-to-body": true,
      "calculate-position": _vm.withPopper
    },
    on: {
      "input": _vm.handleInput,
      "option:selected": _vm.optionSelected,
      "option:created": _vm.optionCreated
    },
    scopedSlots: _vm._u([_vm.required ? {
      key: "search",
      fn: function (ref) {
        var attributes = ref.attributes;
        var events = ref.events;
        return [_c('input', _vm._g(_vm._b({
          staticClass: "vs__search",
          attrs: {
            "required": !_vm.mutableValue
          }
        }, 'input', attributes, false), events))];
      }
    } : null, {
      key: "selected-option",
      fn: function (option) {
        return [_c('h6', [_vm._v(_vm._s(option))]), _vm._v("\n    " + _vm._s(option[_vm.textKey] || "(" + option[_vm.valueKey] + ")") + "\n  ")];
      }
    }, {
      key: "option",
      fn: function (option) {
        return [_vm._v("\n    " + _vm._s(option) + "\n  ")];
      }
    }, _vm.searchable ? {
      key: "no-options",
      fn: function (ref) {
        var search = ref.search;
        var searching = ref.searching;
        return [searching ? [_vm._v("\n      查無\n      "), _c('em', [_vm._v(_vm._s(search))]), _vm._v(" 相關.\n    ")] : _c('em', {
          staticStyle: {
            "opacity": "0.5"
          }
        }, [_vm._v("開始嘗試搜尋欄位")])];
      }
    } : null, _vm._l(_vm.$scopedSlots, function (_, slot) {
      return {
        key: slot,
        fn: function (props) {
          return [_vm._t(slot, null, null, props)];
        }
      };
    })], null, true)
  });
};

var __vue_staticRenderFns__$h = [];
/* style */

const __vue_inject_styles__$h = undefined;
/* scoped */

const __vue_scope_id__$h = undefined;
/* module identifier */

const __vue_module_identifier__$h = undefined;
/* functional template */

const __vue_is_functional_template__$h = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$h = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$h,
  staticRenderFns: __vue_staticRenderFns__$h
}, __vue_inject_styles__$h, __vue_script__$h, __vue_scope_id__$h, __vue_is_functional_template__$h, __vue_module_identifier__$h, false, undefined, undefined, undefined);

//
//
//
//
//
//
var script$g = /*#__PURE__*/{
  name: 'FieldFile',
  inheritAttrs: false,
  props: {
    value: {
      type: [Object, FileList],
      default: null
    },
    multiple: {
      type: Boolean,
      default: null
    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        this.$emit('input', value);
      }

    }
  },
  methods: {
    previewFiles(event) {
      console.log(event.target.files);
      this.mutableValue = event.target.files;
    }

  }
};

/* script */
const __vue_script__$g = script$g;
/* template */

var __vue_render__$g = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "input"
  }, [_c('input', _vm._b({
    attrs: {
      "type": "file",
      "multiple": _vm.multiple
    },
    on: {
      "change": _vm.previewFiles
    }
  }, 'input', _vm.$attrs, false))]);
};

var __vue_staticRenderFns__$g = [];
/* style */

const __vue_inject_styles__$g = undefined;
/* scoped */

const __vue_scope_id__$g = undefined;
/* module identifier */

const __vue_module_identifier__$g = undefined;
/* functional template */

const __vue_is_functional_template__$g = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$g = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$g,
  staticRenderFns: __vue_staticRenderFns__$g
}, __vue_inject_styles__$g, __vue_script__$g, __vue_scope_id__$g, __vue_is_functional_template__$g, __vue_module_identifier__$g, false, undefined, undefined, undefined);

//
var script$f = /*#__PURE__*/{
  name: 'Field',
  components: {
    FieldText: __vue_component__$o,
    FieldNumber: __vue_component__$n,
    FieldDate: __vue_component__$m,
    FieldRadio: __vue_component__$k,
    FieldCheckbox: __vue_component__$j,
    FieldCheckboxMulti: __vue_component__$i,
    FieldSelect: __vue_component__$h,
    FieldFile: __vue_component__$g
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    default: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    type: {
      type: String,
      default: 'text',

      validator(value) {
        return ['text', 'number', 'date', 'radio', 'checkbox', 'checkbox-multi', 'select', 'file'].includes(value);
      }

    }
  },
  emits: ['input'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },

      set(value) {
        console.log('mutableValue', value);
        this.$emit('input', value);
      }

    }
  },

  created() {
    if (this.default != null && this.mutableValue == null) {
      this.mutableValue = this.default;
    }
  }

};

/* script */
const __vue_script__$f = script$f;
/* template */

var __vue_render__$f = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "field"
  }, [_c("field-" + _vm.type, _vm._b({
    tag: "component",
    scopedSlots: _vm._u([_vm._l(_vm.$scopedSlots, function (_, slot) {
      return {
        key: slot,
        fn: function (props) {
          return [_vm._t(slot, null, null, props)];
        }
      };
    })], null, true),
    model: {
      value: _vm.mutableValue,
      callback: function ($$v) {
        _vm.mutableValue = $$v;
      },
      expression: "mutableValue"
    }
  }, 'component', _vm.$attrs, false))], 1);
};

var __vue_staticRenderFns__$f = [];
/* style */

const __vue_inject_styles__$f = undefined;
/* scoped */

const __vue_scope_id__$f = undefined;
/* module identifier */

const __vue_module_identifier__$f = undefined;
/* functional template */

const __vue_is_functional_template__$f = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$f = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$f,
  staticRenderFns: __vue_staticRenderFns__$f
}, __vue_inject_styles__$f, __vue_script__$f, __vue_scope_id__$f, __vue_is_functional_template__$f, __vue_module_identifier__$f, false, undefined, undefined, undefined);

//
var script$e = /*#__PURE__*/{
  name: 'IconRow',
  components: {
    Icon: __vue_component__$p
  },
  props: {
    icon: {
      type: String,
      required: true
    }
  }
};

/* script */
const __vue_script__$e = script$e;
/* template */

var __vue_render__$e = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "icon-row"
  }, [_vm._t("default"), _vm._v(" "), _c('Icon', {
    attrs: {
      "icon": _vm.icon
    }
  })], 2);
};

var __vue_staticRenderFns__$e = [];
/* style */

const __vue_inject_styles__$e = undefined;
/* scoped */

const __vue_scope_id__$e = undefined;
/* module identifier */

const __vue_module_identifier__$e = undefined;
/* functional template */

const __vue_is_functional_template__$e = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$e = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$e,
  staticRenderFns: __vue_staticRenderFns__$e
}, __vue_inject_styles__$e, __vue_script__$e, __vue_scope_id__$e, __vue_is_functional_template__$e, __vue_module_identifier__$e, false, undefined, undefined, undefined);

//
var script$d = /*#__PURE__*/{
  name: 'InputRow',
  components: {
    Field: __vue_component__$f
  },
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  emits: ['input']
};

/* script */
const __vue_script__$d = script$d;
/* template */

var __vue_render__$d = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c(_vm.$props.multiple ? 'div' : 'label', {
    tag: "component",
    class: ['input-row', {
      required: _vm.required
    }]
  }, [_c('div', {
    staticClass: "for"
  }, [_vm._t("label-left"), _vm._v(" "), _c('p', [_vm._v(_vm._s(_vm.label))]), _vm._v(" "), _vm._t("label-right")], 2), _vm._v(" "), _c('Field', _vm._b({
    attrs: {
      "multiple": _vm.multiple,
      "required": _vm.required
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('input', $event);
      }
    },
    scopedSlots: _vm._u([_vm._l(_vm.$scopedSlots, function (_, slot) {
      return {
        key: slot,
        fn: function (props) {
          return [_vm._t(slot, null, null, props)];
        }
      };
    })], null, true)
  }, 'Field', _vm.$attrs, false))], 1);
};

var __vue_staticRenderFns__$d = [];
/* style */

const __vue_inject_styles__$d = undefined;
/* scoped */

const __vue_scope_id__$d = undefined;
/* module identifier */

const __vue_module_identifier__$d = undefined;
/* functional template */

const __vue_is_functional_template__$d = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$d = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$d,
  staticRenderFns: __vue_staticRenderFns__$d
}, __vue_inject_styles__$d, __vue_script__$d, __vue_scope_id__$d, __vue_is_functional_template__$d, __vue_module_identifier__$d, false, undefined, undefined, undefined);

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
//
//
//
//
//
//
//
var script$c = /*#__PURE__*/{
  name: 'Card'
};

/* script */
const __vue_script__$c = script$c;
/* template */

var __vue_render__$c = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "card"
  }, [!!_vm.$slots.cardHeader || !!_vm.$scopedSlots.cardHeader ? _c('header', {
    staticClass: "card__header"
  }, [_vm._t("cardHeader")], 2) : _vm._e(), _vm._v(" "), !!_vm.$slots.cardMain || !!_vm.$scopedSlots.cardMain ? _c('main', {
    staticClass: "card__main"
  }, [_vm._t("cardMain")], 2) : _vm._e(), _vm._v(" "), !!_vm.$slots.cardFooter || !!_vm.$scopedSlots.cardFooter ? _c('footer', {
    staticClass: "card__footer"
  }, [_vm._t("cardFooter")], 2) : _vm._e()]);
};

var __vue_staticRenderFns__$c = [];
/* style */

const __vue_inject_styles__$c = undefined;
/* scoped */

const __vue_scope_id__$c = undefined;
/* module identifier */

const __vue_module_identifier__$c = undefined;
/* functional template */

const __vue_is_functional_template__$c = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$c = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$c,
  staticRenderFns: __vue_staticRenderFns__$c
}, __vue_inject_styles__$c, __vue_script__$c, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);

//
//
//
//
//
//
//
var script$b = /*#__PURE__*/{
  name: 'Block',
  props: {
    shadow: {
      type: Boolean,
      required: false
    },
    radius: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    classes() {
      return {
        'block--radius': this.radius,
        'block--shadow': this.shadow
      };
    }

  }
};

/* script */
const __vue_script__$b = script$b;
/* template */

var __vue_render__$b = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "block",
    class: _vm.classes
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$b = [];
/* style */

const __vue_inject_styles__$b = undefined;
/* scoped */

const __vue_scope_id__$b = undefined;
/* module identifier */

const __vue_module_identifier__$b = undefined;
/* functional template */

const __vue_is_functional_template__$b = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$b = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$b,
  staticRenderFns: __vue_staticRenderFns__$b
}, __vue_inject_styles__$b, __vue_script__$b, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);

//
var script$a = /*#__PURE__*/{
  name: 'CustomDraggable',
  components: {
    Draggable
  },
  props: {
    value: {
      type: Array,
      required: true
    },
    handleClass: {
      type: String,
      default: 'drag'
    },
    tag: {
      type: String,
      default: 'div'
    },
    animation: {
      type: Number,
      default: 200
    },
    ghostClass: {
      type: String,
      default: 'ghost'
    }
  },
  emits: ['input'],
  computed: {
    localValue: {
      get() {
        return this.value;
      },

      set(val) {
        this.$emit('input', val);
      }

    }
  }
};

/* script */
const __vue_script__$a = script$a;
/* template */

var __vue_render__$a = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('Draggable', {
    attrs: {
      "tag": _vm.tag,
      "handle": "." + _vm.handleClass,
      "animation": _vm.animation,
      "ghost-class": _vm.ghostClass
    },
    model: {
      value: _vm.localValue,
      callback: function ($$v) {
        _vm.localValue = $$v;
      },
      expression: "localValue"
    }
  }, [_vm._t("default")], 2);
};

var __vue_staticRenderFns__$a = [];
/* style */

const __vue_inject_styles__$a = undefined;
/* scoped */

const __vue_scope_id__$a = undefined;
/* module identifier */

const __vue_module_identifier__$a = undefined;
/* functional template */

const __vue_is_functional_template__$a = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$a = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$a,
  staticRenderFns: __vue_staticRenderFns__$a
}, __vue_inject_styles__$a, __vue_script__$a, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);

//
var script$9 = /*#__PURE__*/{
  name: 'ColumnSettingBase',
  components: {
    InputRow: __vue_component__$d
  },
  inject: ['convertOptions'],
  props: {
    // 識別碼
    id: {
      type: String,
      required: true
    },
    // 欄位屬性約束
    typeConstraint: {
      type: Object,
      required: true
    },
    // 所有欄位群 (obj by key)
    columnsObjByKey: {
      type: Object,
      required: true
    },
    //-----------
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
    // 預設值
    defaultValue: {
      type: [String, Number, Boolean, Array],
      default: null
    },
    // 提示文字
    placeholder: {
      type: String,
      default: null
    },
    // 加密
    encrypt: {
      type: Number,
      default: null
    },
    // 欄位性質
    subType: {
      type: String,
      default: null
    } // 自動完成
    // autocomplete: { type: String, default: null },

  },
  emits: ['update'],
  computed: {
    fields() {
      let temp = {
        label: {
          props: {
            label: '欄位說明'
          }
        },
        subLabel: {
          props: {
            label: '欄位子說明'
          }
        }
      };

      if (!this.typeConstraint.isFile) {
        temp['defaultValue'] = {
          props: {
            label: '預設值'
          }
        };
      }

      if (this.typeConstraint.isInput) {
        temp['placeholder'] = {
          props: {
            label: '提示文字'
          }
        };
      }

      if (this.typeConstraint.isText) {
        temp['subType'] = {
          props: {
            label: '欄位性質',
            placeholder: '預設: 文字',
            type: 'select',
            options: this.subTypeOptions,
            clearable: true
          }
        }; // if (!this.subType) {
        //   temp['autocomplete'] = {
        //     props: {
        //       label: '自動完成',
        //       placeholder: '預設: 關閉',
        //       type: 'select',
        //       options: this.autocompleteOptions,
        //       clearable: true,
        //     },
        //   };
        // }
      } else if (this.typeConstraint.isNumber) {
        temp = { ...temp,
          defaultValue: {
            props: { ...temp.defaultValue.props,
              type: 'number'
            }
          }
        };
      } else if (this.typeConstraint.needItems) {
        var _this$columnsObjByKey;

        temp = { ...temp,
          defaultValue: {
            props: { ...temp.defaultValue.props,
              type: 'select',
              placeholder: '請選擇',
              options: (_this$columnsObjByKey = this.columnsObjByKey[this.id].data) === null || _this$columnsObjByKey === void 0 ? void 0 : _this$columnsObjByKey.items,
              searchable: true,
              valueKey: 'id',
              textKey: 'text',
              fuseKeys: ['text'],
              // reduce: (option) => option,
              // multiple: this.typeConstraint.isCheckbox,
              // multiple: true,
              taggable: true,
              pushTags: true,
              optionCreatedFlag: true,
              getOptionLabel: option => option // reduce: (name) => name.value,
              // createOption: (label) => ({ label, value: -1 }),

            }
          }
        };
      }

      if (this.typeConstraint.isInput) {
        temp['encrypt'] = {
          props: {
            label: '資料庫加密',
            type: 'checkbox',
            text: '加密',
            yes: 1,
            no: null
          }
        };
      }

      return temp;
    },

    subTypeOptions() {
      // https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element/input
      return this.convertOptions({
        // text: '文字', // default
        tel: '手機',
        email: '信箱',
        password: '密碼' // 其他
        // file: '檔案',

      });
    },

    autocompleteOptions() {
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
      return this.convertOptions({
        // off: '關閉', // default
        name: '全名',
        email: '信箱',
        username: '帳號',
        'current-password': '密碼' // 其他
        // 'new-password': '新密碼',

      });
    }

  }
};

/* script */
const __vue_script__$9 = script$9;
/* template */

var __vue_render__$9 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('fieldset', _vm._l(_vm.fields, function (v, k) {
    return _c('InputRow', _vm._b({
      key: k,
      attrs: {
        "value": _vm.$props[k]
      },
      on: {
        "input": function ($event) {
          return _vm.$emit('update', k, $event);
        }
      },
      scopedSlots: _vm._u([_vm._l(_vm.$scopedSlots, function (_, slot) {
        return {
          key: slot,
          fn: function (props) {
            return [_vm._t(slot, null, null, props)];
          }
        };
      })], null, true)
    }, 'InputRow', v.props, false));
  }), 1);
};

var __vue_staticRenderFns__$9 = [];
/* style */

const __vue_inject_styles__$9 = undefined;
/* scoped */

const __vue_scope_id__$9 = undefined;
/* module identifier */

const __vue_module_identifier__$9 = undefined;
/* functional template */

const __vue_is_functional_template__$9 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$9 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$9,
  staticRenderFns: __vue_staticRenderFns__$9
}, __vue_inject_styles__$9, __vue_script__$9, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);

//
var script$8 = /*#__PURE__*/{
  name: 'ColumnSettingData',
  components: {
    InputRow: __vue_component__$d,
    Icon: __vue_component__$p,
    Field: __vue_component__$f,
    Block: __vue_component__$b,
    Draggable: __vue_component__$a
  },
  inject: ['handleConfirm', 'convertOptions'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: {
      type: Array,
      required: true
    },
    // 所有欄位群 (obj by key)
    columnsObjByKey: {
      type: Object,
      required: true
    },
    //-----------
    // 資料來源模式
    srcMode: {
      type: String,
      default: 'list',
      validator: value => ['list', 'api'].includes(value)
    },
    // 顯示模式
    displayMode: {
      type: String,
      default: 'line',
      validator: value => ['line', 'next', 'bothSide'].includes(value)
    },
    // 項目
    items: {
      type: Array,
      default: () => []
    },
    // API設定
    api: {
      type: Object,
      default: () => ({
        url: '',
        textKey: '',
        valueKey: ''
      })
    }
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    sourceModeOptions() {
      return this.convertOptions({
        list: '手動設置',
        api: 'API'
      });
    },

    displayModeOptions() {
      return this.convertOptions({
        line: 'Line by Line',
        next: 'Next to each others',
        bothSide: 'Stay on each sides in a row (Left - Right)'
      });
    }

  },
  methods: {
    update(key, val) {
      this.$emit('update', key, val);
    },

    updateApi(key, val) {
      this.$emit('updateObj', 'api', key, val);
    },

    updateItem(id, key, val) {
      this.$emit('updateArr', 'items', id, key, val);
    },

    addItem() {
      this.$emit('addArr', 'items', {
        id: nanoid(6),
        text: ''
      });
    },

    removeItem(id) {
      // 確認刪除函式
      const allowFunc = () => {
        this.$emit('removeArr', 'items', id);
      };

      const idx = this.$props.items.findIndex(item => item.id === id);
      const {
        text
      } = this.$props.items[idx];
      const showMsg = `確定刪除項目 #${idx + 1} [${text || id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    }

  }
};

/* script */
const __vue_script__$8 = script$8;
/* template */

var __vue_render__$8 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('fieldset', [_c('InputRow', {
    attrs: {
      "value": _vm.$props.srcMode,
      "label": "資料來源",
      "placeholder": "請選擇來源",
      "type": "select",
      "options": _vm.sourceModeOptions,
      "required": ""
    },
    on: {
      "input": function ($event) {
        return _vm.update('srcMode', $event);
      }
    }
  }), _vm._v(" "), _c('hr', {
    staticClass: "dashed"
  }), _vm._v(" "), _vm.$props.srcMode === 'list' ? [_c('Block', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.$props.items.length,
      expression: "$props.items.length"
    }]
  }, [_c('Draggable', {
    attrs: {
      "value": _vm.$props.items
    },
    on: {
      "input": function ($event) {
        return _vm.update('items', $event);
      }
    }
  }, _vm._l(_vm.$props.items, function (item, idx) {
    return _c('div', {
      key: item.id,
      staticClass: "input-row"
    }, [_c('div', {
      staticClass: "drag"
    }, [_c('Icon', {
      attrs: {
        "icon": "mdi:drag"
      }
    }), _vm._v(_vm._s(idx + 1))], 1), _vm._v(" "), _c('Field', {
      attrs: {
        "value": item.text,
        "placeholder": "(" + item.id + ")"
      },
      on: {
        "input": function ($event) {
          return _vm.updateItem(item.id, 'text', $event);
        }
      }
    }), _vm._v(" "), _c('Icon', {
      attrs: {
        "icon": "mdi:close-thick",
        "is-btn": ""
      },
      on: {
        "click": function ($event) {
          return _vm.removeItem(item.id);
        }
      }
    })], 1);
  }), 0)], 1), _vm._v(" "), _c('button', {
    staticClass: "btn btn--add",
    on: {
      "click": function ($event) {
        $event.preventDefault();
        return _vm.addItem($event);
      }
    }
  }, [_vm._v("✚")])] : [_c('InputRow', {
    attrs: {
      "value": _vm.$props.api.url,
      "label": "API URL",
      "required": ""
    },
    on: {
      "input": function ($event) {
        return _vm.updateApi('url', $event);
      }
    }
  }), _vm._v(" "), _c('InputRow', {
    attrs: {
      "value": _vm.$props.api.textKey,
      "label": "Value Key",
      "required": ""
    },
    on: {
      "input": function ($event) {
        return _vm.updateApi('textKey', $event);
      }
    }
  }), _vm._v(" "), _c('InputRow', {
    attrs: {
      "value": _vm.$props.api.valueKey,
      "label": "Text Key",
      "required": ""
    },
    on: {
      "input": function ($event) {
        return _vm.updateApi('valueKey', $event);
      }
    }
  })]], 2);
};

var __vue_staticRenderFns__$8 = [];
/* style */

const __vue_inject_styles__$8 = undefined;
/* scoped */

const __vue_scope_id__$8 = undefined;
/* module identifier */

const __vue_module_identifier__$8 = undefined;
/* functional template */

const __vue_is_functional_template__$8 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$8 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$8,
  staticRenderFns: __vue_staticRenderFns__$8
}, __vue_inject_styles__$8, __vue_script__$8, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);

//
var script$7 = /*#__PURE__*/{
  name: 'ColumnSettingRule',
  components: {
    InputRow: __vue_component__$d,
    Icon: __vue_component__$p
  },
  inject: ['collect', 'setCollect'],
  props: {
    // 識別碼
    id: {
      type: String,
      required: true
    },
    // 欄位名稱
    name: {
      type: String,
      required: true
    },
    // 欄位屬性約束
    typeConstraint: {
      type: Object,
      required: true
    },
    // 排除自己的所有欄位群
    columnsExcludeSelf: {
      type: Array,
      required: true
    },
    // 所有欄位群 (obj by key)
    columnsObjByKey: {
      type: Object,
      required: true
    },
    //-----------
    // 規則提示
    msg: {
      type: Object,
      default: () => ({})
    },
    // 必填
    required: {
      type: Number,
      default: null
    },
    // 與..相符
    sameAs: {
      type: String,
      default: null
    },
    // 字元下限
    minimum: {
      type: Number,
      default: null
    },
    // 字元上限
    maximum: {
      type: Number,
      default: null
    },
    // 驗證格式
    regex: {
      type: String,
      default: null
    },
    // 選擇數量下限 [多選框選項]
    least: {
      type: Number,
      default: null
    },
    // 選擇數量上限 [多選框選項]
    most: {
      type: Number,
      default: null
    }
  },
  emits: ['update', 'updateObj'],
  computed: {
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.sameAs ? this.columnsObjByKey[this.sameAs].name || this.columnsObjByKey[this.sameAs].id : '';
      let temp = {
        required: {
          props: {
            label: '是否必填',
            text: '必填',
            type: 'checkbox',
            yes: 1,
            no: null
          },
          msg: `[${name}] 為必填。`
        },
        sameAs: {
          props: {
            label: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select',
            options: this.typeConstraint.filterSame(this.columnsExcludeSelf),
            valueKey: 'id',
            textKey: 'name',
            clearable: true,
            searchable: true
          },
          msg: `[${name}] 與 [${sameAsName}] 不相符`
        }
      };

      if (this.typeConstraint.isText) {
        temp = { ...temp,
          minimum: {
            props: {
              label: '字元下限',
              type: 'number'
            },
            msg: `[${name}] 最少 [:min] 個字。`
          },
          maximum: {
            props: {
              label: '字元上限',
              type: 'number'
            },
            msg: `[${name}] 最多 [:max] 個字。`
          },
          regex: {
            props: {
              label: '驗證格式'
            },
            msg: `[${name}] 格式驗證失敗。`
          }
        };
      } else if (this.typeConstraint.isNumber) {
        temp = { ...temp,
          minimum: {
            props: {
              label: '數字下限',
              type: 'number'
            },
            msg: `[${name}] 最少 [:min]。`
          },
          maximum: {
            props: {
              label: '數字上限',
              type: 'number'
            },
            msg: `[${name}] 最多 [:max]。`
          }
        };
      } else if (this.typeConstraint.isCheckbox) {
        temp = { ...temp,
          least: {
            props: {
              label: '選擇數量下限',
              type: 'number'
            },
            msg: `[${name}] 最少選 [:least] 個。`
          },
          most: {
            props: {
              label: '選擇數量上限',
              type: 'number'
            },
            msg: `[${name}] 最多選 [:most] 個。`
          }
        };
      }

      return temp;
    },

    toggleMsg() {
      return this.collect[this.id]['toggleMsg'];
    }

  },

  created() {
    this.setCollect(this.id, 'toggleMsg', {});
  },

  methods: {
    update(k, v) {
      this.$emit('update', k, v);

      if (this.toggleMsg[k] === undefined) {
        this.setToggleMsg(k, false);
      }
    },

    setToggleMsg(k, v) {
      this.setCollect(this.id, 'toggleMsg', { ...this.toggleMsg,
        [k]: v !== undefined ? v : !this.toggleMsg[k]
      });
    }

  }
};

/* script */
const __vue_script__$7 = script$7;
/* template */

var __vue_render__$7 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('fieldset', _vm._l(_vm.fields, function (v, k) {
    return _c('div', {
      key: k,
      staticClass: "input-group"
    }, [_c('InputRow', _vm._b({
      attrs: {
        "value": _vm.$props[k]
      },
      on: {
        "input": function ($event) {
          return _vm.update(k, $event);
        }
      },
      scopedSlots: _vm._u([{
        key: "label-right",
        fn: function () {
          return [_c('Icon', {
            directives: [{
              name: "show",
              rawName: "v-show",
              value: _vm.$props[k],
              expression: "$props[k]"
            }],
            attrs: {
              "icon": "mdi:ideogram-cjk-variant",
              "is-btn": ""
            },
            on: {
              "click": function ($event) {
                return _vm.setToggleMsg(k);
              }
            }
          })];
        },
        proxy: true
      }, _vm._l(_vm.$scopedSlots, function (_, slot) {
        return {
          key: slot,
          fn: function (props) {
            return [_vm._t(slot, null, null, props)];
          }
        };
      })], null, true)
    }, 'InputRow', v.props, false)), _vm._v(" "), _c('InputRow', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.$props[k] && _vm.toggleMsg[k],
        expression: "$props[k] && toggleMsg[k]"
      }],
      attrs: {
        "value": _vm.$props.msg[k],
        "placeholder": v.msg
      },
      on: {
        "input": function ($event) {
          return _vm.$emit('updateObj', 'msg', k, $event);
        }
      }
    })], 1);
  }), 0);
};

var __vue_staticRenderFns__$7 = [];
/* style */

const __vue_inject_styles__$7 = undefined;
/* scoped */

const __vue_scope_id__$7 = undefined;
/* module identifier */

const __vue_module_identifier__$7 = undefined;
/* functional template */

const __vue_is_functional_template__$7 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$7 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$7,
  staticRenderFns: __vue_staticRenderFns__$7
}, __vue_inject_styles__$7, __vue_script__$7, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);

//
var script$6 = /*#__PURE__*/{
  name: 'ColumnSettingConditionDisplay',
  components: {
    InputRow: __vue_component__$d,
    Icon: __vue_component__$p,
    Field: __vue_component__$f,
    IconRow: __vue_component__$e,
    Block: __vue_component__$b
  },
  inject: ['handleConfirm', 'typeIcons'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: {
      type: Array,
      required: true
    },
    // 所有欄位群 (obj by key)
    columnsObjByKey: {
      type: Object,
      required: true
    },
    //-----------
    idx: {
      type: Number,
      required: true
    },
    triggerID: {
      type: String,
      default: null
    },
    values: {
      type: Array,
      default: () => []
    },
    meet: {
      type: Number,
      default: null
    } // null: 滿足其一, 1: 滿足全部

  },
  emits: ['update'],
  computed: {
    meetOptions() {
      return [{
        value: null,
        text: '符合其一'
      }, {
        value: 1,
        text: '符合全部'
      }];
    },

    triggerColumn() {
      return this.triggerID ? this.columnsObjByKey[this.triggerID] : null;
    },

    thousandSeparatorFunc() {
      return option => thousandSeparator(option);
    }

  }
};

/* script */
const __vue_script__$6 = script$6;
/* template */

var __vue_render__$6 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('Block', [_c('InputRow', {
    attrs: {
      "value": _vm.triggerID,
      "label": "監聽欄位",
      "type": "select",
      "options": _vm.columnsExcludeSelf,
      "value-key": "id",
      "text-key": "name",
      "clearable": "",
      "searchable": ""
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'triggerID', $event);
      }
    },
    scopedSlots: _vm._u([{
      key: "label-left",
      fn: function () {
        return [_c('Icon', {
          attrs: {
            "icon": "mdi:close-thick",
            "is-btn": ""
          },
          on: {
            "click": function ($event) {
              return _vm.$emit('remove');
            }
          }
        }), _vm._v(" "), _c('span', [_vm._v(_vm._s(_vm.idx + 1) + ". ")])];
      },
      proxy: true
    }, {
      key: "selected-option",
      fn: function (o) {
        return [_c('IconRow', {
          attrs: {
            "icon": _vm.typeIcons[o.type]
          }
        }, [_vm._v(_vm._s(o.name || "(" + o.id + ")"))])];
      }
    }, {
      key: "option",
      fn: function (o) {
        return [_c('IconRow', {
          attrs: {
            "icon": _vm.typeIcons[o.type]
          }
        }, [_vm._v(_vm._s(o.name || "(" + o.id + ")"))])];
      }
    }])
  }), _vm._v(" "), _vm.triggerColumn ? _c('div', [_c('Block', [_c('div', {
    staticClass: "input-row"
  }, [_vm.triggerColumn.type === 'text' ? [_c('div', {
    staticClass: "for"
  }), _vm._v(" "), _c('Field', {
    attrs: {
      "value": _vm.values,
      "type": "select",
      "multiple": "",
      "taggable": "",
      "searchable": "",
      "placeholder": "請輸入條件，按下 Enter 確認。 (可輸入多筆)",
      "no-drop": "",
      "close-on-select": false,
      "reduce": function (option) {
        return option;
      },
      "get-option-label": function (option) {
        return option;
      },
      "create-option": function (option) {
        return option;
      }
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'values', $event);
      }
    }
  })] : _vm.triggerColumn.type === 'number' ? [_c('div', {
    staticClass: "for"
  }, [_vm._v("符合其一")]), _vm._v(" "), _c('Field', {
    attrs: {
      "value": _vm.values,
      "type": "select",
      "multiple": "",
      "taggable": "",
      "searchable": "",
      "placeholder": "請輸入條件，按下 Enter 確認。 (可輸入多筆)",
      "no-drop": "",
      "close-on-select": false,
      "reduce": function (option) {
        return option;
      },
      "get-option-label": _vm.thousandSeparatorFunc,
      "create-option": function (option) {
        return Number(option);
      }
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'values', $event);
      }
    }
  })] : ['select', 'radio', 'checkbox'].includes(_vm.triggerColumn.type) && _vm.triggerColumn.data ? [_c('div', {
    staticClass: "for"
  }, [_c('Field', {
    attrs: {
      "value": _vm.meet,
      "type": "select",
      "options": _vm.meetOptions
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'meet', $event);
      }
    }
  })], 1), _vm._v(" "), _vm.triggerColumn.data.srcMode === 'list' ? _c('Field', {
    attrs: {
      "value": _vm.values,
      "placeholder": "請選擇條件 (可多選)",
      "type": "select",
      "multiple": "",
      "searchable": "",
      "options": _vm.triggerColumn.data.items,
      "value-key": "id",
      "text-key": "text",
      "fuse-keys": ['text']
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'values', $event);
      }
    }
  }) : _vm._e()] : _vm._e()], 2)])], 1) : _vm._e()], 1);
};

var __vue_staticRenderFns__$6 = [];
/* style */

const __vue_inject_styles__$6 = undefined;
/* scoped */

const __vue_scope_id__$6 = undefined;
/* module identifier */

const __vue_module_identifier__$6 = undefined;
/* functional template */

const __vue_is_functional_template__$6 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$6 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$6,
  staticRenderFns: __vue_staticRenderFns__$6
}, __vue_inject_styles__$6, __vue_script__$6, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);

//
var script$5 = /*#__PURE__*/{
  name: 'ColumnSettingCondition',
  components: {
    InputRow: __vue_component__$d,
    ConditionDisplay: __vue_component__$6
  },
  inject: ['handleConfirm'],
  props: {
    // 識別碼
    id: {
      type: String,
      required: true
    },
    // 欄位名稱
    name: {
      type: String,
      default: '(no name)'
    },
    // 欄位屬性約束
    typeConstraint: {
      type: Object,
      required: true
    },
    // 排除自己的所有欄位群
    columnsExcludeSelf: {
      type: Array,
      required: true
    },
    // 所有欄位群 (obj by key)
    columnsObjByKey: {
      type: Object,
      required: true
    },
    //-----------
    // 連動必填元素 (如果自身有值，其元素必填)
    requiredSync: {
      type: Array,
      default: () => []
    },
    // 顯示條件
    display: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    // 自身必填檢查 (來自其他元素的 requiredSync)
    requiredCheck() {
      const requiredCheck = [];
      this.columnsExcludeSelf.forEach(c => {
        var _c$condition, _c$condition$required;

        if ((_c$condition = c.condition) !== null && _c$condition !== void 0 && (_c$condition$required = _c$condition.requiredSync) !== null && _c$condition$required !== void 0 && _c$condition$required.includes(this.id)) {
          requiredCheck.push(c.id);
        }
      });
      return requiredCheck;
    }

  },
  methods: {
    addDsiplay() {
      this.$emit('addArr', 'display', {
        id: nanoid(6)
      });
    },

    updateDisplay(id, k, v) {
      this.$emit('updateArr', 'display', id, k, v);
    },

    removeDisplay(id) {
      const allowFunc = () => {
        this.$emit('removeArr', 'display', id);
      };

      const idx = this.$props.display.findIndex(d => d.id === id);
      const showMsg = `確定刪除顯示條件 #${idx + 1}?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    }

  }
};

/* script */
const __vue_script__$5 = script$5;
/* template */

var __vue_render__$5 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('fieldset', [_c('InputRow', {
    attrs: {
      "value": _vm.$props.requiredSync,
      "label": "連動必填",
      "type": "select",
      "options": _vm.columnsExcludeSelf,
      "value-key": "id",
      "text-key": "name",
      "multiple": "",
      "searchable": ""
    },
    on: {
      "input": function ($event) {
        return _vm.$emit('update', 'requiredSync', $event);
      }
    }
  }), _vm._v(" "), _vm.requiredCheck.length ? _c('InputRow', {
    attrs: {
      "value": _vm.requiredCheck,
      "label": "被連動必填",
      "type": "select",
      "options": _vm.columnsExcludeSelf,
      "value-key": "id",
      "text-key": "name",
      "multiple": "",
      "searchable": "",
      "no-drop": "",
      "disabled": ""
    }
  }) : _vm._e(), _vm._v(" "), _c('hr', {
    staticClass: "dashed"
  }), _vm._v(" "), _vm._m(0), _vm._v(" "), _vm._l(_vm.$props.display, function (d, idx) {
    return _c('ConditionDisplay', _vm._b({
      key: d.id,
      attrs: {
        "idx": idx,
        "columns-exclude-self": _vm.columnsExcludeSelf,
        "columns-obj-by-key": _vm.columnsObjByKey
      },
      on: {
        "update": function ($event) {
          var i = arguments.length,
              argsArray = Array(i);

          while (i--) argsArray[i] = arguments[i];

          return _vm.updateDisplay.apply(void 0, [d.id].concat(argsArray));
        },
        "remove": function ($event) {
          return _vm.removeDisplay(d.id);
        }
      }
    }, 'ConditionDisplay', d, false));
  }), _vm._v(" "), _c('button', {
    staticClass: "btn btn--add",
    on: {
      "click": function ($event) {
        $event.preventDefault();
        return _vm.addDsiplay($event);
      }
    }
  }, [_vm._v("✚")])], 2);
};

var __vue_staticRenderFns__$5 = [function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('p', [_vm._v("顯示條件 "), _c('em', {
    staticStyle: {
      "opacity": "0.5"
    }
  }, [_vm._v("(預設符合其一)")])]);
}];
/* style */

const __vue_inject_styles__$5 = undefined;
/* scoped */

const __vue_scope_id__$5 = undefined;
/* module identifier */

const __vue_module_identifier__$5 = undefined;
/* functional template */

const __vue_is_functional_template__$5 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$5 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$5,
  staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, __vue_script__$5, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);

//
var script$4 = /*#__PURE__*/{
  name: 'ColumnSetting',
  components: {
    InputRow: __vue_component__$d,
    IconRow: __vue_component__$e,
    SettingBase: __vue_component__$9,
    SettingData: __vue_component__$8,
    SettingRule: __vue_component__$7,
    SettingCondition: __vue_component__$5
  },
  inject: ['typeOptions', 'typeIcons', 'getTypeConstraint', 'convertOptions'],
  props: {
    idx: {
      type: Number,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    //-----------
    // 識別碼
    id: {
      type: String,
      required: true
    },
    // 欄位名稱
    name: {
      type: String,
      default: ''
    },
    // 欄位屬性
    type: {
      type: String,
      default: ''
    },
    // 欄位 - 基本設定
    base: {
      type: Object,
      default: () => ({})
    },
    // 欄位 - 規則設定
    rule: {
      type: Object,
      default: () => ({})
    },
    // 欄位 - 項目設定
    data: {
      type: Object,
      default: () => ({})
    },
    // 欄位 - 顯示條件
    condition: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update'],

  data() {
    return {
      currentTab: 'base'
    };
  },

  computed: {
    column() {
      return {
        id: this.id,
        name: this.name,
        type: this.type,
        base: this.base,
        rule: this.rule,
        data: this.data,
        condition: this.condition
      };
    },

    tabOptions() {
      return this.convertOptions({
        base: '基本',
        rule: '規則',
        data: '項目',
        condition: '條件'
      });
    },

    tabShow() {
      return {
        base: true,
        rule: true,
        data: this.typeConstraint.needItems,
        condition: true
      };
    },

    currentCmp() {
      const config = {
        component: `setting-${this.currentTab}`,
        props: {
          id: this.column.id,
          name: this.column.name,
          typeConstraint: this.typeConstraint,
          columnsExcludeSelf: this.columnsExcludeSelf,
          columnsObjByKey: this.columnsObjByKey,
          // -------------------------------------
          ...this.column[this.currentTab]
        }
      };
      return config;
    },

    typeConstraint() {
      return this.getTypeConstraint(this.type);
    },

    columnsExcludeSelf() {
      return this.columns.filter(column => column.id !== this.id);
    },

    columnsObjByKey() {
      return arr2ObjByKey(this.columns, 'id');
    }

  },
  // 監聽連動 [Side Effect]
  watch: {
    type: function () {
      this.resetBaseDefalutValue();

      if (this.typeConstraint.needItems) {
        this.initSettingData();
      }
    },
    'data.items': function (a, b) {
      if ((a === null || a === void 0 ? void 0 : a.length) < (b === null || b === void 0 ? void 0 : b.length) || !a && b) {
        const diff = difference(b, a || [])[0];
        this.resetBaseDefalutValue();
        this.columnsExcludeSelf.map(c => {
          var _c$condition, _c$condition$display;

          (_c$condition = c.condition) === null || _c$condition === void 0 ? void 0 : (_c$condition$display = _c$condition.display) === null || _c$condition$display === void 0 ? void 0 : _c$condition$display.map(d => {
            d.values = arrRemoveValue(d.values, diff.id);
          });
        });
      }
    }
  },
  methods: {
    updateColumn(tab, val) {
      console.log(`updateColumn[${tab}]`, val);
      this.column[tab] = val;
      this.$emit('update', this.column.id, this.column);
    },

    updateColumnTab(tab, targetKey, targetVal) {
      console.log(`updateColumnTab[${tab}][${targetKey}]`, targetVal);
      const newTab = { ...this.column[tab],
        [targetKey]: targetVal
      };
      this.updateColumn(tab, newTab);
    },

    updateColumnTabObj(tab, targetKey, k, v) {
      console.log(`updateColumnTabObj[${tab}][${targetKey}][${k}]`, v);
      const newTarget = { ...this.column[tab][targetKey],
        [k]: v
      };
      this.updateColumnTab(tab, targetKey, newTarget);
    },

    addColumnTabArr(tab, targetKey, v) {
      console.log(`addColumnTabArr[${tab}][${targetKey}]`, v);
      const target = this.column[tab][targetKey];
      const newTarget = target ? [...target, v] : [v];
      this.updateColumnTab(tab, targetKey, newTarget);
    },

    updateColumnTabArr(tab, targetKey, id, k, v) {
      console.log(`updateColumnTabArr[${tab}][${targetKey}][${id}][${k}]`, v);
      const newTarget = arrUpdateItemByKey(this.column[tab][targetKey], 'id', id, {
        [k]: v
      });
      this.updateColumnTab(tab, targetKey, newTarget);
    },

    removeColumnTabArr(tab, targetKey, id) {
      console.log(`removeColumnTabArr[${tab}][${targetKey}]`, id);
      const newTarget = arrRemoveItemByKey(this.column[tab][targetKey], 'id', id);
      this.updateColumnTab(tab, targetKey, newTarget);
    },

    //-------------
    initSettingData() {
      if (!this.column.data.srcMode) {
        console.log('initSettingData()');
        this.updateColumn('data', { ...this.column.data,
          srcMode: 'list',
          items: []
        });
      }
    },

    resetBaseDefalutValue() {
      this.updateColumnTab('base', 'defaultValue', this.typeConstraint.isCheckbox ? [] : null);
    }

  }
};

/* script */
const __vue_script__$4 = script$4;
/* template */

var __vue_render__$4 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "column-setting"
  }, [_c('InputRow', {
    attrs: {
      "value": _vm.column.type,
      "label": "欄位屬性",
      "placeholder": "請選擇屬性",
      "type": "select",
      "options": _vm.typeOptions,
      "required": ""
    },
    on: {
      "input": function ($event) {
        return _vm.updateColumn('type', $event);
      }
    },
    scopedSlots: _vm._u([{
      key: "selected-option",
      fn: function (o) {
        return [_c('IconRow', {
          attrs: {
            "icon": _vm.typeIcons[o.value]
          }
        }, [_vm._v(_vm._s(o.text))])];
      }
    }, {
      key: "option",
      fn: function (o) {
        return [_c('IconRow', {
          attrs: {
            "icon": _vm.typeIcons[o.value]
          }
        }, [_vm._v(_vm._s(o.text))])];
      }
    }])
  }), _vm._v(" "), _c('nav', {
    staticClass: "tabs"
  }, [_vm._l(_vm.tabOptions, function (tab) {
    return [_c('div', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.tabShow[tab.value],
        expression: "tabShow[tab.value]"
      }],
      key: tab.value,
      class: ['tabs__item', {
        active: _vm.currentTab === tab.value
      }]
    }, [_c('span', {
      on: {
        "click": function ($event) {
          _vm.currentTab = tab.value;
        }
      }
    }, [_vm._v(" " + _vm._s(tab.text))])])];
  })], 2), _vm._v(" "), _c('keep-alive', [_c(_vm.currentCmp.component, _vm._b({
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.tabShow[_vm.currentTab],
      expression: "tabShow[currentTab]"
    }],
    tag: "component",
    on: {
      "update": function ($event) {
        var i = arguments.length,
            argsArray = Array(i);

        while (i--) argsArray[i] = arguments[i];

        return _vm.updateColumnTab.apply(void 0, [_vm.currentTab].concat(argsArray));
      },
      "updateObj": function ($event) {
        var i = arguments.length,
            argsArray = Array(i);

        while (i--) argsArray[i] = arguments[i];

        return _vm.updateColumnTabObj.apply(void 0, [_vm.currentTab].concat(argsArray));
      },
      "addArr": function ($event) {
        var i = arguments.length,
            argsArray = Array(i);

        while (i--) argsArray[i] = arguments[i];

        return _vm.addColumnTabArr.apply(void 0, [_vm.currentTab].concat(argsArray));
      },
      "updateArr": function ($event) {
        var i = arguments.length,
            argsArray = Array(i);

        while (i--) argsArray[i] = arguments[i];

        return _vm.updateColumnTabArr.apply(void 0, [_vm.currentTab].concat(argsArray));
      },
      "removeArr": function ($event) {
        var i = arguments.length,
            argsArray = Array(i);

        while (i--) argsArray[i] = arguments[i];

        return _vm.removeColumnTabArr.apply(void 0, [_vm.currentTab].concat(argsArray));
      }
    },
    scopedSlots: _vm._u([_vm._l(_vm.$scopedSlots, function (_, slot) {
      return {
        key: slot,
        fn: function (props) {
          return [_vm._t(slot, null, null, props)];
        }
      };
    })], null, true)
  }, 'component', _vm.currentCmp.props, false))], 1)], 1);
};

var __vue_staticRenderFns__$4 = [];
/* style */

const __vue_inject_styles__$4 = undefined;
/* scoped */

const __vue_scope_id__$4 = undefined;
/* module identifier */

const __vue_module_identifier__$4 = undefined;
/* functional template */

const __vue_is_functional_template__$4 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$4 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$4,
  staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);

//
var script$3 = /*#__PURE__*/{
  name: 'FormSetting',
  components: {
    Draggable: __vue_component__$a,
    Block: __vue_component__$b,
    Card: __vue_component__$c,
    Icon: __vue_component__$p,
    Field: __vue_component__$f,
    ColumnSetting: __vue_component__$4
  },
  inject: ['collect', 'toggleCollect'],
  props: {
    columns: {
      type: Array,
      required: true
    },
    invokeUpdateColumns: {
      type: Function,
      required: true
    },
    invokeAdd: {
      type: Function,
      required: true
    },
    invokeUpdate: {
      type: Function,
      required: true
    },
    invokeRemove: {
      type: Function,
      required: true
    }
  },
  methods: {
    toggleIsOpen(columnId) {
      this.toggleCollect(columnId, 'isOpen');
    },

    toggleIsEditName(columnId) {
      this.toggleCollect(columnId, 'isEditName');
    }

  }
};

/* script */
const __vue_script__$3 = script$3;
/* template */

var __vue_render__$3 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "form-setting"
  }, [_c('Draggable', {
    attrs: {
      "value": _vm.columns
    },
    on: {
      "input": _vm.invokeUpdateColumns
    }
  }, _vm._l(_vm.columns, function (column, idx) {
    return _c('Block', {
      key: column.id,
      attrs: {
        "radius": "",
        "shadow": ""
      }
    }, [_c('Card', {
      scopedSlots: _vm._u([{
        key: "cardHeader",
        fn: function () {
          return [_vm._t("cardHeader", [_c('div', {
            staticClass: "drag"
          }, [_c('Icon', {
            attrs: {
              "icon": "mdi:drag"
            }
          }), _vm._v(" "), _c('span', [_vm._v("#" + _vm._s(idx + 1))])], 1), _vm._v(" "), _c('div', {
            staticClass: "card__name"
          }, [_vm.collect[column.id].isEditName ? [_c('Field', {
            attrs: {
              "placeholder": column.id
            },
            model: {
              value: column.name,
              callback: function ($$v) {
                _vm.$set(column, "name", $$v);
              },
              expression: "column.name"
            }
          })] : [_c('div', {
            staticClass: "text-ellipsis"
          }, [_vm._v(_vm._s(column.name || "(" + column.id + ")"))])], _vm._v(" "), _c('Icon', {
            attrs: {
              "icon": _vm.collect[column.id].isEditName ? 'ic:baseline-done-outline' : 'mi:edit-alt',
              "is-btn": ""
            },
            on: {
              "click": function ($event) {
                return _vm.toggleIsEditName(column.id);
              }
            }
          })], 2), _vm._v(" "), _c('div', {
            staticClass: "card__controll"
          }, [_c('Icon', {
            attrs: {
              "icon": _vm.collect[column.id].isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings',
              "is-btn": ""
            },
            on: {
              "click": function ($event) {
                return _vm.toggleIsOpen(column.id);
              }
            }
          }), _vm._v(" "), _c('Icon', {
            attrs: {
              "icon": "mdi:close-thick",
              "is-btn": ""
            },
            on: {
              "click": function ($event) {
                return _vm.invokeRemove(column.id);
              }
            }
          })], 1)], {
            "idx": idx,
            "column": column,
            "isOpen": _vm.collect[column.id].isOpen,
            "toggleIsOpen": _vm.toggleIsOpen.bind(null, column.id),
            "isEditName": _vm.collect[column.id].isEditName,
            "toggleIsEditName": _vm.toggleIsEditName.bind(null, column.id)
          })];
        },
        proxy: true
      }, {
        key: "cardMain",
        fn: function () {
          return [_vm._t("cardMain", [_c('ColumnSetting', _vm._b({
            directives: [{
              name: "show",
              rawName: "v-show",
              value: _vm.collect[column.id].isOpen,
              expression: "collect[column.id].isOpen"
            }],
            attrs: {
              "idx": idx,
              "columns": _vm.columns
            },
            on: {
              "update": _vm.invokeUpdate
            },
            scopedSlots: _vm._u([_vm._l(_vm.$scopedSlots, function (_, slot) {
              return {
                key: slot,
                fn: function (props) {
                  return [_vm._t(slot, null, null, props)];
                }
              };
            })], null, true)
          }, 'ColumnSetting', column, false))])];
        },
        proxy: true
      }], null, true)
    })], 1);
  }), 1), _vm._v(" "), _c('button', {
    staticClass: "btn btn--add",
    on: {
      "click": _vm.invokeAdd
    }
  }, [_vm._v("✚")])], 1);
};

var __vue_staticRenderFns__$3 = [];
/* style */

const __vue_inject_styles__$3 = undefined;
/* scoped */

const __vue_scope_id__$3 = undefined;
/* module identifier */

const __vue_module_identifier__$3 = undefined;
/* functional template */

const __vue_is_functional_template__$3 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$3 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$3,
  staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

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
  name: 'FormDemo',
  props: {
    // id: {
    //   type: String,
    //   required: true,
    // },
    columns: {
      type: Array,
      required: true
    }
  }
};

/* script */
const __vue_script__$2 = script$2;
/* template */

var __vue_render__$2 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "form-demo"
  }, [_vm._m(0), _vm._v(" "), _c('code', [_vm._v("\n    " + _vm._s(_vm.columns) + "\n  ")])]);
};

var __vue_staticRenderFns__$2 = [function () {
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

const __vue_inject_styles__$2 = undefined;
/* scoped */

const __vue_scope_id__$2 = "data-v-ef04cf30";
/* module identifier */

const __vue_module_identifier__$2 = undefined;
/* functional template */

const __vue_is_functional_template__$2 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$2 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$2,
  staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

//
var script$1 = /*#__PURE__*/{
  name: 'RecordControls',
  components: {
    Icon: __vue_component__$p
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
    value: {
      type: [String, Number, Boolean, Array, Object, Date, Function, Symbol],
      required: true
    },
    immediate: {
      type: Boolean,
      default: false
    },
    callback: {
      type: Function,
      default: null
    }
  },

  data() {
    return {
      record: [],
      recordIdx: -1
    };
  },

  computed: {
    hasThis() {
      return this.recordIdx > -1 && this.recordIdx < this.record.length;
    },

    hasPrev() {
      return this.recordIdx > 0;
    },

    hasNext() {
      return this.recordIdx < this.record.length - 1;
    },

    createdTime() {
      return this.record[this.recordIdx] && this.record[this.recordIdx].created;
    }

  },

  created() {
    this.getRecord();
  },

  methods: {
    removeRecord() {
      if (confirm(`確定清除 [${this.recordName}] 的所有存檔?`)) {
        localStorage.removeItem(this.recordName);
        window.location.reload();
      }
    },

    getRecord() {
      this.record = JSON.parse(localStorage.getItem(this.recordName)) || [];

      if (this.immediate && (!this.record || !this.record.length)) {
        this.record = [];
        this.addToRecord();
      }

      this.restoreLast();
    },

    addToRecord() {
      this.record.push({
        value: deepCopy(this.value),
        created: new Date().toLocaleString()
      });

      if (this.record.length > this.recordLimit) {
        this.record = this.record.slice(0 - this.recordLimit);
      }

      localStorage.setItem(this.recordName, JSON.stringify(this.record));
      this.restoreLast();
    },

    restoreThis() {
      this.setTargetInfo(this.recordIdx);
    },

    restorePrev() {
      this.setTargetInfo(this.recordIdx - 1);
    },

    restoreNext() {
      this.setTargetInfo(this.recordIdx + 1);
    },

    restoreLast() {
      this.setTargetInfo(this.record.length - 1);
    },

    setTargetInfo(idx) {
      const temp = idx > -1 && idx < this.record.length ? this.record[idx].value : null;
      if (!temp) return;
      this.recordIdx = idx;
      this.$emit('input', deepCopy(temp));
      if (this.callback) this.callback(temp);
    }

  }
};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "record-controls"
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
  })], 1), _vm._v(" "), _c('button', {
    attrs: {
      "disabled": !_vm.hasThis
    },
    on: {
      "click": _vm.removeRecord
    }
  }, [_c('Icon', {
    attrs: {
      "icon": "mdi:trash-can"
    }
  })], 1), _vm._v(" "), _vm._t("default", [_c('span', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.hasThis,
      expression: "hasThis"
    }]
  }, [_vm._v(" " + _vm._s(_vm.recordIdx + 1) + " / " + _vm._s(_vm.recordLimit) + " 筆 : " + _vm._s(_vm.createdTime) + " ")])], {
    "hasThis": _vm.hasThis,
    "recordIdx": _vm.recordIdx,
    "recordLimit": _vm.recordLimit,
    "createdTime": _vm.createdTime
  })], 2);
};

var __vue_staticRenderFns__$1 = [];
/* style */

const __vue_inject_styles__$1 = undefined;
/* scoped */

const __vue_scope_id__$1 = undefined;
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/normalizeComponent({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

//
var script = /*#__PURE__*/{
  name: 'FormBuilder',
  components: {
    FormMainLogic: __vue_component__$q,
    FormSetting: __vue_component__$3,
    FormDemo: __vue_component__$2,
    RecordControls: __vue_component__$1
  },
  props: {
    id: {
      type: String,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  },
  emits: ['update:columns'],
  computed: {
    localColumns: {
      get() {
        return this.columns;
      },

      set(val) {
        this.$emit('update:columns', val);
      }

    }
  }
};

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "form-builder"
  }, [_c('RecordControls', {
    attrs: {
      "record-name": "formBuilder-" + _vm.id,
      "record-limit": 5,
      "immediate": ""
    },
    model: {
      value: _vm.localColumns,
      callback: function ($$v) {
        _vm.localColumns = $$v;
      },
      expression: "localColumns"
    }
  }), _vm._v(" "), _c('h1', [_vm._v("Form ID: " + _vm._s(_vm.id))]), _vm._v(" "), _c('FormMainLogic', {
    attrs: {
      "columns": _vm.localColumns
    },
    on: {
      "update:columns": function ($event) {
        _vm.localColumns = $event;
      }
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function (props) {
        return [_c('main', {
          staticClass: "form-builder__main"
        }, [_c('FormSetting', _vm._b({}, 'FormSetting', props, false)), _vm._v(" "), _c('FormDemo', {
          attrs: {
            "columns": props.finalColumns
          }
        })], 1)];
      }
    }])
  })], 1);
};

var __vue_staticRenderFns__ = [];
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

var components = /*#__PURE__*/Object.freeze({
  __proto__: null,
  FormBuilder: __vue_component__,
  FormMainLogic: __vue_component__$q,
  FormSetting: __vue_component__$3,
  FormDemo: __vue_component__$2,
  RecordControls: __vue_component__$1
});

// Import vue components

const install = function install(Vue) {
  Object.entries(components).forEach(([componentName, component]) => {
    Vue.component(componentName, component);
  });
}; // Create module definition for Vue.use()

export default install;
export { __vue_component__ as FormBuilder, __vue_component__$2 as FormDemo, __vue_component__$q as FormMainLogic, __vue_component__$3 as FormSetting, __vue_component__$1 as RecordControls };
