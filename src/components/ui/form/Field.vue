<template>
  <div class="x-field">
    <component
      :is="componentName"
      ref="el"
      v-bind="bindAttrs"
      :value.sync="mutableValue"
      :error.sync="mutableError"
      v-on="{
        focus: handleFocus,
        blur: handleBlur,
      }"
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
import { typeConfig, subTypeConfig } from '@/assets/js/options.js';
import { checkRule } from '@/assets/js/columns.js';

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
    columnsByKey: { type: Object, default: null },
    values: { type: Object, default: null },
    // ------------
    id: { type: String, default: null },
    name: { type: String, default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
    minimum: { type: [Number, String], default: null },
    maximum: { type: [Number, String], default: null },
    multiple: { type: [Boolean, Number], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    // ------------
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
  },
  emits: ['update:value', 'update:error', 'input', 'focus', 'blur'],
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
      set(val) {
        this.$emit('update:value', val);
      },
    },
    mutableError: {
      get() {
        return this.error;
      },
      set(val) {
        this.$emit('update:error', val);
      },
    },
    isForm() {
      return this.columnsByKey && this.values;
    },
    bindAttrs() {
      let config = {
        ...this.$attrs,
        id: this.id,
        name: this.name || this.id,
        type: this.subType || this.type,
        multiple: !!this.multiple,
        checkRule: this.isForm ? checkRule.bind(null, this.columnsByKey, this.values) : null,
      };

      if (this.type === 'text') {
        config = {
          ...config,
          minlength: this.minimum,
          maxlength: this.maximum,
        };
      } else {
        config = {
          ...config,
          min: this.minimum,
          max: this.maximum,
        };
      }

      return config;
    },
  },
  watch: {
    default: {
      handler: function (_default) {
        if (_default != null && this.mutableValue == null) {
          this.mutableValue = _default;
        }
        this.handleCheckRule();
      },
      immediate: true,
    },
    value() {
      this.handleCheckRule();
    },
  },
  methods: {
    focus() {
      this.$refs.el.focus();
    },
    reset() {
      this.$refs.el.reset();
    },
    validity() {
      const validity = this.$refs.el.validity();
      console.log('[validity]', this.id, validity);
      return validity;
    },
    checkValidity() {
      const checkValidity = this.$refs.el.checkValidity();
      console.log('[checkValidity]', this.id, checkValidity);
      return checkValidity;
    },
    handleFocus(e) {
      this.$emit('focus', e);
    },
    handleBlur(e) {
      this.$emit('blur', e);
    },
    handleCheckRule() {
      if (this.isForm) {
        const { errorMsg } = checkRule(this.columnsByKey, this.values, this.id);
        this.mutableError = errorMsg;
      }
    },
  },
};
</script>
