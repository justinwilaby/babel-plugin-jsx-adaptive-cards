const {getExpressionKey} = require('../helpers');
const memberExpressionsByName = {};

module.exports = function addMemberExpression(t, expression, scope) {
  const key = getExpressionKey(t, expression);
  let identifier = key ? memberExpressionsByName[key] : null;
  if (!identifier) {
    const index = scope.opts.expressions.push(expression) - 1;
    identifier = memberExpressionsByName[key] = t.identifier(`e${index}`);
  }
  return identifier;
};
