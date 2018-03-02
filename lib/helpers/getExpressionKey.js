module.exports = function (t, expression) {
  if (t.isCallExpression(expression) && !expression.arguments.length) {
    return `${expression.type}${expression.callee.name}`;
  }
  if (t.isMemberExpression(expression)) {
    return `${expression.property.name}${expression.object.type}`;
  }
};
