/* eslint-disable vue/no-mutating-props */
<template>
  <div v-if="canDisplay" class="x-form-item">
    <label :for="id" class="label" :class="{ required: required }">
      <span v-if="idx">{{ idx }}.</span>
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
        checkRule,
        // disabled: canDisplay,
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
import { getters as regexGetters } from '@/store/regex.js';
import { getTypeConstraint } from '@/assets/js/options.js';

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
    idx: { type: Number, default: null },
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
      return this.checkConditionDisplay(this.display, 'and');
    },
    regexConfig: regexGetters.regexConfig,
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
      if (!Array.isArray(rootList) || !rootList.length) return true;

      let flag = rootLogic === 'or' ? false : true;

      for (let i = 0; i < rootList.length; i++) {
        const { triggerId, state, value, list, logic: groupLogic } = rootList[i];

        const selfFlag = this.checkDisplayState(triggerId, state, value);

        let tempFlag = selfFlag;

        if (Array.isArray(list) && list.length) {
          const groupFlag = this.checkConditionDisplay(list, groupLogic);

          if (groupLogic === 'or') {
            tempFlag = tempFlag || groupFlag;
          } else {
            tempFlag = tempFlag && groupFlag;
          }
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
      const triggerColumn = this.columnsByKey[triggerId];
      if (!triggerColumn) return true;

      const triggerValue = this.values[triggerId];

      let flag = false;
      switch (state) {
        // 有效的
        case null: {
          flag = this.checkRule(triggerId).flag;
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
          flag = (value || []).some((v) =>
            Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v
          );
          break;
        }
        // 符合全部
        case 'ma': {
          flag = (value || []).every((v) =>
            Array.isArray(triggerValue) ? triggerValue.includes(v) : triggerValue === v
          );
          break;
        }
        // TODO: ...
      }

      return flag;
    },
    checkRule(id) {
      let column;
      try {
        column = this.columnsByKey[id];
      } catch (error) {
        return { flag: true, errorMsg: null };
      }

      const { name: columnName, type, base, rule } = column;
      if (!rule) return { flag: true, errorMsg: null };

      const typeConstraint = getTypeConstraint(type);
      const { required, requiredPassive, minimum, maximum, least, most, regex, sameAs } = rule;

      const value = this.values[id];
      const ruleMsg = rule.msg || {};
      const name = columnName || id;
      let next = true;
      let errorMsg = '';

      // 檢查 - 必填
      if (next) {
        // 自身必填檢查
        let needRequired = required;
        if (!needRequired && requiredPassive && requiredPassive.length) {
          needRequired = requiredPassive.some((cid) => {
            var targetValue = this.values[cid];
            return targetValue != null || targetValue !== '' || (Array.isArray(targetValue) && !targetValue.length);
          });
        }

        if (needRequired && (value == null || value === '' || (Array.isArray(value) && !value.length))) {
          next = false;
          errorMsg = ruleMsg['required'] || `[${name}] 為必填。`;
        }
      }

      // (通過必填檢查，但無資料，不進行後續檢查。)
      if (next && value == null) return { flag: true };

      // 檢查 - 上下限
      if (next) {
        // 文字
        if (typeConstraint.isText) {
          // 字元下限
          if (minimum && minimum > value.length) {
            next = false;
            errorMsg = (ruleMsg['minimum'] || `[${name}] 最少 [:min] 個字。`).replace('[:min]', minimum);
          }
          // 字元上限
          if (maximum && maximum < value.length) {
            next = false;
            errorMsg = (ruleMsg['maximum'] || `[${name}] 最多 [:max] 個字。`).replace('[:max]', maximum);
          }
        }
        // 數字
        else if (typeConstraint.isNumber) {
          // 數字下限
          if (minimum && minimum > value) {
            next = false;
            errorMsg = (ruleMsg['minimum'] || `[${name}] 最少 [:min]。`).replace('[:min]', minimum);
          }
          // 數字上限
          if (maximum && maximum < value) {
            next = false;
            errorMsg = (ruleMsg['maximum'] || `[${name}] 最多 [:max]。`).replace('[:max]', maximum);
          }
        }
        // 日期
        else if (typeConstraint.isDate) {
          const valueDateTime = new Date(value).getTime();
          // 日期下限
          if (minimum && new Date(minimum).getTime() > valueDateTime) {
            next = false;
            errorMsg = (ruleMsg['minimum'] || `[${name}] 不得小於 [:min]。`).replace('[:min]', minimum);
          }
          // 日期上限
          if (maximum && new Date(maximum).getTime() < valueDateTime) {
            next = false;
            errorMsg = (ruleMsg['maximum'] || `[${name}] 不得大於 [:max]。`).replace('[:max]', maximum);
          }
        }
        // 選擇數量
        else if (base.multiple) {
          // 選擇數量下限
          if (least && least > value.length) {
            next = false;
            errorMsg = (ruleMsg['least'] || `[${name}] 最少選 [:least]。`).replace('[:least]', least);
          }
          // 選擇數量上限
          if (most && most < value.length) {
            next = false;
            errorMsg = (ruleMsg['most'] || `[${name}] 最多選 [:most]。`).replace('[:most]', most);
          }
        }
      }

      // 檢查 - Regex
      if (next && regex) {
        if (!new RegExp(this.regexConfig[regex].pattern, 'gi').test(value)) {
          next = false;
          errorMsg = ruleMsg['regex'] || `[${name}] 格式驗證失敗。`;
        }
      }

      // 檢查 - 與..相符
      if (next && sameAs) {
        const sameAsColumn = this.columnsByKey[sameAs];
        const sameAsValue = this.values[sameAs];
        if (sameAsColumn) {
          if (!base?.multiple) {
            if (value !== sameAsValue) next = false;
          } else {
            if (value.length !== sameAsValue.length) next = false;
            if (!value.every((v) => sameAsValue.includes(v))) next = false;
          }

          if (!next) {
            const sameAsName = sameAsColumn.name || sameAs;
            errorMsg = ruleMsg['sameAs'] || `[${name}] 與 [${sameAsName}] 不相符。`;
          }
        }
      }

      return { flag: next, errorMsg };
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
