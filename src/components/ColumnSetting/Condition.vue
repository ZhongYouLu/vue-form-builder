<template>
  <!-- 條件設定 -->
  <fieldset>
    <!-- <legend>條件設定</legend> -->
    <div v-for="(d, idx) in sync.display" :key="d.id">
      <div>
        <span>#{{ idx + 1 }}</span>
        <div class="icon-btn" @click="invokeRemove(idx)">
          <Icon icon="mdi:close-thick" />
        </div>
        <Field v-model="d.triggerID" type="select-search" label="監聽欄位" :options="columnsExcludeSelf" />
        <template v-if="columnsObjByKey[d.triggerID] && columnsObjByKey[d.triggerID].type === 'select'">
          <Field
            v-if="columnsObjByKey[d.triggerID].data.srcMode === 'list'"
            v-model="d.findOne"
            type="select"
            label="相等"
            :options="columnsObjByKey[d.triggerID].data.items"
          />
        </template>
        {{ d }}
      </div>
    </div>
    <button class="btn btn--add" @click.prevent="invokeAdd">&#10010;</button>
  </fieldset>
</template>
<script>
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { nanoid } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingCondition',
  components: {
    Field,
    Icon,
  },
  inject: ['handleConfirm'],
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, default: '(no name)' },
    // 屬於文字輸入框
    isText: { type: Boolean, default: false },
    // 屬於多選框
    isCheckBox: { type: Boolean, default: false },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 顯示條件
    display: { type: Array, default: () => [] },
  },
  emits: ['update'],
  data() {
    return {
      sync: {
        display: this.display,
      },
    };
  },
  computed: {},
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
      this.sync.display.push({
        id: nanoid(6),
        triggerID: null,
        findOne: [], // 滿足其一
        findAll: [], // 滿足全部
      });
    },
    invokeRemove(idx) {
      const allowFunc = () => {
        this.sync.display.splice(idx, 1);
      };
      const showMsg = `確定刪除條件 #${idx + 1} ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
    getColumnTemp: function () {
      return {
        // 其他檢查設定
        requiredSync: [], // 連動必填元素 (如果自身有值，其元素必填)
        requiredCheck: [], // 自身必填檢查 (來自其他元素的 requiredSync)
        sameAsReverseCheck: [], // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.sameAs)
      };
    },
  },
};
</script>
