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

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    InputRow,
  },
  inject: ['convertOptions'],
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 欄位說明
    label: { type: String, default: null },
    // 欄位子說明
    subLabel: { type: String, default: null },
    // 預設值
    defaultValue: { type: [String, Number, Boolean, Array], default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 加密
    encrypt: { type: Number, default: null },
    // 欄位性質
    subType: { type: String, default: null },
    // 自動完成
    // autocomplete: { type: String, default: null },
  },
  emits: ['update'],
  computed: {
    fields() {
      let temp = {
        label: { props: { label: '欄位說明' } },
        subLabel: { props: { label: '欄位子說明' } },
      };

      if (!this.typeConstraint.isFile) {
        temp['defaultValue'] = { props: { label: '預設值' } };
      }

      if (this.typeConstraint.isInput) {
        temp['placeholder'] = { props: { label: '提示文字' } };
      }

      if (this.typeConstraint.isText) {
        temp['subType'] = {
          props: {
            label: '欄位性質',
            placeholder: '預設: 文字',
            type: 'select',
            options: this.subTypeOptions,
            clearable: true,
          },
        };

        // if (!this.subType) {
        //   temp['autocomplete'] = {
        //     props: {
        //       label: '自動完成',
        //       placeholder: '預設: 關閉',
        //       type: 'select',
        //       options: this.autocompleteOptions,
        //       clearable: true,
        //     },
        //   };
        // }
      } else if (this.typeConstraint.isNumber) {
        temp = {
          ...temp,
          defaultValue: {
            props: {
              ...temp.defaultValue.props,
              type: 'number',
            },
          },
        };
      } else if (this.typeConstraint.needItems) {
        temp = {
          ...temp,
          defaultValue: {
            props: {
              ...temp.defaultValue.props,
              type: 'select',
              placeholder: '請選擇',
              options: this.columnsObjByKey[this.id].data?.items,
              searchable: true,
              valueKey: 'id',
              textKey: 'text',
              fuseKeys: ['text'],
              // reduce: (option) => option,
              // multiple: this.typeConstraint.isCheckbox,
              // multiple: true,
              taggable: true,
              pushTags: true,
              optionCreatedFlag: true,
              getOptionLabel: (option) => option,

              // reduce: (name) => name.value,
              // createOption: (label) => ({ label, value: -1 }),
            },
          },
        };
      }

      if (this.typeConstraint.isInput) {
        temp['encrypt'] = { props: { label: '資料庫加密', type: 'checkbox', text: '加密', yes: 1, no: null } };
      }

      return temp;
    },
    subTypeOptions() {
      // https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element/input
      return this.convertOptions({
        // text: '文字', // default
        tel: '手機',
        email: '信箱',
        password: '密碼',
        // 其他
        // file: '檔案',
      });
    },
    autocompleteOptions() {
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofilling-form-controls:-the-autocomplete-attribute
      return this.convertOptions({
        // off: '關閉', // default
        name: '全名',
        email: '信箱',
        username: '帳號',
        'current-password': '密碼',
        // 其他
        // 'new-password': '新密碼',
      });
    },
  },
};
</script>
