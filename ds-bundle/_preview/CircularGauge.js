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

  // .design-sync/previews/CircularGauge.tsx
  var CircularGauge_exports = {};
  __export(CircularGauge_exports, {
    AllZones: () => AllZones,
    CustomMax: () => CustomMax,
    EnergyIndex: () => EnergyIndex
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
  function f({ value: n, max: r2 = 100, zone: a, label: o, sublabel: s, size: l = 136 }) {
    let u = Math.max(0, Math.min(1, n / r2)) * 360, d = Math.round(l * 0.7);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "flex flex-col items-center gap-3",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        style: {
          width: l,
          height: l,
          borderRadius: "50%",
          flexShrink: 0,
          background: `conic-gradient(${i(a)} ${u}deg, var(--surface) ${u}deg 360deg)`,
          border: "2px solid var(--ink)",
          boxShadow: "var(--shadow-hard)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 700ms var(--ease)"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          style: {
            width: d,
            height: d,
            borderRadius: "50%",
            background: "var(--surface)",
            border: "2px solid var(--ink)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          },
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-stat text-ink",
            style: { fontSize: l * 0.26 },
            children: o
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-micro text-ink-muted",
            style: { marginTop: 4 },
            children: s
          })]
        })
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, {
        zone: a,
        size: "sm"
      })]
    });
  }

  // .design-sync/previews/CircularGauge.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function EnergyIndex() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(f, { value: 38, zone: "amber", label: "38", sublabel: "/ 100 ENERGY", size: 168 });
  }
  function AllZones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(f, { value: 82, zone: "green", label: "82", sublabel: "/ 100", size: 132 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(f, { value: 38, zone: "amber", label: "38", sublabel: "/ 100", size: 132 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(f, { value: 16, zone: "red", label: "16", sublabel: "/ 100", size: 132 })
    ] });
  }
  function CustomMax() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(f, { value: 5.4, max: 9, zone: "red", label: "5.4", sublabel: "HRS", size: 152 });
  }
  return __toCommonJS(CircularGauge_exports);
})();
