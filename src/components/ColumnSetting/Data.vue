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
      @input="updateData('srcMode', $event)"
    />
    <template v-if="data.srcMode === 'api'">
      <InputRow v-model.trim="data.api.url" :label="'API URL'" />
      <InputRow v-model.trim="data.api.textKey" :label="'Value Key'" />
      <InputRow v-model.trim="data.api.valueKey" :label="'Text Key'" />
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
        <Draggable v-model="data.items" animation="300" ghost-class="ghost" handle=".item__drag" tag="tbody">
          <tr v-for="(item, idx) in data.items" :key="item.id">
            <td scope="row">
              <div class="icon-btn item__drag">
                <Icon icon="mdi:drag" />
              </div>
            </td>
            <td>{{ idx + 1 }}</td>
            <td>
              <div class="input"><input v-model.trim="item.text" type="text" /></div>
            </td>
            <td>
              <div class="input"><input v-model.trim="item.value" type="text" /></div>
            </td>
            <td>
              <div class="icon-btn" @click="invokeRemove(idx)">
                <Icon icon="mdi:close-thick" />
              </div>
            </td>
          </tr>
        </Draggable>
      </table>
      <button class="btn btn--add" @click.prevent="invokeAdd">&#10010;</button>
    </template>
  </fieldset>
</template>
<script>
import Draggable from 'vuedraggable';
import InputRow from '@/components/ui/InputRow';
import Icon from '@/components/ui/Icon';
import { nanoid, convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingItem',
  components: {
    Draggable,
    InputRow,
    Icon,
  },
  inject: ['handleConfirm'],
  props: {
    // 項目
    items: { type: Array, default: () => [] },
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
  emits: ['update'],
  computed: {
    data: {
      get() {
        return {
          items: this.items.map((item) => {
            return {
              id: nanoid(6),
              ...item,
            };
          }),
          srcMode: this.srcMode,
          displayMode: this.displayMode,
          api: this.api,
        };
      },
      set(newData) {
        newData = Object.entries(newData).reduce((p, [k, v]) => {
          if (v) p[k] = v;
          return p;
        }, {});

        this.$emit('update', newData);
      },
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
    updateData(key, val) {
      console.log(`updateData: ${key}`, val);
      this.data = { ...this.data, [key]: val };
    },
    invokeAdd() {
      this.data.items.push({
        id: nanoid(6),
        text: '',
        value: '',
      });
    },
    invokeRemove(idx) {
      const allowFunc = () => {
        this.data.items.splice(idx, 1);
      };

      const item = this.data.items[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${item.text || item.id}] ?`;

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
