module.exports = function ($$kind) {
  const element = {$$kind};
  Object.defineProperty(element, 'attrs', {value: {}, enumerable: false});
  return element;
};
