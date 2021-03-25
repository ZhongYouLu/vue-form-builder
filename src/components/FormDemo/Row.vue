<template>
  <div class="form-demo-row">
    {{ $props }}
    <div>{{ idx }}. {{ desc }}</div>
    <div>{{ subDesc }}</div>
    <template v-if="type">
      <Field
        v-model="mutableValue"
        :name="id"
        :type="type"
        :placeholder="placeholder"
        :sub-type="subType"
        :options="items"
        :multiple="!!isMultiple"
        text-key="text"
        value-key="id"
      />
    </template>
  </div>
</template>

<script>
import Field from '@/components/ui/Field';

export default /*#__PURE__*/ {
  name: 'FormDemoRow',
  components: {
    Field,
  },
  props: {
    value: { validator: (prop) => prop !== undefined, required: true },
    id: { type: String, required: true },
    idx: { type: Number, required: true },
    desc: { type: String, default: null },
    subDesc: { type: String, default: null },
    type: { type: String, default: null },
    subType: { type: String, default: null },
    placeholder: { type: String, default: null },
    items: { type: Array, default: null },
    isMultiple: { type: Number, default: null },
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
