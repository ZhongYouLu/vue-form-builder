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
      <template #1>
        <Field
          v-if="sync.required"
          v-model="sync.msg.required"
          label="是否必填"
          :placeholder="'[' + name + '] 為必填。'"
        />
      </template>
    </Field>
    <Field v-model="sync.sameAs" label="與..相符">
      <!-- <VueSelect
        v-model="column.rule.sameAs"
        :options="columnsExcludeSelf"
        :reduce="(option) => option.id"
        :get-option-label="(option) => option.info.name"
        placeholder="請選擇欄位"
        :append-to-body="true"
        :calculate-position="withPopper"
        :filter="fuseSearch"
        :reset-on-options-change="true"
      >
        <template #option="option">
          {{ option.info.name || option.id }}
          <br />
          <em>{{ option.info.label }}</em>
        </template>
        <template #no-options="{ search, searching }">
          <template v-if="searching">
            查無
            <em>{{ search }}</em> 相關.
          </template>
          <em v-else style="opacity: 0.5">開始嘗試搜尋欄位</em>
        </template>
      </VueSelect> -->
    </Field>
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
        msg: this.msg,
        required: this.required,
        minimum: this.minimum,
        maximum: this.maximum,
        regex: this.regex,
        sameAs: this.sameAs,
        limit: this.limit,
      },
    };
  },
  watch: {
    sync: {
      handler: function (newVal) {
        const temp = Object.entries(newVal).reduce((p, [k, v]) => {
          if (v) {
            p[k] = v;
          }
          return p;
        }, {});

        this.$emit('update', temp);
      },
      deep: true,
    },
    'sync.required': function (newVal) {
      if (newVal && this.sync.msg['required'] === undefined) {
        this.sync.msg = { ...this.sync.msg, required: null };
      }
    },
  },
};
</script>
