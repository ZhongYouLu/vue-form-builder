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
import XInput from '@/components/ui/form/Field/Input';
import XCheckbox from '@/components/ui/form/Field/Checkbox';
import XCheckboxGroup from '@/components/ui/form/Field/CheckboxGroup';
import XRadioGroup from '@/components/ui/form/Field/RadioGroup';
import XSelect from '@/components/ui/form/Field/Select';
import { typeConfig, subTypeConfig } from '@/assets/js/options.js';

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
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
    // ------------
    id: { type: String, default: null },
    name: { type: String, default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
    defaultValue: { type: [String, Number, Boolean, Array], default: null },
    min: { type: [Number, String], default: null },
    max: { type: [Number, String], default: null },
    multiple: { type: [Boolean, Number], default: null },
    // ------------
    checkRule: { type: Function, default: null },
    processRule: { type: Function, default: null },
  },
  emits: ['update:value', 'update:error', 'input', 'focus', 'blur'],
  data() {
    return {
      selfDefaultValue: null,
    };
  },
  computed: {
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
    bindAttrs() {
      let attrs = {
        ...this.$attrs,
        id: this.id,
        name: this.id, // this.name
        type: this.subType || this.type,
        defaultValue: this.selfDefaultValue,
        multiple: !!this.multiple,
        // ------------
        checkRule: this.checkRule,
        processRule: this.processRule,
      };

      if (this.type === 'text') {
        attrs = {
          ...attrs,
          minlength: this.min,
          maxlength: this.max,
        };
      } else {
        attrs = {
          ...attrs,
          min: this.min,
          max: this.max,
        };
      }

      return attrs;
    },
  },
  watch: {
    // mutableValue: 'check',
    // mutableError: 'check',
    defaultValue(val) {
      this.selfDefaultValue = val;
    },
  },
  created() {
    this.selfDefaultValue = this.defaultValue || this.value;
  },
  methods: {
    focus() {
      this.$refs.el.focus();
    },
    reset() {
      this.$refs.el.reset();
    },
    validity() {
      if (!this.$refs.el?.validity) return false;

      const validity = this.$refs.el.validity();
      console.log('[validity]', this.name || this.id, validity);
      return validity;
    },
    checkValidity() {
      if (!this.$refs.el?.checkValidity) return false;

      const checkValidity = this.$refs.el.checkValidity();
      console.log('[checkValidity]', this.name || this.id, checkValidity);
      return checkValidity;
    },
    check() {
      // this.checkRule && this.checkRule();
      // this.processRule && this.processRule();
      this.$nextTick(() => {
        this.checkValidity();
      });
    },
    handleFocus(e) {
      this.$emit('focus', e);
    },
    handleBlur(e) {
      this.$emit('blur', e);
    },
  },
};
</script>
