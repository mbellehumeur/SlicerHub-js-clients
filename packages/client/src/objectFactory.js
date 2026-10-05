/**
 * Minimal object factory (replaces vtk.js macro for HubClient only).
 */

export function obj(publicAPI, model) {
  if (!model.classHierarchy) {
    model.classHierarchy = [];
  }
  publicAPI.getClassName = () =>
    model.classHierarchy[model.classHierarchy.length - 1] || 'HubClient';
  publicAPI.isA = (className) => model.classHierarchy.includes(className);
  if (typeof publicAPI.delete !== 'function') {
    publicAPI.delete = () => {};
  }
}

export function get(publicAPI, model, keys) {
  keys.forEach((key) => {
    const method = `get${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    publicAPI[method] = () => model[key];
  });
}

export function chain(fn, existingDelete) {
  return () => {
    fn();
    if (typeof existingDelete === 'function') {
      existingDelete();
    }
  };
}

export function newInstance(extend, className) {
  return function castClientNewInstance(initialValues = {}) {
    const publicAPI = {};
    const model = { classHierarchy: [className] };
    extend(publicAPI, model, initialValues);
    return publicAPI;
  };
}
