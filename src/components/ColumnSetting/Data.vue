<template>
  <!-- 項目設定 -->
  <fieldset>
    <!-- <legend>項目設定</legend> -->
    <InputRow
      :value="$props.srcMode"
      :label="'資料來源'"
      :type="'select'"
      :options="sourceModeOptions"
      placeholder="請選擇來源"
      is-required
      @input="update('srcMode', $event)"
    />
    <template v-if="$props.srcMode === 'list'">
      <div v-if="$props.items.length" class="items">
        <Draggable :value="$props.items" @input="update('items', $event)">
          <div v-for="(item, idx) in $props.items" :key="item.id" class="input-row inline">
            <div class="drag"><Icon icon="mdi:drag" />{{ idx + 1 }}</div>
            <Field :value="item.text" @input="updateItem(item.id, 'text', $event)" />
            <Icon icon="mdi:close-thick" is-btn @click="removeItem(idx)" />
          </div>
        </Draggable>
      </div>
      <button class="btn btn--add" @click.prevent="addItem">&#10010;</button>
    </template>
    <template v-else>
      <InputRow :value="$props.api.url" :label="'API URL'" @input="updateApi('url', $event)" />
      <InputRow :value="$props.api.textKey" :label="'Value Key'" @input="updateApi('textKey', $event)" />
      <InputRow :value="$props.api.valueKey" :label="'Text Key'" @input="updateApi('valueKey', $event)" />
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
        return ['list', 'api'].includes(value);
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
      });
    },
    removeItem(idx) {
      const { id, text } = this.$props.items[idx];

      const allowFunc = () => {
        this.$emit('removeArr', 'items', id);
      };

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
</style>
