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
      @update:value="updateColumn(['type'], $event)"
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
        v-bind="column[tab]"
        :tab="tab"
        :type-constraint="typeConstraint"
        :columns-by-key="columnsByKey"
        :columns-exclude-self="columnsExcludeSelf"
        @update:column="updateColumnById(...arguments)"
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
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';
import { typeOptions, getTypeConstraint } from '@/assets/js/options.js';
import { arrRemoveValueByKey, arrRemoveValues, difference } from '@/assets/js/helper.js';

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
  computed: {
    ...collectsGetters,
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
    currentTab: {
      get() {
        return this.collects[this.id].currentTab;
      },
      set(tab) {
        this.setCollect([this.id, 'currentTab'], tab);
      },
    },
    typeOptions() {
      return typeOptions;
    },
    typeConstraint() {
      return getTypeConstraint(this.type);
    },
    columnsExcludeSelf() {
      return arrRemoveValueByKey(this.columns, 'id', this.id);
    },
  },
  // 監聽連動 [Side Effect]
  watch: {
    typeConstraint: function (after, before) {
      if (!after.needOptions && this.currentTab === 'item') {
        this.currentTab = 'base';
      }

      // 移除 [與...相符](sameAs)
      this.updateColumn(['rule', 'sameAs'], null);
      this.columnsExcludeSelf.map((c) => {
        if (c.rule?.sameAs === this.id) {
          this.updateColumnById(c.id, ['rule', 'sameAs'], null);
        }
      });

      // 非文字框，移除 [欄位性質](subType)
      if (!after.isText) {
        this.updateColumn(['base', 'subType'], null);
      }

      // 不可多選，移除 [可複選](multiple)
      if (!after.canMultiple) {
        this.updateColumn(['base', 'multiple'], null);
      }

      // TODO: Checkbox & is't multiple , doesn't init defaultValue
      if (!after.needOptions || !before.needOptions) {
        this.initDefaultValue(null);
        this.columnsExcludeSelf.map((c) => {
          if (c.condition?.display) {
            this.initConditionDisplayValue(c.condition.display);
          }
        });
      }

      // 連動 [Side Effect]
    },
    'base.multiple': function (multiple) {
      this.initDefaultValue(multiple);
    },
    'rule.required': function (required) {
      if (required) {
        this.updateColumn(['rule', 'requiredPassive'], []);
      }
    },
    'item.options': function (after = [], before = []) {
      if (after.length < before.length) {
        const deductOptionIds = difference(before, after).map((option) => option.id);

        if (this.column.base?.defaultValue) {
          if (!this.base.multiple && deductOptionIds.includes(this.column.base.defaultValue)) {
            this.updateColumn(['base', 'defaultValue'], null);
          } else if (this.column.base.defaultValue.some((value) => deductOptionIds.includes(value))) {
            this.updateColumn(['base', 'defaultValue'], arrRemoveValues(this.base.defaultValue, deductOptionIds));
          }
        }

        this.columnsExcludeSelf.map((c) => {
          if (c.condition?.display) {
            this.removeConditionDisplayValue(c.condition.display, deductOptionIds);
          }
        });
      }
    },
  },
  created() {
    if (!this.currentTab) this.currentTab = 'base';
  },
  methods: {
    ...collectsMutations,
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    updateColumn(path, val) {
      this.updateColumnById(this.id, path, val);
    },
    initDefaultValue(multiple) {
      this.updateColumn(['base', 'defaultValue'], multiple ? [] : null);
    },
    initConditionDisplayValue(arr) {
      if (!Array.isArray(arr)) return arr;

      return arr.map((d) => {
        if (d.triggerId === this.id) {
          d.value = null;
        }
        if (Array.isArray(d.list) && d.list.length) {
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
        if (Array.isArray(d.list) && d.list.length) {
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
