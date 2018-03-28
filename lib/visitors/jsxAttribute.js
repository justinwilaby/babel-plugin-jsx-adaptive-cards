const t = require('@babel/types');
const {getMapKeyForNode, getJSXElement, syntaxErrorThrower, getDefinitionFromSchema, getValueFromSchema} = require('../helpers');

module.exports = {
  enter(path, scope) {
    const jsxElement = getJSXElement(t, path);
    const key = getMapKeyForNode(jsxElement);
    const element = scope.opts.nodeMap[key];
    const attr = path.node;
    const name = attr.name.name;
    const isSpreadAttr = t.isJSXSpreadAttribute(attr);
    if (element.$$kind === 'component' && !isSpreadAttr) {
      element.props[name] = attr.value;
      return;
    }

    const typeAttr = jsxElement.openingElement.attributes.find(attr => (!t.isJSXSpreadAttribute(attr) && attr.name.name === 'type'));
    if (typeAttr && !t.isStringLiteral(typeAttr.value)) {
      syntaxErrorThrower(path, 'Type attributes must be string literals');
    }

    const type = typeAttr ? typeAttr.value.value : null;
    const definition = getDefinitionFromSchema(path, element.$$kind, type);
    if (!definition.properties && path.node.openingElement.attributes.length) {
      syntaxErrorThrower(path, `${element.$$kind} does not allow attributes`);
    }

    if (!isSpreadAttr && !(name in element.attrs)) {

      if (!definition.properties[name] || (element[name] && element.attrs[name])) {
        syntaxErrorThrower(path, `The ${name} attribute is not allowed here`);
      }

      // Validation can only occur when we have a string literal
      if (t.isStringLiteral(attr.value)) {
        const {value} = attr.value;
        const attributeDefinition = definition.properties[name];
        let {enum:enums, $ref} = attributeDefinition;
        if ($ref) {
          enums = getValueFromSchema($ref).enum;
        }
        if (enums && !enums.includes(value)) {
          syntaxErrorThrower(path, `${value} is not a valid value for the ${name} attribute`);
        }
      }
      element.attrs[name] = attr.value;
    }
  }
};
