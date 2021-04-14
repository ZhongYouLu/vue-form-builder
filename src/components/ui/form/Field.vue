<template>
  <div class="x-field">
    <component
      :is="componentName"
      :id="id"
      ref="input"
      v-model="mutableValue"
      :name="name || id"
      v-bind="$attrs"
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
    value: { type: [String, Number, Boolean, Array], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    type: { validator: (val) => !!typeConfig[val], default: 'text' },
    subType: { validator: (val) => !!subTypeConfig[val], default: null },
    multiple: { type: [Boolean, Number], default: null },
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
  },
  created() {
    console.log('Field', this.id, this.name != this.id && this.name);
  },
};
</script>
