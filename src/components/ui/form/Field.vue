<template>
  <div class="field2">
    <component
      :is="componentName"
      ref="input"
      v-bind="$attrs"
      v-model="mutableValue"
      :type="subType || type"
      :multiple="multiple"
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
    multiple: { type: Boolean, default: false },
    subType: { type: String, default: null },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'number', 'date', 'radio', 'checkbox', 'select'].includes(value);
      },
    },
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
    componentName() {
      let name = null;
      switch (this.type) {
        case 'text':
        case 'number':
          name = 'x-input';
          break;

        default:
          name = `x-${this.type}`;
          break;
      }
      if (['checkbox', 'radop'].includes(this.type) && this.multiple) name += '-group';
      return name;
    },
  },
  created() {
    if (this.default != null && this.mutableValue == null) {
      this.mutableValue = this.default;
    }
  },
};
</script>
