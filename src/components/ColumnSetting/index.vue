/* eslint-disable vue/no-mutating-props */
<template>
  <form :id="`form_${id}`">
    <InputRow
      :value="column.type"
      label="欄位屬性"
      placeholder="請選擇屬性"
      type="select"
      :options="columnTypeOptions"
      @input="updateColumn('type', $event)"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </InputRow>

    <nav class="tabs">
      <template v-for="tab in tabOptions">
        <div v-if="tabDisplayConditions[tab.value]" :key="tab.value">
          <div :class="['tab', { active: currentTab === tab.value }]" @click="currentTab = tab.value">
            {{ tab.text }}
          </div>
        </div>
      </template>
    </nav>

    <component
      :is="currentCmp.component"
      v-bind="currentCmp.props"
      v-if="tabDisplayConditions[currentTab]"
      @update="updateColumn(currentTab, $event)"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </component>
  </form>
</template>

<script>
import InputRow from '@/components/ui/InputRow';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import ColumnSettingBase from '@/components/ColumnSetting/Base';
import ColumnSettingData from '@/components/ColumnSetting/Data';
import ColumnSettingRule from '@/components/ColumnSetting/Rule';
import ColumnSettingCondition from '@/components/ColumnSetting/Condition';
import { convertOptions, json2ObjByKey } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSetting',
  components: {
    InputRow,
    Field,
    Icon,
    'setting-base': ColumnSettingBase,
    'setting-data': ColumnSettingData,
    'setting-rule': ColumnSettingRule,
    'setting-condition': ColumnSettingCondition,
  },
  props: {
    idx: { type: Number, required: true },
    columns: { type: Array, required: true },
    //-----------
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, default: '' },
    // 欄位屬性
    type: { type: String, default: '' },
    // 欄位 - 基本設定
    base: { type: Object, default: () => ({}) },
    // 欄位 - 規則設定
    rule: { type: Object, default: () => ({}) },
    // 欄位 - 項目設定
    data: { type: Object, default: () => ({}) },
    // 欄位 - 顯示條件
    condition: { type: Object, default: () => ({}) },
  },
  emits: ['update'],
  data() {
    return {
      currentTab: 'base',
    };
  },
  computed: {
    column: {
      get() {
        return {
          id: this.id,
          name: this.name,
          type: this.type,
          base: this.base,
          rule: this.rule,
          data: this.data,
          condition: this.condition,
        };
      },
      set(newColumn) {
        this.$emit('update', newColumn.id, newColumn);
      },
    },
    tabOptions() {
      return convertOptions({
        base: '基本',
        rule: '規則',
        data: '項目',
        condition: '條件',
      });
    },
    tabDisplayConditions() {
      return {
        base: true,
        rule: true,
        data: this.needItems,
        condition: true,
      };
    },
    currentCmp() {
      const config = {
        component: `setting-${this.currentTab}`,
        props: {
          id: this.column.id,
          name: this.column.name,
          isText: this.isText,
          isCheckBox: this.isCheckBox,
          // -------------------------------------
          ...this.column[this.currentTab],
        },
      };

      switch (this.currentTab) {
        case 'rule':
        case 'condition':
          config.props = {
            ...config.props,
            columnsExcludeSelf: this.columnsExcludeSelf,
            columnsObjByKey: this.columnsObjByKey,
          };
          break;
        case 'data':
        case 'base':
        default:
          break;
      }

      return config;
    },
    columnTypeOptions() {
      return convertOptions({
        text: '文字框 (text)',
        number: '數字框 (number)',
        radio: '單選框 (radio)',
        checkbox: '勾選框 (checkbox)',
        select: '下拉選單 (select)',
      });
    },
    isText() {
      return this.column.type === 'text';
    },
    isCheckBox() {
      return this.column.type === 'checkbox';
    },
    needItems() {
      return ['select', 'radio', 'checkbox'].includes(this.column.type);
    },
    columnsExcludeSelf() {
      const selfID = this.id;
      return this.columns.filter((column) => column.id !== selfID);
    },
    columnsObjByKey() {
      return json2ObjByKey(this.columns, 'id');
    },
  },
  methods: {
    updateColumn(tab, val) {
      console.log(`updateColumn:${tab}`, val);
      this.column = { ...this.column, [tab]: val };
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.tabs {
  display: flex;
  margin: $gap-lg 0;

  & > div {
    display: flex;
    margin-right: $gap;

    &:not(:last-child)::after {
      content: '‧';
      margin-left: $gap;
      color: $color-gray-dark;
    }

    .tab {
      color: $color-gray-dark;
      cursor: pointer;

      &.active {
        font-weight: bolder;
        color: $color-black;
      }
    }
  }
}
</style>
