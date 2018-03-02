const t = require('@babel/types');
const builders = require('./builders');
const VALID_NODES = /^(items|action|actions|choice|open|submit|show|text|input|images|image|container|columns|column|facts|fact|card|body)$/;

module.exports = function (path, scope) {
  if (isComponent(path)) {
    return builders.component(path, scope);
  }
  if (t.isJSXFragment(path.node)) {
    return [];
  }
  const {name} = path.node.openingElement.name;
  if (!VALID_NODES.test(name)) {
    throw path.buildCodeFrameError(`The ${name} element is not allowed here`);
  }
  return builders[name](path, scope);
};

function isComponent(path) {
  if (!t.isJSXFragment(path) && path.node.openingElement.name) {
    const {name} = path.node.openingElement.name;
    return name.charAt(0).toUpperCase() === name.charAt(0);
  }
  return false;
}
