const jsx = require('@babel/plugin-syntax-jsx');
const {
  JSXElement,
  JSXExpressionContainer,
  JSXFragment,
  JSXSpreadAttribute,
  JSXSpreadChild,
  Program
} = require('./visitors');

module.exports = function (api, options) {
  return {
    inherits: jsx.default,
    visitor: {
      Program,
      JSXElement,
      JSXFragment,
      JSXSpreadChild,
      JSXSpreadAttribute,
      JSXExpressionContainer
    }
  }
};
