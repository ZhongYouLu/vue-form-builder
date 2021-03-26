<template>
  <div class="field">
    <component
      :is="componentName"
      v-bind="$attrs"
      v-model="mutableValue"
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
import FieldText from '@/components/ui/Field/Text';
import FieldNumber from '@/components/ui/Field/Number';
import FieldDate from '@/components/ui/Field/Date';
import FieldRadio from '@/components/ui/Field/Radio';
import FieldCheckbox from '@/components/ui/Field/Checkbox';
import FieldCheckboxMulti from '@/components/ui/Field/CheckboxMulti';
import FieldSelect from '@/components/ui/Field/Select';
import FieldFile from '@/components/ui/Field/File';

export default /*#__PURE__*/ {
  name: 'Field',
  components: {
    FieldText,
    FieldNumber,
    FieldDate,
    FieldRadio,
    FieldCheckbox,
    FieldCheckboxMulti,
    FieldSelect,
    FieldFile,
  },
  inheritAttrs: false,
  props: {
    value: { type: [String, Number, Boolean, Array], default: null },
    default: { type: [String, Number, Boolean, Array], default: null },
    multiple: { type: Boolean, default: false },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'number', 'date', 'radio', 'checkbox', 'select', 'file'].includes(value);
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
      let name = `field-${this.type}`;
      if (this.type === 'checkbox' && this.multiple) name += '-multi';
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

<style lang="scss">
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/components/_field.scss';
</style>
