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
      @update:value="update(['type'], $event)"
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
        :tab="tab"
        :type-constraint="typeConstraint"
        :columns-by-key="columnsByKey"
        :columns-exclude-self="columnsExcludeSelf"
        v-bind="column[tab]"
        @update:column="updateColumn(...arguments)"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </component>
    </template>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import SettingBase from '@/components/ColumnSetting/Base';
import SettingItem from '@/components/ColumnSetting/Item';
import SettingRule from '@/components/ColumnSetting/Rule';
import SettingCondition from '@/components/ColumnSetting/Condition';
import { typeOptions, getTypeConstraint } from '@/assets/js/options.js';
import { arrUpdateItemByKey, arrRemoveValueByKey, arrRemoveValues, difference } from '@/assets/js/helper.js';

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
    columnsByKey: { type: Object, required: true },
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
    typeOptions() {
      return typeOptions;
    },
    typeConstraint() {
      return getTypeConstraint(this.type, this.base.subType, this.base.multiple);
    },
    columnsExcludeSelf() {
      return arrRemoveValueByKey(this.columns, 'id', this.id);
    },
  },
  // 監聽連動 [Side Effect]
  watch: {
    type: function () {
      this.initBaseDefaultValue();
      if (!this.typeConstraint.isText) {
        this.update(['base', 'subType'], null);
      }
      this.update(['rule', 'sameAs'], null);
      // 連動 [Side Effect]
      this.columnsExcludeSelf.map((c) => {
        if (c.condition?.display) {
          this.updateColumn(c.id, ['condition', 'display'], this.initConditionDisplayValue(c.condition.display));
        }
        if (c.rule?.sameAs === this.id) {
          this.updateColumn(c.id, ['rule', 'sameAs'], null);
        }
      });
      if (!this.typeConstraint.needOptions) {
        if (this.currentTab === 'item') {
          this.currentTab = 'base';
        }
      }
    },
    'base.multiple': function (multiple) {
      this.initBaseDefaultValue(!!multiple);
    },
    'rule.required': function (required) {
      if (required) {
        this.update(['rule', 'requiredPassive'], []);
      }
    },
    'item.options': function (after, before) {
      if (after?.length < before?.length || (!after && before)) {
        const deductOptions = difference(before, after || []);
        const deductOptionIds = deductOptions.map((option) => option.id);

        if (this.column.base?.defaultValue) {
          console.log(this.column.base.defaultValue);
          if (Array.isArray(this.column.base.defaultValue)) {
            if (this.column.base.defaultValue.some((value) => deductOptionIds.includes(value))) {
              this.update(['base', 'defaultValue'], arrRemoveValues(this.base.defaultValue, deductOptionIds));
            }
          } else if (deductOptionIds.includes(this.column.base.defaultValue)) {
            this.update(['base', 'defaultValue'], null);
          }
        }
        this.columnsExcludeSelf.map((c) => {
          if (c.condition?.display) {
            this.updateColumn(
              c.id,
              ['condition', 'display'],
              this.removeConditionDisplayValue(c.condition.display, deductOptionIds)
            );
          }
        });
      }
    },
  },
  methods: {
    updateColumn(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    update(path, val) {
      this.updateColumn(this.id, path, val);
    },
    initBaseDefaultValue(multiple) {
      this.update(['base', 'multiple'], multiple ? 1 : null);
      this.update(['base', 'defaultValue'], multiple ? [] : null);
    },
    initConditionDisplayValue(arr) {
      if (!Array.isArray(arr)) return arr;

      return arr.map((d) => {
        if (d.triggerId === this.id) {
          d.value = null;
        }
        if (d.list && d.list.length) {
          d.list = this.initConditionDisplayValue(d.list);
        }
        return d;
      });
    },
    removeConditionDisplayValue(arr, deductIds) {
      if (!Array.isArray(arr)) return arr;

      return arr.map((d) => {
        if (d.triggerId === this.id) {
          d.value = arrRemoveValues(d.value, deductIds);
        }
        if (d.list && d.list.length) {
          d.list = this.removeConditionDisplayValue(d.list, deductIds);
        }
        return d;
      });
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
