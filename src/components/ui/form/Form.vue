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
        v-for="({ id, type, ...column }, idx) in columns"
        :key="id"
        ref="formItem"
        v-bind="{
          idx: idx + 1,
          id,
          type,
          novalidate,
          disabled,
          // -----------
          ...column.base,
          ...column.rule,
          ...column.item,
          ...column.condition,
          // -----------
          columns,
          columnsByKey,
          values,
          // -----------
          testMode: true,
        }"
        :value.sync="values[id]"
        :error.sync="errors[id]"
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
        <Button htmltype="reset" @click="reset">reset</Button>
      </div>
    </form>
    <hr class="dashed" />
    <div>invalid: {{ !!invalid }}</div>
    <div>values: {{ values }}</div>
    <div>errors: {{ errors }}</div>
  </div>
</template>

<script>
import FormItem from '@/components/ui/form/FormItem';
import Button from '@/components/ui/Button';
import { arr2ObjByKey } from '@/assets/js/helper.js';

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
  },
  emits: ['submit'],
  data() {
    return {
      values: {},
      errors: {},
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
          let value = this.values[column.id] || null;

          const oldColumn = old?.find((c) => c.id === column.id);
          if (column.type !== oldColumn?.type) {
            value = null;
          } else {
            const oldDefault = oldColumn?.base?.defaultValue;
            const newDefault = column.base?.defaultValue;
            if (newDefault !== oldDefault) {
              value = newDefault || null;
            }
          }

          this.$set(this.values, column.id, value);
          this.$set(this.errors, column.id, null);
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
      this.$refs.formItem.every((formItem) => formItem.validity());
    },
    checkValidity() {
      if (this.novalidate) {
        return true;
      }
      const elements = [...this.$refs.formItem].reverse();
      let validity = true;
      elements.forEach((el) => {
        if (el.checkValidity && !el.checkValidity()) {
          validity = false;
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
