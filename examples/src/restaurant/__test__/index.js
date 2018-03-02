import Ajv from 'ajv';
import assert from 'assert';
import schema from 'babel-plugin-jsx-adaptive-cards/lib/schema.json';

import {RestaurantComponent} from '../RestaurantComponent.acx';

describe('The InputComponent' , () => {
  let restaurantComponent;
  beforeEach(() => {
    restaurantComponent = new RestaurantComponent();
  });
  it('should pass the schema validation', () => {
    const ajv = new Ajv({schemaId: 'auto'});
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    const validate = ajv.compile(schema);
    const card = restaurantComponent.render();
    const valid = validate(card);
    assert(valid);
  });
});
