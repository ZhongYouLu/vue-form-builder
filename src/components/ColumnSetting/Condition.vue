<template>
  <!-- 條件設定 -->
  <Block tag="fieldset">
    <!-- <legend>條件設定</legend> -->
    <ConditionDisplay
      :level="0"
      :list.sync="matubleDisplay"
      :columns-exclude-self="columnsExcludeSelf"
      :columns-obj-by-key="columnsObjByKey"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </ConditionDisplay>
  </Block>
</template>
<script>
import Block from '@/components/ui/Block';
import ConditionDisplay from '@/components/ColumnSetting/ConditionDisplay';

export default /*#__PURE__*/ {
  name: 'ColumnSettingCondition',
  components: {
    Block,
    ConditionDisplay,
  },
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 顯示條件
    display: { type: Array, default: () => [] },
  },
  emits: ['init', 'update'],
  computed: {
    matubleDisplay: {
      get() {
        return this.display;
      },
      set(val) {
        this.$emit('update', 'display', val);
      },
    },
  },
  created() {
    this.$emit('init', {
      display: this.display,
    });
  },
};
</script>
