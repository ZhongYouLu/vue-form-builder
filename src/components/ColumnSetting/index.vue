/* eslint-disable vue/no-mutating-props */
<template>
  <div class="column-setting">
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
      @update="updateColumnTab(currentTab, ...arguments)"
      @updateObj="updateColumnTabObj(currentTab, ...arguments)"
      @updateArr="updateColumnTabArr(currentTab, ...arguments)"
      @addArr="addColumnTabArr(currentTab, ...arguments)"
      @removeArr="removeColumnTabArr(currentTab, ...arguments)"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </component>
  </div>
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
    column() {
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
        case 'data':
        case 'condition':
          config.props = {
            ...config.props,
            columnsExcludeSelf: this.columnsExcludeSelf,
            columnsObjByKey: this.columnsObjByKey,
          };
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
      console.log(`updateColumn[${tab}]`, val);
      this.$emit('update', this.column.id, { ...this.column, [tab]: val });
    },
    updateColumnTab(tab, targetKey, targetVal) {
      console.log(`updateColumnTab[${tab}][${targetKey}]`, targetVal);
      const newTab = { ...this.column[tab], [targetKey]: targetVal };
      this.updateColumn(tab, newTab);
    },
    updateColumnTabObj(tab, targetKey, k, v) {
      console.log(`updateColumnTabObj[${tab}][${targetKey}][${k}]`, v);
      const target = this.column[tab][targetKey];
      const newTarget = { ...target, [k]: v };
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    updateColumnTabArr(tab, targetKey, id, k, v) {
      console.log(`updateColumnTabArr[${tab}][${targetKey}][${id}][${k}]`, v);
      const target = this.column[tab][targetKey];
      const idx = target.findIndex((i) => i.id === id);
      const newTarget = [...target.slice(0, idx), { ...target[idx], [k]: v }, ...target.slice(idx + 1)];
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    addColumnTabArr(tab, targetKey, v) {
      console.log(`addColumnTabArr[${tab}][${targetKey}]`, v);
      const target = this.column[tab][targetKey];
      const newTarget = target ? [...target, v] : [v];
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    removeColumnTabArr(tab, targetKey, id) {
      console.log(`removeColumnTabArr[${tab}][${targetKey}]`, id);
      const target = this.column[tab][targetKey];
      const idx = target.findIndex((i) => i.id === id);
      const newTarget = [...target.slice(0, idx), ...target.slice(idx + 1)];
      this.updateColumnTab(tab, targetKey, newTarget);
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

.column-setting {
  fieldset {
    padding: $gap-lg;
  }
}
</style>
