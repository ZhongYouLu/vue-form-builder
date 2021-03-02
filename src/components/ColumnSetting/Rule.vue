<template>
  <!-- 規則設定 -->
  <fieldset>
    <!-- <legend>規則設定</legend> -->
    <Field
      v-model="sync.required"
      label="是否必填"
      type="radio"
      :options="[
        { value: 1, text: '是' },
        { value: 0, text: '否' },
      ]"
    >
      <template #msg>
        <div v-if="sync.required">
          <Field v-model="syncMsg.required" label="是否必填-訊息" :placeholder="`[${name}] 為必填。`" />
        </div>
      </template>
    </Field>
    <Field
      v-model="sync.sameAs"
      label="與..相符"
      placeholder="請選擇欄位"
      type="select-search"
      :options="columnsExcludeSelf"
    />
    <template v-if="isText">
      <Field v-model.number="sync.minimum" label="字元下限" type="number" />
      <Field v-model.number="sync.maximum" label="字元上限" type="number" />
      <Field label="字元限制">
        <div class="input-row inline">
          <div class="input"><input v-model.number="sync.minimum" type="number" /></div>
          <span>~</span>
          <div class="input"><input v-model.number="sync.maximum" type="number" /></div>
        </div>
      </Field>
      <Field v-model="sync.regex" label="驗證格式" />
    </template>
    <template v-else-if="isCheckBox">
      <Field v-model.number="sync.limit" label="選擇數量上限 [多選框選項]" type="number" />
    </template>
  </fieldset>
</template>
<script>
import Field from '@/components/Field.vue';
// import { removeProperty } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingBase',
  components: {
    Field,
  },
  props: {
    name: { type: String, default: '(no name)' },
    // 屬於文字輸入框
    isText: { type: Boolean, default: false },
    // 屬於多選框
    isCheckBox: { type: Boolean, default: false },
    //
    columnsExcludeSelf: { type: Array, required: true },
    //-----------
    // 必填
    required: { type: Number, default: null },
    // 字元下限
    minimum: { type: Number, default: null },
    // 字元上限
    maximum: { type: Number, default: null },
    // 驗證格式
    regex: { type: String, default: null },
    // 與..相符
    sameAs: { type: String, default: null },
    // 選擇數量上限 [多選框選項]
    limit: { type: String, default: null },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
  },
  emits: ['update'],
  data() {
    return {
      sync: {
        required: this.required,
        minimum: this.minimum,
        maximum: this.maximum,
        regex: this.regex,
        sameAs: this.sameAs,
        limit: this.limit,
      },
      syncMsg: this.msg,
    };
  },
  watch: {
    syncMsg: function (newVal) {
      this.$emit('update:msg', newVal);
    },
    sync: {
      handler: function (newVal) {
        const vm = this;
        const temp = Object.entries(newVal).reduce((p, [k, v]) => {
          if (v) {
            p[k] = v;
            if (vm.syncMsg[k] === undefined) {
              vm.syncMsg = { ...vm.syncMsg, [k]: null };
            }
          } else {
            // vm.syncMsg = removeProperty(k, vm.syncMsg);
          }

          return p;
        }, {});

        this.$emit('update', { ...temp, msg: this.syncMsg });
      },
      deep: true,
    },
  },
};
</script>
