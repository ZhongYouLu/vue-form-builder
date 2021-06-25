<template>
  <div>
    <form
      ref="form"
      v-bind="{
        class: 'x-form',
        name,
        method,
        action,
        novalidate,
        disabled,
      }"
    >
      <FormItem
        v-for="({ id, name: cname, type, base, rule, item, condition }, idx) in columns"
        :key="id"
        ref="formItem"
        v-bind="{
          idx: idx + 1,
          id,
          name: cname,
          type,
          ...base,
          ...rule,
          ...item,
          ...condition,
          // -----------
          novalidate,
          disabled,
          // -----------
          columnsByKey,
          fields,
          // -----------
          testMode,
        }"
        :value.sync="fields[id].value"
        :error.sync="fields[id].error"
        v-on="{
          // focus: handleFocus,
          // blur: handleBlur,
        }"
      >
        <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
          <slot :name="slot" v-bind="props" />
        </template>
      </FormItem>
      <div>
        <Button ref="submitBtn" :loading="loading" @click="submit">Send</Button>
        <Button @click="reset">reset</Button>
        <Button @click="validity">validity</Button>
        <Button @click="checkValidity">checkValidity</Button>
      </div>
    </form>
    <template v-if="testMode">
      <hr class="dashed" />
      <div>invalid: {{ !!invalid }}</div>
      <div>fields: {{ fields }}</div>
    </template>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import Button from '@/components/ui/Button';
import { arr2ObjByKey, difference } from '@/assets/js/helper.js';

export default /*#__PURE__*/ {
  name: 'Form',
  components: {
    FormItem,
    Button,
  },
  props: {
    columns: { type: Array, required: true },
    // -----------------------------------
    name: { type: String, default: null },
    method: { type: String, default: 'GET' },
    action: { type: String, default: null },
    novalidate: { type: Boolean, defalut: null },
    disabled: { type: Boolean, defalut: null },
    // -----------------------------------
    testMode: { type: Boolean, default: null },
  },
  emits: ['submit'],
  data() {
    return {
      fields: {},
      invalid: null, // 無效的
      loading: false,
    };
  },
  computed: {
    columnsByKey() {
      return arr2ObjByKey(this.columns, 'id');
    },
    formData() {
      return Object.keys(this.fields).reduce((acc, key) => {
        const val = this.fields[key].value;
        acc[key] = Array.isArray(val) ? [...val] : val;
        return acc;
      }, {});
    },
  },
  watch: {
    columns: {
      handler: function (columns, old) {
        columns.map((column) => {
          let value = this.fields[column.id]?.value || null;

          const oldColumn = old?.find((c) => c.id === column.id);

          const oldDefault = oldColumn?.base?.defaultValue;
          const newDefault = column.base?.defaultValue;

          const isDiff =
            Array.isArray(newDefault) && Array.isArray(oldDefault)
              ? difference(newDefault, oldDefault).length
              : newDefault !== oldDefault;

          if (isDiff) {
            value = newDefault || null;
          }

          if (oldColumn && oldColumn.type !== column.type) {
            value = null;
          }

          this.$set(this.fields, column.id, {
            value: value,
            error: null,
            requiredSync: this.columns.reduce((acc, c) => {
              if (c.rule?.requiredPassive?.includes(column.id)) {
                acc.push(c.id);
              }
              return acc;
            }, []),
          });
        });
      },
      immediate: true,
    },
  },
  methods: {
    reset() {
      this.invalid = false;
      this.$refs.formItem.forEach((formItem) => {
        formItem.reset();
      });
    },
    validity() {
      return this.$refs.formItem.every((formItem) => formItem.validity());
    },
    checkValidity() {
      if (this.novalidate) return true;

      let validity = true;
      const elements = [...this.$refs.formItem].reverse();
      elements.forEach((el) => {
        if (el.checkValidity && !el.checkValidity()) {
          validity = false;
          el.focus();
        }
      });
      this.invalid = !validity;
      return validity;
    },
    submit() {
      // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
      if (!this.disabled && this.checkValidity()) {
        this.loading = true;
        this.$emit('submit', this.formData, () => (this.loading = false));
      }
    },
    handleFocus(e) {
      console.log('focus', e);
    },
    handleBlur(e) {
      console.log('blur', e);
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

/*
form {
  counter-reset: num;

  & > .x-form-item .label {
    &::before {
      counter-increment: num;
      content: counter(num) '. ';
    }
  }
}
*/
</style>
