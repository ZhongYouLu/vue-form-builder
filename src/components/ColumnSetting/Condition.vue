<template>
  <!-- 基本設定 -->
  <fieldset>
    <!-- <legend>基本設定</legend> -->
    <Field v-model="sync.name" :label="'欄位名稱'" is-required />
    <Field
      v-model="sync.type"
      :label="'欄位屬性'"
      :type="'select'"
      :options="columnTypeOptions"
      placeholder="請選擇屬性"
      is-required
    />
    <Field v-model="sync.label" :label="'欄位說明'" />
    <Field v-model="sync.subLabel" :label="'欄位子說明'" />
    <Field v-model="sync.defaultValue" :label="'預設值'" />
    <template v-if="type === 'text'">
      <hr />
      <Field v-model="sync.placeholder" :label="'提示文字'" placeholder="提示文字" />
      <Field
        v-model="sync.autocomplete"
        :label="'自動完成'"
        :type="'select'"
        :options="autocompleteOptions"
        placeholder="請選擇屬性"
        is-required
      />
    </template>
  </fieldset>
</template>
<script>
import Field from '@/components/Field.vue';
import { convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    Field,
  },
  props: {
    // 欄位名稱
    name: { type: String, default: null },
    // 欄位說明
    label: { type: String, default: null },
    // 欄位子說明
    subLabel: { type: String, default: null },
    // 欄位屬性
    type: { type: String, default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 預設值
    defaultValue: { type: String, default: null },
    // 自動完成
    autocomplete: { type: String, default: null },
    // 屬於輸入欄位
    isInput: { type: Boolean, default: false },
  },
  emits: ['update'],
  data() {
    return {
      sync: {
        name: this.name,
        label: this.label,
        subLabel: this.subLabel,
        type: this.type,
        placeholder: this.placeholder,
        defaultValue: this.defaultValue,
        autocomplete: this.autocomplete,
      },
    };
  },
  computed: {
    columnTypeOptions() {
      return convertOptions({
        text: '文字框 (text)',
        number: '數字框 (number)',
        select: '下拉選單 (select)',
        radio: '單選框 (radio)',
        checkbox: '勾選框 (checkbox)',
      });
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
  watch: {
    sync: {
      handler: function (newVal) {
        const temp = Object.entries(newVal).reduce((p, [k, v]) => {
          if (v) p[k] = v;
          return p;
        }, {});

        this.$emit('update', temp);
      },
      deep: true,
    },
  },
};
</script>
