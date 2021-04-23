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
      return this.columns.map((column) => this.processColumn(column));
    },
  },
  watch: {
    columns(after, before) {
      // 增加的欄位IDs
      const addIds = difference(
        after.map((c) => c.id),
        Object.keys(this.collect)
      );
      if (addIds.length) {
        // 初始集合，提供後續使用。
        addIds.forEach((id) => this.$set(this.collect, id, {}));
      }

      // 減少的欄位IDs
      const deductIds = difference(
        before.map((c) => c.id),
        after.map((c) => c.id)
      );
      if (deductIds.length) {
        // 監聽連動 [Side Effect]
        after.forEach((c) => {
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
    // -------------
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
    // -------------
    // 確保集合屬性存在
    checkCollect(columnId, key) {
      if (this.collect[columnId][key] === undefined) {
        this.$set(this.collect[columnId], key, null);
      }
    },
    // 切換集合屬性
    toggleCollect(columnId, key) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = !this.collect[columnId][key];
    },
    // 設定集合屬性
    setCollect(columnId, key, val) {
      this.checkCollect(columnId, key);
      this.collect[columnId][key] = val;
    },
    // -------------
    // 處理欄位
    processColumn(column) {
      return Object.entries(column).reduce((acc, [k, v]) => {
        if (isEmpty(v)) return acc;

        switch (k) {
          case 'rule':
            v = this.processRule(v);
            break;
          case 'item':
            v = this.processItem(v);
            break;
          case 'condition':
            v = this.processCondition(v);
            break;
        }

        if (!isEmpty(v)) acc[k] = v;

        return acc;
      }, {});
    },
    // 處理欄位的規則
    processRule(rule) {
      const { msg, requiredSync, ...newRule } = rule;

      if (msg) {
        const newMsg = Object.entries(msg).reduce((acc, [k, v]) => {
          if (v && newRule[k]) acc[k] = v;
          return acc;
        }, {});

        if (!isEmpty(newMsg)) newRule['msg'] = newMsg;
      }

      if (!isEmpty(requiredSync)) newRule['requiredSync'] = requiredSync;

      return newRule;
    },
    // 處理欄位的項目
    processItem(item) {
      const { srcMode, options, api, ...newItem } = item;

      switch (srcMode) {
        case 'list':
          if (!isEmpty(options)) {
            newItem['srcMode'] = srcMode;
            newItem['options'] = options;
          }
          break;
        case 'api':
          if (!isEmpty(api)) {
            newItem['srcMode'] = srcMode;
            newItem['api'] = api;
          }
          break;
      }

      return newItem;
    },
    // 處理欄位的條件
    processCondition(condition) {
      let { display, ...newCondition } = condition;
      display = this.processDisplay(display);
      if (!isEmpty(display)) newCondition['display'] = display;

      return newCondition;
    },
    // 處理欄位的條件的顯示
    processDisplay(arr) {
      if (!Array.isArray(arr)) return arr;

      const temp = arr.map((d) => {
        if (d.triggerId) {
          let { list, ...newD } = d;
          list = this.processDisplay(list);
          if (!isEmpty(list)) newD['list'] = list;

          return newD;
        }
      });

      return !isEmpty(temp) ? temp : null;
    },
    // -------------
    // 初始不存在的id
    removeTriggerId(arr, deductIds) {
      if (!Array.isArray(arr)) return arr;

      return arr.map((d) => {
        if (deductIds.includes(d.triggerId)) {
          d.triggerId = null;
          d.value = null;
        }
        if (d.list && d.list.length) {
          d.list = this.removeTriggerId(d.list, deductIds);
        }
        return d;
      });
    },
  },
};
</script>
