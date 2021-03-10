<template>
  <!-- 基本設定 -->
  <fieldset>
    <!-- <legend>基本設定</legend> -->
    <template v-for="(v, k) in fields">
      <InputRow :key="k" :value="base[k]" v-bind="v.bind" @input="updateBase(k, $event)" />
    </template>
  </fieldset>
</template>

<script>
import InputRow from '@/components/ui/InputRow';
import { isEmpty, convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    InputRow,
  },
  props: {
    // 屬於文字輸入框
    isText: { type: Boolean, required: true },
    //-----------
    // 欄位說明
    label: { type: String, default: null },
    // 欄位子說明
    subLabel: { type: String, default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 預設值
    defaultValue: { type: String, default: null },
    // 自動完成
    autocomplete: { type: String, default: null },
  },
  emits: ['update'],
  computed: {
    base: {
      get() {
        return {
          label: this.label,
          subLabel: this.subLabel,
          placeholder: this.placeholder,
          defaultValue: this.defaultValue,
          autocomplete: this.autocomplete,
        };
      },
      set(newBase) {
        newBase = Object.entries(newBase).reduce((p, [k, v]) => {
          if (!isEmpty(v)) p[k] = v;
          return p;
        }, {});

        this.$emit('update', newBase);
      },
    },
    fields() {
      let temp = {
        label: { bind: { label: '欄位說明' } },
        subLabel: { bind: { label: '欄位子說明' } },
        defaultValue: { bind: { label: '預設值' } },
      };

      if (this.isText) {
        temp = {
          ...temp,
          placeholder: { bind: { label: '提示文字' } },
          autocomplete: {
            bind: {
              label: '自動完成',
              placeholder: '請選擇屬性',
              type: 'select',
              options: this.autocompleteOptions,
            },
          },
        };
      }

      return temp;
    },
    autocompleteOptions() {
      // https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element/input
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
      return convertOptions({
        off: '關閉',
        on: '開啟',
        name: '全名',
        email: '信箱',
        username: '帳號',
        'current-password': '密碼',
        'new-password': '新密碼',
      });
    },
  },
  methods: {
    updateBase(key, val) {
      console.log(`updateBase: ${key}`, val);
      this.base = { ...this.base, [key]: val };
    },
  },
};
</script>
