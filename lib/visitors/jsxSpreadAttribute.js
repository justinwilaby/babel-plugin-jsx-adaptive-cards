const t = require('@babel/types');
const {getMapKeyForNode, getJSXElement} = require('../helpers');
const {addMemberExpression} = require('../utils');
module.exports = {
  enter(path, scope) {
    const jsxElement = getJSXElement(t, path);
    const key = getMapKeyForNode(jsxElement);
    const element = scope.opts.nodeMap[key];
    (element.spread || (element.spread = [])).push(addMemberExpression(t, path.node.argument, scope));
  }
};
