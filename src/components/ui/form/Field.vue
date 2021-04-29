<template>
  <div class="x-field">
    <component
      :is="componentName"
      :id="id"
      ref="input"
      :name="name || id"
      v-bind="$attrs"
      :type="subType || type"
      :multiple="!!multiple"
      :value.sync="mutableValue"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </component>
  </div>
</template>

<script>
import XInput from '@/components/ui/form/Input';
import XCheckbox from '@/components/ui/form/Checkbox';
import XCheckboxGroup from '@/components/ui/form/CheckboxGroup';
import XRadioGroup from '@/components/ui/form/RadioGroup';
import XSelect from '@/components/ui/form/Select';
import { typeConfig, subTypeConfig, getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'Field',
  components: {
    XInput,
    XCheckbox,
    XCheckboxGroup,
    XRadioGroup,
    XSelect,
  },
  inheritAttrs: false,
  props: {
    columns: { type: Array, default: null },
    columnsByKey: { type: Object, default: null },
    values: { type: Object, default: null },
    // ------------
    id: { type: String, default: null },
    name: { type: String, default: null },
    value: { type: [String, Number, Boolean, Array], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
    multiple: { type: [Boolean, Number], default: null },
    error: { type: String, default: null },
  },
  emits: ['input', 'focus', 'blur'],
  computed: {
    componentName() {
      let name = null;
      switch (this.type) {
        case 'text':
        case 'number':
        case 'date':
        case 'file':
          name = 'x-input';
          break;
        case 'radio':
          name = 'x-radio-group';
          break;
        case 'checkbox':
          name = 'x-checkbox';
          if (this.multiple) name += '-group';
          break;
        default:
          name = `x-${this.type}`;
          break;
      }
      return name;
    },
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update:value', value);
      },
    },
    mutableError: {
      get() {
        return this.error;
      },
      set(msg) {
        // console.log('update:error', msg);
        this.$emit('update:error', msg);
      },
    },
    sameAsSync() {
      if (!this.columns) return [];

      return this.columns.reduce((acc, column) => {
        if (column.rule?.sameAs === this.id) acc.push(column.id);
        return acc;
      }, []);
    },
    typeConstraint() {
      return getTypeConstraint(this.type);
    },
  },
  watch: {
    default: {
      handler: function (_default) {
        if (_default != null && this.mutableValue == null) {
          this.mutableValue = _default;
        }
      },
      immediate: true,
    },
    // value: {
    //   handler: function (value) {
    //     // this.checkRule(this.name || this.id, value);
    //   },
    //   immediate: true,
    // },
    // errorMsg: {
    //   handler: function (msg) {
    //     // console.log('inputEl', this.inputEl);
    //     // if (this.inputEl) this.inputEl.setCustomValidity(msg || '');
    //   },
    //   immediate: true,
    // },
  },
  methods: {
    checkRule(name, value) {
      // 檢查 - 必填
      if (this.required && (value == null || value === '')) {
        this.errorMsg = this.msg.required || `[${name}] 為必填。`;
        return;
      }

      // (通過必填檢查，但無資料，不進行後續檢查。)
      if (value == null) return;

      // 檢查 - 字元上下限
      if (this.typeConstraint.isText) {
        // 字元下限
        if (this.minimum && this.minimum > value.length) {
          this.errorMsg = (this.msg.minimum || `[${name}] 最少 [:min] 個字。`).replace('[:min]', this.minimum);
          return;
        }

        // 字元上限
        if (this.maximum && this.maximum < value.length) {
          this.errorMsg = (this.msg.maximum || `[${name}] 最多 [:max] 個字。`).replace('[:max]', this.maximum);
          return;
        }
      }

      // 檢查 - 數字上下限
      if (this.typeConstraint.isNumber) {
        // 數字下限
        if (this.minimum && this.minimum > value) {
          this.errorMsg = (this.msg.minimum || `[${name}] 最少 [:min]。`).replace('[:min]', this.minimum);
          return;
        }

        // 數字上限
        if (this.maximum && this.maximum < value) {
          this.errorMsg = (this.msg.maximum || `[${name}] 最多 [:max]。`).replace('[:max]', this.maximum);
          return;
        }
      }

      // 檢查 - 與..相符
      if (this.columnsByKey && this.sameAs && this.columnsByKey[this.sameAs]) {
        if (
          // 如果同類型
          this.columnsByKey[this.id].type === this.columnsByKey[this.sameAs].type &&
          // 且相符
          value !== this.values[this.sameAs]
        ) {
          const sameAs = this.columnsByKey[this.sameAs];
          const sameAsName = sameAs.name || sameAs.id;

          this.errorMsg = (this.msg.sameAs || `[${name}] 與 [[:sameAs]] 不相符`).replace('[:sameAs]', sameAsName);

          return;
        }
      }

      this.errorMsg = null;
    },
  },
};
</script>
