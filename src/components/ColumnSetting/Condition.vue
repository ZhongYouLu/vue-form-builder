<template>
  <!-- 條件設定 -->
  <fieldset>
    <ConditionDisplay
      v-for="(d, idx) in $props.display"
      :key="d.id"
      :idx="idx"
      v-bind="d"
      :columns-exclude-self="columnsExcludeSelf"
      :columns-obj-by-key="columnsObjByKey"
      :type-icons="typeIcons"
      @update="updateDisplay(d.id, ...arguments)"
      @remove="removeDisplay(d.id)"
    />
    <Button icon="mdi:plus" block @click="addDisplay" />
  </fieldset>
</template>
<script>
import Button from '@/components/ui/Button';
import ConditionDisplay from '@/components/ColumnSetting/ConditionDisplay';
import { nanoid } from '@/assets/js/helper.js';
import { typeIcons } from '@/assets/js/options.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingCondition',
  components: {
    Button,
    ConditionDisplay,
  },
  inject: ['handleConfirm'],
  inheritAttrs: false,
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, default: '(no name)' },
    // 欄位屬性約束
    typeConstraint: { type: Object, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 顯示條件
    display: { type: Array, default: () => [] },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    typeIcons() {
      return typeIcons;
    },
  },
  methods: {
    addDisplay() {
      this.$emit('addArr', 'display', { id: nanoid(6) });
    },
    updateDisplay(id, k, v) {
      this.$emit('updateArr', 'display', id, k, v);
    },
    removeDisplay(id) {
      const allowFunc = () => {
        this.$emit('removeArr', 'display', id);
      };

      const idx = this.$props.display.findIndex((d) => d.id === id);
      const showMsg = `確定刪除顯示條件 #${idx + 1}?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
  },
};
</script>
