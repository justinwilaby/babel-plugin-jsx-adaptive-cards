import Ajv from 'ajv';
import assert from 'assert';
import schema from 'babel-plugin-jsx-adaptive-cards/lib/schema.json';

import {StockUpdateComponent} from '../stockUpdateCompont.acx';

describe('The StockUpdateComponent' , () => {
  let stockUpdateComponent;
  beforeEach(() => {
    stockUpdateComponent = new StockUpdateComponent();
  });
  it('should pass the schema validation', () => {
    const ajv = new Ajv({schemaId: 'auto'}); // options can be passed, e.g. {allErrors: true}
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    const validate = ajv.compile(schema);
    const card = stockUpdateComponent.render();
    const valid = validate(card);
    assert(valid);
  });
});
