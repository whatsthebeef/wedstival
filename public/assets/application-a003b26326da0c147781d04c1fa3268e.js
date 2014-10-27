(function() {
  var CSRFToken, Click, ComponentUrl, EVENTS, Link, browserCompatibleDocumentParser, browserIsntBuggy, browserSupportsCustomEvents, browserSupportsPushState, browserSupportsTurbolinks, bypassOnLoadPopstate, cacheCurrentPage, cacheSize, changePage, clone, constrainPageCacheTo, createDocument, currentState, enableTransitionCache, executeScriptTags, extractTitleAndBody, fetch, fetchHistory, fetchReplacement, historyStateIsDefined, initializeTurbolinks, installDocumentReadyPageEventTriggers, installHistoryChangeHandler, installJqueryAjaxSuccessPageUpdateTrigger, loadedAssets, manuallyTriggerHashChangeForFirefox, pageCache, pageChangePrevented, pagesCached, popCookie, processResponse, recallScrollPosition, referer, reflectNewUrl, reflectRedirectedUrl, rememberCurrentState, rememberCurrentUrl, rememberReferer, removeNoscriptTags, requestMethodIsSafe, resetScrollPosition, setAutofocusElement, transitionCacheEnabled, transitionCacheFor, triggerEvent, visit, xhr, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  pageCache = {};

  cacheSize = 10;

  transitionCacheEnabled = false;

  currentState = null;

  loadedAssets = null;

  referer = null;

  createDocument = null;

  xhr = null;

  EVENTS = {
    BEFORE_CHANGE: 'page:before-change',
    FETCH: 'page:fetch',
    RECEIVE: 'page:receive',
    CHANGE: 'page:change',
    UPDATE: 'page:update',
    LOAD: 'page:load',
    RESTORE: 'page:restore',
    BEFORE_UNLOAD: 'page:before-unload',
    EXPIRE: 'page:expire'
  };

  fetch = function(url) {
    var cachedPage;
    url = new ComponentUrl(url);
    rememberReferer();
    cacheCurrentPage();
    if (transitionCacheEnabled && (cachedPage = transitionCacheFor(url.absolute))) {
      fetchHistory(cachedPage);
      return fetchReplacement(url);
    } else {
      return fetchReplacement(url, resetScrollPosition);
    }
  };

  transitionCacheFor = function(url) {
    var cachedPage;
    cachedPage = pageCache[url];
    if (cachedPage && !cachedPage.transitionCacheDisabled) {
      return cachedPage;
    }
  };

  enableTransitionCache = function(enable) {
    if (enable == null) {
      enable = true;
    }
    return transitionCacheEnabled = enable;
  };

  fetchReplacement = function(url, onLoadFunction) {
    if (onLoadFunction == null) {
      onLoadFunction = (function(_this) {
        return function() {};
      })(this);
    }
    triggerEvent(EVENTS.FETCH, {
      url: url.absolute
    });
    if (xhr != null) {
      xhr.abort();
    }
    xhr = new XMLHttpRequest;
    xhr.open('GET', url.withoutHashForIE10compatibility(), true);
    xhr.setRequestHeader('Accept', 'text/html, application/xhtml+xml, application/xml');
    xhr.setRequestHeader('X-XHR-Referer', referer);
    xhr.onload = function() {
      var doc;
      triggerEvent(EVENTS.RECEIVE, {
        url: url.absolute
      });
      if (doc = processResponse()) {
        reflectNewUrl(url);
        changePage.apply(null, extractTitleAndBody(doc));
        manuallyTriggerHashChangeForFirefox();
        reflectRedirectedUrl();
        onLoadFunction();
        return triggerEvent(EVENTS.LOAD);
      } else {
        return document.location.href = url.absolute;
      }
    };
    xhr.onloadend = function() {
      return xhr = null;
    };
    xhr.onerror = function() {
      return document.location.href = url.absolute;
    };
    return xhr.send();
  };

  fetchHistory = function(cachedPage) {
    if (xhr != null) {
      xhr.abort();
    }
    changePage(cachedPage.title, cachedPage.body);
    recallScrollPosition(cachedPage);
    return triggerEvent(EVENTS.RESTORE);
  };

  cacheCurrentPage = function() {
    var currentStateUrl;
    currentStateUrl = new ComponentUrl(currentState.url);
    pageCache[currentStateUrl.absolute] = {
      url: currentStateUrl.relative,
      body: document.body,
      title: document.title,
      positionY: window.pageYOffset,
      positionX: window.pageXOffset,
      cachedAt: new Date().getTime(),
      transitionCacheDisabled: document.querySelector('[data-no-transition-cache]') != null
    };
    return constrainPageCacheTo(cacheSize);
  };

  pagesCached = function(size) {
    if (size == null) {
      size = cacheSize;
    }
    if (/^[\d]+$/.test(size)) {
      return cacheSize = parseInt(size);
    }
  };

  constrainPageCacheTo = function(limit) {
    var cacheTimesRecentFirst, key, pageCacheKeys, _i, _len, _results;
    pageCacheKeys = Object.keys(pageCache);
    cacheTimesRecentFirst = pageCacheKeys.map(function(url) {
      return pageCache[url].cachedAt;
    }).sort(function(a, b) {
      return b - a;
    });
    _results = [];
    for (_i = 0, _len = pageCacheKeys.length; _i < _len; _i++) {
      key = pageCacheKeys[_i];
      if (!(pageCache[key].cachedAt <= cacheTimesRecentFirst[limit])) {
        continue;
      }
      triggerEvent(EVENTS.EXPIRE, pageCache[key]);
      _results.push(delete pageCache[key]);
    }
    return _results;
  };

  changePage = function(title, body, csrfToken, runScripts) {
    triggerEvent(EVENTS.BEFORE_UNLOAD);
    document.title = title;
    document.documentElement.replaceChild(body, document.body);
    if (csrfToken != null) {
      CSRFToken.update(csrfToken);
    }
    setAutofocusElement();
    if (runScripts) {
      executeScriptTags();
    }
    currentState = window.history.state;
    triggerEvent(EVENTS.CHANGE);
    return triggerEvent(EVENTS.UPDATE);
  };

  executeScriptTags = function() {
    var attr, copy, nextSibling, parentNode, script, scripts, _i, _j, _len, _len1, _ref, _ref1;
    scripts = Array.prototype.slice.call(document.body.querySelectorAll('script:not([data-turbolinks-eval="false"])'));
    for (_i = 0, _len = scripts.length; _i < _len; _i++) {
      script = scripts[_i];
      if (!((_ref = script.type) === '' || _ref === 'text/javascript')) {
        continue;
      }
      copy = document.createElement('script');
      _ref1 = script.attributes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        attr = _ref1[_j];
        copy.setAttribute(attr.name, attr.value);
      }
      if (!script.hasAttribute('async')) {
        copy.async = false;
      }
      copy.appendChild(document.createTextNode(script.innerHTML));
      parentNode = script.parentNode, nextSibling = script.nextSibling;
      parentNode.removeChild(script);
      parentNode.insertBefore(copy, nextSibling);
    }
  };

  removeNoscriptTags = function(node) {
    node.innerHTML = node.innerHTML.replace(/<noscript[\S\s]*?<\/noscript>/ig, '');
    return node;
  };

  setAutofocusElement = function() {
    var autofocusElement, list;
    autofocusElement = (list = document.querySelectorAll('input[autofocus], textarea[autofocus]'))[list.length - 1];
    if (autofocusElement && document.activeElement !== autofocusElement) {
      return autofocusElement.focus();
    }
  };

  reflectNewUrl = function(url) {
    if ((url = new ComponentUrl(url)).absolute !== referer) {
      return window.history.pushState({
        turbolinks: true,
        url: url.absolute
      }, '', url.absolute);
    }
  };

  reflectRedirectedUrl = function() {
    var location, preservedHash;
    if (location = xhr.getResponseHeader('X-XHR-Redirected-To')) {
      location = new ComponentUrl(location);
      preservedHash = location.hasNoHash() ? document.location.hash : '';
      return window.history.replaceState(currentState, '', location.href + preservedHash);
    }
  };

  rememberReferer = function() {
    return referer = document.location.href;
  };

  rememberCurrentUrl = function() {
    return window.history.replaceState({
      turbolinks: true,
      url: document.location.href
    }, '', document.location.href);
  };

  rememberCurrentState = function() {
    return currentState = window.history.state;
  };

  manuallyTriggerHashChangeForFirefox = function() {
    var url;
    if (navigator.userAgent.match(/Firefox/) && !(url = new ComponentUrl).hasNoHash()) {
      window.history.replaceState(currentState, '', url.withoutHash());
      return document.location.hash = url.hash;
    }
  };

  recallScrollPosition = function(page) {
    return window.scrollTo(page.positionX, page.positionY);
  };

  resetScrollPosition = function() {
    if (document.location.hash) {
      return document.location.href = document.location.href;
    } else {
      return window.scrollTo(0, 0);
    }
  };

  clone = function(original) {
    var copy, key, value;
    if ((original == null) || typeof original !== 'object') {
      return original;
    }
    copy = new original.constructor();
    for (key in original) {
      value = original[key];
      copy[key] = clone(value);
    }
    return copy;
  };

  popCookie = function(name) {
    var value, _ref;
    value = ((_ref = document.cookie.match(new RegExp(name + "=(\\w+)"))) != null ? _ref[1].toUpperCase() : void 0) || '';
    document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/';
    return value;
  };

  triggerEvent = function(name, data) {
    var event;
    if (typeof Prototype !== 'undefined') {
      Event.fire(document, name, data, true);
    }
    event = document.createEvent('Events');
    if (data) {
      event.data = data;
    }
    event.initEvent(name, true, true);
    return document.dispatchEvent(event);
  };

  pageChangePrevented = function(url) {
    return !triggerEvent(EVENTS.BEFORE_CHANGE, {
      url: url
    });
  };

  processResponse = function() {
    var assetsChanged, clientOrServerError, doc, extractTrackAssets, intersection, validContent;
    clientOrServerError = function() {
      var _ref;
      return (400 <= (_ref = xhr.status) && _ref < 600);
    };
    validContent = function() {
      var contentType;
      return ((contentType = xhr.getResponseHeader('Content-Type')) != null) && contentType.match(/^(?:text\/html|application\/xhtml\+xml|application\/xml)(?:;|$)/);
    };
    extractTrackAssets = function(doc) {
      var node, _i, _len, _ref, _results;
      _ref = doc.querySelector('head').childNodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if ((typeof node.getAttribute === "function" ? node.getAttribute('data-turbolinks-track') : void 0) != null) {
          _results.push(node.getAttribute('src') || node.getAttribute('href'));
        }
      }
      return _results;
    };
    assetsChanged = function(doc) {
      var fetchedAssets;
      loadedAssets || (loadedAssets = extractTrackAssets(document));
      fetchedAssets = extractTrackAssets(doc);
      return fetchedAssets.length !== loadedAssets.length || intersection(fetchedAssets, loadedAssets).length !== loadedAssets.length;
    };
    intersection = function(a, b) {
      var value, _i, _len, _ref, _results;
      if (a.length > b.length) {
        _ref = [b, a], a = _ref[0], b = _ref[1];
      }
      _results = [];
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        value = a[_i];
        if (__indexOf.call(b, value) >= 0) {
          _results.push(value);
        }
      }
      return _results;
    };
    if (!clientOrServerError() && validContent()) {
      doc = createDocument(xhr.responseText);
      if (doc && !assetsChanged(doc)) {
        return doc;
      }
    }
  };

  extractTitleAndBody = function(doc) {
    var title;
    title = doc.querySelector('title');
    return [title != null ? title.textContent : void 0, removeNoscriptTags(doc.querySelector('body')), CSRFToken.get(doc).token, 'runScripts'];
  };

  CSRFToken = {
    get: function(doc) {
      var tag;
      if (doc == null) {
        doc = document;
      }
      return {
        node: tag = doc.querySelector('meta[name="csrf-token"]'),
        token: tag != null ? typeof tag.getAttribute === "function" ? tag.getAttribute('content') : void 0 : void 0
      };
    },
    update: function(latest) {
      var current;
      current = this.get();
      if ((current.token != null) && (latest != null) && current.token !== latest) {
        return current.node.setAttribute('content', latest);
      }
    }
  };

  browserCompatibleDocumentParser = function() {
    var buildTestsUsing, createDocumentUsingDOM, createDocumentUsingFragment, createDocumentUsingParser, createDocumentUsingWrite, docTest, docTests, e, _i, _len;
    createDocumentUsingParser = function(html) {
      return (new DOMParser).parseFromString(html, 'text/html');
    };
    createDocumentUsingDOM = function(html) {
      var doc;
      doc = document.implementation.createHTMLDocument('');
      doc.documentElement.innerHTML = html;
      return doc;
    };
    createDocumentUsingWrite = function(html) {
      var doc;
      doc = document.implementation.createHTMLDocument('');
      doc.open('replace');
      doc.write(html);
      doc.close();
      return doc;
    };
    createDocumentUsingFragment = function(html) {
      var body, doc, head, htmlWrapper, _ref, _ref1;
      head = ((_ref = html.match(/<head[^>]*>([\s\S.]*)<\/head>/i)) != null ? _ref[0] : void 0) || '<head></head>';
      body = ((_ref1 = html.match(/<body[^>]*>([\s\S.]*)<\/body>/i)) != null ? _ref1[0] : void 0) || '<body></body>';
      htmlWrapper = document.createElement('html');
      htmlWrapper.innerHTML = head + body;
      doc = document.createDocumentFragment();
      doc.appendChild(htmlWrapper);
      return doc;
    };
    buildTestsUsing = function(createMethod) {
      var buildTest, formNestingTest, structureTest;
      buildTest = function(fallback, passes) {
        return {
          passes: passes(),
          fallback: fallback
        };
      };
      structureTest = buildTest(createDocumentUsingWrite, (function(_this) {
        return function() {
          var _ref, _ref1;
          return ((_ref = createMethod('<html><body><p>test')) != null ? (_ref1 = _ref.body) != null ? _ref1.childNodes.length : void 0 : void 0) === 1;
        };
      })(this));
      formNestingTest = buildTest(createDocumentUsingFragment, (function(_this) {
        return function() {
          var _ref, _ref1;
          return ((_ref = createMethod('<html><body><form></form><div></div></body></html>')) != null ? (_ref1 = _ref.body) != null ? _ref1.childNodes.length : void 0 : void 0) === 2;
        };
      })(this));
      return [structureTest, formNestingTest];
    };
    try {
      if (window.DOMParser) {
        docTests = buildTestsUsing(createDocumentUsingParser);
        return createDocumentUsingParser;
      }
    } catch (_error) {
      e = _error;
      docTests = buildTestsUsing(createDocumentUsingDOM);
      return createDocumentUsingDOM;
    } finally {
      for (_i = 0, _len = docTests.length; _i < _len; _i++) {
        docTest = docTests[_i];
        if (!docTest.passes) {
          return docTest.fallback;
        }
      }
    }
  };

  ComponentUrl = (function() {
    function ComponentUrl(original) {
      this.original = original != null ? original : document.location.href;
      if (this.original.constructor === ComponentUrl) {
        return this.original;
      }
      this._parse();
    }

    ComponentUrl.prototype.withoutHash = function() {
      return this.href.replace(this.hash, '').replace('#', '');
    };

    ComponentUrl.prototype.withoutHashForIE10compatibility = function() {
      return this.withoutHash();
    };

    ComponentUrl.prototype.hasNoHash = function() {
      return this.hash.length === 0;
    };

    ComponentUrl.prototype._parse = function() {
      var _ref;
      (this.link != null ? this.link : this.link = document.createElement('a')).href = this.original;
      _ref = this.link, this.href = _ref.href, this.protocol = _ref.protocol, this.host = _ref.host, this.hostname = _ref.hostname, this.port = _ref.port, this.pathname = _ref.pathname, this.search = _ref.search, this.hash = _ref.hash;
      this.origin = [this.protocol, '//', this.hostname].join('');
      if (this.port.length !== 0) {
        this.origin += ":" + this.port;
      }
      this.relative = [this.pathname, this.search, this.hash].join('');
      return this.absolute = this.href;
    };

    return ComponentUrl;

  })();

  Link = (function(_super) {
    __extends(Link, _super);

    Link.HTML_EXTENSIONS = ['html'];

    Link.allowExtensions = function() {
      var extension, extensions, _i, _len;
      extensions = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = extensions.length; _i < _len; _i++) {
        extension = extensions[_i];
        Link.HTML_EXTENSIONS.push(extension);
      }
      return Link.HTML_EXTENSIONS;
    };

    function Link(link) {
      this.link = link;
      if (this.link.constructor === Link) {
        return this.link;
      }
      this.original = this.link.href;
      this.originalElement = this.link;
      this.link = this.link.cloneNode(false);
      Link.__super__.constructor.apply(this, arguments);
    }

    Link.prototype.shouldIgnore = function() {
      return this._crossOrigin() || this._anchored() || this._nonHtml() || this._optOut() || this._target();
    };

    Link.prototype._crossOrigin = function() {
      return this.origin !== (new ComponentUrl).origin;
    };

    Link.prototype._anchored = function() {
      return (this.hash.length > 0 || this.href.charAt(this.href.length - 1) === '#') && (this.withoutHash() === (new ComponentUrl).withoutHash());
    };

    Link.prototype._nonHtml = function() {
      return this.pathname.match(/\.[a-z]+$/g) && !this.pathname.match(new RegExp("\\.(?:" + (Link.HTML_EXTENSIONS.join('|')) + ")?$", 'g'));
    };

    Link.prototype._optOut = function() {
      var ignore, link;
      link = this.originalElement;
      while (!(ignore || link === document)) {
        ignore = link.getAttribute('data-no-turbolink') != null;
        link = link.parentNode;
      }
      return ignore;
    };

    Link.prototype._target = function() {
      return this.link.target.length !== 0;
    };

    return Link;

  })(ComponentUrl);

  Click = (function() {
    Click.installHandlerLast = function(event) {
      if (!event.defaultPrevented) {
        document.removeEventListener('click', Click.handle, false);
        return document.addEventListener('click', Click.handle, false);
      }
    };

    Click.handle = function(event) {
      return new Click(event);
    };

    function Click(event) {
      this.event = event;
      if (this.event.defaultPrevented) {
        return;
      }
      this._extractLink();
      if (this._validForTurbolinks()) {
        if (!pageChangePrevented(this.link.absolute)) {
          visit(this.link.href);
        }
        this.event.preventDefault();
      }
    }

    Click.prototype._extractLink = function() {
      var link;
      link = this.event.target;
      while (!(!link.parentNode || link.nodeName === 'A')) {
        link = link.parentNode;
      }
      if (link.nodeName === 'A' && link.href.length !== 0) {
        return this.link = new Link(link);
      }
    };

    Click.prototype._validForTurbolinks = function() {
      return (this.link != null) && !(this.link.shouldIgnore() || this._nonStandardClick());
    };

    Click.prototype._nonStandardClick = function() {
      return this.event.which > 1 || this.event.metaKey || this.event.ctrlKey || this.event.shiftKey || this.event.altKey;
    };

    return Click;

  })();

  bypassOnLoadPopstate = function(fn) {
    return setTimeout(fn, 500);
  };

  installDocumentReadyPageEventTriggers = function() {
    return document.addEventListener('DOMContentLoaded', (function() {
      triggerEvent(EVENTS.CHANGE);
      return triggerEvent(EVENTS.UPDATE);
    }), true);
  };

  installJqueryAjaxSuccessPageUpdateTrigger = function() {
    if (typeof jQuery !== 'undefined') {
      return jQuery(document).on('ajaxSuccess', function(event, xhr, settings) {
        if (!jQuery.trim(xhr.responseText)) {
          return;
        }
        return triggerEvent(EVENTS.UPDATE);
      });
    }
  };

  installHistoryChangeHandler = function(event) {
    var cachedPage, _ref;
    if ((_ref = event.state) != null ? _ref.turbolinks : void 0) {
      if (cachedPage = pageCache[(new ComponentUrl(event.state.url)).absolute]) {
        cacheCurrentPage();
        return fetchHistory(cachedPage);
      } else {
        return visit(event.target.location.href);
      }
    }
  };

  initializeTurbolinks = function() {
    rememberCurrentUrl();
    rememberCurrentState();
    createDocument = browserCompatibleDocumentParser();
    document.addEventListener('click', Click.installHandlerLast, true);
    window.addEventListener('hashchange', function(event) {
      rememberCurrentUrl();
      return rememberCurrentState();
    }, false);
    return bypassOnLoadPopstate(function() {
      return window.addEventListener('popstate', installHistoryChangeHandler, false);
    });
  };

  historyStateIsDefined = window.history.state !== void 0 || navigator.userAgent.match(/Firefox\/2[6|7]/);

  browserSupportsPushState = window.history && window.history.pushState && window.history.replaceState && historyStateIsDefined;

  browserIsntBuggy = !navigator.userAgent.match(/CriOS\//);

  requestMethodIsSafe = (_ref = popCookie('request_method')) === 'GET' || _ref === '';

  browserSupportsTurbolinks = browserSupportsPushState && browserIsntBuggy && requestMethodIsSafe;

  browserSupportsCustomEvents = document.addEventListener && document.createEvent;

  if (browserSupportsCustomEvents) {
    installDocumentReadyPageEventTriggers();
    installJqueryAjaxSuccessPageUpdateTrigger();
  }

  if (browserSupportsTurbolinks) {
    visit = fetch;
    initializeTurbolinks();
  } else {
    visit = function(url) {
      return document.location.href = url;
    };
  }

  this.Turbolinks = {
    visit: visit,
    pagesCached: pagesCached,
    enableTransitionCache: enableTransitionCache,
    allowLinkExtensions: Link.allowExtensions,
    supported: browserSupportsTurbolinks,
    EVENTS: clone(EVENTS)
  };

}).call(this);
(function() {


}).call(this);
var initMaps = function(google) {

   var larchfieldLongLat = new google.maps.LatLng(53.819068, -1.254719);

   var larchfieldMap;
   var initLarchfieldMap = function() {
      var mapCanvas = document.getElementById('map_canvas_larchfield');
      var mapOptions = {
         center: larchfieldLongLat,
         zoom: 10,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      larchfieldMap = new google.maps.Map(mapCanvas, mapOptions)
   }
   google.maps.event.addDomListener(window, 'load', function(){
      initLarchfieldMap();
      var marker = new google.maps.Marker({
         position: larchfieldLongLat,
         map: larchfieldMap,
         url: "https://www.google.com/maps/place/Larchfield+House,+Church+St,+Barkston+Ash,+Tadcaster,+North+Yorkshire+LS24+9PJ,+UK/@53.8190678,-1.2547195,17z/data=!3m1!4b1!4m2!3m1!1s0x4879474d1d751c89:0x284963a9e971207e?hl=en-419"
      });
      google.maps.event.addListener(marker, 'click', function() {
         window.location.href = this.url;
      })
   });

   var hotelMap;
   var hotels = [
      ['Station Farm Guesthouse', 53.826546, -1.224861, 'http://www.stationfarmguesthouse.co.uk']
   ];

   var initHotels = function() {
      var mapCanvas = document.getElementById('map_canvas_hotels');
      var mapOptions = {
         center: larchfieldLongLat,
         zoom: 10,
         mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      hotelMap = new google.maps.Map(mapCanvas, mapOptions)
   }
   google.maps.event.addDomListener(window, 'load', function(){
      initHotels();
      hotels.forEach(function(hotel){
         var hotelLatLng = new google.maps.LatLng(hotel[1], hotel[2]);
         var marker = new google.maps.Marker({
            position: hotelLatLng,
            url: hotel[3],
            map: hotelMap,
            title: "hotel"
         });
      });
   });

}
;
function initCanvas(func) {
   window.addEventListener ? 
   window.addEventListener("load", func, false) : 
   window.attachEvent && window.attachEvent("onload", func);
}

function loadImages(sources, callback) {
   var images = {};
   var loadedImages = 0;
   var numImages = 0;
   // get num of sources
   for(var src in sources) {
      numImages++;
   }
   for(var src in sources) {
      images[src] = new Image();
      images[src].onload = function() {
         if(++loadedImages >= numImages) {
            callback(images);
         }
      };
      images[src].src = sources[src];
   }
}

function initPicturesByType(constructor, num, width, height, opts) {
   var minx = opts ? (opts.minx ? opts.minx : 0) : 0;
   var maxx = opts ? (typeof opts.maxx != 'undefined' ? opts.maxx : window.innerWidth) : window.innerWidth;
   var miny = opts ? (opts.miny ? opts.miny : 0) : 0;
   var maxy = opts ? (typeof opts.maxy != 'undefined' ? opts.maxy : window.innerHeight) : window.innerHeight;
   var types = [];
   for(var i = 0; i < num; i++) {
      types.push(new constructor(generatePosition(minx, maxx), 
         generatePosition(miny, maxy), width, height, 
         generatePosition(Math.PI/10, -1*Math.PI/10))); 
   }
   return types;
}

   // return Math.random() * (Math.PI/6 - -1*Math.PI/6) + -1*Math.PI/6;
   
function generatePosition(min, max) {
   return Math.random() * (max - min) + min;
}

function randomElement(array) {
   return array[Math.floor(Math.random()*array.length)]
}

var painter = function(contextWrapper, images) {

   var cw = contextWrapper; 
   var imgs = images; 

   return {
      drawPicture : function (pic) {
         cw.save();
         cw.translate(pic.pivotX(), pic.pivotY());
         this.rotate(pic);
         this.opacitate(pic);
         this.paint(pic);
         cw.restore();
      },

      paint : function(pic) {
         cw.drawImage(imgs[pic.image], pic.dpx(), pic.dpy(), pic.width, pic.height);
      },

      rotate : function(pic) {
         if(typeof pic.angle != 'undefined') {
            cw.rotate(pic.angle);
         }
      },

      opacitate : function(pic) {
         if(typeof pic.opacity != 'undefined') {
            cw.opacitate(pic.opacity);
         }
      }
   };
}

var contextWrapper = function(cxt) {

   var context = cxt;

   return { 

      opacitate : function(opacity) {
         context.globalAlpha = opacity;
      },

      rotate : function(radians) {
         context.rotate(radians);
      },

      translate : function(x, y) {
         context.translate(x, y);
      },

      save : function() {
         context.save();
      },

      drawImage : function(image, x, y, width, height) {
         context.drawImage(image, x, y, width, height);
      },

      restore : function() {
         context.restore();
      }
   }
};

function canvas(sources, canvasId, width, height, pictures, callback) {
   var canvas = document.getElementById(canvasId),
   context = canvas.getContext("2d");

   context.canvas.width  = width;
   context.canvas.height = height;

   var pictures = pictures;
   var imgs = {};
   var p;

   var cw = contextWrapper(context);

   loadImages(sources, function(images) {
      imgs = images;
      p = painter(cw, imgs);
      setInterval(draw, 50);
   })

   function draw() {
      canvas.width = canvas.width;

      var i = 0;
      while (i < pictures.length) {
         var pic = pictures[i];
         if(pic.cleanUp) {
            pictures.splice(i, i+1);
         }
         else {
            pic.draw(p); 
            i++;
         }
         if (callback) {
            callback();
         }
      }
   }
   return canvas;
}

(function(){
   var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

   // The base Class implementation (does nothing)
   this.Class = function(){};

   // Create a new Class that inherits from this class
   Class.extend = function(prop) {
      var _super = this.prototype;

      // Instantiate a base class (but only create the instance,
         // don't run the init constructor)
         initializing = true;
         var prototype = new this();
         initializing = false;

         // Copy the properties over onto the new prototype
         for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn){
               return function() {
                  var tmp = this._super;

                  // Add a new ._super() method that is the same method
                  // but on the super-class
                  this._super = _super[name];

                  // The method only need to be bound temporarily, so we
                  // remove it when we're done executing
                  var ret = fn.apply(this, arguments);        
                  this._super = tmp;

                  return ret;
               };
            })(name, prop[name]) : prop[name];
         }

         // The dummy class constructor
         function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
               this.init.apply(this, arguments);
         }

         // Populate our constructed prototype object
         Class.prototype = prototype;

         // Enforce the constructor to be what we expect
         Class.prototype.constructor = Class;

         // And make this class extendable
         Class.extend = arguments.callee;

         return Class;
   };

})();

