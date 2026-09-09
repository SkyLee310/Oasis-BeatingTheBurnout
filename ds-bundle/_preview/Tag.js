"use strict";
var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e2) {
      throw err = [e2], e2;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e2) {
      throw mod = 0, e2;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t2, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t2, np(p, k)) : R.createElement(t2, np(p, k), c);
      }
      function jsxs2(t2, p, k) {
        return R.createElement.apply(R, [t2, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t2, p, k, s) {
        return (s ? jsxs2 : jsx2)(t2, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/Tag.tsx
  var Tag_exports = {};
  __export(Tag_exports, {
    AsEyebrow: () => AsEyebrow,
    Tones: () => Tones,
    WithIcon: () => WithIcon
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var n = 2.25;
  function l({ children: t2, tone: n2 = "neutral" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: "inline-flex w-fit items-center gap-1.5 t-micro",
      style: {
        background: n2 === "yellow" ? "var(--highlight)" : n2 === "green" ? "var(--zone-green-bg)" : n2 === "amber" ? "var(--zone-amber-bg)" : n2 === "red" ? "var(--zone-red-bg)" : "var(--surface)",
        color: n2 === "green" ? "var(--zone-green-text)" : n2 === "amber" ? "var(--zone-amber-text)" : n2 === "red" ? "var(--zone-red-text)" : "var(--ink)",
        border: "1.5px solid var(--ink)",
        borderRadius: "var(--r-pill)",
        padding: "4px 11px",
        fontWeight: 800,
        whiteSpace: "nowrap"
      },
      children: t2
    });
  }

  // node_modules/lucide-react/dist/esm/lucide-react.js
  init_define_import_meta_env();

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  init_define_import_meta_env();
  var import_react2 = __toESM(require_react_shim());

  // node_modules/lucide-react/dist/esm/shared/src/utils.js
  init_define_import_meta_env();
  var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  var toCamelCase = (string) => string.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
  );
  var toPascalCase = (string) => {
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  };
  var mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
  }).join(" ").trim();

  // node_modules/lucide-react/dist/esm/Icon.js
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim());

  // node_modules/lucide-react/dist/esm/defaultAttributes.js
  init_define_import_meta_env();
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  // node_modules/lucide-react/dist/esm/Icon.js
  var Icon = (0, import_react.forwardRef)(
    ({
      color = "currentColor",
      size = 24,
      strokeWidth = 2,
      absoluteStrokeWidth,
      className = "",
      children,
      iconNode,
      ...rest
    }, ref) => {
      return (0, import_react.createElement)(
        "svg",
        {
          ref,
          ...defaultAttributes,
          width: size,
          height: size,
          stroke: color,
          strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
          className: mergeClasses("lucide", className),
          ...rest
        },
        [
          ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
          ...Array.isArray(children) ? children : [children]
        ]
      );
    }
  );

  // node_modules/lucide-react/dist/esm/createLucideIcon.js
  var createLucideIcon = (iconName, iconNode) => {
    const Component = (0, import_react2.forwardRef)(
      ({ className, ...props }, ref) => (0, import_react2.createElement)(Icon, {
        ref,
        iconNode,
        className: mergeClasses(
          `lucide-${toKebabCase(toPascalCase(iconName))}`,
          `lucide-${iconName}`,
          className
        ),
        ...props
      })
    );
    Component.displayName = toPascalCase(iconName);
    return Component;
  };

  // node_modules/lucide-react/dist/esm/icons/zap.js
  init_define_import_meta_env();
  var __iconNode = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db"
      }
    ]
  ];
  var Zap = createLucideIcon("zap", __iconNode);

  // .design-sync/previews/Tag.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function Tones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(l, { children: "4 PENDING" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(l, { tone: "yellow", children: "TODAY" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(l, { tone: "green", children: "RECOVERED" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(l, { tone: "amber", children: "NEAR CAPACITY" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(l, { tone: "red", children: "OVERLOADED" })
    ] });
  }
  function WithIcon() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(l, { tone: "amber", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Zap, { size: 13, strokeWidth: n }),
      " TODAY'S READING"
    ] });
  }
  function AsEyebrow() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(l, { tone: "amber", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Zap, { size: 13, strokeWidth: n }),
        " TODAY'S READING"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h1", { className: "t-hero text-ink", children: [
        "You're running",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
        "near capacity."
      ] })
    ] });
  }
  return __toCommonJS(Tag_exports);
})();
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/zap.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.487.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
