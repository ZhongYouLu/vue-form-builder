<template>
  <div class="field">
    <component :is="typeCmp" v-bind="$attrs" v-model="mutableValue">
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
    value: { type: [String, Number, Boolean, Array, Object, FileList], default: null },
    type: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'number', 'date', 'radio', 'checkbox', 'checkbox-multi', 'select', 'file'].includes(value);
      },
    },
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
      },
    },
    typeCmp() {
      return `field-${this.type}`;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';
@import '@/assets/scss/components/_field.scss';
</style>
