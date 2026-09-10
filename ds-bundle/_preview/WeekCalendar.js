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
        var o2 = {};
        for (var x in p) if (x !== "children") o2[x] = p[x];
        if (k !== void 0) o2.key = k;
        return o2;
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
      module.exports.jsxDEV = function(t2, p, k, s2) {
        return (s2 ? jsxs : jsx2)(t2, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/WeekCalendar.tsx
  var WeekCalendar_exports = {};
  __export(WeekCalendar_exports, {
    CustomWeek: () => CustomWeek,
    DaySelected: () => DaySelected,
    DefaultWeek: () => DefaultWeek,
    Interactive: () => Interactive
  });
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim(), 1);

  // dist-ds/oasis-ds.js
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim());
  var o = {
    deadline: {
      bg: "var(--blush)",
      text: "var(--zone-red-text)",
      dot: "var(--bold-orange)"
    },
    alert: {
      bg: "var(--blush)",
      text: "var(--zone-red-text)",
      dot: "var(--bold-orange)"
    },
    commitment: {
      bg: "var(--butter)",
      text: "var(--zone-amber-text)",
      dot: "var(--zone-amber-accent)"
    },
    class: {
      bg: "var(--sky)",
      text: "var(--ink)",
      dot: "var(--bold-blue)"
    },
    rest: {
      bg: "var(--mint)",
      text: "var(--zone-green-text)",
      dot: "var(--bold-green)"
    }
  };
  var s = [
    {
      date: 8,
      day: "Mon",
      month: "Sep",
      events: [{
        time: "9am",
        title: "DS A2 — start today",
        kind: "commitment",
        energy: -12
      }, {
        time: "3pm",
        title: "Study group — LinAlg",
        kind: "class"
      }]
    },
    {
      date: 9,
      day: "Tue",
      month: "Sep",
      events: [{
        time: "2pm",
        title: "Web Systems class",
        kind: "class"
      }, {
        time: "5pm",
        title: "Part-time interview",
        kind: "commitment",
        energy: -4
      }]
    },
    {
      date: 10,
      day: "Wed",
      month: "Sep",
      isToday: true,
      events: [{
        time: "9am",
        title: "LinAlg Quiz",
        kind: "deadline",
        energy: -8
      }, {
        time: "1pm",
        title: "DS lecture",
        kind: "class"
      }]
    },
    {
      date: 11,
      day: "Thu",
      month: "Sep",
      events: [{
        time: "11am",
        title: "Ethics tutorial",
        kind: "class"
      }, {
        time: "11:59pm",
        title: "Web Systems Lab due",
        kind: "deadline",
        energy: -6
      }]
    },
    {
      date: 12,
      day: "Fri",
      month: "Sep",
      events: [{
        time: "11:59pm",
        title: "DS Assignment 2 due",
        kind: "deadline",
        energy: -12
      }, {
        time: "5pm",
        title: "Part-time shift offer",
        kind: "alert"
      }]
    },
    {
      date: 13,
      day: "Sat",
      month: "Sep",
      events: [{
        time: "all day",
        title: "Ethics reading (deferred)",
        kind: "commitment",
        energy: -4
      }, {
        time: "eve",
        title: "Rest + recovery",
        kind: "rest"
      }]
    },
    {
      date: 14,
      day: "Sun",
      month: "Sep",
      events: [{
        time: "all day",
        title: "Rest day",
        kind: "rest"
      }]
    }
  ];
  function _({ selectedDate: n, onDayClick: r, days: i = s }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      className: "grid grid-cols-7 gap-2 sm:gap-2.5",
      children: i.map((i2) => {
        let a = n === i2.date;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
          onClick: () => r(i2),
          className: "focus-ring press flex flex-col items-center justify-between p-2",
          style: {
            background: a ? "var(--highlight)" : i2.isToday ? "var(--sky)" : "var(--surface)",
            border: "2px solid var(--ink)",
            borderRadius: "var(--r-md)",
            boxShadow: a ? "var(--shadow-hard)" : "none",
            minHeight: 92,
            cursor: "pointer"
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "t-eyebrow",
              style: {
                color: "var(--ink)",
                fontSize: 10
              },
              children: i2.day
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "t-stat text-ink",
              style: { fontSize: 26 },
              children: i2.date
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "flex items-center gap-1",
              children: i2.events.slice(0, 3).map((t2, n2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
                width: 7,
                height: 7,
                borderRadius: 999,
                background: o[t2.kind].dot,
                border: "1.5px solid var(--ink)"
              } }, n2))
            })
          ]
        }, i2.date);
      })
    });
  }

  // .design-sync/previews/WeekCalendar.tsx
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  function DefaultWeek() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(_, { selectedDate: null, onDayClick: () => {
    } });
  }
  function DaySelected() {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(_, { selectedDate: 11, onDayClick: () => {
    } });
  }
  function Interactive() {
    const [selected, setSelected] = (0, import_react.useState)(null);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      _,
      {
        selectedDate: selected?.date ?? null,
        onDayClick: (day) => setSelected((d) => d?.date === day.date ? null : day)
      }
    );
  }
  function CustomWeek() {
    const calmWeek = s.map((d, i) => ({
      ...d,
      events: i === 2 ? [{ time: "3pm", title: "Study group — LinAlg", kind: "class" }] : i === 5 ? [{ time: "11am", title: "Long walk", kind: "rest" }] : []
    }));
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(_, { selectedDate: null, onDayClick: () => {
    }, days: calmWeek });
  }
  return __toCommonJS(WeekCalendar_exports);
})();
