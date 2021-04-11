/* eslint-disable vue/no-mutating-props */
<template>
  <form
    ref="form"
    class="x-form"
    :method="method"
    :action="action"
    :novalidate="novalidate"
    :disabled="disabled"
    :type="type"
  >
    <slot></slot>
  </form>
</template>

<script>
import Button from '@/components/ui/Button';

export default /*#__PURE__*/ {
  name: 'Form',
  components: {
    Button,
  },
  props: {
    name: { type: String, default: 'GET' },
    method: { type: String, default: 'GET' },
    type: { type: String, default: 'POST' },
    action: { type: Function, default: null },
    novalidate: { type: Boolean, defalut: null },
    disabled: { type: Boolean, defalut: null },
  },
  data() {
    return {
      invalid: null,
    };
  },
  computed: {},
  methods: {
    reset() {
      this.invalid = false;
      this.$refs.form.elements.forEach((el) => {
        el.reset && el.reset();
      });
    },
    validity() {
      return this.$refs.form.elements.every((el) => el.validity());
    },
    formdata() {
      const formdata = new FormData();
      const jsondata = {};
      if (!this.disabled) {
        this.$refs.form.elements.forEach((el) => {
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
      const elements = [...this.$refs.form.elements].reverse();
      let validity = true;
      elements.forEach((el) => {
        if (el.checkValidity && !el.checkValidity()) {
          validity = false;
        }
      });
      this.invalid = !validity;
      return validity;
    },
    async submit() {
      if (this.checkValidity() && !this.disabled) {
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
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/utils.scss';

.x-form {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 0.8em;
  align-items: center;
  justify-items: end;

  [type='none'] {
    display: contents;
  }
}
</style>
