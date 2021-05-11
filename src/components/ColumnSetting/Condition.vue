<template>
  <div>
    <ConditionDisplay
      :level="0"
      :list.sync="matubleDisplay"
      :columns-exclude-self="columnsExcludeSelf"
      :columns-by-key="columnsByKey"
    >
      <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
        <slot :name="slot" v-bind="props" />
      </template>
    </ConditionDisplay>
  </div>
</template>
<script>
import ConditionDisplay from '@/components/ColumnSetting/ConditionDisplay';

export default /*#__PURE__*/ {
  name: 'ColumnSettingCondition',
  components: {
    ConditionDisplay,
  },
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // Tab
    tab: { type: String, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsByKey: { type: Object, required: true },
    //-----------
    // 顯示條件
    display: { type: Array, default: () => [] },
  },
  emits: ['update:column'],
  computed: {
    matubleDisplay: {
      get() {
        return this.display;
      },
      set(val) {
        // 拖曳 與 刪除 的時候觸發
        this.updateCondition(['display'], val);
      },
    },
  },
  created() {
    this.updateCondition(['display'], this.matubleDisplay);
  },
  methods: {
    updateColumnById(id, path, val) {
      this.$emit('update:column', id, path, val);
    },
    updateCondition(path, val) {
      this.updateColumnById(this.id, [this.tab, ...path], val);
    },
  },
};
</script>
