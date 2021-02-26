<template>
  <!-- 基本設定 -->
  <fieldset>
    <!-- <legend>基本設定</legend> -->
    <Field v-model="sync.label" :label="'欄位說明'" />
    <Field v-model="sync.subLabel" :label="'欄位子說明'" />
    <Field v-model="sync.defaultValue" :label="'預設值'" />
    <template v-if="isText">
      <div class="hr-dashed"></div>
      <Field v-model="sync.placeholder" :label="'提示文字'" placeholder="提示文字" />
      <Field
        v-model="sync.autocomplete"
        :label="'自動完成'"
        :type="'select'"
        :options="autocompleteOptions"
        placeholder="請選擇屬性"
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
    // 屬於文字輸入框
    isText: { type: Boolean, default: false },
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
