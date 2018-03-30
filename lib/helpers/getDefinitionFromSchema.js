const schema = require('../schema');
const definitionsMap = require('../utils/definitionsMap');

function getDefinitionFromSchema(path, kind, type) {
  let definition = type ? schema.definitions[definitionsMap[kind][type]] : schema.definitions[definitionsMap[kind]];
  if (!definition) {
    const message = type ? `${type} is not a valid type for the ${kind} element.` : `${kind} is not a valid adaptive card element.`;
    throw path.buildCodeFrameError(message);
  }
  if (definition.allOf) {
    const {properties = {}} = definition;

    definition.allOf.forEach(all => {
      const additionalProps = getValueFromSchema(`${all.$ref}/properties`);
      Object.assign(properties, additionalProps);
    });
    definition.properties = properties;
  }
  if (kind === 'card') {
    const {properties} = definition;
    Object.assign(properties, schema.properties);
  }
  return definition;
};

function getValueFromSchema($ref) {
  const path = $ref.replace('#/', '').split('/');
  return path.reduce((acc, fragment) => acc[fragment], schema);
}

module.exports = {
  getDefinitionFromSchema,
  getValueFromSchema
};
