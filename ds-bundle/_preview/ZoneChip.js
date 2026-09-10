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

  // .design-sync/previews/ZoneChip.tsx
  var ZoneChip_exports = {};
  __export(ZoneChip_exports, {
    AllZones: () => AllZones,
    BesideHeading: () => BesideHeading,
    Large: () => Large
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
  function c({ zone: t2, size: n = "sm" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: `zone-chip zone-${t2} ${n === "lg" ? "zone-chip-lg" : ""}`,
      children: r[t2]
    });
  }

  // .design-sync/previews/ZoneChip.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function AllZones() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "green" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "amber" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "red" })
    ] });
  }
  function Large() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "green", size: "lg" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "red", size: "lg" })
    ] });
  }
  function BesideHeading() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-baseline justify-between gap-3 rule-b pb-3", style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "t-title text-ink", children: "Sleep architecture" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(c, { zone: "red" })
    ] });
  }
  return __toCommonJS(ZoneChip_exports);
})();
