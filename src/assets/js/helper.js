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

export function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ('000' + firstPart.toString(36)).slice(-3);
  secondPart = ('000' + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
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

export function convertOptions(obj) {
  return Object.entries(obj).reduce((p, [k, v]) => [...p, { value: k, text: v }], []);
}

export function isEmptyObject(value) {
  return value && Object.keys(value).length === 0 && value.constructor === Object;
}

export function isEmpty(obj) {
  // null and undefined are "empty"
  if (obj == null) return true;

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

export function removeEmpty(obj) {
  Object.entries(obj).forEach(
    ([key, val]) =>
      (val && typeof val === 'object' && removeEmpty(val)) || ((val === null || val === '') && delete obj[key])
  );
  return obj;
}

// eslint-disable-next-line no-unused-vars
export const removeProperty = (propKey, { [propKey]: propValue, ...rest }) => rest;

export function removeObjInArrByKey(array, key, value) {
  const index = array.findIndex((obj) => obj[key] === value);
  return index >= 0 ? [...array.slice(0, index), ...array.slice(index + 1)] : array;
}

// export function arrPropRemove() {
//   Array.prototype.remove = function (key, value) {
//     const index = this.findIndex((obj) => obj[key] === value);
//     return index >= 0 ? [...this.slice(0, index), ...this.slice(index + 1)] : this;
//   };
// }
