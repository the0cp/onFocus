// ==UserScript==
// @name          AlwaysForcus - AllowCopy - DisableFullscreen
// @include       *
// ==/UserScript==


unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

unsafeWindow.document.hasFocus = () => true;
unsafeWindow.window.onFocus = () => true;

// kill dom property names
[
    "hidden",
    "mozHidden",
    "msHidden",
    "webkitHidden"
].forEach(prop_name => {
    Object.defineProperty(document, prop_name, {value: false});
})

Object.defineProperty(document, "visibilityState", {get: () => "visible"});
Object.defineProperty(document, "webkitVisibilityState", {get: () => "visible"});

unsafeWindow.document.onvisibilitychange = undefined;


// element constructors to allow blur events on
const blurWhitelist = [
    HTMLInputElement,
    HTMLAnchorElement,
    HTMLSpanElement,
    HTMLParagraphElement,
]

// element constructors to block mouseleave and mouseout events on
const hoverBlacklist = [
    HTMLIFrameElement,
    HTMLHtmlElement,
    HTMLBodyElement,
    HTMLHeadElement,
    HTMLFrameSetElement, // obsolete but included for completeness
    HTMLFrameElement // obsolete but included for completeness
];

var event_handler = (event) => {
    // if the event is blur, and the target is an whitelisted type, allow it
    if (event.type === 'blur' &&
        ((blurWhitelist.some(type => event.target instanceof type) ||
            event.target.classList?.contains('ql-editor')))) { // quill js fix
        return;
    }
    // if the event is mouseleave or mouseout, and the target is an blacklisted type, block it
    if (['mouseleave', 'mouseout'].includes(event.type) &&
        !hoverBlacklist.some(type => event.target instanceof type)) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

// kill event listeners
[
    "visibilitychange",
    "webkitvisibilitychange",
    "blur",
    "hasFocus",
    "mouseleave",
    "mouseout",
    "mozvisibilitychange",
    "fullscreenchange",
    "msvisibilitychange"
].forEach(event_name => {
    window.addEventListener(event_name, event_handler, true);
    document.addEventListener(event_name, event_handler, true);
})

function removeCopyEvent() {
    Array.prototype.concat.call(document.querySelectorAll('*'), document)
        .forEach(function (ele) {
            ele.oncopy = undefined;
            ele.oncontextmenu = undefined;
        });
}

'use strict';
~function (global) {
    function generate() {
        return function () {

            global.addEventListener('contextmenu', function (e) {
                removeCopyEvent();
            });

            global.addEventListener('keydown', function (e) {
                if (e.ctrlKey || e.keyCode === 224 || e.keyCode === 17 || e.keyCode === 91 || e.keyCode === 93) {
                    removeCopyEvent();
                }
            });

            this.hookBefore(EventTarget.prototype, 'addEventListener',
                function (m, args) {
                    if (args[0] === 'copy' || args[0] === 'contextmenu') {
                        args[0] = 'prevent ' + args[0] + ' handler';
                        console.log('AllowCopy', args[0]);
                    }
                }, false);

            var style = 'body * :not(input):not(textarea){-webkit-user-select:auto!important;-moz-user-select:auto!important;-ms-user-select:auto!important;user-select:auto!important}';

            var stylenode = document.createElement('style');

            stylenode.setAttribute("type", "text/css");
            if (stylenode.styleSheet) {// IE
                stylenode.styleSheet.cssText = style;
            } else {// w3c
                var cssText = document.createTextNode(style);
                stylenode.appendChild(cssText);
            }

            document.addEventListener('readystatechange', function () {
                if (document.readyState === "interactive" || document.readyState === "complete") {
                    setTimeout(function () {
                        document.head.appendChild(stylenode);
                        console.log('AllowCopy css applied')
                    }, 2000);
                }
            });

            console.log('AllowCopy', 'works.');
        }
    }


    if (global.eHook) {
        global.eHook.plugins({
            name: 'allowCopy',
            mount: generate()
        });
    }
}(window);