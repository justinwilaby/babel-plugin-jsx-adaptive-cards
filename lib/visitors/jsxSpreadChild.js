const t = require('@babel/types');

const {definitionsMap} = require('../utils');
const {getMapKeyForNode} = require('../helpers');

module.exports = {
  enter(path, scope) {
    const key = getMapKeyForNode(path.parent);
    const parentElement = scope.opts.nodeMap[key];
    const spreadElement = t.spreadElement(path.node.expression);
    if (Array.isArray(parentElement)) {
      parentElement.push(spreadElement);
    } else {
      switch (parentElement.attrs.type) {
        case definitionsMap.input.choiceSet:
          parentElement.choices.push(spreadElement);
          break;

        case definitionsMap.column:
        case definitionsMap.container:
          parentElement.items.push(spreadElement);
          break;

        case definitionsMap.images:
          parentElement.images.push(spreadElement);
          break;

        default:
          debugger;
          break;
      }
    }
  }
};
