// ==UserScript==
// @name          onFocus
// @include       *
// @description  kill blur eventListener, force onfocus
// @author       the0cp
// @version      1.0.0
// @license      GPLv3
// ==/UserScript==


unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

unsafeWindow.document.hasFocus = () => true;
unsafeWindow.window.onFocus = () => true;

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

const blurWhitelist = [
    HTMLInputElement,
    HTMLAnchorElement,
    HTMLSpanElement,
    HTMLParagraphElement,
]

const hoverBlacklist = [
    HTMLIFrameElement,
    HTMLHtmlElement,
    HTMLBodyElement,
    HTMLHeadElement,
];

var event_handler = (event) => {
    if (event.type === 'blur' &&
        ((blurWhitelist.some(type => event.target instanceof type) ||
            event.target.classList?.contains('ql-editor')))) {
        return;
    }
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