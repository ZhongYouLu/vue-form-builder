/* eslint-disable vue/no-mutating-props */
<template>
  <div class="column-setting">
    <FormItem
      v-bind="{
        id: `[${id}]-type`,
        value: type,
        desc: '欄位屬性',
        placeholder: '請選擇屬性',
        type: 'select',
        options: typeOptions,
        fuseKeys: ['id', 'text'],
        required: true,
      }"
      @update:value="updateColumnById(id, ['type'], $event)"
    />
    <FadeTransition>
      <div v-if="type">
        <!-- Tabs -->
        <nav class="tabs">
          <template v-for="(tab, tabKey, idx) in tabs">
            <div v-show="tab.show" :key="tabKey" :class="['tabs__item', { active: tabKey === currentTab }]">
              <span @click="switchTab(tabKey, idx)"> {{ tab.text }}</span>
            </div>
          </template>
        </nav>
        <!-- Settings -->
        <Block tag="fieldset">
          <SliderGroupTransition :back="sliderBack">
            <div v-for="tabKey in Object.keys(tabs)" v-show="tabKey === currentTab" :key="tabKey">
              <component
                :is="`setting-${tabKey}`"
                v-bind="{
                  id,
                  name,
                  typeConstraint,
                  columnsByKey,
                  columnsExcludeSelf,
                  //------------
                  tab: tabKey,
                  ...$props[tabKey],
                }"
                @update:column="updateColumnById(...arguments)"
              >
                <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
                  <slot :name="slot" v-bind="props" />
                </template>
              </component>
            </div>
          </SliderGroupTransition>
        </Block>
      </div>
    </FadeTransition>
  </div>
</template>

<script>
import SettingBase from '@/components/ColumnSetting/Base';
import SettingItem from '@/components/ColumnSetting/Item';
import SettingRule from '@/components/ColumnSetting/Rule';
import SettingCondition from '@/components/ColumnSetting/Condition';
import FormItem from '@/components/ui/form/FormItem';
import Block from '@/components/ui/Block';
import FadeTransition from '@/components/ui/transition/Fade';
import SliderTransition from '@/components/ui/transition/Slider';
import SliderGroupTransition from '@/components/ui/transition-group/Slider';
import { getters as collectsGetters, mutations as collectsMutations } from '@/store/collects.js';
import { typeOptions, getTypeConstraint } from '@/assets/js/options.js';
import { arrRemoveValueByKey } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSetting',
  components: {
    SettingBase,
    SettingItem,
    SettingRule,
    SettingCondition,
    // UI
    FormItem,
    Block,
    // Transition
    FadeTransition,
    SliderTransition,
    SliderGroupTransition,
  },
  props: {
    columns: { type: Array, required: true },
    columnsByKey: { type: Object, required: true },
    //-----------
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, default: null },
    // 欄位屬性
    type: { type: String, default: null },
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
      sliderBack: false,
      tempTabIdx: -1,
    };
  },
  computed: {
    collects: collectsGetters.collects,
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
    typeConstraint: function (val) {
      if (!val.needOptions && this.currentTab === 'item') {
        this.currentTab = 'base';
      }
    },
  },
  created() {
    if (!this.currentTab) this.currentTab = 'base';
  },
  methods: {
    setCollect: collectsMutations.setCollect,
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    switchTab(tab, idx) {
      this.sliderBack = idx < this.tempTabIdx;
      this.tempTabIdx = idx;

      this.currentTab = tab;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

// .column-setting {
//   padding: $gap-lg;
// }

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
</style>
