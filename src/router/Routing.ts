import { derived, writable } from 'svelte/store'

const isBrowser = typeof window !== 'undefined'

const href = writable(isBrowser ? window.location.href : 'https://example.com')
const URL = isBrowser ? window.URL : require('url').URL
var updateHref;
if (isBrowser) {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  updateHref = () => href.set(window.location.href)

  history.pushState = function () {
    originalPushState.apply(this, arguments)
    updateHref()
  }

  history.replaceState = function () {
    originalReplaceState.apply(this, arguments)
    updateHref()
  }

  window.addEventListener('popstate', updateHref)
  window.addEventListener('hashchange', updateHref)
} else {
  updateHref = () => console.log("Not a browser");
}

export const initRouter = () => {}

let tmp = {
  firstRender: {
    active: false,
    pathLength: 0
  },
};

const paramsData = writable(JSON.stringify({}))

href.subscribe(newHref => {
  tmp.firstRender.active = false;
  tmp.firstRender.pathLength = 0;
});

export const url = {
  subscribe: derived(href, ($href) => new URL($href)).subscribe,
  // setHref: (urlHref) => href.set(urlHref),
};

export const params = {
  subscribe: derived(paramsData, ($args) => JSON.parse($args)).subscribe,
  setParams: (newArgs: { [key: string]: string }) => paramsData.set(JSON.stringify(newArgs)),
}

export const redirectTo = (href: string) => {
  let hash = href.includes("#") ? href.split("#")[1] : "";
  // Force hash url
  if (!hash.startsWith("#")) {
    // TODO: Maybe dont force a / in from but go relative from where you are?
    if (!hash.startsWith("/")) {
      let previousHash = window?.location?.hash;
      if (previousHash) {
        if (!previousHash.endsWith("/")) previousHash += "/";
        hash = previousHash + hash;
      } else {
        hash = "/" + hash;
      }
    }
  }
  // removes pathname and non hash query data
  href = (window.location.origin + href + hash)
  if (href.endsWith("//")) {
    href = href.substr(0, href.length - 1);
  }
  if (href.endsWith("/")) {
    href = href.substr(0, href.length - 1);
  }
  history.pushState(href, "", href);
}

window.addEventListener("click", (e: MouseEvent | any) => {
  var target = e.target;

  while (target && target.tagName !== 'A') {
    target = target.parentNode;
    if (!target) { return; }
  }

  if (target.pathname && target.nodeName == "A") {
    let pathname = target.pathname;
    let href = pathname;
    if (!pathname.startsWith("/") || pathname.includes("://")) return;
    e.preventDefault();
    redirectTo(href);
  }
})

export const isActiveRoute = (current_path: string, path: string, exact: boolean): boolean => {
  // path formatting
  current_path = current_path.split("?")[0];
  if (current_path.startsWith("#/")) current_path = current_path.substr(2);
  if (path.startsWith("#/")) path = path.substr(2);
  if (current_path.startsWith("/")) current_path = current_path.substr(1);
  if (path.startsWith("/")) path = path.substr(1);
  if (current_path.endsWith("/")) current_path = current_path.substr(0, current_path.length - 1);
  if (path.endsWith("/")) path = path.substr(0, path.length - 1);
  // format to string array for each dir
  let current_args = current_path.split("/");
  let path_args = path.split("/");
  // account for no path args
  if (path == "") path_args = [];
  if (current_path == "") current_args = [];
  // check if arg length mismatch (on exact) or provided args are more than required
  if ((exact && path_args.length != current_args.length) || current_args.length < path_args.length) return false;
  let variableParams = {};
  // compare args
  let argCount = path_args.length;
  for (let i = 0; i < argCount; i++) {
    let current_arg = current_args[i];
    let path_arg = path_args[i];
    let isVariable = path_arg.includes(":");
    let [prefix, paramKey, suffix] = path_arg.split(":");
    prefix = prefix ?? "";
    suffix = suffix ?? "";
    if (!isVariable) {
      if (current_arg != path_arg) return false;
    } else {
      if (current_arg.startsWith(prefix ?? "") && current_arg.endsWith(suffix ?? "")) {
        variableParams[paramKey] = current_arg.slice(prefix.length, current_arg.length - suffix.length);
      } else {
        return false;
      }
    }
  }

  // TODO: Move to <Route /> component if is activeRoute, update params based on the query
  // Pass through via component NOT via global state (global state can probably be useful)
  params.setParams(variableParams);

  return true;
}

export const isActiveRouteUnmodified = (current_path: string, path: string, exact: boolean): boolean => {

  // path formatting
  current_path = current_path.split("?")[0];
  if (current_path.startsWith("#/")) current_path = current_path.substr(2);
  if (path.startsWith("#/")) path = path.substr(2);
  if (current_path.startsWith("/")) current_path = current_path.substr(1);
  if (path.startsWith("/")) path = path.substr(1);
  if (current_path.endsWith("/")) current_path = current_path.substr(0, current_path.length - 1);
  if (path.endsWith("/")) path = path.substr(0, path.length - 1);
  // format to string array for each dir
  let current_args = current_path.split("/");
  let path_args = path.split("/");
  // account for no path args
  if (path == "") path_args = [];
  if (current_path == "") current_args = [];
  // check if arg length mismatch (on exact) or provided args are more than required
  if ((exact && path_args.length != current_args.length) || current_args.length < path_args.length) return false;
  let variableParams = {};
  // compare args
  let argCount = path_args.length;
  for (let i = 0; i < argCount; i++) {
    let current_arg = current_args[i];
    let path_arg = path_args[i];
    let isVariable = path_arg.includes(":");
    let [prefix, paramKey, suffix] = path_arg.split(":");
    prefix = prefix ?? "";
    suffix = suffix ?? "";
    if (!isVariable) {
      if (current_arg != path_arg) return false;
    } else {
      if (current_arg.startsWith(prefix ?? "") && current_arg.endsWith(suffix ?? "")) {
        variableParams[paramKey] = current_arg.slice(prefix.length, current_arg.length - suffix.length);
      } else {
        return false;
      }
    }
  }
  return true;
}