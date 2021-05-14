/* eslint-disable vue/no-mutating-props */
<template>
  <div v-if="canDisplay" class="x-form-item">
    <label :for="id" class="label" :class="{ required: required }">
      <slot name="text-left"></slot>
      <span>{{ desc }}</span>
      <slot name="text-right"></slot>
    </label>
    <Field
      ref="field"
      v-bind="{
        ...$attrs,
        id,
        name: name || id,
        required: !!required,
        // -----------
        columns,
        columnsByKey,
        values,
      }"
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
    columnsByKey: { type: Object, default: null },
    values: { type: Object, default: null },
    // ------------
    id: { type: String, required: true },
    name: { type: String, default: null },
    desc: { type: String, default: null }, // 欄位說明
    subDesc: { type: String, default: null }, // 欄位子說明
    required: { type: [Boolean, Number], default: null },
    display: { type: Array, default: null },
    // ------------
    value: { type: [String, Number, Boolean, Array], default: null },
    error: { type: String, default: null },
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
    canDisplay() {
      return this.checkConditionDisplay(this.display, 'and');
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
    checkConditionDisplay(rootList, rootLogic) {
      if (rootList == null || !rootList.length) return true;

      let flag = rootLogic === 'or' ? false : true;

      for (let i = 0; i < rootList.length; i++) {
        const { triggerId, state, value, list, logic: groupLogic } = rootList[i];

        const selfFlag = this.checkDisplayState(triggerId, state, value);
        const groupFlag = this.checkConditionDisplay(list, groupLogic);

        let tempFlag;
        if (groupLogic === 'or') {
          tempFlag = selfFlag || groupFlag;
        } else {
          tempFlag = selfFlag && groupFlag;
        }

        if (rootLogic === 'or') {
          flag = flag || tempFlag;
        } else {
          flag = flag && tempFlag;
        }

        if (!flag) return false;
      }

      return flag;
    },
    checkDisplayState(triggerId, state = null, value = null) {
      let triggerColumn = this.columnsByKey[triggerId];
      if (!triggerColumn) return true;

      let triggerValue = this.values[triggerId];

      let flag = false;
      switch (state) {
        // 有效的
        case null: {
          flag = this.checkRule(triggerValue, triggerColumn);
          break;
        }
        // 空值
        case '0': {
          flag = triggerValue == null || triggerValue === '';
          break;
        }
        // 不為空
        case '1': {
          flag = triggerValue != null && triggerValue !== '';
          break;
        }
        // 符合其一
        case 'mo': {
          flag = (value || []).some((v) => v === triggerValue);
          break;
        }
        // 符合全部
        case 'ma': {
          flag = (value || []).every((v) => v === triggerValue);
          break;
        }
        // TODO: ...
      }

      return flag;
    },
    checkRule(value, { type, rule } = {}) {
      const { required, minimum, maximum, sameAs } = rule;

      // 檢查 - 必填
      if (required && (value == null || value === '')) return false;

      // (通過必填檢查，但無資料，不進行後續檢查。)
      if (value == null) return true;

      // 檢查 - 上下限
      if (type === 'text') {
        if (minimum && minimum > value.length) return false;
        if (maximum && minimum < value.length) return false;
      } else if (type === 'number') {
        if (minimum && minimum > value) return false;
        if (maximum && minimum < value) return false;
      }

      // 檢查 - 與..相符
      if (sameAs && this.columnsByKey[this.sameAs]) {
        if (value !== this.values[this.sameAs]) return false;
      }

      return true;
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
