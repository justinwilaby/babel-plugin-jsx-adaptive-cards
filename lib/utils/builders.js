const t = require('@babel/types');

const {getMapKeyForNode, normalizeWhitespace, syntaxErrorThrower, defineElement, findElementChildProperty} = require('../helpers');
const definitionsMap = require('./definitionsMap');

module.exports.action = function (path, scope) {
  const action = defineElement('action');
  const parent = getParent(path, scope);
  const typeAttr = path.node.openingElement.attributes.find(attr => (!t.isJSXSpreadAttribute(attr) && attr.name.name === 'type'));
  const children = path.node.children;
  action.attrs.type = definitionsMap.action[typeAttr.value.value];
  const childPropertyName = findActionChildProperty(action);

  // Let the visitor handle the card build
  if (childPropertyName !== 'card') {
    action[childPropertyName] = children;
  }
  if (!parent) {
    return action;
  }
  if (parent.$$kind === 'actions') {
    parent.actions.push(action);
  } else if (/(column|columns|container|image)/.test(parent.$$kind)) {
    if (parent.selectAction) {
      syntaxErrorThrower(path, `Only a single action can exist on the ${parent.$$kind} element`);
    }
    parent.selectAction = action;
  } else if (!insertElementViaCommonParentProps(action, parent)) {
    syntaxErrorThrower(path, `${parent.$$kind} must not contain an action element`);
  }
  return action;
};

module.exports.actions = function (path, scope) {
  const parent = getParent(path, scope);
  const actions = defineElement('actions');
  actions.actions = [];

  if (path.node.openingElement.attributes.length) {
    syntaxErrorThrower(path, 'The actions element cannot contain attributes');
  }
  if (parent && parent.attrs && parent.attrs.type === definitionsMap.card) {
    parent.actions = actions;
  } else if (!insertElementViaCommonParentProps(actions, parent)) {
    syntaxErrorThrower(path, `The actions element cannot be used with the ${parent.type} element`);
  }
  return actions;
};

module.exports.body = function (path, scope) {
  const parent = getParent(path, scope);
  const body = [];

  if (parent && parent.attrs && parent.attrs.type === definitionsMap.card) {
    parent.body = body;
  } else if (!insertElementViaCommonParentProps(body, parent)) {
    syntaxErrorThrower(path, `The body element cannot be used with the ${parent.type} element`);
  }

  return body;
};

module.exports.card = function (path, scope) {
  const parent = getParent(path, scope);
  const card = defineElement('card');
  Object.assign(card.attrs, {
    type: definitionsMap.card,
    version: '1.0',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json'
  });

  if (parent && parent.attrs && parent.attrs.type === definitionsMap.action.showCard) {
    parent.card = card;
  } else if (!insertElementViaCommonParentProps(card, parent)) {
    syntaxErrorThrower(path, 'The card element is not allowed here');
  }

  return card;
};

