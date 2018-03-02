module.exports = function getJSXElement(t, path) {
  if (!path.parentPath || t.isJSXElement(path.container)) {
    return path.container;
  }
  return getJSXElement(t, path.parentPath);
};
