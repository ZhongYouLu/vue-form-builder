import Vue from 'vue';
import { instantiateSetState, instantiateGetState } from '@/store/helper.js';
import collects, { mutations as collectsMutations } from '@/store/collects.js';

import {
  nanoid,
  isEmpty,
  clearEmpties,
  arr2ObjByKey,
  arrRemoveValueByKey,
  arrRemoveValues,
  difference,
  deepCopy,
} from '@/assets/js/helper.js';

const state = Vue.observable({ columns: [] });

// Getters
const getters = {
  // 欄位群 (可變的)
  mutableColumns: {
    get() {
      return state.columns;
    },
    set(val) {
      mutations.setColumns(val);
    },
  },
  // 欄位群 (Array to Obj - By Key)
  columnsByKey: () => arr2ObjByKey(state.columns, 'id'),
  // 最終欄位群 (去除不必要的屬性)
  finalColumns: () => processColumns(deepCopy(state.columns)),
};

// Mutations
const mutations = {
  // 設置欄位群
  setColumns(columns) {
    const oldColumns = deepCopy(state.columns);
    state.columns = clearEmpties(columns) || [];

    actions.handleUpdateColumns(state.columns, oldColumns);
  },
  // 新增欄位 (插入位置)
  addColumn(insertIdx = state.columns.length) {
    const emptyColumn = { id: nanoid(6) };
    const newColumns = [...state.columns];
    newColumns.splice(insertIdx, 0, emptyColumn);
    mutations.setColumns(newColumns);
  },
  // 刪除欄位 (欄位ID)
  removeColumn(id) {
    const newColumns = arrRemoveValueByKey(state.columns, 'id', id);
    mutations.setColumns(newColumns);
  },
  // 設置欄位 (欄位ID, 物件路徑, 值, 更新或插入)
  setColumnById(id, objectPath, value = {}, upsert = true) {
    const column = state.columns.find((c) => c.id === id);
    if (column) {
      const setColumn = instantiateSetState(column);
      setColumn({ objectPath, value, upsert });
    }
  },
};

// Actions
const actions = {
  // async fetchColumnsFromApi() {
  //   const res = await fetch('http://localhost:5001/api/columns');
  //   mutations.setColumns(res.data);
  // },
  handleUpdateColumns(after = [], before = []) {
    const afterIds = after.map((c) => c.id);
    const beforeIds = before.map((c) => c.id);
    const addIds = difference(afterIds, beforeIds); // 增加的欄位IDs
    const deductIds = difference(beforeIds, afterIds); // 減少的欄位IDs

    // 有增加的IDs
    if (addIds.length) {
      // 初始集合，提供後續使用。
      addIds.forEach((id) => {
        if (collects[id] === undefined) collectsMutations.setCollect([id], {});
      });
    }

    // 有減少的IDs
    if (deductIds.length) {
      // 監聽連動 [Side Effect]
      after.forEach((column) => {
        const setColumn = instantiateSetState(column);
        const getColumn = instantiateGetState(column);
        let objectPath = null;
        let targetValue = null;

        // 如果有規則
        if (column.rule) {
          // 被連動必填
          objectPath = ['rule', 'requiredPassive'];
          if ((targetValue = getColumn({ objectPath }))) {
            setColumn({ objectPath, value: arrRemoveValues(targetValue, deductIds) });
          }

          // 與...相符
          objectPath = ['rule', 'sameAs'];
          if ((targetValue = getColumn({ objectPath }))) {
            setColumn({ objectPath, value: null });
          }
        }

        // 如果有條件
        if (column.condition) {
          // 顯示
          objectPath = ['condition', 'display'];
          if ((targetValue = getColumn({ objectPath }))) {
            removeConditionDisplayTriggerId(targetValue, deductIds); // recursive & side effect
          }
        }
      });
    }
  },
  handleRemoveColumn(id, handleConfirm = null) {
    const idx = state.columns.findIndex((c) => c.id === id);
    const { name } = state.columns[idx];
    const showMsg = `確定刪除欄位 #${idx + 1} [${name || id}] ?`;

    const allowFunc = mutations.removeColumn.bind(null, id);

    if (typeof handleConfirm === 'function') {
      handleConfirm(showMsg, allowFunc);
    } else {
      if (confirm(showMsg)) allowFunc();
    }
  },
};

export default state.columns;
export { getters, mutations, actions };

// ----------------------
const processColumns = (function () {
  // 處理欄位
  const processColumn = (column) => {
    column = clearEmpties(column);

    return Object.entries(column).reduce((acc, [k, v]) => {
      if (isEmpty(v)) return acc;

      switch (k) {
        case 'rule':
          v = processRule(v);
          break;
        case 'item':
          v = processItem(v);
          break;
        case 'condition':
          v = processCondition(v);
          break;
      }

      if (!isEmpty(v)) acc[k] = v;

      return acc;
    }, {});
  };
  // 處理欄位的規則
  const processRule = (rule) => {
    const { msg, ...newRule } = rule;

    if (msg) {
      const newMsg = Object.entries(msg).reduce((acc, [k, v]) => {
        if (v && newRule[k]) acc[k] = v;
        return acc;
      }, {});

      if (!isEmpty(newMsg)) newRule['msg'] = newMsg;
    }

    return newRule;
  };
  // 處理欄位的項目
  const processItem = (item) => {
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
  };
  // 處理欄位的條件
  const processCondition = (condition) => {
    let { display, ...newCondition } = condition;
    display = processDisplay(display);
    if (!isEmpty(display)) newCondition['display'] = display;

    return newCondition;
  };
  // 處理欄位的條件的顯示
  const processDisplay = (arr) => {
    if (!Array.isArray(arr)) return arr;

    return arr.reduce((acc, d) => {
      if (d.triggerId) {
        let { list, ...newD } = d;
        list = processDisplay(list);
        if (!isEmpty(list)) newD['list'] = list;
        if (!isEmpty(newD)) acc.push(newD);
      }
      return acc;
    }, []);
  };

  return (columns) => columns.map((column) => processColumn(column));
})();

// 初始不存在的id (recursive & side effect)
const removeConditionDisplayTriggerId = (arr, deductIds) => {
  if (!Array.isArray(arr)) return arr;

  return arr.map((d) => {
    if (d.triggerId && deductIds.includes(d.triggerId)) {
      d.triggerId = null;
      d.value = null;
    }
    if (Array.isArray(d.list) && d.list.length) {
      d.list = removeConditionDisplayTriggerId(d.list, deductIds);
    }
    return d;
  });
};
