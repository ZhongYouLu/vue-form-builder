import Vue from 'vue';
import { difference } from '@/assets/js/helper.js';

const state = Vue.observable({ regexOptions: {} });

// Getters
const getters = {
  regexOptions: () => state.regexOptions,
};

// Mutations
const mutations = {
  setOptions: (val) => (state.regexOptions = val),
  addOption: (val) => state.regexOptions.push({ id: val, text: val }),
  update: (regexValues) => {
    // const regexValues = columns.reduce((acc, c) => (c.rule?.regex ? acc.concat(c.rule.regex) : acc), []);

    if (regexValues) {
      const newValues = difference(
        regexValues,
        state.regexOptions.map((option) => option.id)
      );
      newValues.forEach((val) => mutations.addOption(val));
    }
  },
};

export default state;
export { getters, mutations };
