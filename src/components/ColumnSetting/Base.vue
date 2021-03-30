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
import { subTypeOptions } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    InputRow,
  },
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 欄位說明
    desc: { type: String, default: null },
    // 欄位子說明
    subDesc: { type: String, default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 預設值
    defaultValue: { type: [String, Number, Boolean, Array], default: null },
    // 欄位性質
    subType: { type: String, default: null },
    // 可複選
    isMultiple: { type: Number, default: null },
    // 自動完成區段
    // autocompleteSection: { type: String, default: null },
    // 自動完成
    // autocomplete: { type: String, default: null },
    // 加密
    encrypt: { type: Number, default: null },
  },
  emits: ['update'],
  computed: {
    fields() {
      let temp = {
        desc: { props: { text: '欄位說明' } },
        subDesc: { props: { text: '欄位子說明' } },
      };

      if (this.typeConstraint.isInput || this.typeConstraint.isSelect) {
        temp['placeholder'] = { props: { text: '提示文字' } };
      }

      if (!this.typeConstraint.isFile) {
        temp['defaultValue'] = { props: { text: '預設值' } };
      }

      if (this.typeConstraint.isText) {
        temp['subType'] = {
          props: {
            text: '欄位性質',
            placeholder: '預設: 文字',
            type: 'select',
            options: subTypeOptions,
            clearable: true,
          },
        };
      }

      // Change defalutValue.props.type
      if (this.typeConstraint.isNumber) {
        temp.defaultValue.props.type = 'number';
      } else if (this.typeConstraint.isDate) {
        temp.defaultValue.props.type = 'date';
      } else if (this.typeConstraint.isCheckbox && !this.typeConstraint.isMultiple) {
        temp.defaultValue.props.type = 'checkbox';
      } else if (this.typeConstraint.needItems) {
        temp.defaultValue.props = {
          ...temp.defaultValue.props,
          type: 'select',
          placeholder: '請選擇',
          options: this.columnsObjByKey[this.id].item?.items,
          valueKey: 'id',
          textKey: 'text',
          multiple: !!this.typeConstraint.isMultiple,
          clearable: true,
          taggable: true,
          pushTags: true,
          reactable: true,
        };
      }

      if (this.typeConstraint.isCheckbox || this.typeConstraint.isSelect) {
        temp['isMultiple'] = { props: { text: '可複選', type: 'checkbox', label: '可複選' } };
      }

      if (this.typeConstraint.isInput) {
        temp = {
          ...temp,
          // autocompleteSection: {
          //   props: {
          //     text: '自動完成區段',
          //     type: 'select',
          //     placeholder: '如需區隔再行指定。 e.g. 訂購地址、收件地址',
          //     options: autocompleteSectionOptions,
          //     clearable: true,
          //   },
          // },
          // autocomplete: {
          //   props: {
          //     text: '自動完成',
          //     placeholder: '請選擇',
          //     type: 'select',
          //     options: autocompleteOptions,
          //     clearable: true,
          //   },
          // },
          encrypt: { props: { text: '資料庫加密', type: 'checkbox', label: '加密' } },
        };
      }

      return temp;
    },
  },
};
</script>
