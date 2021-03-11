<template>
  <!-- 項目設定 -->
  <fieldset>
    <!-- <legend>項目設定</legend> -->
    <InputRow
      :value="data.srcMode"
      :label="'資料來源'"
      :type="'select'"
      :options="sourceModeOptions"
      placeholder="請選擇來源"
      is-required
      @input="update('srcMode', $event)"
    />
    <template v-if="data.srcMode === 'api'">
      <InputRow :value="data.api.url" :label="'API URL'" @input="updateApi('url', $event)" />
      <InputRow :value="data.api.textKey" :label="'Value Key'" @input="updateApi('textKey', $event)" />
      <InputRow :value="data.api.valueKey" :label="'Text Key'" @input="updateApi('valueKey', $event)" />
    </template>
    <template v-else>
      <table v-if="data.items.length" class="items">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">idx</th>
            <th scope="col">Text</th>
            <th scope="col">Value</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <Draggable :value="data.items" handle-class="item__drag" tag="tbody" @input="update('items', $event)">
          <tr v-for="(item, idx) in data.items" :key="item.id">
            <td scope="row"><Icon icon="mdi:drag" class="item__drag" /></td>
            <td>{{ idx + 1 }}</td>
            <td><Field :value="item.text" @input="updateItem(item.id, 'text', $event)" /></td>
            <td><Field :value="item.value" @input="updateItem(item.id, 'value', $event)" /></td>
            <td><Icon icon="mdi:close-thick" is-btn @click="removeItem(idx)" /></td>
          </tr>
        </Draggable>
      </table>
      <button class="btn btn--add" @click.prevent="addItem">&#10010;</button>
    </template>
  </fieldset>
</template>

<script>
import Draggable from '@/components/ui/Draggable';
import InputRow from '@/components/ui/InputRow';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { nanoid, convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingItem',
  components: {
    Draggable,
    InputRow,
    Field,
    Icon,
  },
  inject: ['handleConfirm'],
  props: {
    // 資料來源模式
    srcMode: {
      type: String,
      default: 'list',
      validator(value) {
        return ['api', 'list'].includes(value);
      },
    },
    // 顯示模式
    displayMode: {
      type: String,
      default: 'line',
      validator(value) {
        return ['line', 'next', 'bothSide'].includes(value);
      },
    },
    // 項目
    items: { type: Array, default: () => [] },
    // API設定
    api: {
      type: Object,
      // default: null,
      default: () => ({
        url: '',
        textKey: '',
        valueKey: '',
      }),
    },
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  computed: {
    data() {
      return {
        srcMode: this.srcMode,
        displayMode: this.displayMode,
        items: this.items.map((item) => {
          return {
            id: nanoid(6),
            ...item,
          };
        }),
        api: this.api,
      };
    },
    sourceModeOptions() {
      return convertOptions({
        list: '手動設置',
        api: 'API',
      });
    },
    displayModeOptions() {
      return convertOptions({
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
      this.$emit('addArr', 'items', {
        id: nanoid(6),
        text: '',
        value: '',
      });
    },
    removeItem(idx) {
      const allowFunc = () => {
        this.$emit('removeArr', 'items', id);
      };

      const { id, text } = this.data.items[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${text || id}] ?`;

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

.items {
  td {
    padding: $gap;
  }
}

.item__drag {
  cursor: move;
}
</style>
