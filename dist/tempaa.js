(function() {
  'use strict';

  /*
    Tempaa class
   */
  var Tempaa, exports;

  Tempaa = (function() {
    function Tempaa() {}

    Tempaa.selectorTypes = ['foreach', 'text', 'html', 'class', 'style', 'attr', 'visible', 'data', 'event'];


    /*
      Data binding
     */

    Tempaa.bind = function(_el, data) {
      var dataBind, dataBindFunc, e, el, helper, oldData, renderProperties, selectorType, selectorTypes, selectors, templateClass, _i, _len;
      templateClass = this;
      el = $(_el);
      helper = this.helper;
      if (helper == null) {
        helper = templateClass;
      }
      oldData = el.data('data');
      dataBindFunc = el.data('bind-func');
      if (oldData) {
        try {
          if (_.isEqual(JSON.parse(JSON.stringify(oldData)), JSON.parse(JSON.stringify(data)))) {
            return;
          }
        } catch (_error) {
          e = _error;
          '';
        }
        if (dataBindFunc) {
          if (Object.unobserve) {
            Object.unobserve(oldData, dataBindFunc);
          } else if (typeof oldData.removeListener === 'function') {
            oldData.removeListener('change', dataBindFunc);
          } else if (typeof oldData.off === 'function') {
            oldData.off('change', dataBindFunc);
          }
        }
      }
      el.removeClass('template');
      el.data('data', data);
      el.data('bind-func', null);
      renderProperties = function(text, data) {
        var prop, render, source, value;
        if (data == null) {
          return {};
        }
        source = 'if (typeof data === "undefined" || data === null) { data = {}; }';
        for (prop in helper) {
          source += 'var ' + prop + ' = helper["' + prop + '"];';
        }
        for (prop in data) {
          value = data[prop];
          if (typeof value === 'function') {
            source += 'var ' + prop + ' = $.proxy(data["' + prop + '"], data);';
          } else {
            source += 'var ' + prop + ' = data["' + prop + '"];';
          }
        }
        source += 'return ' + text + '';
        try {
          render = new Function('data', '$', 'context', 'helper', source);
          return render.call(this, data, $, data, helper);
        } catch (_error) {
          e = _error;
          console.error('[Tempaa] render properties error: ', e.message);
          console.log(data);
          console.log(source);
          if (e.message.match(/is not defined/)) {
            for (prop in data) {
              value = data[prop];
              if (typeof value === 'function') {
                continue;
              }
              console.log(prop, value);
            }
          }
          return {};
        }
      };
      selectors = ['*[data-bind]'];
      selectorTypes = this.selectorTypes;
      for (_i = 0, _len = selectorTypes.length; _i < _len; _i++) {
        selectorType = selectorTypes[_i];
        selectors.push("*[data-bind-" + selectorType + "]");
      }
      (dataBind = function() {
        var bindChildren;
        bindChildren = el.find(selectors.join(','));
        if (el.is(selectors.join(','))) {
          bindChildren = $([el].concat(bindChildren.get()));
        }
        bindChildren.each((function(_this) {
          return function(index, _child) {
            var child, len;
            child = $(_child);
            len = child.parent().closest('*[data-bind^="foreach"],*[data-bind-foreach]').length;
            if (len > 0) {
              return child.attr('data-bind-skip', 'true');
            } else {
              return child.removeAttr('data-bind-skip');
            }
          };
        })(this));
        return bindChildren.each((function(_this) {
          return function(index, _child) {
            var all, bindDef, child, classes, events, item, key, matches, name, oldStyle, oldValue, source, style, styles, template, templateSelector, tmpl, type, typeData, types, urlStyle, value, _j, _k, _l, _len1, _len2, _len3;
            child = $(_child);
            if (child.attr('data-bind-skip')) {
              return;
            }
            types = [];
            for (_j = 0, _len1 = selectorTypes.length; _j < _len1; _j++) {
              selectorType = selectorTypes[_j];
              if (child.is("*[data-bind-" + selectorType + "]")) {
                source = child.attr("data-bind-" + selectorType);
                types.push({
                  type: selectorType,
                  source: source
                });
              }
            }
            if (child.is('*[data-bind]')) {
              bindDef = child.attr('data-bind');
              if (typeof bindDef === 'string') {
                matches = bindDef.match(/^([a-zA-Z]+)(?:\:(.*))?$/);
                if (matches) {
                  all = matches[0], type = matches[1], source = matches[2];
                  types.push({
                    type: type,
                    source: source
                  });
                }
              }
            }
            for (_k = 0, _len2 = types.length; _k < _len2; _k++) {
              typeData = types[_k];
              type = typeData.type, source = typeData.source;
              type = type.replace(/^\s+/, '').replace(/\s+$/, '');
              source = source.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&amp;', '&');
              source = source ? source.replace(/^\s+/, '').replace(/\s+$/, '') : 'this';
              source = source.replace(/(@|\$data)([a-zA-Z])/g, 'data.$2');
              source = source.replace(/(@|\$data)/g, 'data');
              switch (type) {
                case 'foreach':
                  if (!source || source === 'this') {
                    value = data;
                  } else {
                    value = renderProperties('{value:' + source + '}', data);
                    value = value.value;
                  }
                  template = child.data('bind-foreach-template');
                  if (!template) {
                    templateSelector = child.attr('data-bind-template-selector');
                    if (typeof templateSelector === 'string') {
                      template = $(templateSelector);
                      tmpl = template.data('bind-foreach-template');
                      if (tmpl) {
                        template = tmpl;
                      }
                    } else {
                      template = child.children();
                    }
                    child.data('bind-foreach-template', template);
                    if (template.hasClass('template')) {
                      template.removeClass('template');
                    }
                  }
                  child.empty();
                  if ($.isArray(value) || (typeof (value != null ? value.length : void 0) === 'number' && typeof (value != null ? value.push : void 0) === 'function')) {
                    for (_l = 0, _len3 = value.length; _l < _len3; _l++) {
                      item = value[_l];
                      tmpl = template.clone(true);
                      templateClass.bind(tmpl, item);
                      tmpl.data('data', item);
                      child.append(tmpl);
                    }
                  }
                  break;
                case 'text':
                  if (data == null) {
                    return;
                  }
                  value = null;
                  if (!source || source === 'this') {
                    value = data;
                  } else {
                    value = renderProperties('{value:' + source + '}', data);
                    value = value.value;
                  }
                  if (value == null) {
                    value = '';
                  }
                  oldValue = child.text();
                  if (oldValue !== value) {
                    child.text(value);
                  }
                  break;
                case 'html':
                  if (data == null) {
                    return;
                  }
                  value = null;
                  if (!source || source === 'this') {
                    value = data;
                  } else {
                    value = renderProperties('{value:' + source + '}', data);
                    value = value.value;
                  }
                  if (value == null) {
                    value = '';
                  }
                  oldValue = child.text();
                  if (oldValue !== value) {
                    child.html(value);
                  }
                  break;
                case 'class':
                  classes = renderProperties(source, data);
                  for (key in classes) {
                    value = classes[key];
                    if (value) {
                      child.addClass(key);
                    } else {
                      child.removeClass(key);
                    }
                  }
                  break;
                case 'style':
                  styles = renderProperties(source, data);
                  for (key in styles) {
                    style = styles[key];
                    oldStyle = child.css(key);
                    urlStyle = style.replace(/url\(\/(.+)\)/, 'url(' + location.origin + '$1)');
                    if (style !== oldStyle && urlStyle !== oldStyle) {
                      child.css(key, style);
                    }
                  }
                  break;
                case 'attr':
                  child.attr(renderProperties(source, data));
                  break;
                case 'visible':
                  value = null;
                  if (!source || source === 'this') {
                    value = data;
                  } else {
                    value = renderProperties('{value:' + source + '}', data);
                    value = value.value;
                  }
                  if (value == null) {
                    value = false;
                  }
                  if (value) {
                    child.attr('style', ("" + (child.attr('style'))).replace(/display:([^;]+)/, ''));
                  } else {
                    child.hide();
                  }
                  break;
                case 'data':
                  value = null;
                  if (!source || source === 'this') {
                    value = data;
                  } else {
                    value = renderProperties('{value:' + source + '}', data);
                    value = value.value;
                  }
                  child.data('data', value);
                  break;
                case 'event':
                  events = renderProperties(source, data);
                  for (name in events) {
                    value = events[name];
                    child.off("" + name + ".tempaa");
                    child.on("" + name + ".tempaa", $.proxy(value, data));
                  }
              }
            }
          };
        })(this));
      })();
      if (Object.observe) {
        Object.observe(data, dataBind);
        el.data('bind-func', dataBind);
      } else if (typeof (data != null ? data.addListener : void 0) === 'function') {
        data.addListener('change', dataBind);
        el.data('bind-func', dataBind);
      } else if (typeof (data != null ? data.on : void 0) === 'function') {
        data.on('change', dataBind);
        el.data('bind-func', dataBind);
      }
      return el;
    };

    return Tempaa;

  })();


  /*
    exports
   */

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = Tempaa;
  } else if (typeof exports !== "undefined" && exports !== null) {
    exports = Tempaa;
  } else if (typeof window !== "undefined" && window !== null) {
    window.Tempaa = Tempaa;
  }

}).call(this);
