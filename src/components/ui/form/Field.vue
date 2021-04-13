<template>
  <div class="field">
    <component
      :is="componentName"
      ref="input"
      v-bind="$attrs"
      v-model="mutableValue"
      :type="subType || type"
      :multiple="!!multiple"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
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
import XRadio from '@/components/ui/form/Radio';
import XRadioGroup from '@/components/ui/form/RadioGroup';
import XSelect from '@/components/ui/form/Select';
import { typeConfig, subTypeConfig, getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'Field',
  components: {
    XInput,
    XCheckbox,
    XCheckboxGroup,
    XRadio,
    XRadioGroup,
    XSelect,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean, Array], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    multiple: { type: [Boolean, Number], default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
  },
  emits: ['input', 'focus', 'blur'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        console.log('mutableValue', value);
        this.$emit('input', value);
      },
    },
    typeConstraint() {
      return getTypeConstraint(this.type, this.subType, this.multiple);
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
        default:
          name = `x-${this.type}`;
          break;
      }
      if (['checkbox', 'radio'].includes(this.type) && this.multiple) name += '-group';
      return name;
    },
  },
  created() {
    if (this.default != null && this.mutableValue == null) {
      this.mutableValue = this.default;
    }
  },
  methods: {},
};
</script>
