export function uuid() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// https://github.com/ai/nanoid
export let nanoid = (t = 21) => {
  let e = '',
    r = crypto.getRandomValues(new Uint8Array(t));
  for (; t--; ) {
    let n = 63 & r[t];
    e += n < 36 ? n.toString(36) : n < 62 ? (n - 26).toString(36).toUpperCase() : n < 63 ? '_' : '-';
  }
  return e;
};

export function thousandSeparator(val) {
  if (!val) return val;
  const parts = val.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
  // return Number(val).toLocaleString();
}

export function deepCopy(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof Array) {
    return obj.reduce(function (arr, item, i) {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }
  if (obj instanceof Object) {
    return Object.keys(obj).reduce(function (newObj, key) {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }
}

export function json2ObjByKey(json, key) {
  if (!json) return {};
  key = key || 'id';
  return json.reduce(function (acc, obj) {
    const v = obj[key];
    if (v) acc[v] = Object.assign({}, acc[v], deepCopy(obj));
    return acc;
  }, {});
}

export function convertPairs(obj, key) {
  return Object.entries(obj).reduce((acc, [k, v]) => ({ ...acc, [k]: v[key] }), {});
}

export function convertOptions(obj, kKey = 'value', vKey = 'text') {
  return Object.entries(obj).reduce((acc, [k, v]) => [...acc, { [kKey]: k, [vKey]: v }], []);
}

export function isEmptyObject(value) {
  return value && Object.keys(value).length === 0 && value.constructor === Object;
}

export function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

  // it's a number
  if (typeof obj === 'number') return false;

  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;

  // If it isn't an object at this point
  // it is empty, but it can't be anything *but* empty
  // Is it empty?  Depends on your application.
  if (typeof obj !== 'object') return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle
  // toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
}

export function clearEmpties(obj) {
  Object.entries(obj).forEach(
    ([key, val]) => (val && typeof val === 'object' && clearEmpties(val)) || (isEmpty(val) && delete obj[key])
  );

  return isEmpty(obj) ? null : obj;
}

// eslint-disable-next-line no-unused-vars
export const removeProperty = (propKey, { [propKey]: propValue, ...rest }) => rest;

export function removeObjInArrByKey(array, key, value) {
  const index = array.findIndex((obj) => obj[key] === value);
  return index >= 0 ? [...array.slice(0, index), ...array.slice(index + 1)] : array;
}
export function updateObjInArrByKey(array, key, value, newObj) {
  const index = array.findIndex((obj) => obj[key] === value);
  return index >= 0 ? [...array.slice(0, index), { ...array[index], ...newObj }, ...array.slice(index + 1)] : array;
}

export const intersection = (arr1, arr2) => arr1.filter((x) => arr2.includes(x));
export const difference = (arr1, arr2) => arr1.filter((x) => !arr2.includes(x));
export const symmetricDifference = (arr1, arr2) => difference(arr1, arr2).concat(difference(arr2, arr1));
