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
  nested2Pairs,
  pairs2Arr,
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
      typeOptions: this.typeOptions,
      typeIcons: this.typeIcons,
      getTypeConstraint: this.getTypeConstraint,
      convertOptions: this.convertOptions,
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
    typeConfig() {
      // https://www.w3schools.com/tags/tag_input.asp
      return {
        text: { text: '文字框', icon: 'carbon:string-text' },
        number: { text: '數字框', icon: 'carbon:string-integer' },
        date: { text: '日期框', icon: 'carbon:calendar' },
        radio: { text: '單選框', icon: 'carbon:radio-button-checked' },
        checkbox: { text: '勾選框', icon: 'carbon:checkbox-checked' },
        select: { text: '下拉選單', icon: 'carbon:list' },
        file: { text: '檔案', icon: 'ic:baseline-attach-file' },
        // ------------------
        // password: { text: '密碼框', icon: 'carbon:password' },
        // email: { text: '電子郵件輸入欄位', icon: '' },
        // date: { text: '日期輸入欄位', icon: '' },
        // tel: { text: '電話號碼輸入欄位', icon: '' },
        // url: { text: '網址輸入欄位', icon: '' },
        // file: { text: '檔案上傳', icon: '' },
      };
    },
    typeOptions() {
      return this.convertOptions(nested2Pairs(this.typeConfig, 'text'));
    },
    typeIcons() {
      return {
        ...nested2Pairs(this.typeConfig, 'icon'),
        undefined: 'carbon:unknown',
      };
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
        diffIds.map((id) => {
          this.$set(this.collect, id, {});
        });
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
            // 與...相符
            if (deductIds.includes(c.rule.sameAs)) c.rule.sameAs = null;
          }

          // 如果有條件
          if (c.condition) {
            // 連動必填
            c.condition.requiredSync = arrRemoveValues(c.condition.requiredSync, deductIds);
            // 顯示
            c.condition.display = arrRemoveValuesByKey(c.condition.display, 'triggerID', deductIds);
          }
        });
      }
    },
  },
  methods: {
    convertOptions(obj) {
      return pairs2Arr(obj, 'text', 'value');
    },
    getTypeConstraint(type, isMultiple) {
      return {
        isText: type === 'text',
        isNumber: type === 'number',
        isDate: type === 'date',
        isCheckbox: type === 'checkbox',
        isSelect: type === 'select',
        isFile: type === 'file',
        isInput: ['text', 'number', 'date'].includes(type),
        needItems: ['select', 'radio', 'checkbox'].includes(type),
        isMultiple: isMultiple,
        filterSame: (columns) => columns.filter((c) => c.type === type),
      };
    },
    // 更新欄位群
    emitUpdate(newColumns, note) {
      console.log(`${note && `[${note}] `}update:columns`, newColumns);
      const cleanColumns = newColumns.map((c) => clearEmpties(c));
      this.$emit('update:columns', cleanColumns);
    },
    // 呼叫更新欄位群
    invokeUpdateColumns(newColumns) {
      this.emitUpdate(newColumns, 'invokeUpdateColumns');
    },
    // 呼叫新增欄位
    invokeAdd() {
      const emptyColumn = { id: nanoid(6) };
      const newColumns = this.columns.concat(emptyColumn);
      this.emitUpdate(newColumns, 'invokeAdd');
    },
    // 呼叫更新欄位
    invokeUpdate(id, newColumn) {
      const newColumns = arrUpdateItemByKey(this.columns, 'id', id, newColumn);
      this.emitUpdate(newColumns, 'invokeUpdate');
    },
    // 呼叫刪除欄位
    invokeRemove(id) {
      // 確認刪除函式
      const allowFunc = () => {
        const newColumns = arrRemoveValueByKey(this.columns, 'id', id);
        this.emitUpdate(newColumns, 'invokeRemove');
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
  },
};
</script>
