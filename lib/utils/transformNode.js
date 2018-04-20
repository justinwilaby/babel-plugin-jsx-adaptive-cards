const t = require('@babel/types');
const definitionsMap = require('./definitionsMap');
const {normalizeWhitespace} = require('../helpers');
const {addMemberExpression} = require('../utils');

const nodeKindTransformMap = {
  action: transformAction,
  card: transformCard,
  choice: transformChoice,
  choices: transformInput,
  column: transformColumnOrContainer,
  columns: transformColumns,
  component: transformComponent,
  container: transformColumnOrContainer,
  fact: transformFact,
  facts: transformFacts,
  image: transformImage,
  images: transformImages,
  input: transformInput,
  text: transformTextBlock
};

function transformNode(element, scope) {
  if (t.isExpression(element) || t.isSpreadElement(element) || t.isIdentifier(element)) {
    return element;
  }
  const objectExpression = t.objectExpression([]);
  const ast = nodeKindTransformMap[element.$$kind](element, scope);

  if (element.$$kind === 'component') {
    return ast;
  }

  if (Array.isArray(ast)) {
    objectExpression.properties.push(...ast);
  } else if (ast) {
    objectExpression.properties.push(
      t.objectProperty(t.identifier(element.$$kind), ast)
    );
  }

  if ('attrs' in element) { // let the component transform handle the attributes
    transformAttributes(objectExpression, element);
  }

  if ('spread' in element) {
    return t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), [...element.spread, objectExpression]);
  }

  return objectExpression;
}

function transformAction(actionElement, scope) {
  const typeKey = actionElement.attrs.type;
  const properties = [];
  const key = definitionsMap.action.childFieldName[typeKey];
  if (actionElement[key]) {
    const transformedChildren = transformChildren(actionElement[key], scope);
    if (transformedChildren.length === 1) {
      properties.push(t.objectProperty(t.identifier(key), transformedChildren[0]));
    } else if (transformedChildren.length > 1) {
      properties.push(t.objectProperty(t.identifier(key), t.arrayExpression(transformedChildren)));
    }
  }
  return properties;
}

function transformCard(card, scope) {
  const properties = [];
  if ('body' in card) {
    properties.push(t.objectProperty(t.identifier('body'), t.arrayExpression(card.body.map(element => transformNode(element, scope)))))
  }

  if ('actions' in card) {
    properties.push(t.objectProperty(t.identifier('actions'), t.arrayExpression(card.actions.actions.map(element => transformNode(element, scope)))))
  }

  return properties;
}

function transformChoice(choice, scope) {
  const title = transformTextBlock(choice.title, scope);
  return [t.objectProperty(t.identifier('title'), title)];
}

function transformComponent(component, scope) {
  // Build the props object to pass as an expression to
  // the render function or the constructor for our component
  const propsOExp = t.objectExpression([]);
  if (component.children.length) {
    propsOExp.properties.push(t.objectProperty(t.identifier('children'), t.arrayExpression(component.children.map(element => transformNode(element, scope)))));
  }
  transformAttributes(propsOExp, component);
  const propsIdentifier = propsOExp.properties.length ? addMemberExpression(t, propsOExp, scope) : propsOExp;
  // _renderComponent(scope, uid, ctor, props)
  const callExp = t.callExpression(t.identifier('_renderComponent'),
    [
      t.thisExpression(),
      t.stringLiteral(component.uid),
      t.identifier(component.name),
      propsIdentifier
    ]
  );
  return addMemberExpression(t, callExp, scope); // t, expression, scope
}

function transformColumnOrContainer(columnOrContainerElement, scope) {
  const properties = [];

  if ('selectedAction' in columnOrContainerElement) {
    properties.push(t.objectProperty(t.identifier('selectedAction'), transformNode(columnOrContainerElement.selectedAction, scope)));
  }

  if ('items' in columnOrContainerElement) {
    properties.push(t.objectProperty(t.identifier('items'), t.arrayExpression(columnOrContainerElement.items.map(item => transformNode(item, scope)))));
  }

  return properties;
}

