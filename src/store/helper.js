import Vue from 'vue';

export const instantiateSetState = (rootObj) => {
  return ({ objectPath, value, upsert = true } = {}) => {
    if (objectPath === undefined) rootObj = value;
    if (objectPath && Array.isArray(objectPath) && objectPath.length) {
      const navigate = [...objectPath.slice(0, -1)];
      const valueObj = navigate.reduce((obj, prop) => {
        if (typeof obj[prop] !== 'object') {
          if (upsert) {
            Vue.set(obj, prop, {});
          } else {
            console.error(`setState: property '${prop}' doesn't exist`);
          }
        }
        return obj[prop];
      }, rootObj);

      Vue.set(valueObj, objectPath[objectPath.length - 1], value);
    }
  };
};

export const instantiateGetState = (rootObj) => {
  return ({ objectPath, upsert = true } = {}) => {
    if (objectPath === undefined) return rootObj;
    if (objectPath && Array.isArray(objectPath) && objectPath.length) {
      const navigate = [...objectPath.slice(0, -1)];
      const valueObj = navigate.reduce((obj, prop) => {
        if (obj[prop] === undefined) {
          if (upsert) {
            Vue.set(obj, prop, {});
          } else {
            console.error(`getState: property '${prop}' doesn't exist`);
          }
        }
        return obj[prop];
      }, rootObj);

      let value = valueObj[objectPath[objectPath.length - 1]];
      // if (value === undefined) console.error(`getState: Invalid object path`);
      return value;
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
