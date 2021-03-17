<template>
  <!-- 基本設定 -->
  <fieldset>
    <!-- <legend>基本設定</legend> -->
    <InputRow v-for="(v, k) in fields" :key="k" :value="$props[k]" v-bind="v.props" @input="$emit('update', k, $event)">
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </InputRow>
  </fieldset>
</template>

<script>
import InputRow from '@/components/ui/InputRow';
import { convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    InputRow,
  },
  props: {
    // 屬於文字輸入框
    isText: { type: Boolean, required: true },
    //-----------
    // 加密
    encrypt: { type: Number, default: null },
    // 欄位說明
    label: { type: String, default: null },
    // 欄位子說明
    subLabel: { type: String, default: null },
    // 預設值
    defaultValue: { type: String, default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 自動完成
    autocomplete: { type: String, default: null },
  },
  emits: ['update'],
  computed: {
    fields() {
      let temp = {
        label: { props: { label: '欄位說明' } },
        subLabel: { props: { label: '欄位子說明' } },
        defaultValue: { props: { label: '預設值' } },
        encrypt: { props: { label: '是否加密', text: '加密', type: 'checkbox', yes: 1, no: null } },
      };

      if (this.isText) {
        temp = {
          ...temp,
          placeholder: { props: { label: '提示文字' } },
          autocomplete: {
            props: {
              label: '自動完成',
              placeholder: '請選擇屬性',
              type: 'select',
              options: this.autocompleteOptions,
              clearable: true,
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
};
</script>
