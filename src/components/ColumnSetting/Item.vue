<template>
  <!-- 項目設定 -->
  <fieldset>
    <!-- <legend>項目設定</legend> -->
    <Field
      v-model="sync.srcMode"
      :label="'資料來源'"
      :type="'select'"
      :options="sourceModeOptions"
      placeholder="請選擇來源"
      is-required
    />
    <template v-if="sync.srcMode === 'api'">
      <Field v-model="sync.api.url" :label="'API URL'" />
      <Field v-model="sync.api.textKey" :label="'Value Key'" />
      <Field v-model="sync.api.valueKey" :label="'Text Key'" />
    </template>
    <template v-else>
      <table v-if="sync.items.length" class="table table-striped">
        <thead class="thead-dark">
          <tr>
            <th scope="col"></th>
            <th scope="col">idx</th>
            <th scope="col">Text</th>
            <th scope="col">Value</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <Draggable v-model="sync.items" animation="300" ghost-class="ghost" handle=".item__drag" tag="tbody">
          <tr v-for="(item, idx) in sync.items" :key="item.id">
            <td scope="row">
              <div class="icon-btn item__drag">
                <Icon icon="mdi:drag" />
              </div>
            </td>
            <td>{{ idx + 1 }}</td>
            <td>
              <div class="input"><input v-model="item.text" type="text" /></div>
            </td>
            <td>
              <div class="input"><input v-model="item.value" type="text" /></div>
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
import Field from '@/components/Field.vue';
import Icon from '@/components/Icon';
import { nanoid, convertOptions } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingItem',
  components: {
    Draggable,
    Field,
    Icon,
  },
  inject: ['handleConfirm'],
  props: {
    // 項目
    items: {
      type: Array,
      default: () => [],
    },
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
      default() {
        return {
          url: '',
          textKey: '',
          valueKey: '',
        };
      },
    },
    handleDelete: { type: Function, default: null },
  },
  emits: ['update'],
  data() {
    return {
      sync: {
        items: this.items.map((item) => {
          return {
            id: nanoid(6),
            ...item,
          };
        }),
        srcMode: this.srcMode,
        displayMode: this.displayMode,
        api: this.api,
      },
    };
  },
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
  watch: {
    sync: {
      handler: function (newVal) {
        const temp = Object.entries(newVal).reduce((p, [k, v]) => {
          if (v) p[k] = v;
          return p;
        }, {});

        this.$emit('update', temp);
      },
      deep: true,
    },
  },
  methods: {
    invokeAdd() {
      this.sync.items.push({
        id: nanoid(6),
        text: '',
        value: '',
      });
    },
    invokeRemove(idx) {
      const allowFunc = () => {
        this.sync.items.splice(idx, 1);
      };

      const item = this.sync.items[idx];
      const showMsg = `確定刪除欄位 #${idx + 1} [${item.text ? item.text : item.id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
  },
};
</script>
