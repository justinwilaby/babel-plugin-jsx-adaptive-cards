const template = require('@babel/template');
const createTemplate = template.default.smart({
  placeholderPattern: false
});
const _renderComponentTpl = createTemplate(`const _components = new WeakMap(); function _renderComponent(scope, uid, ctor, props) { const map = _components.get(scope) || {}; if (map && map[uid]) { return map[uid](props); } if (\'render\' in ctor.prototype) { map[uid] = (function () { let instance; return function (props) { if (!instance) { instance = new ctor(props) } else { instance.props = props; } return instance.render(); } })(); } else { map[uid] = function (props) { return ctor(props); }; } _components.set(scope, map); return map[uid](props); }`);

module.exports = {
  exit(path, scope) {
    if (!scope.opts.hasComponent) {
      return;
    }
    path.node.body.unshift(..._renderComponentTpl());
    scope.opts.hasComponent = false;
  }
};
