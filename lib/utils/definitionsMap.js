const definitionsMap = {
  card: 'AdaptiveCard',
  text: 'TextBlock',
  images: 'ImageSet',
  image: 'Image',
  choice: 'Input.Choice',
  choices: 'Input.ChoiceSet',
  container: 'Container',
  columns: 'ColumnSet',
  column: 'Column',
  facts: 'FactSet',
  fact: 'Fact',
  actions: 'Actions',
  action: {
    childFieldName: {
      'Action.OpenUrl': 'url',
      'Action.Submit': 'data',
      'Action.ShowCard': 'card'
    },
    openUrl: 'Action.OpenUrl',
    submit: 'Action.Submit',
    showCard: 'Action.ShowCard'
  },
  input: {
    text: 'Input.Text',
    number: 'Input.Number',
    date: 'Input.Date',
    time: 'Input.Time',
    toggle: 'Input.Toggle'
  }
};
module.exports = definitionsMap;
