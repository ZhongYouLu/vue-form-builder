<template>
  <!-- 項目設定 -->
  <fieldset>
    <!-- <legend>項目設定</legend> -->
    <InputRow
      :value="$props.srcMode"
      label="資料來源"
      placeholder="請選擇來源"
      type="select"
      :options="sourceModeOptions"
      required
      @input="update('srcMode', $event)"
    />
    <hr class="dashed" />
    <template v-if="$props.srcMode === 'list'">
      <Block v-show="$props.items.length">
        <Draggable :value="$props.items" @input="update('items', $event)">
          <div v-for="(item, idx) in $props.items" :key="item.id" class="input-row">
            <div class="drag"><Icon icon="mdi:drag" />{{ idx + 1 }}</div>
            <Field :value="item.text" :placeholder="`(${item.id})`" @input="updateItem(item.id, 'text', $event)" />
            <Icon icon="mdi:close-thick" is-btn @click="removeItem(item.id)" />
          </div>
        </Draggable>
      </Block>
      <button class="btn btn--add" @click.prevent="addItem">&#10010;</button>
    </template>
    <template v-else>
      <InputRow :value="$props.api.url" label="API URL" required @input="updateApi('url', $event)" />
      <InputRow :value="$props.api.textKey" label="Value Key" required @input="updateApi('textKey', $event)" />
      <InputRow :value="$props.api.valueKey" label="Text Key" required @input="updateApi('valueKey', $event)" />
    </template>
  </fieldset>
</template>

<script>
import { InputRow, Icon, Field, Block, Draggable } from '@/components/ui';
import { nanoid } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingData',
  components: {
    InputRow,
    Icon,
    Field,
    Block,
    Draggable,
  },
  inject: ['handleConfirm', 'convertOptions'],
  props: {
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 資料來源模式
    srcMode: { type: String, default: 'list', validator: (value) => ['list', 'api'].includes(value) },
    // 顯示模式
    displayMode: { type: String, default: 'line', validator: (value) => ['line', 'next', 'bothSide'].includes(value) },
    // 項目
    items: { type: Array, default: () => [] },
    // API設定
    api: { type: Object, default: () => ({ url: '', textKey: '', valueKey: '' }) },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    sourceModeOptions() {
      return this.convertOptions({
        list: '手動設置',
        api: 'API',
      });
    },
    displayModeOptions() {
      return this.convertOptions({
        line: 'Line by Line',
        next: 'Next to each others',
        bothSide: 'Stay on each sides in a row (Left - Right)',
      });
    },
  },
  methods: {
    update(key, val) {
      this.$emit('update', key, val);
    },
    updateApi(key, val) {
      this.$emit('updateObj', 'api', key, val);
    },
    updateItem(id, key, val) {
      this.$emit('updateArr', 'items', id, key, val);
    },
    addItem() {
      this.$emit('addArr', 'items', { id: nanoid(6), text: '' });
    },
    removeItem(id) {
      // 確認刪除函式
      const allowFunc = () => {
        this.$emit('removeArr', 'items', id);
      };

      const idx = this.$props.items.findIndex((item) => item.id === id);
      const { text } = this.$props.items[idx];
      const showMsg = `確定刪除項目 #${idx + 1} [${text || id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

hr.dashed {
  border-top: 1px dashed $border-color;
}
</style>
