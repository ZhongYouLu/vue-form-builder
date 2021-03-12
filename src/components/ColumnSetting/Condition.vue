<template>
  <!-- 條件設定 -->
  <fieldset>
    <!-- <legend>條件設定</legend> -->
    <InputRow
      :value="$props.requiredSync"
      type="select"
      label="連動必填"
      multiple
      searchable
      :options="columnsExcludeSelf"
      @input="$emit('update', 'requiredSync', $event)"
    />
    <!-- <div v-for="(d, idx) in $props.display" :key="d.id">
      <div>
        <span>#{{ idx + 1 }}</span>
        <Icon icon="mdi:close-thick" is-btn @click="invokeRemove(idx)" />
        <InputRow
          v-model="d.triggerID"
          type="select"
          label="監聽欄位"
          clearable
          searchable
          :options="columnsExcludeSelf"
        />
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
    <button class="btn btn--add" @click.prevent="invokeAdd">&#10010;</button> -->
  </fieldset>
</template>
<script>
import InputRow from '@/components/ui/InputRow';
// import Field from '@/components/ui/Field';
// import Icon from '@/components/ui/Icon';
import { nanoid } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingCondition',
  components: {
    InputRow,
    // Field,
    // Icon,
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
    // 連動必填元素 (如果自身有值，其元素必填)
    requiredSync: { type: Array, default: () => [] },
    // 顯示條件
    display: { type: Array, default: () => [] },
    // 其他檢查設定
    // requiredSync: [], // 連動必填元素 (如果自身有值，其元素必填)
    // requiredCheck: [], // 自身必填檢查 (來自其他元素的 requiredSync)
    // sameAsReverseCheck: [], // 反向相符檢查 元素值是否相符 (來自其他元素的 rule.sameAs)
  },
  emits: ['update', 'updateObj', 'updateArr', 'addArr', 'removeArr'],
  methods: {
    invokeAdd() {
      this.$emit('addArr', 'display', {
        id: nanoid(6),
        triggerID: null,
        findOne: [], // 滿足其一
        findAll: [], // 滿足全部
      });
    },
    invokeRemove(idx) {
      const { id, text } = this.$props.display[idx];

      const allowFunc = () => {
        this.$emit('removeArr', 'display', id);
      };

      const showMsg = `確定刪除顯示條件 #${idx + 1} [${text || id}] ?`;

      if (this.handleConfirm) {
        this.handleConfirm(showMsg, allowFunc);
      } else {
        if (confirm(showMsg)) allowFunc();
      }
    },
  },
};
</script>
