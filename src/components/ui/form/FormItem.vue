/* eslint-disable vue/no-mutating-props */
<template>
  <div class="x-form-item">
    <label :for="id" class="label" :class="{ required: required }">
      <slot name="text-left"></slot>
      <span>{{ desc }}</span>
      <slot name="text-right"></slot>
    </label>
    <Field
      :id="id"
      ref="field"
      v-bind="$attrs"
      :name="name || id"
      :required="!!required"
      :columns="columns"
      :columns-obj-by-key="columnsObjByKey"
      :values="values"
      :value.sync="mutableValue"
      :error.sync="mutableError"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </Field>
  </div>
</template>

<script>
import Field from '@/components/ui/form/Field';

export default /*#__PURE__*/ {
  name: 'FormItem',
  components: {
    Field,
  },
  inheritAttrs: false,
  props: {
    columns: { type: Array, default: null },
    columnsObjByKey: { type: Object, default: null },
    values: { type: Object, default: null },
    // ------------
    id: { type: String, required: true },
    name: { type: String, default: null },
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
    // ------------
    desc: { type: String, default: null }, // 欄位說明
    subDesc: { type: String, default: null }, // 欄位子說明
    required: { type: [Boolean, Number], default: null },
  },
  emits: ['update:value', 'update:error', 'focus', 'blur'],
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update:value', value);
      },
    },
    mutableError: {
      get() {
        return this.error;
      },
      set(msg) {
        this.$emit('update:error', msg);
      },
    },
  },
  methods: {
    reset() {
      this.$refs.field.reset();
    },
    focus() {
      this.$refs.field.focus();
    },
    validity() {
      return this.$refs.field.validity();
    },
    checkValidity() {
      return this.$refs.field.checkValidity();
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

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-form-item {
  display: flex;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-bottom: $gap;
  }

  &:hover {
    .label {
      // font-weight: bolder;
      color: var(--themeColor);
    }
  }

  .label {
    position: relative;
    // flex: 0 0 10rem;
    flex: 1 1 30%;
    margin-right: var(--hGap);
    padding-top: var(--vGap);
    max-width: 15rem;
    color: var(--fontColor);
    // white-space: nowrap; /* 強迫不換行 */

    &.required::after {
      content: '*';
      position: absolute;
      // left: calc(var(--hGap) * -1);
      top: var(--vGap);
      // vertical-align: middle;
      color: var(--dangerColor);
    }
  }

  .x-field {
    flex: 1 1 20rem;
    width: 100%;

    & > * {
      width: 100%;
    }
  }
}
</style>
