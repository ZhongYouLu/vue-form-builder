/* eslint-disable vue/no-mutating-props */
<template>
  <div class="column-setting">
    <InputRow
      :value="column.type"
      label="欄位屬性"
      placeholder="請選擇屬性"
      type="select"
      :options="typeOptions"
      required
      @input="updateColumn('type', $event)"
    >
      <!-- Select -->
      <template #selected-option="o">
        <IconRow :icon="typeIcons[o.value]">{{ o.text }}</IconRow>
      </template>
      <template #option="o">
        <IconRow :icon="typeIcons[o.value]">{{ o.text }}</IconRow>
      </template>
    </InputRow>

    <nav class="tabs">
      <template v-for="tab in tabOptions">
        <div v-show="tabShow[tab.value]" :key="tab.value" :class="['tabs__item', { active: currentTab === tab.value }]">
          <span @click="currentTab = tab.value"> {{ tab.text }}</span>
        </div>
      </template>
    </nav>
    <keep-alive>
      <component
        :is="currentCmp.component"
        v-bind="currentCmp.props"
        v-show="tabShow[currentTab]"
        @update="updateColumnTab(currentTab, ...arguments)"
        @updateObj="updateColumnTabObj(currentTab, ...arguments)"
        @addArr="addColumnTabArr(currentTab, ...arguments)"
        @updateArr="updateColumnTabArr(currentTab, ...arguments)"
        @removeArr="removeColumnTabArr(currentTab, ...arguments)"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </component>
    </keep-alive>
  </div>
</template>

<script>
import { InputRow, IconRow } from '@/components/ui';
import SettingBase from '@/components/ColumnSetting/Base';
import SettingItem from '@/components/ColumnSetting/Item';
import SettingRule from '@/components/ColumnSetting/Rule';
import SettingCondition from '@/components/ColumnSetting/Condition';
import {
  arr2ObjByKey,
  arrUpdateItemByKey,
  arrRemoveItemByKey,
  arrRemoveValue,
  difference,
} from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSetting',
  components: {
    InputRow,
    IconRow,
    SettingBase,
    SettingItem,
    SettingRule,
    SettingCondition,
  },
  inject: ['typeOptions', 'typeIcons', 'getTypeConstraint', 'convertOptions'],
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
    item: { type: Object, default: () => ({}) },
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
        item: this.item,
        condition: this.condition,
      };
    },
    tabOptions() {
      return this.convertOptions({
        base: '基本',
        rule: '規則',
        item: '項目',
        condition: '條件',
      });
    },
    tabShow() {
      return {
        base: true,
        rule: true,
        item: this.typeConstraint.needItems,
        condition: true,
      };
    },
    currentCmp() {
      const config = {
        component: `setting-${this.currentTab}`,
        props: {
          id: this.column.id,
          name: this.column.name,
          typeConstraint: this.typeConstraint,
          columnsExcludeSelf: this.columnsExcludeSelf,
          columnsObjByKey: this.columnsObjByKey,
          // -------------------------------------
          ...this.column[this.currentTab],
        },
      };

      return config;
    },
    typeConstraint() {
      return this.getTypeConstraint(this.type, this.base.isMultiple);
    },
    columnsExcludeSelf() {
      return arrRemoveItemByKey(this.columns, 'id', this.id);
    },
    columnsObjByKey() {
      return arr2ObjByKey(this.columns, 'id');
    },
  },
  // 監聽連動 [Side Effect]
  watch: {
    type: function () {
      this.initBaseDefaultValue();

      if (this.typeConstraint.needItems) {
        this.initItem();
      }
    },
    'base.isMultiple': function (isMultiple) {
      this.initBaseDefaultValue(!!isMultiple);
    },
    'item.items': function (a, b) {
      if (a?.length < b?.length || (!a && b)) {
        const diff = difference(b, a || [])[0];
        this.initBaseDefaultValue();
        this.columnsExcludeSelf.map((c) => {
          c.condition?.display?.map((d) => {
            d.values = arrRemoveValue(d.values, diff.id);
          });
        });
      }
    },
  },
  methods: {
    updateColumn(tab, val) {
      console.log(`updateColumn[${tab}]`, val);
      this.column[tab] = val;
      this.$emit('update', this.column.id, this.column);
    },
    updateColumnTab(tab, targetKey, targetVal) {
      console.log(`updateColumnTab[${tab}][${targetKey}]`, targetVal);
      const newTab = { ...this.column[tab], [targetKey]: targetVal };
      this.updateColumn(tab, newTab);
    },
    updateColumnTabObj(tab, targetKey, k, v) {
      console.log(`updateColumnTabObj[${tab}][${targetKey}][${k}]`, v);
      const newTarget = { ...this.column[tab][targetKey], [k]: v };
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    addColumnTabArr(tab, targetKey, v) {
      console.log(`addColumnTabArr[${tab}][${targetKey}]`, v);
      const target = this.column[tab][targetKey];
      const newTarget = target ? [...target, v] : [v];
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    updateColumnTabArr(tab, targetKey, id, k, v) {
      console.log(`updateColumnTabArr[${tab}][${targetKey}][${id}][${k}]`, v);
      const newTarget = arrUpdateItemByKey(this.column[tab][targetKey], 'id', id, { [k]: v });
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    removeColumnTabArr(tab, targetKey, id) {
      console.log(`removeColumnTabArr[${tab}][${targetKey}]`, id);
      const newTarget = arrRemoveItemByKey(this.column[tab][targetKey], 'id', id);
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    //-------------
    initBaseDefaultValue(isMultiple) {
      this.updateColumn('base', {
        ...this.column.base,
        isMultiple: isMultiple ? 1 : null,
        defaultValue: isMultiple ? [] : null,
      });
    },
    initItem() {
      if (!this.column.item.srcMode) {
        this.updateColumn('item', {
          ...this.column.item,
          srcMode: 'list',
          items: [],
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.tabs {
  display: flex;
  margin: $gap-lg 0;

  &__item {
    display: flex;
    margin-right: $gap;

    &:not(:last-child)::after {
      content: '‧';
      margin-left: $gap;
      color: $color-gray-dark;
    }

    &.active {
      span {
        font-weight: bolder;
        color: $color-black;
      }
    }

    span {
      color: $color-gray-dark;
      cursor: pointer;
    }
  }
}

.column-setting {
  fieldset {
    padding: $gap-lg;
  }
}
</style>
