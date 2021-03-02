/* eslint-disable vue/no-mutating-props */
<template>
  <div class="card">
    <!-- Header -->
    <header class="card__header">
      <slot name="header" :handleOpen="handleOpen" :isOpen="isOpen" :column="mutableColumn">
        <div class="card__drag">
          <Icon icon="mdi:drag" />
          <span>#{{ idx + 1 }}</span>
        </div>
        <div class="text-ellipsis">{{ mutableColumn.name ? mutableColumn.name : `${id} (請設定欄位名稱)` }}</div>
        <div class="controll">
          <div class="icon-btn" @click="handleOpen">
            <Icon :icon="isOpen ? 'mdi:eye-minus' : 'mdi:eye-settings'" />
          </div>
          <div class="icon-btn" @click="handleRemove">
            <Icon icon="mdi:close-thick" />
          </div>
        </div>
      </slot>
    </header>
    <!-- Form -->
    <form v-show="isOpen" :id="id" class="card__form">
      <div>
        <Field v-model="mutableColumn.name" :label="'欄位名稱'" is-required />
        <Field
          v-model="mutableColumn.type"
          :label="'欄位屬性'"
          :type="'select'"
          :options="columnTypeOptions"
          placeholder="請選擇屬性"
          is-required
        />
      </div>
      <nav class="tabs block">
        <template v-for="tab in tabOptions">
          <div v-if="tabDisplayConditions[tab.value]" :key="tab.value">
            <div class="tab" :class="{ active: currentTab === tab.value }" @click="currentTab = tab.value">
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
      />
    </form>
  </div>
</template>
<script>
import Icon from '@/components/Icon';
import Field from '@/components/Field.vue';
import ColumnSettingBase from '@/components/ColumnSetting/Base.vue';
import ColumnSettingItem from '@/components/ColumnSetting/Item.vue';
import ColumnSettingRule from '@/components/ColumnSetting/Rule.vue';
import ColumnSettingCondition from '@/components/ColumnSetting/Condition.vue';
import { convertOptions, json2ObjByKey } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSetting',
  components: {
    // Draggable,
    Icon,
    Field,
    'setting-base': ColumnSettingBase,
    'setting-item': ColumnSettingItem,
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
    // 欄位 - 規則提示
    ruluMsg: { type: Object, default: () => ({}) },
    // 欄位 - 項目設定
    item: { type: Object, default: () => ({}) },
    // 欄位 - 顯示條件
    condition: { type: Object, default: () => ({}) },
  },
  emits: ['update', 'delete'],
  data() {
    return {
      isOpen: false,
      currentTab: 'base',
      mutableColumn: {
        name: this.name,
        type: this.type,
        base: this.base,
        rule: this.rule,
        item: this.item,
        condition: this.condition,
      },
    };
  },
  computed: {
    tabOptions() {
      return convertOptions({
        base: '基本',
        rule: '規則',
        item: '項目',
        condition: '顯示條件',
      });
    },
    tabDisplayConditions() {
      return {
        base: true,
        rule: true,
        item: this.needItems,
        condition: true,
      };
    },
    currentCmp() {
      const base = {
        component: `setting-${this.currentTab}`,
        props: {
          class: `block block--${this.currentTab}`,
          // -------------------------------------
          name: this.mutableColumn.name,
          isText: this.isText,
          isCheckBox: this.isCheckBox,
          ...this.mutableColumn[this.currentTab],
        },
      };

      let temp = base;
      switch (this.currentTab) {
        case 'base':
        case 'rule':
          base.props = {
            ...base.props,
            columnsExcludeSelf: this.columnsExcludeSelf,
          };

          break;
        case 'item':
        case 'condition':
        default:
          break;
      }

      return temp;
    },
    columnTypeOptions() {
      return convertOptions({
        text: '文字框 (text)',
        number: '數字框 (number)',
        select: '下拉選單 (select)',
        radio: '單選框 (radio)',
        checkbox: '勾選框 (checkbox)',
      });
    },
    isText() {
      return this.mutableColumn.type === 'text';
    },
    isCheckBox() {
      return this.mutableColumn.type === 'checkbox';
    },
    isInput() {
      return ['text', 'number'].includes(this.mutableColumn.type);
    },
    needItems() {
      return ['select', 'radio', 'checkbox'].includes(this.mutableColumn.type);
    },
    columnsExcludeSelf() {
      const selfID = this.id;
      return this.columns.filter((column) => column.id !== selfID);
    },
    columnsArr() {
      return json2ObjByKey(this.columns, 'id');
    },
  },
  watch: {
    mutableColumn: {
      handler: function (newVal) {
        this.$emit('update', this.idx, {
          id: this.id,
          ...newVal,
        });
      },
      deep: true,
    },
  },
  methods: {
    updateColumn(tab, val) {
      console.log(`updateMutableColumn:${tab}`, val);
      this.mutableColumn[tab] = val;
    },
    handleRemove: function () {
      this.$emit('remove', this.idx);
    },
    handleOpen: function () {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
<style lang="scss">
@import '@/assets/scss/utils.scss';

.card {
  // overflow: hidden;
  position: relative;
  margin-bottom: $gap-lg;
  background-color: $color-white;
  border-radius: $border-radius;
  box-shadow: $shadow-52;
  transition: box-shadow 0.2s ease-in;

  &:hover {
    box-shadow: $shadow-56;
  }

  &__form {
    padding: $gap-lg;
  }

  &__header {
    @include content-centered($x: false);
    padding: $gap $gap-lg;
    color: $color-white;
    font-weight: bolder;
    background-color: lighten($color-gray-dark, 20);

    .controll {
      display: flex;
      margin-left: auto;
    }
  }

  &__drag {
    $len: $font-size;
    flex: 0 1 $len;
    @include content-centered();
    margin-right: $gap * 2;
    user-select: none;
    cursor: move;

    &:hover {
      background-color: lighten($color-gray-dark, 30);
    }

    svg {
      width: $len;
      height: $len;
    }
  }
}

.icon-btn {
  $len: $font-size;
  @include content-centered();
  flex: 0 1 $len;
  width: $len;
  height: $len;
  line-height: $len;
  font-size: $font-size;
  text-align: center;
  border-radius: 50%;
  outline: none;
  user-select: none;
  cursor: pointer;

  .icon {
    width: $len * 0.9;
    height: $len * 0.9;
  }

  &:hover {
    background-color: lighten($color-gray-dark, 30);
  }
}

.text-ellipsis {
  @include truncate(100%);
}

.block {
  box-sizing: border-box;
  padding: $gap-lg;
  border: 0;
  border-radius: $border-radius;
  box-shadow: $shadow-52;

  legend {
    // font-size: 24px;
    line-height: 10px;
    font-weight: bold;
    // margin: auto;
  }
  &--option {
  }
  &--item {
    .item__drag {
      cursor: move;
    }
  }
  &--rule {
  }
  &--msg {
  }
}

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

.hr-dashed {
  margin: $gap-lg 0;
  border-top: 1px dashed $border-color;
}
</style>
