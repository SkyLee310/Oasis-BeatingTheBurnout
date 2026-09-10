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
        var c2 = p2 && p2.children;
        return c2 === void 0 ? R.createElement(t2, np(p2, k)) : R.createElement(t2, np(p2, k), c2);
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

  // .design-sync/previews/StatTile.tsx
  var StatTile_exports = {};
  __export(StatTile_exports, {
    AllVariants: () => AllVariants,
    Basic: () => Basic,
    WithChart: () => WithChart,
    WithNote: () => WithNote
  });
  init_define_import_meta_env();

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var n = 2.25;
  var r = {
    green: "OPTIMAL",
    amber: "NEAR CAPACITY",
    red: "OVERLOADED"
  };
  var i = (e2) => `var(--zone-${e2}-accent)`;
  function c({ zone: t2, size: n2 = "sm" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: `zone-chip zone-${t2} ${n2 === "lg" ? "zone-chip-lg" : ""}`,
      children: r[t2]
    });
  }
  function p({ values: t2, zone: n2 = "amber", height: r2 = 54 }) {
    let a = Math.min(...t2), o = Math.max(...t2) - a || 1;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: r2,
        width: "100%",
        padding: "4px 5px",
        border: "1.5px solid var(--ink)",
        borderRadius: "var(--r-sm)",
        background: "var(--surface)"
      },
      children: t2.map((r3, s) => {
        let c2 = (r3 - a) / o * 72 + 28, l = s === t2.length - 1;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
          flex: 1,
          borderRadius: 3,
          height: `${c2}%`,
          background: i(n2),
          opacity: l ? 1 : 0.4 + s / t2.length * 0.45,
          transition: "height 500ms var(--ease)"
        } }, s);
      })
    });
  }
  function m({ data: n2, height: r2 = 76 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        width: "100%",
        height: r2
      },
      children: n2.map((n3) => {
        let a = n3.hours >= 7 ? "green" : n3.hours >= 6 ? "amber" : "red", o = n3.hours / 9 * 100;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            height: r2
          },
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            style: {
              flex: 1,
              width: "100%",
              borderRadius: "var(--r-sm)",
              border: `${n3.isToday ? 2 : 1.5}px solid var(--ink)`,
              background: "var(--surface)",
              boxShadow: n3.isToday ? "2px 2px 0 var(--ink)" : "none",
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
              fontWeight: n3.isToday ? 800 : 600,
              color: n3.isToday ? "var(--ink)" : "var(--ink-muted)"
            },
            children: n3.day
          })]
        }, n3.day);
      })
    });
  }
  function h({ variant: n2, icon: r2, label: i2, value: a, unit: o, note: s, children: l, zone: u }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: `tile tile-${n2} card-pop`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex items-center justify-between gap-2",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
            className: "inline-flex items-center gap-2 t-eyebrow",
            style: { color: "var(--ink)" },
            children: [
              r2,
              " ",
              i2
            ]
          }), s && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-micro",
            style: { color: "var(--ink-2)" },
            children: s
          })]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex items-baseline gap-1.5",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-stat text-ink",
            style: { fontSize: 46 },
            children: a
          }), o && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-label",
            style: { color: "var(--ink-2)" },
            children: o
          })]
        }),
        l,
        u && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-auto pt-1",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, { zone: u })
        })
      ]
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

  // node_modules/lucide-react/dist/esm/icons/activity.js
  init_define_import_meta_env();
  var __iconNode = [
    [
      "path",
      {
        d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
        key: "169zse"
      }
    ]
  ];
  var Activity = createLucideIcon("activity", __iconNode);

  // node_modules/lucide-react/dist/esm/icons/brain.js
  init_define_import_meta_env();
  var __iconNode2 = [
    [
      "path",
      {
        d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
        key: "l5xja"
      }
    ],
    [
      "path",
      {
        d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
        key: "ep3f8r"
      }
    ],
    ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
    ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
    ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
    ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
    ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
    ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
    ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
  ];
  var Brain = createLucideIcon("brain", __iconNode2);

  // node_modules/lucide-react/dist/esm/icons/heart.js
  init_define_import_meta_env();
  var __iconNode3 = [
    [
      "path",
      {
        d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
        key: "c3ymky"
      }
    ]
  ];
  var Heart = createLucideIcon("heart", __iconNode3);

  // node_modules/lucide-react/dist/esm/icons/moon.js
  init_define_import_meta_env();
  var __iconNode4 = [
    ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
  ];
  var Moon = createLucideIcon("moon", __iconNode4);

  // node_modules/lucide-react/dist/esm/icons/zap.js
  init_define_import_meta_env();
  var __iconNode5 = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db"
      }
    ]
  ];
  var Zap = createLucideIcon("zap", __iconNode5);

  // .design-sync/previews/StatTile.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  var hrValues = [74, 76, 79, 82, 78, 80, 77, 78, 81, 78, 76, 79];
  var sleepWeek = [
    { day: "Mon", hours: 5.1 },
    { day: "Tue", hours: 5.8 },
    { day: "Wed", hours: 4.9, isToday: true },
    { day: "Thu", hours: 5.4 },
    { day: "Fri", hours: 6.2 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 5.4 }
  ];
  function Basic() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 260 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      h,
      {
        variant: "butter",
        zone: "amber",
        icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Zap, { size: 14, strokeWidth: n }),
        label: "Energy index",
        value: "38",
        unit: "/ 100"
      }
    ) });
  }
  function WithNote() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 260 }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      h,
      {
        variant: "blush",
        zone: "amber",
        icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Heart, { size: 14, strokeWidth: n }),
        label: "Heart rate",
        value: "78",
        unit: "bpm",
        note: "+6 bpm"
      }
    ) });
  }
  function WithChart() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", gap: 16, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 260, flex: "1 1 240px" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        h,
        {
          variant: "blush",
          zone: "amber",
          icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Heart, { size: 14, strokeWidth: n }),
          label: "Heart rate",
          value: "78",
          unit: "bpm",
          note: "+6 bpm",
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(p, { values: hrValues, zone: "amber", height: 44 })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { maxWidth: 260, flex: "1 1 240px" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        h,
        {
          variant: "sky",
          zone: "red",
          icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Moon, { size: 14, strokeWidth: n }),
          label: "Sleep · 7-day",
          value: "5.4",
          unit: "hrs avg",
          note: "Goal 7.5h",
          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(m, { data: sleepWeek, height: 54 })
        }
      ) })
    ] });
  }
  function AllVariants() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(h, { variant: "mint", zone: "green", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Activity, { size: 14, strokeWidth: n }), label: "Recovery", value: "82", unit: "/ 100" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(h, { variant: "sky", zone: "red", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Moon, { size: 14, strokeWidth: n }), label: "Sleep", value: "5.4", unit: "hrs" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(h, { variant: "blush", zone: "amber", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Heart, { size: 14, strokeWidth: n }), label: "Heart rate", value: "78", unit: "bpm" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(h, { variant: "butter", zone: "amber", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Zap, { size: 14, strokeWidth: n }), label: "Energy", value: "38", unit: "/ 100" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(h, { variant: "lilac", zone: "red", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Brain, { size: 14, strokeWidth: n }), label: "Cognitive load", value: "91", unit: "%" })
    ] });
  }
  return __toCommonJS(StatTile_exports);
})();
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/activity.js:
lucide-react/dist/esm/icons/brain.js:
lucide-react/dist/esm/icons/heart.js:
lucide-react/dist/esm/icons/moon.js:
lucide-react/dist/esm/icons/zap.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.487.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
