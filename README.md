# Tempaa

[![npm](https://nodei.co/npm/tempaa.png?downloads=true)](https://nodei.co/npm/tempaa/)

Tempaa is a template engine with data-binding.

[![Build Status](https://travis-ci.org/nariyu/tempaa.svg?branch=master)](https://travis-ci.org/nariyu/tempaa)

Dependencies: jQuery

Supported event trigger: Object.observe(), EventEmitter, addListener

## Install

### Install by Bower

```
$ bower install tempaa -S
```

### Install by npm

```
$ npm install tempaa --save
```

## USAGE

### Basic

HTML:

```
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/tempaa/dist/tempaa.min.js"></script>

<div id="module">
  <p>NAME: <span data-bind-text="name"></span></p>
  <ul data-bind-foreach="dependencies">
    <li><a data-bind-attr="{href: url}" data-bind-text="name"></a></li>
  </ul>
</div>
```

JavaScript:

```
var module = {
  name: "tempaa",
  dependencies: [
    { name: "jquery", url: "http://jquery.com/" },
    { name: "lodash", url: "http://lodash.com/" }
  ]
};

Tempaa.bind("#module", module);
```

### For Browserify

JavaScript:

```
var Tempaa = require("tempaa");

var user = {
  name: "John"
};

Tempaa.bind("#user", user);
```

[More examples are here!](https://github.com/nariyu/tempaa/tree/master/examples)


## Features

### data-bind-foreach

HTML:

```
<section id="list-section">
  <ul id="list" data-bind-foreach="items">
    <li data-bind-text="name"></li>
  </ul>
</section>
```

JavaScript:

```
var data = {
  items: [
    { name: "item #1" },
    { name: "item #2" },
    { name: "item #3" }
  ]
};
Tempaa.bind('#list-section', data);
```

### data-bind-text

HTML:

```
<p>NAME: <span data-bind-text="name"></span></p>
```

JavaScript:

```
var data = {
  name: 'tempaa'
};
Tempaa.bind('p', data);
```

### data-bind-html

HTML:

```
<p>HTML: <span data-bind-text="html"></span></p>
```

JavaScript:

```
var data = {
  html: '<strong>tempaa</strong>'
};
Tempaa.bind('p', data);
```

### data-bind-style

HTML:

```
<p>NAME: <span data-bind-style="{color: textColor, 'background-color': bgColor}">Tempaa</span></p>
```

JavaScript:

```
var data = {
  textColor: '#F00',
  bgColor: '#00F'
};
Tempaa.bind('p', data);
```

### data-bind-attr

HTML:

```
<p>LINK: <a data-bind-attr="{href: url}">Here</a></p>
```

JavaScript:

```
var data = {
  url: 'http://github.com/nariyu/tempaa'
};
Tempaa.bind('p', data);
```

### data-bind-prop

HTML:

```
<div class="select-container">
  <select data-bind-foreach="items">
    <option data-bind-text="label"
            data-bind-attr="{value: value}"
            data-bind-prop="{selectd: selected}"></option>
  </select>
</div>
```

JavaScript:

```
var data = {
  items: [
    { label: 'Me', value: 1, selected: false },
    { label: 'Me', value: 2, selected: true },
    { label: 'Me', value: 3, selected: false }
  ]
};
Tempaa.bind('.select-container', data);
```

(use jQery#prop method)

### data-bind-class

HTML:

```
<p>HTML: <span data-bind-class="{box: isBox}">BOX</span></p>
```

JavaScript:

```
var data = {
  isBox: true
};
Tempaa.bind('p', data);
```

### data-bind-visible

HTML:

```
<p data-bind-visible="isMale">I am male.</p>
```

JavaScript:

```
var data = {
  isMale: false
};
Tempaa.bind('p', data);
```

### data-bind-event

HTML:

```
<p data-bind-event="{click: onclick}">Click me!</p>
```

JavaScript:

```
var data = {
  onclick: function() {
    alert('click!');
  }
};
Tempaa.bind('p', data);
```

## License
Copyright (c) 2014 Yusuke Narita
Licensed under the MIT license.