var Pictures = Class.extend({
   init: function(image, x, y, width, height, angle){
      this.image = image;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.angle = angle;

      this.cleanUp = false;
      this.dy = 0;
      this.dx = 0;
      this.counter = 0;
   },
   pivotX : function() {
      return this.x+(this.width/2);
   },
   pivotY : function() {
      return this.y+(this.height);
   },
   dpx : function() {
      return 0-(this.width/2) + this.dx;
   },
   dpy : function() {
      return 0-this.height + this.dy;
   },
   absX : function() {
      return this.x + this.dx;
   },
   absY : function() {
      return this.y + this.dy;
   },
   draw : function(painter) {
      painter.drawPicture(this);
   } 
});

var Hina = Pictures.extend({
   init : function(x, y, width, height, velocity) {
      this._super(null, x, y, width, height);
      this.velocity = velocity;
      this.counter = 0;
      this.armRight1 = this.armGenerator(true, 4);
      this.armRight2 = this.armGenerator(true, 6);
      this.armLeft1 = this.armGenerator(false, 4);
      this.armLeft2 = this.armGenerator(false, 6);
      this.arm1 = null;
      this.arm2 = null;
      this.previousDy = this.dy;
      this.previousDx = this.dx;
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.dx = this.counter*100*this.velocity;
      this.dy = Math.sin(this.counter*4)*50;
      this.previousAngle = this.angle;
      if(this.velocity > 0) {
         this.image = (this.previousDy > this.dy ? "hinaRightStep1" : "hinaRightStep2")
         this.arm1 = this.armRight1;
         this.arm2 = this.armRight2;
      }
      else {
         this.image = (this.previousDy > this.dy ? "hinaLeftStep1" : "hinaLeftStep2")
         this.arm1 = this.armLeft1;
         this.arm2 = this.armLeft2;
      }
      this.arm1.counter = this.arm2.counter = this.counter;
      this.arm2.draw(painter);
      painter.drawPicture(this);
      this.arm1.draw(painter);
   },
   armGenerator : function(isRight, swing) {
      return new Arm((isRight ? this.x+this.width/4 : this.x+(3*this.width/4)), 
         this.y+this.height/5, this.width/2, this.height/4, 
         swing, this.velocity, this.counter);
   }
});

