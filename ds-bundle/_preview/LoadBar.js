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
        var c2 = p && p.children;
        return c2 === void 0 ? R.createElement(t2, np(p, k)) : R.createElement(t2, np(p, k), c2);
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

  // .design-sync/previews/LoadBar.tsx
  var LoadBar_exports = {};
  __export(LoadBar_exports, {
    AllZones: () => AllZones,
    Breakdown: () => Breakdown,
    Single: () => Single
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var r = {
    green: "OPTIMAL",
    amber: "NEAR CAPACITY",
    red: "OVERLOADED"
  };
  var i = (e2) => `var(--zone-${e2}-accent)`;
  function c({ zone: t2, size: n = "sm" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: `zone-chip zone-${t2} ${n === "lg" ? "zone-chip-lg" : ""}`,
      children: r[t2]
    });
  }
  function g({ label: n, pct: r2, zone: a }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "flex flex-col gap-2",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "flex items-center justify-between gap-3 flex-wrap",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "t-label text-ink",
          children: n
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
            className: "t-stat",
            style: {
              fontSize: 16,
              color: "var(--ink)"
            },
            children: [r2, "%"]
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, { zone: a })]
        })]
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "track",
        style: { height: 14 },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "bar-fill",
          style: {
            height: "100%",
            width: `${r2}%`,
            background: i(a)
          }
        })
      })]
    });
  }

  // .design-sync/previews/LoadBar.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function Single() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 420 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(g, { label: "Cognitive & Academics", pct: 91, zone: "red" }) });
  }
  function AllZones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 18, maxWidth: 420 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(g, { label: "Calendar Density", pct: 87, zone: "red" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(g, { label: "Physical Recovery", pct: 54, zone: "amber" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(g, { label: "Social Engagements", pct: 38, zone: "green" })
    ] });
  }
  function Breakdown() {
    const categories = [
      { label: "Cognitive & Academics", pct: 91, zone: "red", detail: "DS Assignment 2 + LinAlg exam prep overlapping" },
      { label: "Calendar Density", pct: 87, zone: "red", detail: "89% occupied slots — less than 30 mins contiguous break" },
      { label: "Physical Recovery", pct: 54, zone: "amber", detail: "Sleep averaging 5.4h — below optimal recovery baseline" },
      { label: "Life Administration", pct: 42, zone: "amber", detail: "Admin commitments accumulating from last week" },
      { label: "Social Engagements", pct: 38, zone: "green", detail: "Restored to calm, sustainable frequency" }
    ];
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 22, maxWidth: 460 }, children: categories.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(g, { label: c2.label, pct: c2.pct, zone: c2.zone }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "t-micro", style: { color: "var(--ink-muted)" }, children: c2.detail })
    ] }, c2.label)) });
  }
  return __toCommonJS(LoadBar_exports);
})();
