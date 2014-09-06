(function() {
  'use strict';

  /*
    Tempaa class
   */
  var Tempaa, exports;

  Tempaa = (function() {
    function Tempaa() {}

    Tempaa.selectorTypes = ['foreach', 'text', 'html', 'class', 'style', 'attr', 'prop', 'visible', 'data', 'event'];


    /*
      Data binding
     */

    Tempaa.bind = function(_el, data) {
      var dataBind, el, helper, renderProperties, selectorType, selectorTypes, selectors, _i, _len;
      el = $(_el);
      helper = this.helper;
      if (helper == null) {
        helper = this;
      }
      renderProperties = this.renderProperties;
      this.destroy(_el);
      el.data('data', data);
      if (this.pre) {
        this.pre.apply(this, [el, data]);
      }
      if (data) {
        el.attr('data-bind-has-data', 'true');
      } else {
        el.removeAttr('data-bind-has-data');
      }
      selectors = [];
      selectorTypes = this.selectorTypes;
      for (_i = 0, _len = selectorTypes.length; _i < _len; _i++) {
        selectorType = selectorTypes[_i];
        selectors.push("[data-bind-" + selectorType + "]");
      }
      (dataBind = function() {
        var bindChildren, repeatChildren;
        bindChildren = el.find(selectors.join(','));
        if (el.is(selectors.join(','))) {
          bindChildren = $([el].concat(bindChildren.get()));
        }
        repeatChildren = [];
        bindChildren.each(function(index, _child) {
          var child, repeatParents, repeatResult;
          child = $(_child);
          repeatParents = child.parent().closest('[data-bind-foreach]').get();
          repeatChildren = el.find('[data-bind-foreach]').get();
          repeatResult = [];
          $.each(repeatChildren, function(index, c) {
            return $.each(repeatParents, function(index, p) {
              if (c === p) {
                return repeatResult.push(p);
              }
            });
          });
          repeatParents = $(repeatResult);
          if (repeatParents.length > 0) {
            repeatChildren.push(_child);
          }
          return repeatParents.each(function(index, _parent) {
            var parent, template, templateSelector, tmpl;
            parent = $(_parent);
            template = parent.data('bind-foreach-template');
            if (!template) {
              templateSelector = parent.attr('data-bind-template-selector');
              if (typeof templateSelector === 'string') {
                template = $(templateSelector);
                tmpl = template.data('bind-foreach-template');
                if (tmpl) {
                  template = tmpl;
                }
              } else {
                template = parent.children();
              }
              parent.data('bind-foreach-template', template);
            }
            return parent.empty();
          });
        });
        bindChildren = el.find(selectors.join(','));
        if (el.is(selectors.join(','))) {
          bindChildren = $([el].concat(bindChildren.get()));
        }
        return bindChildren.each(function(index, _child) {
          var child, classes, destroyFuncs, events, item, key, name, oldStyle, oldValue, source, style, styles, template, tmpl, type, typeData, types, urlStyle, value, _j, _k, _l, _len1, _len2, _len3;
          child = $(_child);
          types = [];
          for (_j = 0, _len1 = selectorTypes.length; _j < _len1; _j++) {
            selectorType = selectorTypes[_j];
            if (child.is("[data-bind-" + selectorType + "]")) {
              source = child.attr("data-bind-" + selectorType);
              types.push({
                type: selectorType,
                source: source
              });
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
                if (!source || source === 'data') {
                  value = data;
                } else {
                  value = renderProperties('{value:' + source + '}', data, helper);
                  value = value.value;
                }
                template = child.data('bind-foreach-template');
                child.empty();
                if (value) {
                  if ($.isArray(value) || (typeof value.length === 'number' && typeof value.push === 'function')) {
                    if (Array.observe) {
                      Array.observe(value, dataBind);
                      destroyFuncs = el.data('bind-destroy-funcs');
                      if (destroyFuncs == null) {
                        destroyFuncs = [];
                      }
                      destroyFuncs.push(function() {
                        var e;
                        try {
                          return Array.unobserve(value, dataBind);
                        } catch (_error) {
                          e = _error;
                          return '';
                        }
                      });
                      el.data('bind-destroy-funcs', destroyFuncs);
                    }
                    for (_l = 0, _len3 = value.length; _l < _len3; _l++) {
                      item = value[_l];
                      tmpl = template.clone(true);
                      child.append(tmpl);
                      Tempaa.bind(tmpl, item);
                    }
                  }
                }
                break;
              case 'text':
                if (data == null) {
                  return;
                }
                value = null;
                if (!source || source === 'data') {
                  value = data;
                } else {
                  value = renderProperties('{value:' + source + '}', data, helper);
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
                if (!source || source === 'data') {
                  value = data;
                } else {
                  value = renderProperties('{value:' + source + '}', data, helper);
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
                classes = renderProperties(source, data, helper);
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
                styles = renderProperties(source, data, helper);
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
                child.attr(renderProperties(source, data, helper));
                break;
              case 'prop':
                child.prop(renderProperties(source, data, helper));
                break;
              case 'visible':
                value = null;
                if (!source || source === 'data') {
                  value = data;
                } else {
                  value = renderProperties('{value:' + source + '}', data, helper);
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
                if (!source || source === 'data') {
                  value = data;
                } else {
                  value = renderProperties('{value:' + source + '}', data, helper);
                  value = value.value;
                }
                child.data('data', value);
                break;
              case 'event':
                events = renderProperties(source, data, helper);
                for (name in events) {
                  value = events[name];
                  child.off("" + name + ".tempaa");
                  child.on("" + name + ".tempaa", $.proxy(value, data));
                }
            }
          }
        });
      })();
      if (data) {
        if (typeof data.addListener === 'function') {
          data.addListener('change', dataBind);
          el.data('bind-func', dataBind);
        } else if (typeof data.on === 'function') {
          data.on('change', dataBind);
          el.data('bind-func', dataBind);
        } else if (Object.observe) {
          Object.observe(data, dataBind);
          el.data('bind-func', dataBind);
        }
      }
      return el;
    };


    /*
      Destroy
     */

    Tempaa.destroy = function(_el) {
      var dataBindFunc, destroyFunc, destroyFuncs, el, oldData, _i, _len;
      el = $(_el);
      oldData = el.data('data');
      dataBindFunc = el.data('bind-func');
      if (oldData && dataBindFunc) {
        if (typeof oldData.removeListener === 'function') {
          oldData.removeListener('change', dataBindFunc);
        } else if (typeof oldData.off === 'function') {
          oldData.off('change', dataBindFunc);
        } else if (Object.unobserve) {
          Object.unobserve(oldData, dataBindFunc);
        }
      }
      destroyFuncs = el.data('bind-destroy-funcs');
      if (destroyFuncs) {
        for (_i = 0, _len = destroyFuncs.length; _i < _len; _i++) {
          destroyFunc = destroyFuncs[_i];
          destroyFunc();
        }
      }
      el.data('data', null);
      el.data('bind-func', null);
      return el.data('bind-destroy-funcs', null);
    };


    /*
     */

    Tempaa.renderProperties = function(text, data, helper) {
      var e, prop, render, source, value;
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
