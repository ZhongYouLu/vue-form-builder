<template>
  <div>
    <slot
      :columns="localColumns"
      :finalColumns="finalColumns"
      :invokeUpdateColumns="invokeUpdateColumns"
      :invokeAdd="invokeAdd"
      :invokeUpdate="invokeUpdate"
      :invokeRemove="invokeRemove"
    />
  </div>
</template>

<script>
import { nanoid, isEmpty, clearEmpties, nested2Pairs, pairs2Arr } from '@/assets/js/helper.js';

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
    // 本地的欄位群
    localColumns: {
      get() {
        return this.columns;
      },
      set(val) {
        this.invokeUpdateColumns(val);
      },
    },
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
    typeConfig() {
      // https://www.w3schools.com/tags/tag_input.asp
      return {
        text: { text: '文字框', icon: 'carbon:string-text' },
        number: { text: '數字框', icon: 'carbon:string-integer' },
        date: { text: '日期框', icon: 'carbon:calendar' },
        radio: { text: '單選框', icon: 'carbon:radio-button-checked' },
        checkbox: { text: '複選框', icon: 'carbon:checkbox-checked' },
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
    convertOptions(obj) {
      return pairs2Arr(obj, 'text', 'value');
    },
    getTypeConstraint(type) {
      return {
        isText: type === 'text',
        isNumber: type === 'number',
        isDate: type === 'date',
        isCheckBox: type === 'checkbox',
        isFile: type === 'file',
        isInput: ['text', 'number', 'date'].includes(type),
        needItems: ['select', 'radio', 'checkbox'].includes(type),
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
            // 連動必填元素
            if (!isEmpty(c.condition.requiredSync)) {
              c.condition.requiredSync = c.condition.requiredSync.reduce((acc, targetID) => {
                if (targetID !== id) acc.push(targetID);
                return acc;
              }, []);
            }

            // 顯示
            if (!isEmpty(c.condition.display)) {
              c.condition.display = c.condition.display.reduce((acc, obj) => {
                if (obj.triggerID !== id) acc.push(obj);
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
