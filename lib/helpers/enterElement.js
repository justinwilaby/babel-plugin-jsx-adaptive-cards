const getMapKeyForNode = require('./getMapKeyForNode');
const processElement = require('../utils/processElement');

module.exports = function enter(path, scope) {
  if (!scope.opts.nodeMap) {
    scope.opts.nodeMap = {};
  }
  if (!scope.opts.expressions) {
    scope.opts.expressions = [];
  }
  const key = getMapKeyForNode(path.node);
  scope.opts.nodeMap[key] = processElement(path, scope);
};
