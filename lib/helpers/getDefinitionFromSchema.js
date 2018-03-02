const schema = require('../schema');
const definitionsMap = require('../utils/definitionsMap');

module.exports = function getDefinitionFromSchema(path, kind, type) {
  let definition = type ? schema.definitions[definitionsMap[kind][type]] : schema.definitions[definitionsMap[kind]];
  if (!definition) {
    const message = type ? `${type} is not a valid type for the ${kind} element.` : `${kind} is not a valid adaptive card element.`;
    throw path.buildCodeFrameError(message);
  }
  if (definition.allOf) {
    const {properties = {}} = definition;

    definition.allOf.forEach(all => {
      const additionalProps = getValueFrom(`${all.$ref}/properties`);
      Object.assign(properties, additionalProps);
    });
    definition.properties = properties;
  }
  return definition;
};

function getValueFrom($ref) {
  const path = $ref.replace('#/', '').split('/');
  return path.reduce((acc, fragment) => acc[fragment], schema);
}
