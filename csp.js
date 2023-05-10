var CSP = {
  NONCE_VALUE: "",
  /*THETA: start*/
  register: function (id, event, js, _document, eventData) {
    var d = _document ? _document : document;
    var element = d.getElementById(id);
    if (element) {
      CSP.registerInElement(element, event, js, eventData);
    }
  },

  registerInElement: function (element, event, js, eventData) {
    if (event) {
      var shortenedEvent = event.substring(2, event.length);
      // if the eventhandler return false, we must use preventDefault
      var jsWrapper = function (event) {
        var retVal = js.call(element, event);
        if (retVal === false && event.cancelable) {
          event.preventDefault();
        }
      };
      $(element).on(shortenedEvent, eventData, jsWrapper);
    }
  },
  /*THETA: end*/

  /**
   * Perform a CSP safe eval().
   *
   * @param js the Javascript to evaluate
   * @param nonceValue nonce value or null if not using CSP
   */
  eval: function (js, nonceValue) {
    // assign the NONCE if necessary
    var options = {};
    if (nonceValue) {
      options = { nonce: nonceValue };
    } else if (CSP.NONCE_VALUE) {
      options = { nonce: CSP.NONCE_VALUE };
    }

    // evaluate the script
    $.globalEval(js, options);
  },

  /**
   * Perform a CSP safe eval() with a return result value.
   *
   * @param js the Javascript to evaluate
   * @see https://stackoverflow.com/a/33945236/502366
   */
  evalResult: function (js) {
    var executeJs = "var cspResult = " + js;
    CSP.eval(executeJs);
    return cspResult;
  },

  /**
   * CSP won't allow  string-to-JavaScript methods like eval() and new Function().
   * This method uses JQuery globalEval to safely evaluate the function if CSP enabled.
   *
   * @param id the element executing the function (aka this)
   * @param js the Javascript to evaluate
   * @param e the event from the caller to pass through
   */
  executeEvent: function (id, js, e) {
    // create the wrapper function
    var scriptEval = 'var cspFunction = function(event){' + js + '}';

    // evaluate JS into a function
    CSP.eval(scriptEval, CSP.NONCE_VALUE);
    // call the function
    cspFunction.call(id, e);
  }

};

