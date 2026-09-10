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
      function np(p2, k) {
        var o = {};
        for (var x in p2) if (x !== "children") o[x] = p2[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t2, p2, k) {
        var c = p2 && p2.children;
        return c === void 0 ? R.createElement(t2, np(p2, k)) : R.createElement(t2, np(p2, k), c);
      }
      function jsxs2(t2, p2, k) {
        return R.createElement.apply(R, [t2, np(p2, k)].concat(p2.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t2, p2, k, s) {
        return (s ? jsxs2 : jsx2)(t2, p2, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/Sparkline.tsx
  var Sparkline_exports = {};
  __export(Sparkline_exports, {
    AllZones: () => AllZones,
    HeartRate: () => HeartRate,
    WithCaption: () => WithCaption
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var i = (e2) => `var(--zone-${e2}-accent)`;
  function p({ values: t2, zone: n = "amber", height: r = 54 }) {
    let a = Math.min(...t2), o = Math.max(...t2) - a || 1;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: r,
        width: "100%",
        padding: "4px 5px",
        border: "1.5px solid var(--ink)",
        borderRadius: "var(--r-sm)",
        background: "var(--surface)"
      },
      children: t2.map((r2, s) => {
        let c = (r2 - a) / o * 72 + 28, l = s === t2.length - 1;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
          flex: 1,
          borderRadius: 3,
          height: `${c}%`,
          background: i(n),
          opacity: l ? 1 : 0.4 + s / t2.length * 0.45,
          transition: "height 500ms var(--ease)"
        } }, s);
      })
    });
  }

  // .design-sync/previews/Sparkline.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  var hrValues = [74, 76, 79, 82, 78, 80, 77, 78, 81, 78, 76, 79];
  function HeartRate() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 320 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "amber", height: 60 }) });
  }
  function AllZones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 320 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "green", height: 44 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "amber", height: 44 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "red", height: 44 })
    ] });
  }
  function WithCaption() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "t-eyebrow", style: { color: "var(--ink)" }, children: "Heart rate · 12h" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "amber", height: 60 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "t-micro", style: { color: "var(--ink-muted)", lineHeight: 1.5 }, children: "Elevated 6 bpm over your 72 bpm resting baseline." })
    ] });
  }
  return __toCommonJS(Sparkline_exports);
})();
