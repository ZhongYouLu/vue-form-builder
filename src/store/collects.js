import Vue from 'vue';
import { instantiateSetState, instantiateGetState } from '@/store/helper.js';

const state = Vue.observable({ collects: {} });

// Helper - setState
const setState = instantiateSetState(state.collects);
const getState = instantiateGetState(state.collects);

// Getters
const getters = {
  collects: () => state.collects,
};

// Mutations
const mutations = {
  setCollects(collects) {
    state.collects = collects;
  },
  setCollect(objectPath, value = {}, upsert = true) {
    setState({ objectPath, value, upsert });
  },
  addCollect(id, value = {}) {
    mutations.setCollect([id], value);
  },
  toggleCollect(objectPath) {
    mutations.setCollect(objectPath, !getState({ objectPath }));
  },
};

export default state.collects;
export { getters, mutations };
