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
      v-model="mutableValue"
      :name="name || id"
      :required="!!required"
      v-bind="$attrs"
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
// import { getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'FormItem',
  components: {
    Field,
  },
  inheritAttrs: false,
  props: {
    idx: { type: Number, default: null },
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
  emits: ['update:value', 'update:error'],
  data() {
    return {
      isBlur: null,
      inputEl: null,
    };
  },
  computed: {
    mutableValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update:value', value);
      },
    },
    // typeConstraint() {
    //   return getTypeConstraint(this.type, this.subType, this.multiple);
    // },
    errorMsg: {
      get() {
        return this.error;
      },
      set(msg) {
        // console.log('update:error', msg);
        // this.$emit('update:error', msg);
      },
    },
    sameAsSync() {
      if (!this.columns) return [];

      return this.columns.reduce((acc, column) => {
        if (column.rule?.sameAs === this.id) acc.push(column.id);
        return acc;
      }, []);
    },
  },
  watch: {
    value: {
      handler: function (value) {
        // this.checkRule(this.name || this.id, value);
      },
      immediate: true,
    },
    errorMsg: {
      handler: function (msg) {
        // console.log('inputEl', this.inputEl);
        // if (this.inputEl) this.inputEl.setCustomValidity(msg || '');
      },
      immediate: true,
    },
  },
  created() {
    console.log('FormItem', this.id, this.name);
  },
  updated() {
    // this.inputEl = this.$refs.field.$refs.input.$refs.input;
  },
  mounted() {
    // this.inputEl = this.$refs.field.$refs.input.$refs.input;
  },
  methods: {
    handleFocus() {
      // this.isBlur = false;
    },
    handleBlur() {
      this.isBlur = true;
    },
    checkRule(name, value) {
      // 檢查 - 必填
      if (this.required && (value == null || value === '')) {
        this.errorMsg = this.msg.required || `[${name}] 為必填。`;
        return;
      }

      // (通過必填檢查，但無資料，不進行後續檢查。)
      if (value == null) return;

      // 檢查 - 字元上下限
      if (this.typeConstraint.isText) {
        // 字元下限
        if (this.minimum && this.minimum > value.length) {
          this.errorMsg = (this.msg.minimum || `[${name}] 最少 [:min] 個字。`).replace('[:min]', this.minimum);
          return;
        }

        // 字元上限
        if (this.maximum && this.maximum < value.length) {
          this.errorMsg = (this.msg.maximum || `[${name}] 最多 [:max] 個字。`).replace('[:max]', this.maximum);
          return;
        }
      }

      // 檢查 - 數字上下限
      if (this.typeConstraint.isNumber) {
        // 數字下限
        if (this.minimum && this.minimum > value) {
          this.errorMsg = (this.msg.minimum || `[${name}] 最少 [:min]。`).replace('[:min]', this.minimum);
          return;
        }

        // 數字上限
        if (this.maximum && this.maximum < value) {
          this.errorMsg = (this.msg.maximum || `[${name}] 最多 [:max]。`).replace('[:max]', this.maximum);
          return;
        }
      }

      // 檢查 - 與..相符
      if (this.columnsObjByKey && this.sameAs && this.columnsObjByKey[this.sameAs]) {
        if (
          // 如果同類型
          this.columnsObjByKey[this.id].type === this.columnsObjByKey[this.sameAs].type &&
          // 且相符
          value !== this.values[this.sameAs]
        ) {
          const sameAs = this.columnsObjByKey[this.sameAs];
          const sameAsName = sameAs.name || sameAs.id;

          this.errorMsg = (this.msg.sameAs || `[${name}] 與 [[:sameAs]] 不相符`).replace('[:sameAs]', sameAsName);

          return;
        }
      }

      this.errorMsg = null;
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
