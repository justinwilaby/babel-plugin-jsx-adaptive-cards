# JSX For Adaptive Cards (ACX)
The Babel plugin for JSX [Adaptive Cards](http://adaptivecards.io/) allows you to use the familiar JSX syntax for authoring 
your cards while leveraging the entire JavaScript language for organizing and generating cards while notifying you at build time of 
schema validation errors.

Similar to [React JSX](https://reactjs.org/docs/introducing-jsx.html), JSX for Adaptive Cards allows authoring of cards using declarative 
elements, components and expressions. It is then transpiled in to pure JavaScript to render valid Adaptive Card JSON. This plugin is compatible 
with nearly all React JSX features and can live along side of projects that build using React. **If you are familiar with React, you 
already know how to use JSX for Adaptive cards.**

# Getting Started
Install babel dependencies:
```bash
npm i --save-dev @babel/core @babel/plugin-syntax-jsx @babel/plugin-transform-runtime @babel/preset-env
```
Install the JSX for Adaptive Cards plugin
```bash
npm i --save-dev bable-plugin-jsx-adaptive-cards
```
Then add it to the plugins array in your `.babelrc`:
```json
{
  ...
  "plugins": ["babel-plugin-jsx-adaptive-cards", "@babel/plugin-syntax-jsx"]
  ...
}
```
JSX for Adaptive Cards can be used in projects that utilize JSX or TSX for React, InfernoJS or other 
React-like libraries. To ensure these other processors do not process the Adaptive Card JSX, Babel 7+ must be used
since it allows [overrides for pattern matching](https://github.com/babel/babel/pull/7091). The `.acx` file extension
is recommended to separate jsx/tsx from Adaptive Card jsx.

# Basic Syntax
JSX for Adaptive cards transforms the [Adaptive Card Schema](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema) 
into a terse and declarative XML syntax that's organized, easy to read, easy to maintain and easy to 
reuse. The basic syntax is the foundation for creating your Adaptive Card using JSX. From there, you can expand into
components, expressions, fragments and many other tools.

Below are links to the original schema and a brief example of the ACX equivalent: 
### [AdaptiveCard](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#schema-adaptivecard) 
This is the root of your Adaptive Card
```jsx harmony
<card>
  <body></body>
  <actions></actions>
</card>
```
###[TextBlock](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#textblock)
The child text node maps to the `text` property.
```jsx harmony
<text>Polar bears have a conservation status of "Vulnerable"</text>
```
### [Image](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#image)
No children are allowed.
```jsx harmony
<image url="http://url.to/image.png"/>
```
### [Container](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#container)
All child elements are pushed into the `items` array.
```jsx harmony
<container>
  <text>Male polar bears weigh between 350-700kg.</text>
  <text>Female polar bears come in at almost half the weight of males.</text>
  ...
</container>
```
### [ColumnSet](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#columnset)
Children are pushed into the `items` array and must be `<column>` elements
```jsx harmony
<columns>
  <column></column>
  ...
</columns>
```
### [Column](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#column)
Allowed only as a child to the `<columns>` element. Children are pushed into the `items` array.
```jsx harmony
<column>
  <text>The Brown Bear or Kodiak Bear is the closest relative to the Polar Bear</text>
  <image url="https://en.wikipedia.org/wiki/Brown_bear#/media/File:2010-kodiak-bear-1.jpg"/>
  ...
</column>
```
### [FactSet](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#factset)
All child elements are pushed into the `facts` array and must be `<fact/>` elements.
```jsx harmony
<facts>
  <fact title="Male Polar Bear Weight" value="300-700kg"/>
  <fact title="Female Polar Bear Weight" value="150-300kg"/>
  ...
</facts>
```
### [Fact](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#fact)
Allowed only as a child of the `<facts>` element
```jsx harmony
<fact title="Polar Bear activity period" value="Year round"/>
```
### [ImageSet](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#imageset)
All child elements are pushed into the `images` array and must be `<image/>` elements
```jsx harmony
<images>
  <image url="https://en.wikipedia.org/wiki/Polar_bear#/media/File:Polarbear_spitzbergen_1.jpg"/>
  <image url="https://en.wikipedia.org/wiki/Polar_bear#/media/File:Ursus_maritimus_us_fish.jpg"/>
  ...
</images>
```
### [Action.OpenUrl](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#actionopenurl)
The child text node maps to the `url` property
```jsx harmony
<action type="openUrl">https://polarbearsinternational.org/</action>
```
### [Action.Submit](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#actionsubmit)
Any expression or JSX element is allowed as a child and will map to the `data` property
```jsx harmony
<action type="submit">
  {{donationAmount: '$100', conservationGroup: 'Polar Bears International'}}
</action>
```
### [Action.ShowCard](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#actionshowcard)
There must be a single child which is the `<card>` element to show
```jsx harmony
<action type="showCard">
  <card>
    <body></body>
    <actions></actions>
  </card>
</action>
```
### [Input.Text](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputtext)
```jsx harmony
<input type="text" id="uniqueId"/>
```
### [Input.Number](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputnumber)
```jsx harmony
<input type="number" id="uniqueId" min={10} max={9999} />
```
### [input.Date](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputdate)
```jsx harmony
<input type="date" id="uniquerId"/>
```
### [Input.Time](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputtime)
```jsx harmony
<input type="time" id="uniqueUd"/>
```
### [Input.Toggle](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputtoggle)
```jsx harmony
<input type="toggle" id="uniqueId" valueOff="one-time" valueOn="monthly" title="Monthly Donation"/>
```
### [Input.ChoiceSet](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputchoiceset)
Children map to the `choices` property and must be `<choice>` elements
```jsx harmony
<input type="choiceSet" id="uniqueId">
  <choice value="1">Polar Bears International</choice>
  <choice value="2">Humane Society International</choice>
  ...
</input>
```
### [Input.Choice](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema#inputchoice)
The child text node maps to the `title` property
```jsx harmony
<choice value="1">Polar Bears International</choice>
```

# Components
Like React Components, Adaptive Cards components come in 2 flavors: Pure Components and Stateful Components. 

## Pure Components
Pure Components are merely functions that accept a `props` object and are expected to return an adaptive card or a fragment when called.
Pure Components are stateless, short lived and the easiest to consume. 
The basic syntax for a Pure Component is:
```jsx harmony
export const PureComponent = props => {
  return (
    <card>
      <body>
        <text>Choose contribution amount</text>
      </body>
      <actions>
        {...props.children}
      </actions>
    </card>
  )
};
```
In the example above, the Pure Component renders it's children inside a `<card>` element. Once the component is created,
Consuming it then looks like this:
```jsx harmony
import {PureComponent} from './components/pureComponent';

const renderMyCard = () => {
  return (
    <PureComponent>
      {getActions()}
    </PureComponent>
  )
}

function getActions() {
  '$5.00 $10.00 $100.00'
  .split(' ')
  .map(amount => <action type="submit" title={`Donate ${amount}`}>{amount}</action>);
}
```
## Stateful Components
Stateful Components are a good choice when the encapsulation of functionality is important or more complex rules
need to be applied before the card is rendered. A Stateful Component has just 2 requirements:
1. `render()` must be a callable function that returns a JSX Fragment or an Adaptive Card element of any kind
2. `props` must be a member property and optionally can also be the single argument passed to the constructor.

The basic syntax for a Stateful Component is:
```jsx harmony
class StatefulComponent {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return (
      <card>
        <body>
          <text>Choose contribution amount</text>
        </body>
        <actions>
          {...this.props.children}
        </actions>
      </card>
    );
  }
}
```
Consuming it is exactly the same as above

## JSX Expressions
As seen in some of the syntax examples above, [JSX expressions](https://reactjs.org/docs/introducing-jsx.html#embedding-expressions-in-jsx)
can be used to call functions, evaluate conditionals or
use variables to generate dynamic content. Although powerful, it's important to understand some nuances when using them.
1. Since expressions are evaluated at runtime, Adaptive Card JSX cannot be fully validated at compile time when an expression 
is encountered. This can lead to an invalid JSON output. Unit testing is recommended for validation in these cases.
2. Attribute values enclosed in quotes are always strings. Elements that require numbers or booleans as attribute values must 
use JSX Expressions. e.g. `<input type="text" isMultiline={true}/>`. Refer to Microsoft's [Adaptive Card Schema](https://docs.microsoft.com/en-us/adaptive-cards/create/cardschema) 
for more details on which types are expected as attribute values.