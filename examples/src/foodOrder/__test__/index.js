import Ajv from 'ajv';
import {FoodOrder} from '../foodOrderComponent.acx';
import assert from 'assert';
import schema from 'babel-plugin-jsx-adaptive-cards/lib/schema.json';

describe('The FoodOrderComponent' , () => {
  let foodOrderComponent;
  beforeEach(() => {
    foodOrderComponent = new FoodOrder();
  });

  it('should pass the schema validation', () => {
    const ajv = new Ajv({schemaId: 'auto'}); // options can be passed, e.g. {allErrors: true}
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    const validate = ajv.compile(schema);
    const card = foodOrderComponent.render();
    const valid = validate(card);
    assert(valid);
  });
});