CSP.tools = {

  setHtml: function (html, targetElement) {
    if (targetElement.$.nodeName === 'BODY' //this is to set the content of the editor which should not contain inline style and script
      || !(/ style=/.test(html) || / on[a-zA-Z]*=/.test(html)) //does not contain style and on* event attributes
    ) {
      targetElement.$.innerHTML = html;
    } else {
      targetElement.$.innerHTML = "";
      var dom = new DOMParser().parseFromString(html, "text/html");
      var domEls = $(dom.body).contents();
      domEls.each(function () {
        if (this.nodeType === 1) {
          CSP.tools.appendDomElement(this, targetElement);
        } else {
          $(targetElement.$).append(this);
        }
      });
    }
    return targetElement.$.innerHTML;
  },

  appendDomElement: function (domEl, pntElement) {

    var parseFromString = function (html) {
      var childDom;
      var startsWith7 = html.substring(0, 7);
      var startsWith4 = html.substring(0, 4);

      if (startsWith7 === "<tbody>" || startsWith7 === "<tbody "
        || startsWith7 === "<thead>" || startsWith7 === "<thead "
        || startsWith7 === "<tfoot>" || startsWith7 === "<tfoot ") {
        html = "<table>" + html + "</table>";
        childDom = new DOMParser().parseFromString(html, "text/html");
        return childDom.body.children.item(0).children;
      } else if (startsWith4 === "<tr>" || startsWith4 === "<tr ") {
        html = "<table><tbody>" + html + "</tbody></table>";
        childDom = new DOMParser().parseFromString(html, "text/html");
        return childDom.body.children.item(0).children.item(0).children;
      } else if (startsWith4 === "<td>" || startsWith4 === "<td ") {
        html = "<table><tbody><tr>" + html + "</tr></tbody></table>";
        childDom = new DOMParser().parseFromString(html, "text/html");
        return childDom.body.children.item(0).children.item(0).children.item(0).children;
      } else {
        childDom = new DOMParser().parseFromString(html, "text/html");
        return childDom.body.children;
      }
    }

    var innerHTML = domEl.innerHTML;
    $(domEl).children().each(function () {
      $(this).remove();
    })
    var element = this.createElementFromDom(domEl);
    if (innerHTML) {
      var childEls = parseFromString(innerHTML);
      if (childEls && childEls.length > 0) {
        for (var i = 0; i < childEls.length; i++) {
          this.appendDomElement(childEls[i], element);
        }
      }
    }
    pntElement.append(element);
  },



  /**
   * Filter CSP violation attribute, e.g. inline style (style) and script (on*)
   * Assuming the domEl does not have any child element 
   **/
  createElementFromDom: function (domEl) {
    //inline style
    var style = domEl.getAttribute("style");
    domEl.removeAttribute("style");
    //inline script
    var href = domEl.getAttribute("href");
    //TODO: set href as onclick event if no onclick event
    if (href && href.indexOf("void(") >= 0) {
      domEl.removeAttribute("href");
    }
    var attributes = domEl.attributes;
    var eventNames = [];
    var events = {};
    if (attributes) {
      for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name.substr(0, 2) === 'on') {
          eventNames.push(attributes[i].name);
          events[attributes[i].name] = attributes[i].value;
        }
      }
    }

    if (!domEl.id && eventNames.length > 0) {
      domEl.id = CKEDITOR.tools.getNextId();
    }

    for (var j = 0; j < eventNames.length; j++) {
      domEl.removeAttribute(eventNames[j]);
    }

    var f = this.createFromHtml(domEl);
    if (style) {
      f.$.style.cssText = style;
    }

    //register events 
    if (eventNames.length > 0) {
      for (var k = 0; k < eventNames.length; k++) {
        CSP.registerInElement(f.$, eventNames[k], function (event) {
          CSP.executeEvent(this.id, event.data.evalScript, event);
        }, {
          evalScript: "var this_= event.data.this_;" + events[eventNames[k]].replace("this", "this_"),
          this_: f.$
        });
      }
    }
    return f;
  },

  createFromHtml: function (domEl) {
    var temp;
    if (domEl.nodeName === 'TBODY') {
      temp = new CKEDITOR.dom.element('div');
      temp.$.innerHTML = "<table>" + domEl.outerHTML + "</table>";
      return temp.getFirst().getFirst().remove();
    } else if (domEl.nodeName === 'TR') {
      temp = new CKEDITOR.dom.element('div');
      temp.$.innerHTML = "<table><tbody>" + domEl.outerHTML + "</tbody></table>";
      return temp.getFirst().getFirst().getFirst().remove();
    } else if (domEl.nodeName === 'TD') {
      temp = new CKEDITOR.dom.element('div');
      temp.$.innerHTML = "<table><tbody><tr>" + domEl.outerHTML + "</tr></tbody></table>";
      return temp.getFirst().getFirst().getFirst().getFirst().remove();
    } else {
      temp = new CKEDITOR.dom.element('div');
      temp.$.innerHTML = domEl.outerHTML;
      // When returning the node, remove it from its parent to detach it.
      return temp.getFirst().remove();
    }
  },

  writeHtml: function (html, _document) {

    if (!CSP.NONCE_VALUE) {
      _document.write(html);
      return;
    }

    var extractStyleAndEvents = function (element, _styles, _scripts, _onLoadEvents) {
      if (!element.id) {
        element.id = CKEDITOR.tools.getNextId();
      }

      //remove event attribute
      var attributes = element.attributes;
      var eventNames = [];
      var events = {};
      var css;
      if (attributes) {
        for (var i = 0; i < attributes.length; i++) {
          if (attributes[i].name === 'style') {
            css = attributes[i].value;

          } else {
            if (attributes[i].name.substr(0, 2) === 'on') {
              eventNames.push(attributes[i].name);
              events[attributes[i].name] = attributes[i].value;
            }
          }
        }
      }

      //remove style attribute
      if (css) {
        _styles.push("#" + element.id + "{" + css + "}");
        element.removeAttribute("style");
      }


      for (var j = 0; j < eventNames.length; j++) {
        element.removeAttribute(eventNames[j]);
        if (eventNames[j] === 'onload') {
          _onLoadEvents.push({ id: element.id, script: events[eventNames[j]] });
        } else {
          _scripts.push('$("#' + element.id + '").on("' + eventNames[j].substring(2, eventNames[j].length) + '", function(event){'
            + events[eventNames[j]]
            + '});');
        }
      }

      var _childDoms = $(element).contents();
      _childDoms.each(function () {
        extractStyleAndEvents(this, _styles, _scripts);
      });
    }

    if (/ style=/.test(html) || / on[a-zA-Z]*=/.test(html)) { //contain style and on* event attributes
      var dom = new DOMParser().parseFromString(html, "text/html");
      var docType = "";
      if (dom.docType) {
        docType = "<!DOCTYPE " + dom.docType.name + ">";
      }
      var headDom = dom.head, scripts = [], styles = [], onLoadEvents = [];
      var childDoms = $(dom.documentElement).contents();
      childDoms.each(function () {
        extractStyleAndEvents(this, styles, scripts, onLoadEvents);
      });

      if (styles.length > 0) {
        headDom.innerHTML = headDom.innerHTML + CKEDITOR.tools.buildStyleHtml(styles.join(""));
      }
      if (scripts.length > 0) {
        headDom.innerHTML = headDom.innerHTML + CSP.tools.buildScriptHtml(scripts.join(""));
      }
      _document.write(docType + dom.documentElement.outerHTML);

      //invoke  onload event
      if (onLoadEvents.length > 0) {
        for (var m = 0; m < onLoadEvents.length; m++) {
          //register event
          CSP.register(onLoadEvents[m].id, "onload", function (event) {
            CSP.executeEvent(this.id, event.data.evalScript, event);
          }, _document, { evalScript: onLoadEvents[m].script });
          //fire event
        }
        for (var m = 0; m < onLoadEvents.length; m++) {
          //fire event
          $(_document.getElementById(onLoadEvents[m].id)).trigger("load");
        }
      }
    } else {
      _document.write(html);
    }
  },

  buildScriptHtml: function (a) {
    var e = [];
    e.push('\x3cscript type\x3d"text/javascript" nonce="')
    e.push(CSP.NONCE_VALUE);
    e.push('"\x3e');
    e.push(a);
    e.push('\x3c/script\x3e');
    return e.join("");
  }
}