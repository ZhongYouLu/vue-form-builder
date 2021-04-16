<template>
  <!-- 條件設定 -->
  <fieldset>
    <!-- <ConditionDisplay
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
    <Button icon="mdi:plus" block @click="addDisplay" /> -->

    <ul>
      <ConditionDisplay
        :item="display"
        :columns-exclude-self="columnsExcludeSelf"
        :columns-obj-by-key="columnsObjByKey"
        :type-icons="typeIcons"
        @make-folder="makeFolder"
        @add-item="addItem"
      ></ConditionDisplay>
    </ul>
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
    // 連動必填元素 (如果自身有值，其元素必填)
    requiredSync: { type: Array, default: () => [] },
    // 顯示條件
    display: {
      type: Object,
      default: () => ({
        name: 'My Tree',
        children: [
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            children: [
              {
                name: 'child folder',
                children: [{ name: 'hello' }, { name: 'wat' }],
              },
              { name: 'hello' },
              { name: 'wat' },
              {
                name: 'child folder',
                children: [{ name: 'hello' }, { name: 'wat' }],
              },
            ],
          },
        ],
      }),
    },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    // 自身必填檢查 (來自其他元素的 requiredSync)
    requiredCheck() {
      const requiredCheck = [];

      this.columnsExcludeSelf.forEach((c) => {
        if (c.condition?.requiredSync?.includes(this.id)) {
          requiredCheck.push(c.id);
        }
      });

      return requiredCheck;
    },
    typeIcons() {
      return typeIcons;
    },
  },
  methods: {
    makeFolder: function (item) {
      this.$set(item, 'children', []);
      this.addItem(item);
    },
    addItem: function (item) {
      item.children.push({
        name: 'new stuff',
      });
    },

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

<style>
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 1em;
  line-height: 1.5em;
  list-style-type: dot;
}
</style>
