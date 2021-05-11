import Vue from 'vue';
import { regexOptions } from '@/assets/js/options.js';
import { difference } from '@/assets/js/helper.js';

const state = Vue.observable({ regexOptions: regexOptions || [] });

// Getters
const getters = {
  regexOptions: () => state.regexOptions,
};

// Mutations
const mutations = {
  setOptions: (val) => (state.regexOptions = val),
  addOption: (val) => state.regexOptions.push({ id: val, text: val }),
  updateOptions: (regexValues) => {
    if (Array.isArray(regexValues) && regexValues.length) {
      const newValues = difference(
        regexValues,
        state.regexOptions.map((option) => option.id)
      );
      newValues.forEach((val) => mutations.addOption(val));
    }
  },
};

export default state.regexOptions;
export { getters, mutations };
