/* eslint-disable vue/no-mutating-props */
<template>
  <div>
    <form
      ref="form"
      class="x-form"
      :name="name"
      :method="method"
      :action="action"
      :novalidate="novalidate"
      :disabled="disabled"
      :type="type"
    >
      <template v-for="{ id, ...column } in columns">
        <FormItem
          v-if="values[id] !== undefined"
          :id="id"
          :key="id"
          ref="formItem"
          :type="column.type"
          :novalidate="novalidate"
          :disabled="disabled"
          v-bind="{
            ...column.base,
            ...column.rule,
            ...column.item,
            ...column.condition,
          }"
          :columns="columns"
          :columns-obj-by-key="columnsObjByKey"
          :values="values"
          :value.sync="values[id]"
          :error.sync="errors[id]"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <template v-for="(_, slot) in $scopedSlots" #[slot]="props">
            <slot :name="slot" v-bind="props" />
          </template>
        </FormItem>
      </template>
      <Button @click="submit">Send</Button>
      <Button htmltype="reset" @click="reset">reset</Button>
    </form>
    <hr class="dashed" />
    <div>values: {{ values }}</div>
    <div>invalid: {{ !!invalid }}</div>
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
    // -----------------------------------
    type: { type: String, default: null },
  },
  emits: ['submit'],
  data() {
    return {
      values: {},
      errors: {},
      invalid: null,
    };
  },
  computed: {
    columnsObjByKey() {
      return arr2ObjByKey(this.columns, 'id');
    },
  },
  watch: {
    columns: {
      handler: function (columns, old) {
        columns.map((column) => {
          let value = this.values[column.id] || null;
          const oldDefault = old?.find((c) => c.id === column.id)?.base?.defaultValue;
          const newDefault = column.base?.defaultValue;
          if (newDefault !== oldDefault) value = newDefault;

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
      this.$refs.formItem.forEach((el) => {
        console.log(el);
      });
    },
    validity() {
      this.$refs.formItem.every((el) => el.validity());
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
    submit(e) {
      if (this.checkValidity() && !this.disabled) {
        // https://developers.google.com/web/fundamentals/design-and-ux/input/forms

        const form = e.target;
        // form.reportValidity()
        // if (form.reportValidity() === false) {
        //   alert('Form is invalid - submission prevented!');
        //   return false;
        // }
        this.serialized(form);
        this.$emit('submit', this.values);

        //validity
        // if (this.action) {
        //   this.submitBtn && (this.submitBtn.loading = true);
        //   if (this.method == 'GET') {
        //     const formdata = new URLSearchParams(this.formdata).toString();
        //     const data = await fetch(`${this.action}?${formdata}`);
        //     this.submitBtn && (this.submitBtn.loading = false);
        //     if (data.headers.get('content-type') == 'application/json') {
        //       this.dispatchEvent(
        //         new CustomEvent('submit', {
        //           detail: {
        //             data: data.json(),
        //           },
        //         })
        //       );
        //     }
        //   } else {
        //     const data = await fetch(this.action, {
        //       method: 'POST',
        //       body: this.formdata,
        //     });
        //     this.submitBtn && (this.submitBtn.loading = false);
        //     if (data.headers.get('content-type') == 'application/json') {
        //       this.dispatchEvent(
        //         new CustomEvent('submit', {
        //           detail: {
        //             data: data.json(),
        //           },
        //         })
        //       );
        //     }
        //   }
        // }
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

      console.log('serialized:', serialized.join('&'));
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

form {
  counter-reset: num;

  & > .x-form-item .label {
    &::before {
      counter-increment: num;
      content: counter(num) '. ';
    }
  }
}
</style>
