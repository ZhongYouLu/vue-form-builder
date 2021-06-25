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
        <Button ref="submitBtn" @click="submit">Send</Button>
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
    };
  },
  computed: {
    columnsByKey() {
      return arr2ObjByKey(this.columns, 'id');
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
    formdata() {
      const formdata = new FormData();
      const jsondata = {};
      if (!this.disabled) {
        this.$refs.formItem.forEach((el) => {
          formdata.set(el.name, el.value);
          jsondata[el.name] = el.value;
        });
      }
      formdata.json = jsondata;
      return formdata;
    },
    async submit(e) {
      // https://developers.google.com/web/fundamentals/design-and-ux/input/forms
      if (!this.disabled && this.checkValidity()) {
        // validity
        if (this.action) {
          this.$refs.submitBtn && (this.$refs.submitBtn.loading = true);

          let data;
          if (this.method == 'GET') {
            data = await fetch(`${this.action}?${this.serialized(this.$refs.form)}`);
          } else {
            data = await fetch(this.action, {
              method: 'POST',
              body: this.formdata,
            });
          }

          this.$refs.submitBtn && (this.$refs.submitBtn.loading = false);

          if (data.headers.get('content-type') == 'application/json') {
            console.log(data.json());
          }
        }

        this.$emit('submit', this.values);
      }
    },
    serialized(form) {
      const serialized = [];

      for (var i = 0, field; (field = form.elements[i]); i++) {
        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (
          !field.name ||
          field.disabled ||
          field.type === 'file' ||
          field.type === 'reset' ||
          field.type === 'submit' ||
          field.type === 'button'
        )
          continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
          for (var n = 0; n < field.options.length; n++) {
            if (!field.options[n].selected) continue;
            serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.options[n].value));
          }
        }
        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
          serialized.push(encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value));
        }
      }

      return serialized.join('&');
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
