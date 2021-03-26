<template>
  <div class="form-demo-row">
    {{ $attrs }}
    <div>{{ idx }}. {{ desc }}</div>
    <div>{{ subDesc }}</div>
    <Field v-if="type" v-model="mutableValue" :name="id" v-bind="bind" />
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
    // --- base ---
    desc: { type: String, default: null },
    subDesc: { type: String, default: null },
    type: { type: String, default: null },
    subType: { type: String, default: null },
    placeholder: { type: String, default: null },
    items: { type: Array, default: null },
    isMultiple: { type: Number, default: null },
    // --- rule ---
    required: { type: Number, default: null },
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
    bind() {
      let base = {
        type: this.type,
        placeholder: this.placeholder,
        required: !!this.required,
      };

      switch (this.type) {
        case 'text':
          base = {
            ...base,
            subType: this.subType,
          };
          break;
        case 'checkbox':
        case 'radio':
        case 'select':
          base = {
            ...base,
            options: this.items,
            multiple: !!this.isMultiple,
            clearable: true,
            textKey: 'text',
            valueKey: 'id',
          };
          break;
        default:
          break;
      }

      return base;
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
