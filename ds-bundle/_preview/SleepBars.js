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
      function jsxs(t2, p, k) {
        return R.createElement.apply(R, [t2, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t2, p, k, s) {
        return (s ? jsxs : jsx2)(t2, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/SleepBars.tsx
  var SleepBars_exports = {};
  __export(SleepBars_exports, {
    Compact: () => Compact,
    RestedWeek: () => RestedWeek,
    TheWeek: () => TheWeek
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var i = (e2) => `var(--zone-${e2}-accent)`;
  function m({ data: n, height: r = 76 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        width: "100%",
        height: r
      },
      children: n.map((n2) => {
        let a = n2.hours >= 7 ? "green" : n2.hours >= 6 ? "amber" : "red", o = n2.hours / 9 * 100;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            height: r
          },
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            style: {
              flex: 1,
              width: "100%",
              borderRadius: "var(--r-sm)",
              border: `${n2.isToday ? 2 : 1.5}px solid var(--ink)`,
              background: "var(--surface)",
              boxShadow: n2.isToday ? "2px 2px 0 var(--ink)" : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              overflow: "hidden",
              padding: 2
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
              width: "100%",
              height: `${o}%`,
              background: i(a),
              borderRadius: 6,
              transition: "height 600ms var(--ease)"
            } })
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-micro",
            style: {
              fontWeight: n2.isToday ? 800 : 600,
              color: n2.isToday ? "var(--ink)" : "var(--ink-muted)"
            },
            children: n2.day
          })]
        }, n2.day);
      })
    });
  }

  // .design-sync/previews/SleepBars.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  var week = [
    { day: "Mon", hours: 5.1 },
    { day: "Tue", hours: 5.8 },
    { day: "Wed", hours: 4.9, isToday: true },
    { day: "Thu", hours: 5.4 },
    { day: "Fri", hours: 6.2 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 5.4 }
  ];
  var restedWeek = [
    { day: "Mon", hours: 7.4 },
    { day: "Tue", hours: 7.1 },
    { day: "Wed", hours: 6.4, isToday: true },
    { day: "Thu", hours: 7.8 },
    { day: "Fri", hours: 7.2 },
    { day: "Sat", hours: 8.1 },
    { day: "Sun", hours: 7.6 }
  ];
  function TheWeek() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 420 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(m, { data: week, height: 96 }) });
  }
  function Compact() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 300 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(m, { data: week, height: 54 }) });
  }
  function RestedWeek() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 420 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(m, { data: restedWeek, height: 96 }) });
  }
  return __toCommonJS(SleepBars_exports);
})();