module.exports.choice = function (path, scope) {
  const choice = defineElement('choice');
  const parent = getParent(path, scope);
  choice.title = path.node.children.filter((childNode) => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
  choice.attrs.type = definitionsMap.choice;
  if (parent && parent.attrs && parent.attrs.type === definitionsMap.choices) {
    parent.choices.push(choice);
  } else if (!insertElementViaCommonParentProps(choice, parent))
    syntaxErrorThrower(path, 'The choice element can only exist as a child of the <choices> tag');
  return choice;
};

module.exports.choices = function (path, scope) {
  const parent = getParent(path, scope);
  const choices = defineElement('choices');
  choices.choices = [];
  choices.attrs.type = definitionsMap.choices;

  if (!parent) {
    return choices;
  }
  if (/(column|container)/.test(parent.$$kind)) {
    parent.items.push(choices);
  } else if (!insertElementViaCommonParentProps(choices, parent)) {
    syntaxErrorThrower(path, `The choices element can only exist as children in the body or container tag`);
  }
  return choices;
};

module.exports.column = function (path, scope) {
  const parent = getParent(path, scope);
  const column = defineElement('column');
  column.items = [];
  column.attrs.type = definitionsMap.column;

  if (parent && parent.attrs && parent.attrs.type === definitionsMap.columns) {
    parent.columns.push(column);
  } else if (!insertElementViaCommonParentProps(column, parent)) {
    syntaxErrorThrower(path, 'The column element can only exist as children in the columns tag');
  }

  return column;
};

module.exports.columns = function (path, scope) {
  const parent = getParent(path, scope);
  const columns = defineElement('columns');
  columns.columns = [];
  columns.attrs.type = definitionsMap.columns;

  if (parent && parent.attrs && parent.attrs.type === definitionsMap.container) {
    parent.items.push(columns);
  } else if (!insertElementViaCommonParentProps(columns, parent)) {
    syntaxErrorThrower(path, 'The columns element can only exist as children in the body or container tag');
  }
  return columns;
};

module.exports.component = function (path, scope) {
  const parent = getParent(path, scope);
  const component = {
    $$kind: 'component',
    uid: path.scope.generateUidBasedOnNode(),
    name: path.node.openingElement.name.name,
    props: {},
    children: []
  };
  if (!insertElementViaCommonParentProps(component, parent)) {
    const childProperty = findElementChildProperty(parent.$$kind, (parent.attrs || {}).type);
    parent[childProperty] = component;
  }
  scope.opts.hasComponent = true;
  return component;
};

module.exports.container = function (path, scope) {
  const parent = getParent(path, scope);
  const container = defineElement('container');
  container.items = [];
  container.attrs.type = definitionsMap.container;
  insertElementViaCommonParentProps(container, parent);
  return container;
};

module.exports.fact = function (path, scope) {
  const parent = getParent(path, scope);
  const fact = defineElement('fact');
  fact.attrs.type = definitionsMap.fact;
  if (parent && parent.$$kind === 'facts') {
    parent.facts.push(fact);
  } else if (!insertElementViaCommonParentProps(fact, parent)) {
    syntaxErrorThrower(path, 'The fact element can only exist as a child in a facts element');
  }
  return fact;
};

module.exports.facts = function (path, scope) {
  const parent = getParent(path, scope);
  const facts = defineElement('facts');
  facts.facts = [];
  facts.attrs.type = definitionsMap.facts;

  if (!parent) {
    return facts;
  }
  if (/(column|container)/.test(parent.$$kind)) {
    parent.items.push(facts);
  } else if (!insertElementViaCommonParentProps(facts, parent)) {
    syntaxErrorThrower(path, `The facts element can only exist as children in the body or container tag`);
  }
  return facts;
};

module.exports.image = function (path, scope) {
  const parent = getParent(path, scope);
  const image = defineElement('image');

  image.attrs.type = definitionsMap.image;
  if (!parent) {
    return image;
  }

  if (parent.attrs && parent.attrs.type === definitionsMap.images) {
    parent.images.push(image);
  } else if (/(column|container)/.test(parent.$$kind)) {
    parent.items.push(image);
  } else if (!insertElementViaCommonParentProps(image, parent)) {
    syntaxErrorThrower(path, 'The image element can only exist as children in a component or the body or container tag');
  }

  return image;
};

module.exports.images = function (path, scope) {
  const parent = getParent(path, scope);
  const images = defineElement('images');
  images.images = [];
  images.attrs.type = definitionsMap.images;
  insertElementViaCommonParentProps(images, parent);

  return images;
};

module.exports.input = function (path, scope) {
  const input = defineElement('input');
  const parent = getParent(path, scope);
  const typeAttr = path.node.openingElement.attributes.find(attr => (!t.isJSXSpreadAttribute(attr) && attr.name.name === 'type'));
  input.attrs.type = definitionsMap.input[typeAttr.value.value];
  const {children} = path.node;
  if (children && children.length) {
    switch (input.attrs.type) {
      case definitionsMap.input.toggle:
        input.title = children.filter(childNode => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
        break;

      default:
        syntaxErrorThrower(path, `The input[type="${input.attrs.type}"] cannot contain children`);
    }
  }

  if (!insertElementViaCommonParentProps(input, parent)) {
    syntaxErrorThrower(path, 'The input element can only exist as children in the body or container tag');
  }

  return input;
};

module.exports.text = function (path, scope) {
  const text = defineElement('text');
  const parent = getParent(path, scope);
  text.text = path.node.children.filter(childNode => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
  text.attrs.type = definitionsMap.text;
  if (parent && /(column|container)/.test(parent.$$kind)) {
    parent.items.push(text);
  } else if (!insertElementViaCommonParentProps(text, parent)) {
    syntaxErrorThrower(path, 'The text element does not belong here');
  }
  return text;
};

function getParent(path, scope) {
  const key = getMapKeyForNode(path.parent);
  return scope.opts.nodeMap[key];
}

function insertElementViaCommonParentProps(element, parent) {
  // Allow this since no parent indicates a possible expression
  if (!parent) {
    return true;
  }
  if (Array.isArray(parent)) {
    return !!parent.push(element);
  }
  if (parent.$$kind === 'component') {
    return !!parent.children.push(element);
  }
  return false;
}

function findActionChildProperty(action) {
  const {type} = action.attrs;
  switch (type) {
    case definitionsMap.action.submit:
      return 'data';

    case definitionsMap.action.openUrl:
      return 'url';

    case definitionsMap.action.showCard:
      return 'card';
  }
}
