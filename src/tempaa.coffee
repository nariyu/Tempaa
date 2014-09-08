'use strict'

###
  Tempaa class
###
class Tempaa

  # tempaa types
  @selectorTypes: [
    'foreach'
    'text'
    'html'
    'class'
    'style'
    'attr'
    'prop'
    'visible'
    'data'
    'event'
  ]


  ###
    Data binding
  ###
  @bind: (_el, data)->
    el = $ _el

    helper = @helper
    helper = @ unless helper?

    renderProperties = @renderProperties

    @destroy _el

    el.data 'data', data

    @pre.apply(@, [el, data]) if @pre

    if data
      el.attr 'data-bind-has-data', 'true'
    else
      el.removeAttr 'data-bind-has-data'

    # Tempaa Selector
    selectors = []
    selectorTypes = @selectorTypes
    for selectorType in selectorTypes
      selectors.push "[data-bind-#{selectorType}]"

    do dataBind = ->

      bindChildren = el.find selectors.join ','
      if el.is selectors.join ','
        bindChildren = $ [el].concat bindChildren.get()

      repeatChildren = []
      bindChildren.each (index, _child)->
        child = $ _child

        repeatParents = child.parent().closest('[data-bind-foreach]').get()
        repeatChildren = el.find('[data-bind-foreach]').get()

        repeatResult = []
        $.each repeatChildren, (index, c)->
          $.each repeatParents, (index, p)->
            repeatResult.push p if c is p
        repeatParents = $ repeatResult

        if repeatParents.length > 0
          repeatChildren.push _child
        repeatParents.each (index, _parent)->
          parent = $ _parent
          template = parent.data 'bind-foreach-template'
          unless template
            templateSelector = parent.attr 'data-bind-template-selector'
            if typeof templateSelector is 'string'
              template = $ templateSelector
              tmpl = template.data 'bind-foreach-template'
              template = tmpl if tmpl
            else
              template = parent.children()
            parent.data 'bind-foreach-template', template
          parent.empty()

      bindChildren = el.find selectors.join ','
      if el.is selectors.join ','
        bindChildren = $ [el].concat bindChildren.get()

      bindChildren.each (index, _child)->
        child = $ _child

        types = []

        for selectorType in selectorTypes
          if child.is "[data-bind-#{selectorType}]"
            source = child.attr "data-bind-#{selectorType}"
            types.push type: selectorType, source: source

        # 
        for typeData in types
          { type, source } = typeData
          type  = type.replace(/^\s+/, '').replace(/\s+$/, '')
          source = source.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
          source = if source then source.replace(/^\s+/, '').replace(/\s+$/, '') else 'this'
          source = source.replace /(@|\$data)([a-zA-Z])/g, 'data.$2'
          source = source.replace /(@|\$data)/g, 'data'

          switch type

            # foreach
            when 'foreach'
              if !source or source is 'data'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data, helper
                value = value.value

              template = child.data 'bind-foreach-template'
              child.empty()
              if value
                if $.isArray(value) or (typeof value.length is 'number' and typeof value.push is 'function')
                  if Array.observe
                    Array.observe value, dataBind
                    destroyFuncs = el.data 'bind-destroy-funcs'
                    destroyFuncs = [] unless destroyFuncs?
                    destroyFuncs.push ->
                      try
                        Array.unobserve value, dataBind
                      catch e
                        ''
                      
                    el.data 'bind-destroy-funcs', destroyFuncs

                  for item in value
                    tmpl = template.clone true
                    child.append tmpl
                    Tempaa.bind tmpl, item

            # text
            when 'text'
              return unless data?

              value = null
              if !source or source is 'data'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data, helper
                value = value.value

              value = '' unless value?

              oldValue = child.text()
              child.text value if oldValue isnt value

            # html
            when 'html'
              return unless data?

              value = null
              if !source or source is 'data'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data, helper
                value = value.value

              value = '' unless value?

              oldValue = child.text()
              child.html value if oldValue isnt value

            # class
            when 'class'
              classes = renderProperties source, data, helper
              for key, value of classes
                if value
                  child.addClass key
                else
                  child.removeClass key

            # style
            when 'style'
              styles = renderProperties source, data, helper
              for key, style of styles
                oldStyle = child.css key
                urlStyle = style.replace(/url\(\/(.+)\)/, 'url(' + location.origin + '$1)')
                if style isnt oldStyle and urlStyle isnt oldStyle
                  child.css key, style

            # attr
            when 'attr'
              child.attr renderProperties source, data, helper

            # prop
            when 'prop'
              child.prop renderProperties source, data, helper

            # visible
            when 'visible'
              value = null
              if !source or source is 'data'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data, helper
                value = value.value

              value = false unless value?

              if value
                child.attr 'style', "#{child.attr('style')}".replace(/display:([^;]+)/, '')
              else
                child.hide()

            # data
            when 'data'
              value = null
              if !source or source is 'data'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data, helper
                value = value.value
              child.data 'data', value

            # event
            when 'event'
              events = renderProperties source, data, helper
              for name, value of events
                child.off "#{name}.tempaa"
                child.on "#{name}.tempaa", $.proxy value, data

    # watch data changed
    if data

      if typeof data.addListener is 'function'
        data.addListener 'change', dataBind
        el.data 'bind-func', dataBind

      else if typeof data.on is 'function'
        data.on 'change', dataBind
        el.data 'bind-func', dataBind

      else if Object.observe
        Object.observe data, dataBind
        el.data 'bind-func', dataBind

    return el


  ###
    Destroy
  ###
  @destroy: (_el)->
    el = $ _el
    oldData = el.data 'data'
    dataBindFunc = el.data 'bind-func'

    if oldData and dataBindFunc
      if typeof oldData.removeListener is 'function'
        oldData.removeListener 'change', dataBindFunc
      else if typeof oldData.off is 'function'
        oldData.off 'change', dataBindFunc
      else if Object.unobserve
        Object.unobserve oldData, dataBindFunc

    destroyFuncs = el.data 'bind-destroy-funcs'
    if destroyFuncs
      destroyFunc() for destroyFunc in destroyFuncs

    el.data 'data', null
    el.data 'bind-func', null
    el.data 'bind-destroy-funcs', null


  ###
  ###
  @renderProperties: (text, data, helper)->
    return {} unless data?

    source = 'if (typeof data === "undefined" || data === null) { data = {}; }'
    for prop of helper
      source += 'var ' + prop + ' = helper["' + prop + '"];'
    for prop, value of data
      if typeof value is 'function'
        source += 'var ' + prop + ' = $.proxy(data["' + prop + '"], data);'
      else
        source += 'var ' + prop + ' = data["' + prop + '"];'
    source += 'return ' + text + ''

    try
      render = new Function 'data', '$', 'context', 'helper', source
      return render.call @, data, $, data, helper
    catch e
      console.error '[Tempaa] render properties error: ', e.message
      console.log data
      console.log source

      if e.message.match /is not defined/
        for prop, value of data
          continue if typeof value is 'function'
          console.log prop, value

      return {}


###
  exports
###
if module?.exports
  module.exports = Tempaa
else if exports?
  exports = Tempaa
else if window?
  window.Tempaa = Tempaa
