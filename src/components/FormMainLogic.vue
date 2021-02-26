<template>
  <div>
    <slot
      :columns="mutableColumns"
      :cleanColumns="cleanColumns"
      :invokeUpdateColumns="invokeUpdateColumns"
      :invokeAdd="invokeAdd"
      :invokeUpdate="invokeUpdate"
      :invokeRemove="invokeRemove"
    />
  </div>
</template>

<script>
import { uuid, deepCopy } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'FormMainLogic',
  inject: [
    // 控制對話框 (可選)
    'handleConfirm',
  ],
  props: {
    // 欄位群
    columns: { type: Array, required: true },
  },
  emits: [
    // :columns.sync
    'update:columns',
  ],
  data() {
    return {
      // 可變的欄位群 (預設id)
      mutableColumns: deepCopy(this.columns).map((column) => {
        return {
          id: uuid(),
          ...column,
        };
      }),
    };
  },
  computed: {
    // 乾淨欄位群 (清除不必要屬性的)
    cleanColumns() {
      const newColumns = this.mutableColumns.map((column) => {
        // TODO: 待清除完整
        // eslint-disable-next-line no-unused-vars
        const { id, item, ...newColumn } = column;

        if (item) {
          const { items, api, ...newItem } = item;

          switch (newItem.srcMode) {
            case 'api':
              newItem['api'] = api;
              break;

            default:
              if (items) {
                const newItems = column['item'].items.map((item) => {
                  // eslint-disable-next-line no-unused-vars
                  const { id, ...newItem } = item;
                  return newItem;
                });
                newItem['items'] = newItems;
              }
              break;
          }

          newColumn['item'] = newItem;
        }

        return newColumn;
      });

      return newColumns;
    },
  },
  watch: {
    // 監聽可變的欄位群，更新父組件。 (單向資料流)
    mutableColumns: {
      handler: function (newVal) {
        this.$emit('update:columns', newVal);
      },
      deep: true,
    },
  },
  methods: {
    invokeUpdateColumns(newVal) {
      this.mutableColumns = newVal;
    },
    invokeAdd() {
      this.mutableColumns.push({ id: uuid() });
    },
    invokeUpdate(idx, newVal) {
      this.$set(this.mutableColumns, idx, {
        id: this.mutableColumns[idx].id,
        ...newVal,
      });
    },
    invokeRemove(idx) {
      const allowFunc = () => {
        this.mutableColumns.splice(idx, 1);
      };

      const column = this.mutableColumns[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${column.base ? column.base.name : null || column.id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    getColumnTemp: function () {
      return {
        // 顯示條件
        conditions: [
          // {
          //   triggerID: 'babyNum',
          //   findOne: ['1', '2', '3', '4'], // 滿足其一
          //   findAll: ['1', '2', '3', '4'], // 滿足全部
          //   // other...
          // },
          // multiple..
        ],
        // 其他檢查設定
        requiredSync: [], // 連動必填元素 (如果自身有值，其元素必填)
        requiredCheck: [], // 自身必填檢查 (來自其他元素的 requiredSync)
        sameAsReverseCheck: [], // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.sameAs)
      };
    },
  },
};
</script>
