<template>
  <div class="form-demo-row">
    attrs: {{ $attrs }}
    <div>{{ idx }}. {{ desc }}</div>
    <div>{{ subDesc }}</div>
    <Field
      v-if="type"
      ref="field"
      v-model="mutableValue"
      :name="id"
      v-bind="bind"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div>
      {{ isBlur ? errorMsg : null }}
    </div>
    {{ sameAsSync }}
  </div>
</template>

<script>
import Field from '@/components/ui/Field';
import { getTypeConstraint } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'FormDemoRow',
  components: {
    Field,
  },
  props: {
    columns: { type: Array, required: true },
    columnsObjByKey: { type: Object, required: true },
    values: { type: Object, required: true },
    // ------------
    value: { validator: (prop) => prop !== undefined, required: true },
    error: { type: String, default: null },
    // ------------
    id: { type: String, required: true },
    idx: { type: Number, required: true },
    name: { type: String, default: null },
    type: { type: String, default: null },
    // --- base ---
    desc: { type: String, default: null }, // 欄位說明
    subDesc: { type: String, default: null }, // 欄位子說明
    subType: { type: String, default: null }, // 欄位性質
    placeholder: { type: String, default: null }, // 提示文字
    // --- items ---
    items: { type: Array, default: null }, // 項目
    isMultiple: { type: Number, default: null }, // 是否可複選
    // --- rule ---
    msg: { type: Object, default: () => ({}) }, // 規則提示
    required: { type: Number, default: null }, // 必填
    sameAs: { type: String, default: null }, // 與..相符
    regex: { type: String, default: null }, // 驗證格式
    minimum: { type: Number, default: null }, // 字元下限(數字下限)
    maximum: { type: Number, default: null }, // 字元上限(數字上限)
    least: { type: Number, default: null }, // 選擇數量下限 [多選框選項]
    most: { type: Number, default: null }, // 選擇數量上限 [多選框選項]
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
    typeConstraint() {
      return getTypeConstraint(this.type, this.subType, this.isMultiple);
    },
    bind() {
      const base = {
        type: this.type,
        placeholder: this.placeholder,
        required: !!this.required,
      };

      const needItems = {
        options: this.items,
        clearable: true,
        textKey: 'text',
        valueKey: 'id',
      };

      const type = {
        text: {
          subType: this.subType,
          regex: this.regex,
          minimum: this.minimum,
          maximum: this.maximum,
        },
        number: {
          minimum: this.minimum,
          maximum: this.maximum,
        },
        radio: {
          ...needItems,
        },
        checkbox: {
          ...needItems,
          multiple: !!this.isMultiple,
        },
        select: {
          ...needItems,
          multiple: !!this.isMultiple,
        },
      };

      return { ...base, ...type[this.type] };
    },
    errorMsg: {
      get() {
        return this.error;
      },
      set(msg) {
        console.log('update:error', msg);
        this.$emit('update:error', msg);
      },
    },
    sameAsSync() {
      return this.columns.reduce((acc, column) => {
        if (column.rule?.sameAs === this.id) acc.push(column.id);
        return acc;
      }, []);
    },
  },
  watch: {
    value: {
      handler: function (value) {
        const name = this.name || this.id;
        this.checkRule(name, value);
      },
      immediate: true,
    },
    errorMsg: {
      handler: function (msg) {
        console.log('inputEl', this.inputEl);
        if (this.inputEl) this.inputEl.setCustomValidity(msg || '');
      },
      immediate: true,
    },
  },
  updated() {
    this.inputEl = this.$refs.field.$refs.input.$refs.input;
  },
  mounted() {
    this.inputEl = this.$refs.field.$refs.input.$refs.input;
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
      if (this.sameAs && this.columnsObjByKey[this.sameAs]) {
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

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
