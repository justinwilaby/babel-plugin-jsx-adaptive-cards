const definitionsMap = require('../utils/definitionsMap');

module.exports = function ($$kind, type) {
  switch ($$kind) {
    case 'action':
      return findActionChildProperty(type);

    case 'column':
    case 'container':
      return 'items';

    case 'columns':
    case 'choices':
    case 'facts':
    case 'images':
      return $$kind;

    default:
      return null;
  }
};

function findActionChildProperty(type) {

  switch (type) {
    case definitionsMap.action.submit:
      return 'data';

    case definitionsMap.action.openUrl:
      return 'url';

    case definitionsMap.action.showCard:
      return 'card';
  }
}
