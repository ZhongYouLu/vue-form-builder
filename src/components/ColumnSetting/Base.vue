<template>
  <SlideFadeTransitionGroup>
    <FormItem
      v-for="(v, k) in fields"
      :key="k"
      v-bind="{
        id: `[${id}]-${k}`,
        value: $props[k],
        ...v.props,
      }"
      @update:value="updateBase([k], $event)"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </FormItem>
  </SlideFadeTransitionGroup>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import SlideFadeTransitionGroup from '@/components/ui/transition-group/SlideFade';
import { subTypeOptions } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    FormItem,
    SlideFadeTransitionGroup,
  },
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // Tab
    tab: { type: String, required: true },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 所有欄位群 (obj by key)
    columnsByKey: { type: Object, required: true },
    //-----------
    // 欄位說明
    desc: { type: String, default: null },
    // 欄位子說明
    subDesc: { type: String, default: null },
    // 提示文字
    placeholder: { type: String, default: null },
    // 預設值
    defaultValue: { type: [String, Number, Boolean, Array], default: null },
    // 勾選框文字
    label: { type: String, default: null },
    // 欄位性質
    subType: { type: String, default: null },
    // 多
    multi: { type: Number, default: null },
    // 可複選
    multiple: { type: Number, default: null },
    // 自動完成區段
    // autocompleteSection: { type: String, default: null },
    // 自動完成
    // autocomplete: { type: String, default: null },
    // 加密
    encrypt: { type: Number, default: null },
  },
  emits: ['update:column'],
  computed: {
    fields() {
      let fields = {
        desc: { props: { desc: '欄位說明' } },
        subDesc: { props: { desc: '欄位子說明' } },
      };

      if (this.typeConstraint.isInput || this.typeConstraint.isSelect) {
        fields['placeholder'] = { props: { desc: '提示文字' } };
      }

      if (!this.typeConstraint.isFile) {
        fields['defaultValue'] = { props: { desc: '預設值' } };
      }

      if (this.typeConstraint.isText) {
        fields['subType'] = {
          props: {
            desc: '欄位性質',
            placeholder: '預設: 文字',
            type: 'select',
            options: subTypeOptions,
            clearable: true,
            fuseKeys: ['id', 'text'],
          },
        };
        fields['multi'] = { props: { desc: '多行', type: 'checkbox', label: '多行' } };
      }

      // Change defalutValue.props.type
      if (this.typeConstraint.isNumber) {
        fields.defaultValue.props.type = 'number';
      } else if (this.typeConstraint.isDate) {
        fields.defaultValue.props.type = 'date';
      } else if (this.typeConstraint.isCheckbox && !this.multiple) {
        fields.defaultValue.props.type = 'checkbox';
      } else if (this.typeConstraint.needOptions) {
        fields.defaultValue.props = {
          ...fields.defaultValue.props,
          type: 'select',
          placeholder: '請選擇',
          searchPlaceholder: '開始嘗試搜尋項目',
          options: this.columnsByKey[this.id].item?.options,
          multiple: !!this.multiple,
          clearable: true,
          // taggable: true,
          // pushTags: true,
          // reactable: true,
        };
      }

      if (this.typeConstraint.isCheckbox && !this.multiple) {
        fields['label'] = { props: { desc: '勾選文字' } };
      }

      if (this.typeConstraint.canMultiple) {
        fields['multiple'] = { props: { desc: '可複選', type: 'checkbox', label: '可複選' } };
      }

      if (this.typeConstraint.isInput) {
        fields = {
          ...fields,
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
          encrypt: { props: { desc: '資料庫加密', type: 'checkbox', label: '加密' } },
        };
      }

      return fields;
    },
  },
  methods: {
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    updateBase(path, val) {
      this.updateColumnById(this.id, [this.tab, ...path], val);
    },
  },
};
</script>
