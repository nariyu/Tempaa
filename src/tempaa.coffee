'use strict'

###
  Tempaa class
###
class Tempaa

  @selectorTypes: [
    'foreach'
    'text'
    'html'
    'class'
    'style'
    'attr'
    'visible'
    'data'

    'event'
  ]


  ###
    Data binding
  ###
  @bind: (_el, data)->
    templateClass = @
    el = $ _el

    helper = @helper
    helper = templateClass unless helper?

    oldData = el.data('data')
    dataBindFunc = el.data('bind-func')
    if oldData
      try
        return if _.isEqual JSON.parse(JSON.stringify(oldData)), JSON.parse(JSON.stringify(data))
      catch e
        ''

      if dataBindFunc
        if Object.unobserve
          Object.unobserve oldData, dataBindFunc
        else if typeof oldData.removeListener is 'function'
          oldData.removeListener 'change', dataBindFunc
        else if typeof oldData.off is 'function'
          oldData.off 'change', dataBindFunc

    el.removeClass 'template'
    el.data('data', data)
    el.data('bind-func', null)

    renderProperties = (text, data)->
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

    # Tempaa Selector
    selectors = ['*[data-bind]']
    selectorTypes = @selectorTypes
    for selectorType in selectorTypes
      selectors.push "*[data-bind-#{selectorType}]"

    do dataBind = ->

      bindChildren = el.find(selectors.join(','))
      if el.is(selectors.join(','))
        bindChildren = $([el].concat(bindChildren.get()))

      bindChildren.each (index, _child)=>
        child = $ _child

        len = child.parent().closest('*[data-bind^="foreach"],*[data-bind-foreach]').length
        if len > 0
          child.attr('data-bind-skip', 'true')
        else
          child.removeAttr('data-bind-skip')

      bindChildren.each (index, _child)=>
        child = $ _child

        return if child.attr('data-bind-skip')

        types = []

        for selectorType in selectorTypes
          if child.is("*[data-bind-#{selectorType}]")
            source = child.attr("data-bind-#{selectorType}")
            types.push type: selectorType, source: source

        if child.is('*[data-bind]')
          bindDef = child.attr('data-bind')
          if typeof bindDef is 'string'
            matches = bindDef.match /^([a-zA-Z]+)(?:\:(.*))?$/
            if matches
              [all, type, source] = matches
              types.push type: type, source: source

        # 
        for typeData in types
          { type, source } = typeData
          type  = type.replace(/^\s+/, '').replace(/\s+$/, '')
          source = source.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&amp;', '&')
          source = if source then source.replace(/^\s+/, '').replace(/\s+$/, '') else 'this'
          source = source.replace /(@|\$data)([a-zA-Z])/g, 'data.$2'
          source = source.replace /(@|\$data)/g, 'data'

          switch type

            # foreach
            when 'foreach'
              if !source or source is 'this'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data
                value = value.value

              template = child.data('bind-foreach-template')
              unless template
                templateSelector = child.attr('data-bind-template-selector')
                if typeof templateSelector is 'string'
                  template = $(templateSelector)
                  tmpl = template.data('bind-foreach-template')
                  template = tmpl if tmpl
                else
                  template = child.children()
                child.data('bind-foreach-template', template)
                template.removeClass 'template' if template.hasClass 'template'

              child.empty()
              if $.isArray(value) or (typeof value?.length is 'number' and typeof value?.push is 'function')
                for item in value
                  tmpl = template.clone(true)
                  templateClass.bind tmpl, item
                  tmpl.data('data', item)
                  child.append tmpl

            # text
            when 'text'
              return unless data?

              value = null
              if !source or source is 'this'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data
                value = value.value

              value = '' unless value?

              oldValue = child.text()
              child.text value if oldValue isnt value

            # html
            when 'html'
              return unless data?

              value = null
              if !source or source is 'this'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data
                value = value.value

              value = '' unless value?

              oldValue = child.text()
              child.html value if oldValue isnt value

            # class
            when 'class'
              classes = renderProperties source, data
              for key, value of classes
                if value
                  child.addClass key
                else
                  child.removeClass key

            # style
            when 'style'
              styles = renderProperties source, data
              for key, style of styles
                oldStyle = child.css key
                urlStyle = style.replace(/url\(\/(.+)\)/, 'url(' + location.origin + '$1)')
                if style isnt oldStyle and urlStyle isnt oldStyle
                  child.css key, style

            # attr
            when 'attr'
              child.attr renderProperties source, data

            # visible
            when 'visible'
              value = null
              if !source or source is 'this'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data
                value = value.value

              value = false unless value?

              if value
                child.attr 'style', "#{child.attr('style')}".replace(/display:([^;]+)/, '')
              else
                child.hide()

            # data
            when 'data'
              value = null
              if !source or source is 'this'
                value = data
              else
                value = renderProperties '{value:' + source + '}', data
                value = value.value
              child.data('data', value)

            # event
            when 'event'
              events = renderProperties source, data
              for name, value of events
                child.off "#{name}.tempaa"
                child.on "#{name}.tempaa", $.proxy(value, data)

    # watch
    if Object.observe
      # console.log '[Tempaa] Object.observe'
      Object.observe data, dataBind
      el.data('bind-func', dataBind)

    else if typeof data?.addListener is 'function'
      # console.log '[Tempaa] addListener'
      data.addListener 'change', dataBind
      el.data('bind-func', dataBind)

    else if typeof data?.on is 'function'
      # console.log '[Tempaa] on'
      data.on 'change', dataBind
      el.data('bind-func', dataBind)

    return el


###
  exports
###
if module?.exports
  module.exports = Tempaa
else if exports?
  exports = Tempaa
else if window?
  window.Tempaa = Tempaa
