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
    id: { type: String, default: null },
    name: { type: String, default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
    minimum: { type: [Number, String], default: null },
    maximum: { type: [Number, String], default: null },
    defaultValue: { type: [String, Number, Boolean, Array], default: null },
    multiple: { type: [Boolean, Number], default: null },
    // ------------
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
    // ------------
    checkRule: { type: Function, default: null },
  },
  emits: ['update:value', 'update:error', 'input', 'focus', 'blur'],
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
      let config = {
        ...this.$attrs,
        id: this.id,
        name: this.name || this.id,
        type: this.subType || this.type,
        defaultValue: this.defaultValue,
        multiple: !!this.multiple,
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
    mutableValue: {
      handler: function () {
        this.checkRule && this.checkRule();
        // this.$nextTick(() => {
        //   this.checkValidity();
        // });
      },
      immediate: true,
    },
    // mutableError: 'checkValidity',
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
      if (!this.$refs.el?.checkValidity) return false;

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
  },
};
</script>
