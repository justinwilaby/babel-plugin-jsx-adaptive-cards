const t = require('@babel/types');

const {getMapKeyForNode, normalizeWhitespace, syntaxErrorThrower} = require('../helpers');
const definitionsMap = require('./definitionsMap');
const getDefinitionFromSchema = require('../helpers/getDefinitionFromSchema');

module.exports.action = function (path, scope) {
  const action = {$$kind: 'action'};
  copyAttributes(path, action);
  const parent = getParent(path, scope);
  const type = action.attrs.type;
  const children = path.node.children;
  action.attrs.type = definitionsMap.action[type.value];
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
    if (parent.selectedAction) {
      syntaxErrorThrower(path, `Only a single action can exist on the ${parent.$$kind} element`);
    }
    parent.selectedAction = action;
  } else if (!insertElementViaCommonParentProps(action, parent)) {
    syntaxErrorThrower(path, `${parent.$$kind} must not contain an action element`);
  }
  return action;
};

module.exports.actions = function (path, scope) {
  const parent = getParent(path, scope);
  const actions = {$$kind: 'actions', actions: []};
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
  const card = {$$kind: 'card', attrs: {version: '1.0', $schema: 'http://adaptivecards.io/schemas/adaptive-card.json'}};
  copyAttributes(path, card);
  card.attrs.type = definitionsMap.card;

  if (parent && parent.attrs && parent.attrs.type === definitionsMap.action.showCard) {
    parent.card = card;
  } else if (!insertElementViaCommonParentProps(card, parent)) {
    syntaxErrorThrower(path, 'The card element is not allowed here');
  }

  return card;
};

module.exports.choice = function (path, scope) {
  const choice = {$$kind: 'choice'};
  const parent = getParent(path, scope);
  copyAttributes(path, choice);
  choice.title = path.node.children.filter((childNode) => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
  choice.attrs.type = definitionsMap.choice;
  if (parent && parent.attrs && parent.attrs.type === definitionsMap.input.choiceSet) {
    parent.choices.push(choice);
  } else if (!insertElementViaCommonParentProps(choice, parent))
    syntaxErrorThrower(path, 'The choice element can only exist as a child of the <input type="choiceSet"/> tag');
  return choice;
};

module.exports.column = function (path, scope) {
  const parent = getParent(path, scope);
  const column = {$$kind: 'column', items: []};
  copyAttributes(path, column);
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
  const columns = {$$kind: 'columns', columns: []};
  copyAttributes(path, columns);
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
  (path.node.openingElement.attributes || []).forEach(attr => {
    if (!t.isJSXSpreadAttribute(attr)) {
      component.props[attr.name.name] = attr.value;
    }
  });
  if (!insertElementViaCommonParentProps(component, parent)) {
    switch (parent.$$kind) {
      case 'columns':
        parent.columns.push(component);
        break;

      case 'container':
      case 'column':
        parent.items.push(component);
        break;

      case 'facts':
        parent.facts.push(component);
        break;

      case 'images':
        parent.images.push(component);
        break;

      case 'action':
        const childProp = findActionChildProperty(parent);
        parent[childProp] = component;
        break;
    }
  }
  scope.opts.hasComponent = true;
  return component;
};

module.exports.container = function (path, scope) {
  const parent = getParent(path, scope);
  const container = {$$kind: 'container', items: []};
  copyAttributes(path, container);
  container.attrs.type = definitionsMap.container;
  insertElementViaCommonParentProps(container, parent);
  return container;
};

module.exports.fact = function (path, scope) {
  const parent = getParent(path, scope);
  const fact = {$$kind: 'fact'};
  copyAttributes(path, fact);
  fact.attrs.type = definitionsMap.fact;

  if (!insertElementViaCommonParentProps(fact, parent)) {
    syntaxErrorThrower(path, 'The fact element can only exist as a child in a facts element');
  }
  return fact;
};

module.exports.facts = function (path, scope) {
  const parent = getParent(path, scope);
  const facts = {$$kind: 'facts', facts: []};
  copyAttributes(path, facts);
  facts.attrs.type = definitionsMap.facts;

  if (!parent) {
    return facts.facts;
  }
  if (/(column|container)/.test(parent.$$kind)) {
    parent.items.push(facts);
  } else if (!insertElementViaCommonParentProps(facts, parent)) {
    syntaxErrorThrower(path, `The facts element can only exist as children in the body or container tag`);
  }
  return facts.facts;
};

module.exports.image = function (path, scope) {
  const parent = getParent(path, scope);
  const image = {$$kind: 'image'};

  copyAttributes(path, image);
  if (!parent) {
    return image;
  }
  image.attrs.type = definitionsMap.image;
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
  const images = {$$kind: 'images', images: []};
  copyAttributes(path, images);
  images.attrs.type = definitionsMap.images;
  insertElementViaCommonParentProps(images, parent);

  return images;
};

module.exports.input = function (path, scope) {
  const input = {$$kind: 'input'};
  const parent = getParent(path, scope);
  copyAttributes(path, input, scope.opts.expressions);

  input.attrs.type = definitionsMap.input[input.attrs.type.value];
  const {children} = path.node;
  if (children && children.length) {
    switch (input.attrs.type) {
      case definitionsMap.input.toggle:
        input.title = children.filter(childNode => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
        break;

      case definitionsMap.input.choiceSet:
        input.choices = [];
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
  const text = {$$kind: 'text'};
  const parent = getParent(path, scope);
  copyAttributes(path, text);
  text.text = path.node.children.filter(childNode => t.isJSXExpressionContainer(childNode) || normalizeWhitespace(childNode.value) !== '');
  text.attrs.type = definitionsMap.text;
  if (parent && /(column|container)/.test(parent.$$kind)) {
    parent.items.push(text);
  } else if (!insertElementViaCommonParentProps(text, parent)) {
    syntaxErrorThrower(path, 'The text element does not belong here');
  }
  return text;
};

function copyAttributes(path, destination) {
  if (!destination.attrs) {
    Object.defineProperty(destination, 'attrs', {value: {}, enumerable: false});
  }
  const typeAttr = path.node.openingElement.attributes.find(attr => (!t.isJSXSpreadAttribute(attr) && attr.name.name === 'type'));
  if (typeAttr && !t.isStringLiteral(typeAttr.value)) {
    syntaxErrorThrower(path, 'Type attributes must be string literals');
  }
  const type = typeAttr ? typeAttr.value.value : null;
  const definition = getDefinitionFromSchema(path, destination.$$kind, type);
  if (!definition.properties && path.node.openingElement.attributes.length) {
    syntaxErrorThrower(path, `${destination.$$kind} does not allow attributes`);
  }

  (path.node.openingElement.attributes || []).forEach(attr => {
    if (!t.isJSXSpreadAttribute(attr)) {
      const name = attr.name.name;
      if (!definition.properties[name] || (destination[name] && destination.attrs[name])) {
        syntaxErrorThrower(path, `The ${name} attribute is not allowed here`);
      }
      destination.attrs[attr.name.name] = attr.value;
    }
  });
}

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
