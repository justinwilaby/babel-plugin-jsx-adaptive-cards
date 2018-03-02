const t = require('@babel/types');
const {transformNode} = require('../utils');
const {getMapKeyForNode} = require('../helpers');
const enter = require('../helpers/enterElement');

module.exports = {
  enter,
  exit(path, scope) {
    const key = getMapKeyForNode(path.node);
    const element = scope.opts.nodeMap[key];
    if (Object.keys(scope.opts.nodeMap).length === 1) {
      const transformedNode = transformNode(element, scope);
      path.replaceWithMultiple([
        ...scope.opts.expressions.map((expression, index) => t.variableDeclaration('const', [t.variableDeclarator(t.identifier(`e${index}`), expression)])),
        t.returnStatement(transformedNode)
      ]);
      scope.opts.expressions.length = 0;
    }
    delete scope.opts.nodeMap[key];
  }
};
