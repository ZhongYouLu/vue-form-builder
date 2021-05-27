<template>
  <div class="x-field">
    <component
      :is="componentName"
      ref="el"
      v-bind="{
        ...$attrs,
        id,
        name: name || id,
        type: subType || type,
        multiple: !!multiple,
      }"
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
    multiple: { type: [Boolean, Number], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    // ------------
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
    // ------------
    checkRule: { type: Function, default: null },
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
      set(val) {
        this.$emit('update:value', val);
      },
    },
    mutableError: {
      get() {
        return this.error;
      },
      set(val) {
        if (this.$refs.el) this.$refs.el.$refs.el.setCustomValidity(val || '');
        this.$emit('update:error', val);
      },
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
    reset() {
      this.$refs.el.reset();
    },
    focus() {
      this.$refs.el.focus();
    },
    validity() {
      return this.$refs.el.validity();
    },
    checkValidity() {
      return this.$refs.el.checkValidity();
    },
    handleCheckRule() {
      if (this.checkRule) {
        const { errorMsg } = this.checkRule(this.id);
        this.mutableError = errorMsg;
      }
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
