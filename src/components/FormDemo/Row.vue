<template>
  <div class="form-demo-row">
    attrs: {{ $attrs }}
    <div>{{ idx }}. {{ desc }}</div>
    <div>{{ subDesc }}</div>
    <Field v-if="type" v-model="mutableValue" :name="id" v-bind="bind" @blur="isBlur = true" />
    <div>
      {{ isBlur ? errorMsg : null }}
    </div>
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
    errorMsg() {
      const name = this.name || this.id;

      // 必填
      if ((this.required && this.value == null) || this.value === '') {
        return this.msg.required?.replace('[:min]', this.minimum) || `[${name}] 為必填。`;
      }

      if (!this.value) return null;

      // 字元下限
      if (this.minimum && this.minimum > this.value.length) {
        return this.msg.minimum?.replace('[:min]', this.minimum) || `[${name}] 最少 ${this.minimum} 個字。`;
      }

      // 字元上限
      if (this.maximum && this.maximum < this.value.length) {
        return this.msg.maximum?.replace('[:max]', this.maximum) || `[${name}] 最多 ${this.maximum} 個字。`;
      }

      // 與..相符
      if (this.sameAs && this.columnsObjByKey[this.sameAs]) {
        if (this.columnsObjByKey[this.id].type !== this.columnsObjByKey[this.sameAs].type) return null;
        if (this.value === this.values[this.sameAs]) return null;

        const sameAsName = this.sameAs
          ? this.columnsObjByKey[this.sameAs].name || this.columnsObjByKey[this.sameAs].id
          : '';

        return this.msg.sameAs || `[${name}] 與 [${sameAsName}] 不相符`;
      }

      return null;
    },
  },
  watch: {
    errorMsg: {
      handler: function (msg) {
        this.$emit('update:error', msg);
      },
      immediate: true,
    },
  },
};
</script>

<style scoped lang="scss">
// @import '@/assets/scss/utils.scss';
</style>
