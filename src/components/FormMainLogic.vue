<template>
  <div>
    <slot
      :columns="localColumns"
      :cleanColumns="cleanColumns"
      :invokeUpdateColumns="invokeUpdateColumns"
      :invokeAdd="invokeAdd"
      :invokeUpdate="invokeUpdate"
      :invokeRemove="invokeRemove"
      :collect="collect"
      :setCollect="setCollect"
      :toggleCollect="toggleCollect"
    />
  </div>
</template>

<script>
import { nanoid, isEmpty, removeEmpty } from '@/assets/js/helper.js';

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
    // 本地的欄位群
    localColumns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.invokeUpdateColumns(val);
      },
    },
    // 乾淨欄位群 (清除不必要屬性的)
    cleanColumns() {
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
          } else if (k === 'data') {
            const { items, api, ...newItem } = v;

            switch (newItem.srcMode) {
              case 'api':
                newItem['api'] = api;
                break;
              case 'list':
                newItem['items'] = items;
                break;
            }

            v = newItem;
          } else if (k === 'condition') {
            // TODO:
            console.log(k, v);
          }

          if (!isEmpty(v)) acc[k] = v;

          return acc;
        }, {})
      );
    },
  },
  watch: {
    columns(columns) {
      columns.map((column) => {
        if (!this.collect[column.id]) {
          this.$set(this.collect, column.id, {});
        }
      });
    },
  },
  methods: {
    // 更新欄位群
    emitUpdate(newColumns, note) {
      console.log(`${note && `[${note}] `}update:columns`, newColumns);
      this.$emit(
        'update:columns',
        newColumns.map((c) => removeEmpty(c))
      );
    },
    // 呼叫更新欄位群
    invokeUpdateColumns(newColumns) {
      this.emitUpdate(newColumns, 'invokeUpdateColumns');
    },
    // 呼叫新增欄位
    invokeAdd() {
      const emptyColumn = { id: nanoid(6) };
      const newColumns = [...this.localColumns, emptyColumn];

      this.emitUpdate(newColumns, 'invokeAdd');
    },
    // 呼叫更新欄位
    invokeUpdate(id, newColumn) {
      const idx = this.localColumns.findIndex((c) => c.id === id);

      const newColumns = [...this.localColumns];
      newColumns[idx] = {
        id: this.localColumns[idx].id,
        ...newColumn,
      };

      this.emitUpdate(newColumns, 'invokeUpdate');
    },
    // 呼叫刪除欄位
    invokeRemove(id) {
      const idx = this.localColumns.findIndex((c) => c.id === id);

      // 確認刪除函式
      const allowFunc = () => {
        const newColumns = [...this.localColumns];
        // 消除其他欄位相關連動
        newColumns.forEach((c) => {
          // 如果有規則
          if (!isEmpty(c.rule)) {
            // 與...相符
            if (!isEmpty(c.rule.sameAs) && c.rule.sameAs === id) {
              // 取消設置
              c.rule.sameAs = null;
            }
          }

          // 如果有條件
          if (!isEmpty(c.condition)) {
            // 顯示
            if (!isEmpty(c.condition.display)) {
              c.condition.display = c.condition.display.reduce((acc, obj) => {
                // 排除該項
                if (obj.triggerID === id) return acc;
                // else
                acc = [...acc, obj];
                return acc;
              }, []);
            }

            // 連動必填元素
            if (!isEmpty(c.condition.requiredSync)) {
              c.condition.requiredSync = c.condition.requiredSync.reduce((acc, targetID) => {
                if (targetID !== id) acc.push(targetID);
                return acc;
              }, []);
            }
          }
        });
        // 刪除該索引之欄位
        newColumns.splice(idx, 1);

        this.emitUpdate(newColumns, 'invokeRemove');
      };

      const { name } = this.localColumns[idx];
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
  },
};
</script>
