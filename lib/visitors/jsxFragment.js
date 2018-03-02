const t = require('@babel/types');

const {getMapKeyForNode} = require('../helpers');
const {transformNode} = require('../utils');
const enter = require('../helpers/enterElement');

module.exports = {
  enter,
  exit(path, scope) {
    const key = getMapKeyForNode(path.node);
    const children = scope.opts.nodeMap[key];
    path.replaceWithMultiple([
      ...scope.opts.expressions.map((expression, index) => t.variableDeclaration('const', [t.variableDeclarator(t.identifier(`e${index}`), expression)])),
      t.returnStatement(t.arrayExpression(children.map(child => transformNode(child))))
    ]);
    delete scope.opts.nodeMap[key];
  }
};
