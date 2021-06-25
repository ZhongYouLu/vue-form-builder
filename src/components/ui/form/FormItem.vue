/* eslint-disable vue/no-mutating-props */
<template>
  <div v-show="canDisplay" class="x-form-item">
    <label :for="id" class="label" :class="{ required: required }">
      <span v-if="idx">{{ idx }}.</span>
      <slot name="text-left"></slot>
      <span>{{ desc }}</span>
      <slot name="text-right"></slot>
    </label>
    <Field
      ref="field"
      v-bind="bindAttrs"
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
    </Field>
    <div v-if="testMode">
      <p>mutableValue: {{ mutableValue }}</p>
      <p>mutableError: {{ mutableError }}</p>
      <p>requiredPassive: {{ $attrs.requiredPassive }}</p>
      <p>requiredSync: {{ fields[id].requiredSync }}</p>
      <Button @click="focus">focus</Button>
      <Button @click="reset">reset</Button>
      <Button @click="validity">validity</Button>
      <Button @click="checkValidity">checkValidity</Button>
      <XSwitch v-model="localDisabled" />
    </div>
  </div>
</template>

<script>
import Field from '@/components/ui/form/Field';
import Button from '@/components/ui/Button';
import XSwitch from '@/components/ui/Switch';
import { checkConditionDisplay, processRule, checkRule } from '@/assets/js/columns.js';

export default /*#__PURE__*/ {
  name: 'FormItem',
  components: {
    Field,
    Button,
    XSwitch,
  },
  inheritAttrs: false,
  props: {
    columnsByKey: { type: Object, default: null },
    fields: { type: Object, default: null },
    // ------------
    idx: { type: Number, default: null },
    id: { type: String, required: true },
    name: { type: String, default: null },
    desc: { type: String, default: null }, // 欄位說明
    subDesc: { type: String, default: null }, // 欄位子說明
    required: { type: [Boolean, Number], default: null },
    disabled: { type: Boolean, default: false },
    // ------------
    display: { type: Array, default: null }, // Condition's Display
    // ------------
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
    testMode: { type: Boolean, default: null },
    answerMode: { type: Boolean, default: null },
  },
  emits: ['update:value', 'update:error', 'focus', 'blur'],
  data() {
    return {
      localDisabled: false,
    };
  },
  computed: {
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
        this.$emit('update:error', val);
      },
    },
    canDisplay() {
      return checkConditionDisplay(this.columnsByKey, this.fields, this.display, 'and');
    },
    bindAttrs() {
      return {
        ...this.$attrs,
        id: this.answerMode ? `${this.id}-a` : this.id,
        name: this.name,
        defaultValue: this.fields ? this.fields[this.id]?.defaultValue : this.value,
        required: !!this.required,
        disabled: this.testMode ? this.localDisabled : this.disabled,
        novalidate: !this.canDisplay,
        checkRule: this.invokeCheckRule,
        processRule: this.invokeProcessRule,
      };
    },
  },
  // watch: {
  //   mutableValue: 'invokeProcessRule',
  // },
  methods: {
    focus() {
      this.$refs.field.focus();
    },
    reset() {
      this.$refs.field.reset();
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
    invokeCheckRule() {
      return checkRule(this.columnsByKey, this.fields, this.id);
    },
    invokeProcessRule() {
      return processRule(this.columnsByKey, this.fields, this.id);
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

    & > *,
    .x-input {
      width: 100%;
    }
  }
}
</style>
