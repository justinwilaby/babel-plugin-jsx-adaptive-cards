const schema = require('../schema');
const definitionsMap = require('../utils/definitionsMap');

function getDefinitionFromSchema(path, kind, type) {
  let definition = type ? schema.definitions[definitionsMap[kind][type]] : schema.definitions[definitionsMap[kind]];
  if (!definition) {
    const message = type ? `${type} is not a valid type for the ${kind} element.` : `${kind} is not a valid adaptive card element.`;
    throw path.buildCodeFrameError(message);
  }
  if (definition.allOf) {
    let {properties = {}} = definition;

    definition.allOf.forEach(all => {
      const additionalProps = getValueFromSchema(`${all.$ref}/properties`);
      properties = Object.assign({}, additionalProps, properties);
    });
    definition.properties = properties;
  }

  if (kind === 'card') {
    let {properties} = definition;
    properties = Object.assign({}, properties, schema.properties);
  }

  definition.properties = Object.keys(definition.properties).reduce((agg, propertyName) => {
    const property = definition.properties[propertyName];
    agg[propertyName] = '$ref' in property ? getValueFromSchema(property.$ref) : property;
    return agg;
  }, {});

  return definition;
}

function getValueFromSchema($ref) {
  const path = $ref.replace('#/', '').split('/');
  return path.reduce((acc, fragment) => acc[fragment], schema);
}

module.exports = {
  getDefinitionFromSchema,
  getValueFromSchema
};
