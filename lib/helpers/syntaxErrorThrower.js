module.exports = function thrower(path, message) {
  const error = path.buildCodeFrameError(message);
  error.loc = path.node.loc.start;
  error.pos = path.node.start;
  throw error;
};
