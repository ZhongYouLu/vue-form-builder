<template>
  <label :class="['input-row', { required: isRequired }]">
    <div class="for">
      <slot name="label-left"></slot>
      <p>{{ label }}</p>
      <slot name="label-right"></slot>
    </div>
    <Field v-bind="$attrs" @input="$emit('input', $event)">
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </Field>
  </label>
</template>

<script>
import Field from '@/components/ui/Field';

export default /*#__PURE__*/ {
  name: 'InputRow',
  components: {
    Field,
  },
  inheritAttrs: false,
  props: {
    label: { type: String, default: '' },
    isRequired: { type: Boolean, default: false },
  },
  emits: ['input'],
};
</script>
