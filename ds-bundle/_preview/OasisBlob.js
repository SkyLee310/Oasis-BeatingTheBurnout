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

  // .design-sync/previews/OasisBlob.tsx
  var OasisBlob_exports = {};
  __export(OasisBlob_exports, {
    AllZones: () => AllZones,
    InlineWithLabel: () => InlineWithLabel,
    Sizes: () => Sizes
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  function d({ zone: n, size: r = 120, float: i = true }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      className: i ? "blob-float" : void 0,
      width: r,
      height: r,
      viewBox: "0 0 200 200",
      role: "img",
      "aria-label": n === "green" ? "Mascot looking rested" : n === "amber" ? "Mascot looking strained" : "Mascot looking overloaded",
      style: {
        overflow: "visible",
        flexShrink: 0
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M 100 14 C 143 12 174 44 179 86 C 185 130 156 174 111 183 C 66 192 25 163 17 120 C 9 76 41 22 100 14 Z",
          fill: n === "green" ? "var(--mint-deep)" : n === "amber" ? "var(--butter-deep)" : "var(--blush-deep)",
          stroke: "var(--ink)",
          strokeWidth: "4",
          strokeLinejoin: "round"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
          cx: "60",
          cy: "118",
          rx: "11",
          ry: "7",
          fill: "var(--blush)",
          stroke: "var(--ink)",
          strokeWidth: "2.5"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
          cx: "140",
          cy: "118",
          rx: "11",
          ry: "7",
          fill: "var(--blush)",
          stroke: "var(--ink)",
          strokeWidth: "2.5"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
          cx: "74",
          cy: "88",
          rx: "9",
          ry: "12",
          fill: "var(--ink)"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
          cx: "126",
          cy: "88",
          rx: "9",
          ry: "12",
          fill: "var(--ink)"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: "77",
          cy: "83",
          r: "3.2",
          fill: "#ffffff"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
          cx: "129",
          cy: "83",
          r: "3.2",
          fill: "#ffffff"
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: n === "green" ? "M 76 116 Q 100 140 124 116" : n === "amber" ? "M 78 126 L 122 126" : "M 76 134 Q 100 112 124 134",
          fill: "none",
          stroke: "var(--ink)",
          strokeWidth: "4.5",
          strokeLinecap: "round"
        })
      ]
    });
  }

  // .design-sync/previews/OasisBlob.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function AllZones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "green", size: 104, float: false }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "amber", size: 104, float: false }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "red", size: 104, float: false })
    ] });
  }
  function Sizes() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "amber", size: 64, float: false }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "amber", size: 104, float: false }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "amber", size: 124, float: false })
    ] });
  }
  function InlineWithLabel() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 14, alignItems: "center", maxWidth: 400 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(d, { zone: "red", size: 64, float: false }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "t-sub text-ink", children: "Simulate new commitment" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "t-micro", style: { color: "var(--ink-muted)" }, children: "Test the consequence before you say yes." })
      ] })
    ] });
  }
  return __toCommonJS(OasisBlob_exports);
})();
