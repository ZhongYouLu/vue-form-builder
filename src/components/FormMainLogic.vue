<template>
  <div>
    <slot
      :columns="columns"
      :finalColumns="finalColumns"
      :invokeUpdateColumns="invokeUpdateColumns"
      :invokeAdd="invokeAdd"
      :invokeUpdate="invokeUpdate"
      :invokeRemove="invokeRemove"
    />
  </div>
</template>

<script>
import {
  nanoid,
  isEmpty,
  clearEmpties,
  arrUpdateItemByKey,
  arrRemoveValueByKey,
  arrRemoveValues,
  arrRemoveValuesByKey,
  difference,
} from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'FormMainLogic',
  provide() {
    return {
      collect: this.collect,
      setCollect: this.setCollect,
      toggleCollect: this.toggleCollect,
    };
  },
  inject: [
    // 控制對話框 (可選)
    'handleConfirm',
  ],
  props: {
    // 欄位群
    columns: { type: Array, required: true },
  },
  emits: ['update:columns'],
  data() {
    return {
      collect: {},
    };
  },
  computed: {
    // 最終欄位群 (去除不必要的屬性)
    finalColumns() {
      return this.columns.map((column) =>
        Object.entries(column).reduce((acc, [k, v]) => {
          if (isEmpty(v)) return acc;

          if (k === 'rule') {
            const { msg, ...newRule } = v;

            if (msg) {
              const newMsg = Object.entries(msg).reduce((acc, [k, v]) => {
                if (v && newRule[k]) acc[k] = v;
                return acc;
              }, {});

              if (!isEmpty(newMsg)) newRule['msg'] = newMsg;
            }

            v = newRule;
          } else if (k === 'item') {
            const { options, api, ...newItem } = v;

            switch (newItem.srcMode) {
              case 'list':
                newItem['options'] = options;
                break;
              case 'api':
                newItem['api'] = api;
                break;
            }

            v = newItem;
          } else if (k === 'condition') {
            // TODO:
            console.log('finalColumns computed: ', k, v);
          }

          if (!isEmpty(v)) acc[k] = v;

          return acc;
        }, {})
      );
    },
  },
  // 監聽連動 [Side Effect]
  watch: {
    columns(a, b) {
      const diffIds = difference(
        a.map((c) => c.id),
        Object.keys(this.collect)
      );
      if (diffIds.length) {
        diffIds.forEach((id) => this.$set(this.collect, id, {}));
      }

      // 減少
      const deductIds = difference(
        b.map((c) => c.id),
        a.map((c) => c.id)
      );
      if (deductIds.length) {
        a.forEach((c) => {
          // 如果有規則
          if (c.rule) {
            // 連動必填
            c.rule.requiredSync = arrRemoveValues(c.condition.requiredSync, deductIds);
            // 與...相符
            if (deductIds.includes(c.rule.sameAs)) c.rule.sameAs = null;
          }

          // 如果有條件
          if (c.condition) {
            // 顯示
            c.condition.display = this.removeTriggerId(c.condition.display, deductIds);
          }
        });
      }
    },
  },
  methods: {
    // 更新欄位群
    emitUpdate(newColumns) {
      const cleanColumns = clearEmpties(newColumns);
      this.$emit('update:columns', cleanColumns || []);
    },
    // 呼叫更新欄位群
    invokeUpdateColumns(newColumns) {
      console.log('invokeUpdateColumns', newColumns);
      this.emitUpdate(newColumns);
    },
    // 呼叫新增欄位
    invokeAdd() {
      const id = nanoid(6);
      console.log(`invokeAdd:[${id}]`);

      const emptyColumn = { id };
      const newColumns = this.columns.concat(emptyColumn);
      this.emitUpdate(newColumns);
    },
    // 呼叫更新欄位
    invokeUpdate(id, updateProps) {
      console.log(`invokeUpdate:[${id}]`, updateProps);

      const newColumns = arrUpdateItemByKey(this.columns, 'id', id, updateProps);
      this.emitUpdate(newColumns);
    },
    // 呼叫刪除欄位
    invokeRemove(id) {
      // 確認刪除函式
      const allowFunc = () => {
        console.log(`invokeRemove:[${id}]`);

        const newColumns = arrRemoveValueByKey(this.columns, 'id', id);
        this.emitUpdate(newColumns);
      };

      const idx = this.columns.findIndex((c) => c.id === id);
      const { name } = this.columns[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${name || id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    checkCollect(columnId, key) {
      if (this.collect[columnId][key] === undefined) {
        this.$set(this.collect[columnId], key, null);
      }
    },
    toggleCollect(columnId, key) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = !this.collect[columnId][key];
    },
    setCollect(columnId, key, val) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = val;
    },
    removeTriggerId(arr, deductIds) {
      if (!Array.isArray(arr)) return arr;
      arr.map((d) => {
        if (deductIds.includes(d.triggerId)) {
          d.triggerId = null;
          d.value = null;
        }
        if (d.list && d.list.length) {
          d.list = this.removeTriggerId(d.list, deductIds);
        }
        return d;
      });

      return arr;
    },
  },
};
</script>