function transformFact() {
  return null;
}

function transformFacts(factsElement, scope) {
  if ('facts' in factsElement && factsElement.facts.length) {
    return t.arrayExpression(factsElement.facts.map(fact => transformNode(fact, scope)));
  }
}

function transformImages(imagesElement, scope) {
  if ('images' in imagesElement && imagesElement.images.length) {
    return t.arrayExpression(imagesElement.images.map(image => transformNode(image, scope)));
  }
}

function transformImage(imageElement, scope) {
  if ('selectAction' in imageElement) {
    return t.objectProperty(t.identifier('selectAction'), transformNode(imageElement.selectAction, scope));
  }
}

function transformColumns(columnsElement, scope) {
  const properties = [];
  if ('columns' in columnsElement) {
    properties.push(t.objectProperty(t.identifier('columns'), t.arrayExpression(columnsElement.columns.map(column => transformNode(column, scope)))));
  }
  if ('selectAction' in columnsElement) {
    properties.push(t.objectProperty(t.identifier('selectAction'), transformNode(columnsElement.selectedAction)));
  }

  return properties;
}

function transformInput(inputElement, scope) {
  if ('choices' in inputElement && inputElement.choices.length) {
    return [t.objectProperty(t.identifier('choices'), t.arrayExpression(inputElement.choices.map(child => transformNode(child, scope))))];
  } else if ('title' in inputElement) {
    return [t.objectProperty(t.identifier('title'), transformTextBlock(inputElement.title, scope))];
  }
}

function transformTextBlock(textElement, scope) {
  if (!textElement) {
    return t.nullLiteral;
  }
  const nodes = (textElement.text || textElement);
  if (nodes.length === 1 && t.isJSXText(nodes[0])) {
    return t.stringLiteral(normalizeWhitespace(nodes[0].value));
  }
  const quasis = [];
  const expressions = [];
  nodes.forEach((node, index) => {
    quasis.push(t.templateElement(`t${index}`));
    if (t.isJSXText(node)) {
      const value = normalizeWhitespace(node.value);
      expressions.push(t.stringLiteral(value));
    } else if (t.isJSXExpressionContainer(node)) {
      const identifier = addMemberExpression(t, node.expression, scope);
      expressions.push(identifier);
    }
  });
  return t.templateLiteral(quasis, expressions);
}

function transformAttributes(objectExpression, element) {
  let source = 'props' in element ? element.props : element.attrs;
  Object.keys(source).forEach(key => {
    const node = source[key];
    let expression;
    if (t.isJSXExpressionContainer(node)) {
      expression = node.expression;
    } else {
      expression = primitiveToLiteral(node);
    }
    if (expression) {
      objectExpression.properties.push(
        t.objectProperty(t.identifier(key), expression)
      );
    }
  });
}

// TODO - Make sense of the rules for transforming children
function transformChildren(nodes, scope) {
  const transformedChildren = [];
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }
  nodes.forEach(node => {
    if (t.isJSXText(node)) {
      const value = normalizeWhitespace(node.value);
      if (value) {
        transformedChildren.push(t.stringLiteral(value));
      }
    } else if (t.isJSXExpressionContainer(node)) {
      transformedChildren.push(node.expression);
    } else if ('$$kind' in node) {
      transformedChildren.push(transformNode(node, scope));
    } else {
      transformedChildren.push(node);
    }
  });

  return transformedChildren;
}

function primitiveToLiteral(value) {
  if (typeof value === 'string') {
    return t.stringLiteral(value);
  }
  if (typeof value === 'number') {
    return t.numericLiteral(value);
  }
  if (typeof value === 'boolean') {
    return t.booleanLiteral(value);
  }
  return value;
}

module.exports = transformNode;
