# Tempaa

Tempaa is a template engine with data-binding.

[![Build Status](https://travis-ci.org/nariyu/tempaa.svg?branch=master)](https://travis-ci.org/nariyu/tempaa)

Dependencies: jQuery, Lodash

Supported event trigger: Object.observe(), EventEmitter, addListener

## Install

### Bower

```
$ bower install tempaa -S
```

### npm

```
$ npm install tempaa --save
```

## USAGE

### Example (Basic)

```html
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/lodash/dist/lodash.min.js"></script>
<script src="bower_components/tempaa/dist/tempaa.min.js"></script>

<div id="module">
  <p>NAME: <span data-bind-text="name"></span></p>
  <ul data-bind-foreach="dependencies">
    <li><a data-bind-attr="{href: url}" data-bind-text="name"></li>
  </ul>
</div>
```

```javascript
var module = {
  name: "tempaa",
  dependencies: [
    { name: "jquery", url: "http://jquery.com/" },
    { name: "lodash", url: "http://lodash.com/" }
  ]
};

Tempaa.bind("#module", module);
```

### Example (Browserify)
```javascript
var Tempaa = require("tempaa");

var user = {
  name: "John"
};

Tempaa.bind("#user", user);
```

[More examples are here!](https://github.com/nariyu/tempaa/tree/master/examples)


## License
Copyright (c) 2014 Yusuke Narita
Licensed under the MIT license.
