import Vue from 'vue';
import { getObjPathArr, get } from '@/assets/js/helper.js';

export const instantiateGetState = (rootObj) => {
  return ({ objectPath } = {}) => {
    return get(rootObj, objectPath);
  };
};

export const instantiateSetState = (rootObj) => {
  return ({ objectPath, value, upsert = false } = {}) => {
    if (objectPath === undefined) rootObj = value;

    const pathArray = getObjPathArr(objectPath);
    try {
      const navigate = [...pathArray.slice(0, -1)];
      let valueObj = get(rootObj, navigate);

      if (typeof valueObj !== 'object') {
        valueObj = navigate.reduce((obj, prop) => {
          if (typeof obj[prop] !== 'object') {
            if (upsert) {
              Vue.set(obj, prop, {});
            } else {
              console.error(`setState: property '${prop}' doesn't exist`);
            }
          }
          return obj[prop];
        }, rootObj);

        console.log(navigate, valueObj);
      }

      Vue.set(valueObj, pathArray[pathArray.length - 1], value);
    } catch (e) {
      console.error('instantiateSetState');
    }
  };
};

export const tunnelEmit = (vm, event, ...payload) => {
  while (vm && !vm.$listeners[event]) {
    vm = vm.$parent;
  }

  if (vm) {
    vm.$emit(event, ...payload);
  } else {
    return console.error(`no target listener for event "${event}"`);
  }
};