var Arm = Pictures.extend({
   init : function(x, y, width, height, swing, velocity) {
      this._super(null, x, y, width, height);
      this.velocity = velocity;
      this.counter = null;
      this.swing  = swing;
   },
   draw : function(painter) {
      this.image = (this.velocity > 0 ? "hinaArmRight" : "hinaArmLeft");
      this.angle = (0.5*this.velocity) + (Math.sin(this.counter*2)/this.swing); 
      this.dy = Math.sin(this.counter*4)*50;
      this.dx = this.counter*100*this.velocity;
      painter.drawPicture(this);
   },
   pivotX : function() {
      return this.x + this.dx + (this.width/10*this.velocity);
   },
   pivotY : function() {
      return this.y + (this.height/3) + this.dy;
   },
   dpx : function() {
      return (0 - (this.velocity>0 ? (this.width/10) : (9*this.width/10)));
   },
   dpy : function() {
      return (0 - (this.height/3));
   }
});

var FireEngine = Pictures.extend({
   init : function(x, y, width, height, velocity) {
      this._super("fireEngineLeft", x, y, width, height, 0);
      this.fireEngineLeft = this.image;
      this.wheelsLeft = "wheelsLeft";
      this.fireEngineRight = "fireEngineRight";
      this.wheelsRight = "wheelsRight";
      this.counter = 0;
      this.wheels = new Pictures(this.wheelsLeft, x, y, width, height);
      this.velocity = velocity;
   },
   draw : function(painter) {
      this.counter++;
      this.dx = this.wheels.dx = this.velocity ? (this.counter*this.velocity) : this.dx; 
      if(this.dx < 0) {
         this.image = this.fireEngineLeft;
         this.wheels.image = this.wheelsLeft;
      }
      else {
         this.image = this.fireEngineRight;
         this.wheels.image = this.wheelsRight;
      }
      this.dy = Math.sin(this.counter*200);
      painter.drawPicture(this);
      painter.drawPicture(this.wheels);
   }
});

