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
