module.exports = function (str) {
  str = str.replace(/\t/g, '');
  str = str.replace(/(\s*[\r\n]\s*)/g, ' ');
  return str.trimLeft();
};