var TallFlower = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("tallFlower", x, y, width, height, angle);
      this.tallFlower = this.image; 
      this.tallFlowerBlown = "tallFlowerBlown"; 
      this.previousAngle = this.angle;
      this.shift = generatePosition(1,2);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.previousAngle = this.angle;
      this.angle = this.angle + 
         (Math.sin(this.counter-(Math.PI/this.shift))/150); 
      if(this.previousAngle > this.angle) {
         this.image = this.tallFlower;
      }
      else {
         this.image = this.tallFlowerBlown;
      }
      painter.drawPicture(this);
   }
});

var Flower = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("flower", x, y, width, height, angle);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      this.dx = Math.sin(this.counter*2)*25;
      painter.drawPicture(this);
   }
});

var Chicken = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("chicken", x, y, width, height, angle);
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      // speed of bounce
      var point = Math.sin(this.counter*15);
      // height of bounce
      this.dy = point*10;
      if(point < -0.99) {
         this.angle = generatePosition();
      }
      painter.drawPicture(this);
   }
});

var PeckingChicken = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("peckingChicken", x, y, width, height, angle);
      this.chicken1 = this.image;
      this.chicken2 = "peckingChickenPecking";
      this.angle = 0;
   },
   draw : function(painter) {
      this.counter = this.counter + 0.05;
      if((Math.round(this.counter*10) / 10) % 3 == 0) {
         this.image = this.chicken2;
      }
      else {
         this.image = this.chicken1;
      }
      painter.drawPicture(this);
   }
});

