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
import { nanoid, isEmpty, removeProperty } from '@/assets/js/helper.js';

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
      const newColumns = this.localColumns.map((column) => {
        // TODO: 待清除完整

        const entries = Object.entries(column);
        // const entries = Object.entries(removeProperty('id', column));

        let newColumn = entries.reduce((p, [k, v]) => {
          if (!isEmpty(v)) {
            if (k === 'rule') {
              const { msg, ...newRule } = v;

              const newMsg = Object.entries(msg).reduce((p, [k, v]) => {
                if (v && newRule[k]) p[k] = v;
                return p;
              }, {});

              if (!isEmpty(newMsg)) newRule['msg'] = newMsg;

              v = newRule;
            } else if (k === 'data') {
              const { items, api, ...newItem } = v;

              switch (newItem.srcMode) {
                case 'api':
                  newItem['api'] = api;
                  break;
                case 'list':
                  newItem['items'] = items.map((item) => removeProperty('id', item));
                  break;
              }

              v = newItem;
            }

            if (!isEmpty(v)) p[k] = v;
          }
          return p;
        }, {});

        return newColumn;
      });

      return newColumns;
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
      this.$emit('update:columns', newColumns);
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
          // 如果有規則 - [與...相符]
          if (!isEmpty(c.rule && c.rule.sameAs) && c.rule.sameAs === id) {
            // 取消設置
            c.rule.sameAs = null;
          }

          // 如果有條件 - 顯示
          if (!isEmpty(c.condition && c.condition.display)) {
            c.condition.display = c.condition.display.reduce((p, obj) => {
              // 排除該項
              if (obj.triggerID !== id) return p;
              // else
              p = [...p, obj];
              return p;
            }, []);
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
