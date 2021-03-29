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
      // inputEl: null,
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
        this.$emit('update:error', msg);
      },
    },
  },
  watch: {
    value: {
      handler: function (value) {
        const name = this.name || this.id;

        // 必填
        if ((this.required && value == null) || value === '') {
          this.errorMsg = this.msg.required || `[${name}] 為必填。`;
          return;
        }

        if (value == null) return null;

        if (this.typeConstraint.isText) {
          // 字元下限
          if (this.minimum && this.minimum > value.length) {
            this.errorMsg =
              this.msg.minimum?.replace('[:min]', this.minimum) || `[${name}] 最少 ${this.minimum} 個字。`;
            return;
          }

          // 字元上限
          if (this.maximum && this.maximum < value.length) {
            this.errorMsg =
              this.msg.maximum?.replace('[:max]', this.maximum) || `[${name}] 最多 ${this.maximum} 個字。`;
            return;
          }
        }

        if (this.typeConstraint.isNumber) {
          // 數字下限
          if (this.minimum && this.minimum > value) {
            this.errorMsg = this.msg.minimum?.replace('[:min]', this.minimum) || `[${name}] 最少 ${this.minimum}。`;
            return;
          }

          // 數字上限
          if (this.maximum && this.maximum < value) {
            this.errorMsg = this.msg.maximum?.replace('[:max]', this.maximum) || `[${name}] 最多 ${this.maximum}。`;
            return;
          }
        }

        // 與..相符
        if (this.sameAs && this.columnsObjByKey[this.sameAs]) {
          if (this.columnsObjByKey[this.id].type !== this.columnsObjByKey[this.sameAs].type) return null;
          if (value === this.values[this.sameAs]) return null;

          const sameAsName = this.sameAs
            ? this.columnsObjByKey[this.sameAs].name || this.columnsObjByKey[this.sameAs].id
            : '';

          this.errorMsg = this.msg.sameAs || `[${name}] 與 [${sameAsName}] 不相符`;
          return;
        }

        this.errorMsg = null;
      },
      immediate: true,
    },
    // errorMsg: {
    //   handler: function (msg) {
    //     console.log('inputEl', this.inputEl);
    //     if (this.inputEl) this.inputEl.setCustomValidity(msg || '');
    //   },
    //   immediate: true,
    // },
  },
  // updated() {
  //   this.inputEl = this.$refs.field.$refs.input.$refs.input;
  // },
  // mounted() {
  //   this.inputEl = this.$refs.field.$refs.input.$refs.input;
  // },
  methods: {
    handleFocus() {
      // this.isBlur = false;
    },
    handleBlur() {
      this.isBlur = true;
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