var Heart = Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("heart", x, y, width, height, angle);
      this.opacity = 1.0;
   },
   draw : function(painter) {
      this.dy = this.dy + -5;
      if(this.absY() < 300) {
         if(this.opacity > 0.05) {
            this.opacity = this.opacity - 0.025;
         }
         else {
            this.opacity = 0;
            this.cleanUp = true;
         }
      }
      painter.drawPicture(this);
   }
});

var Note = Pictures.extend({
   init : function(x, y, width, height, probSecondNote) {
      this.images = [{i:"singleNote", w:width}, {i:"doubleNote", w:width*4}]; 
      var firstNote = randomElement(this.images);
      this.image = firstNote.i;
      this.width = firstNote.w;
      this.probSecondNote = probSecondNote || 0.5;
      this._super(this.image, x, y, this.width, height);
      if(Math.random() < this.probSecondNote) {
         this.secondNote = new Note(this.x+(this.width*1.5), this.y, 
            width, this.height, this.probSecondNote - 0.25);
      }
      this.opacity = 1.0;
      this.showing = false;
   },
   draw : function(painter) {
      this.dy = this.dy + -5;
      this.dx = this.dx + 5;
      if((this.absX()) > 2*window.innerWidth/3) {
         if(this.opacity > 0.05) {
            this.opacity = this.opacity - 0.025;
         }
         else {
            this.opacity = 0;
            this.cleanUp = true;
         }
      }
      /*
      if((window.innerWidth/2 < this.absX()) && !this.showing) {
        this.opacity = this.opacity + 0.05;
      }
      if(this.opacity >= 1) {
         this.showing = true;
      }
      */
      painter.drawPicture(this);
      if(this.secondNote) {
         this.secondNote.draw(painter);
      }
   }

});

