<template>
  <!-- 規則設定 -->
  <fieldset>
    <!-- <legend>規則設定</legend> -->
    <template v-for="(v, k) in fields">
      <div :key="k" class="input-group">
        <InputRow :value="rule[k]" v-bind="v.bind" @input="updateRule(k, $event)">
          <template #label-right>
            <div v-if="rule[k]" class="icon-btn" @click.prevent="toggle[k] = !toggle[k]">
              <Icon icon="mdi:ideogram-cjk-variant" />
            </div>
          </template>
        </InputRow>
        <template v-if="rule[k] && toggle[k]">
          <InputRow v-model.trim="rule.msg[k]" :placeholder="v.msg" />
        </template>
      </div>
    </template>
  </fieldset>
</template>
<script>
import InputRow from '@/components/ui/InputRow';
import Icon from '@/components/ui/Icon';
// import { removeProperty } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'ColumnSettingRule',
  components: {
    InputRow,
    Icon,
  },
  props: {
    // 識別碼
    id: { type: String, required: true },
    // 欄位名稱
    name: { type: String, required: true },
    // 屬於文字輸入框
    isText: { type: Boolean, required: true },
    // 屬於多選框
    isCheckBox: { type: Boolean, required: true },
    // 排除自己的所有欄位群
    columnsExcludeSelf: { type: Array, required: true },
    // 所有欄位群 (obj by key)
    columnsObjByKey: { type: Object, required: true },
    //-----------
    // 規則提示
    msg: { type: Object, default: () => ({}) },
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
    // 選擇數量下限 [多選框選項]
    least: { type: Number, default: null },
    // 選擇數量上限 [多選框選項]
    most: { type: Number, default: null },
  },
  emits: ['update'],
  data() {
    return {
      toggle: {},
    };
  },
  computed: {
    rule: {
      get() {
        return {
          msg: this.msg,
          // --------------------
          required: this.required,
          minimum: this.minimum,
          maximum: this.maximum,
          regex: this.regex,
          sameAs: this.sameAs,
          least: this.least,
          most: this.most,
        };
      },
      set(val) {
        let { msg, ...newRule } = val;

        newRule = Object.entries(newRule).reduce((p, [k, v]) => {
          if (v) {
            p[k] = v;
            if (msg[k] === undefined) {
              msg = { ...msg, [k]: null };
            }
          } else {
            // msg = removeProperty(k, msg);
          }

          return p;
        }, {});

        newRule['msg'] = msg;

        this.$emit('update', newRule);
      },
    },
    fields() {
      const name = this.name || this.id;
      const sameAsName = this.rule.sameAs
        ? this.columnsObjByKey[this.rule.sameAs].name || this.columnsObjByKey[this.rule.sameAs].id
        : '';

      let temp = {
        required: {
          msg: `[${name}] 為必填。`,
          bind: { label: '是否必填', type: 'checkbox' },
        },
        sameAs: {
          msg: `[${name}] 與 [${sameAsName}] 不相符`,
          bind: {
            label: '與..相符',
            placeholder: '請選擇欄位',
            type: 'select-search',
            options: this.columnsExcludeSelf,
          },
        },
      };

      if (this.isText) {
        temp = {
          ...temp,
          minimum: {
            msg: `[${name}] 最少 [:min] 個字。`,
            bind: { label: '字元下限', type: 'number' },
          },
          maximum: {
            msg: `[${name}] 最多 [:max] 個字。`,
            bind: { label: '字元上限', type: 'number' },
          },
          regex: { if: this.isText, msg: `[${name}] 格式驗證失敗。`, bind: { label: '驗證格式' } },
        };
      } else if (this.isCheckBox) {
        temp = {
          ...temp,
          least: {
            msg: `[${name}] 最少選 [:least] 個。`,
            bind: { label: '選擇數量下限', type: 'number' },
          },
          most: {
            msg: `[${name}] 最多選 [:most] 個。`,
            bind: { label: '選擇數量上限', type: 'number' },
          },
        };
      }

      return temp;
    },
  },
  created() {
    const vm = this;
    Object.keys(this.rule).map((key) => {
      vm.toggle = { ...vm.toggle, [key]: false };
    });
  },
  methods: {
    updateRule(key, val) {
      console.log(`updateRule: ${key}`, val);
      this.rule = { ...this.rule, [key]: val };
    },
  },
};
</script>
