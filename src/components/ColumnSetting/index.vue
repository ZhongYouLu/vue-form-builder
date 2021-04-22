/* eslint-disable vue/no-mutating-props */
<template>
  <div class="column-setting">
    <FormItem
      :id="`[${id}]-type`"
      :value="column.type"
      desc="欄位屬性"
      placeholder="請選擇屬性"
      type="select"
      :options="typeOptions"
      required
      @update:value="updateColumn('type', $event)"
    />
    <!-- Tabs -->
    <nav class="tabs">
      <template v-for="(tab, tabKey) in tabs">
        <div v-show="tab.show" :key="tabKey" :class="['tabs__item', { active: currentTab === tabKey }]">
          <span @click="currentTab = tabKey"> {{ tab.text }}</span>
        </div>
      </template>
    </nav>
    <!-- Settings -->
    <template v-for="tab in Object.keys(tabs)">
      <component
        :is="`setting-${tab}`"
        v-if="tabs[tab].show"
        v-show="tab === currentTab"
        :id="id"
        :key="`${id}-${tab}`"
        :name="column.name"
        :type-constraint="typeConstraint"
        :columns-exclude-self="columnsExcludeSelf"
        :columns-obj-by-key="columnsObjByKey"
        v-bind="column[tab]"
        @init="updateColumn(tab, $event)"
        @update="updateColumnTab(tab, ...arguments)"
        @updateObj="updateColumnTabObj(tab, ...arguments)"
        @addArr="addColumnTabArr(tab, ...arguments)"
        @updateArr="updateColumnTabArr(tab, ...arguments)"
        @removeArr="removeColumnTabArr(tab, ...arguments)"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </component>
    </template>
    <!-- <keep-alive>
      <component
        :is="currentCmp.component"
        v-bind="currentCmp.props"
        v-show="tabs[currentTab].show"
        @init="updateColumn(currentTab, $event)"
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
    </keep-alive> -->
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import SettingBase from '@/components/ColumnSetting/Base';
import SettingItem from '@/components/ColumnSetting/Item';
import SettingRule from '@/components/ColumnSetting/Rule';
import SettingCondition from '@/components/ColumnSetting/Condition';
import { typeOptions, getTypeConstraint } from '@/assets/js/options.js';
import {
  arr2ObjByKey,
  arrUpdateItemByKey,
  arrRemoveItemByKey,
  arrRemoveValues,
  difference,
} from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSetting',
  components: {
    FormItem,
    SettingBase,
    SettingItem,
    SettingRule,
    SettingCondition,
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
    // 欄位 - 項目設定
    item: { type: Object, default: () => ({}) },
    // 欄位 - 規則設定
    rule: { type: Object, default: () => ({}) },
    // 欄位 - 條件設定
    condition: { type: Object, default: () => ({}) },
  },
  emits: ['update:column'],
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
        // --- Settings ---
        base: this.base,
        item: this.item,
        rule: this.rule,
        condition: this.condition,
      };
    },
    tabs() {
      return {
        base: { text: '基本', show: true },
        item: { text: '項目', show: this.typeConstraint.needOptions },
        rule: { text: '規則', show: true },
        condition: { text: '條件', show: true },
      };
    },
    // currentCmp() {
    //   const config = {
    //     component: `setting-${this.currentTab}`,
    //     props: {
    //       id: this.column.id,
    //       name: this.column.name,
    //       typeConstraint: this.typeConstraint,
    //       columnsExcludeSelf: this.columnsExcludeSelf,
    //       columnsObjByKey: this.columnsObjByKey,
    //       // -------------------------------------
    //       ...this.column[this.currentTab],
    //     },
    //   };

    //   return config;
    // },
    typeOptions() {
      return typeOptions;
    },
    typeConstraint() {
      return getTypeConstraint(this.type, this.base.subType, this.base.multiple);
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

      this.columnsExcludeSelf.map((c) => {
        if (c.condition?.display) {
          c.condition.display = this.initConditionDisplayValue(c.condition.display);
        }
      });

      if (!this.typeConstraint.isText) {
        this.updateColumn('base', { ...this.column.base, subType: null });
      }

      if (!this.typeConstraint.needOptions) {
        if (this.currentTab === 'item') {
          this.currentTab = 'base';
        }
      }
    },
    'base.multiple': function (multiple) {
      this.initBaseDefaultValue(!!multiple);
    },
    'item.options': function (after, before) {
      if (after?.length < before?.length || (!after && before)) {
        const deductOptions = difference(before, after || []);
        const deductOptionIds = deductOptions.map((option) => option.id);

        if (this.column.base?.defaultValue.some((value) => deductOptionIds.includes(value))) {
          this.updateColumn('base', {
            ...this.column.base,
            defaultValue: arrRemoveValues(this.base.defaultValue, deductOptionIds),
          });
        }

        this.columnsExcludeSelf.map((c) => {
          if (c.condition?.display) {
            c.condition.display = this.removeConditionDisplayValue(c.condition.display, deductOptionIds);
          }
        });
      }
    },
  },
  methods: {
    updateColumn(tab, newTab) {
      // console.log(`updateColumn[${tab}]`, newTab);
      this.column[tab] = newTab;
      this.$emit('update:column', this.column);
    },
    updateColumnTab(tab, targetKey, targetVal) {
      // console.log(`updateColumnTab[${tab}][${targetKey}]`, targetVal);
      const newTab = { ...this.column[tab], [targetKey]: targetVal };
      this.updateColumn(tab, newTab);
    },
    updateColumnTabObj(tab, targetKey, k, v) {
      // console.log(`updateColumnTabObj[${tab}][${targetKey}][${k}]`, v);
      const newTarget = { ...this.column[tab][targetKey], [k]: v };
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    addColumnTabArr(tab, targetKey, v) {
      // console.log(`addColumnTabArr[${tab}][${targetKey}]`, v);
      const target = this.column[tab][targetKey];
      const newTarget = target ? [...target, v] : [v];
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    updateColumnTabArr(tab, targetKey, id, k, v) {
      // console.log(`updateColumnTabArr[${tab}][${targetKey}][${id}][${k}]`, v);
      const newTarget = arrUpdateItemByKey(this.column[tab][targetKey], 'id', id, { [k]: v });
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    removeColumnTabArr(tab, targetKey, id) {
      // console.log(`removeColumnTabArr[${tab}][${targetKey}]`, id);
      const newTarget = arrRemoveItemByKey(this.column[tab][targetKey], 'id', id);
      this.updateColumnTab(tab, targetKey, newTarget);
    },
    // -------------
    initBaseDefaultValue(multiple) {
      this.updateColumn('base', {
        ...this.column.base,
        multiple: multiple ? 1 : null,
        defaultValue: multiple ? [] : null,
      });
    },
    initConditionDisplayValue(arr) {
      if (!Array.isArray(arr)) return arr;
      arr.map((d) => {
        if (d.triggerId === this.id) {
          d.value = null;
        }
        if (d.list && d.list.length) {
          d.list = this.initConditionDisplayValue(d.list);
        }
        return d;
      });

      return arr;
    },
    removeConditionDisplayValue(arr, targetIds) {
      if (!Array.isArray(arr)) return arr;
      arr.map((d) => {
        if (d.triggerId === this.id) {
          d.value = arrRemoveValues(d.value, targetIds);
        }
        if (d.list && d.list.length) {
          d.list = this.removeConditionDisplayValue(d.list, targetIds);
        }
        return d;
      });

      return arr;
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
    padding: var(--hGap);
  }
}
</style>