var FireStation =  Pictures.extend({
   init : function(x, y, width, height, angle) {
      this._super("fireStation", x, y, width, height, angle);
      this.roofChicken = new Pictures("roofChicken", this.x, 
         this.y+(this.height/4), (this.width/8), (this.height/8)); 
      this.reachedTop = false;
      this.jump = 1;
   },
   draw : function(painter) {
      if(this.roofChicken.absY() > (this.y+this.height/64) && !this.reachedTop) {
         this.roofChicken.dy = this.roofChicken.dy + -1 + Math.sin(this.jump++);
         this.roofChicken.dx = this.roofChicken.dx + 1;
         this.roofChicken.image = "roofChicken";
      }
      else if(this.roofChicken.absY() < (this.y+this.height/5)) {
         this.reachedTop = true;
         this.roofChicken.dy = this.roofChicken.dy + 1 + Math.sin(this.jump++);
         this.roofChicken.dx = this.roofChicken.dx + -1;
         this.roofChicken.image = "roofChickenDown";
      }
      else {
         this.reachedTop = false;
      }
      painter.drawPicture(this);
      painter.drawPicture(this.roofChicken);
   }

});

var FlyingFlower =  Pictures.extend({
   init : function(x, y, width, height, direction) {
      this._super("flower", x, y, width, height);
      this.counter = 0;
      this.visible;
      this.direction = direction;
   },
   draw : function(painter) {
      this.dx = this.direction*this.counter*3;
      this.dy = -1*Math.sin(this.counter++*0.1)*180;
      if(this.absY() < window.innerHeight) {
         painter.drawPicture(this);
      }
      else {
         this.cleanUp = true;
      }
   }

});





// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//
//


;
