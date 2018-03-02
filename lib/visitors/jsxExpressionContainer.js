const t = require('@babel/types');

const {addMemberExpression, definitionsMap} = require('../utils');
const {getMapKeyForNode, getJSXElement} = require('../helpers');

module.exports = {
  enter(path, scope) {
    if (!t.isMemberExpression(path.node.expression) && !t.isCallExpression(path.node.expression)) {
      return;
    }
    if (t.isJSXAttribute(path.parent) && t.isJSXExpressionContainer(path.node)) {
      const jsxElement = getJSXElement(t, path);
      const key = getMapKeyForNode(jsxElement);
      const element = scope.opts.nodeMap[key];
      element.attrs[path.container.name.name] = addMemberExpression(t, path.node.expression, scope);
      return;
    }

    if (t.isJSXElement(path.parent)) {
      const parentKey = getMapKeyForNode(path.parent);
      const parentElement = scope.opts.nodeMap[parentKey];
      if (Array.isArray(parentElement)) {
        parentElement.push(addMemberExpression(t, path.node.expression, scope));
      } else {
        let propertyName;
        switch (parentElement.attrs.type) {
          case definitionsMap.input.choiceSet:
            propertyName = 'choices';
             // parentElement.choices.push(identifier);
            break;

          case definitionsMap.action.showCard:
            const children = path.node.children;
            const cardExpressions = (children || []).filter(child => t.isJSXExpressionContainer(child));
            if (cardExpressions.length > 1) {
              throw path.buildCodeFrameError('<action type="showCard"> elements must contain a single expression as a child');
            }
            propertyName = 'card';
            // parentElement.card = identifier;
            break;

          case definitionsMap.column:
          case definitionsMap.container:
            propertyName = 'items';
            // parentElement.items.push(identifier);
            break;

          case definitionsMap.images:
            propertyName = 'images';
            // parentElement.images.push(identifier);
            break;

          default:
            // unsupported or is handled elsewhere
            break;
        }

        if (propertyName) {
          const identifier = addMemberExpression(t, path.node.expression, scope);
          if (Array.isArray(parentElement[propertyName])){
            parentElement[propertyName].push(identifier);
          } else {
            parentElement[propertyName] = identifier
          }
        }
      }
    }
  }
};
