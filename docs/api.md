# API Docs

When you use the linter through `require()` :

```js
const IsmlLinter = require('isml-linter');
```

you have access to the following methods:

```js
    /**
     * Sets the configuration json data, in case you don't
     * want to use the default .isml-linter.json file in the
     * project root directory;
     *
     * @param  {Object} json
     * @return {Object} config object - same as input
    */
    setConfig(json)

    /**
     * Parses all files under a specific path;
     *
     * @param  {String} path
     * @return {Object} structured parse result
     **/
    parse(path)

    /**
     * Calls parse() with configured path as
     * param and prints the result to console;
     *
     * @return {Number} 0 if no errors were found
     *                  1 if errors were found
     **/
    build()
```