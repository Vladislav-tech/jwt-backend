const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@': path.resolve(__dirname, 'dist'),
});
