/* @ds-bundle: {"namespace":"OasisDS","components":[{"name":"CircularGauge","sourcePath":"components/general/CircularGauge/CircularGauge.jsx"},{"name":"Initials","sourcePath":"components/general/Initials/Initials.jsx"},{"name":"LoadBar","sourcePath":"components/general/LoadBar/LoadBar.jsx"},{"name":"OasisBlob","sourcePath":"components/general/OasisBlob/OasisBlob.jsx"},{"name":"SleepBars","sourcePath":"components/general/SleepBars/SleepBars.jsx"},{"name":"Sparkline","sourcePath":"components/general/Sparkline/Sparkline.jsx"},{"name":"StatTile","sourcePath":"components/general/StatTile/StatTile.jsx"},{"name":"Tag","sourcePath":"components/general/Tag/Tag.jsx"},{"name":"WeekCalendar","sourcePath":"components/general/WeekCalendar/WeekCalendar.jsx"},{"name":"ZoneChip","sourcePath":"components/general/ZoneChip/ZoneChip.jsx"}],"sourceHashes":{"components/general/CircularGauge/CircularGauge.jsx":"5dd7ec87cb12","components/general/CircularGauge/CircularGauge.d.ts":"9f09e0547eac","components/general/CircularGauge/CircularGauge.prompt.md":"7e01fedb53e0","components/general/Initials/Initials.jsx":"ef9becbf5502","components/general/Initials/Initials.d.ts":"d88dd12348f3","components/general/Initials/Initials.prompt.md":"a8a7eed38561","components/general/LoadBar/LoadBar.jsx":"c21c35eb949c","components/general/LoadBar/LoadBar.d.ts":"37188465d066","components/general/LoadBar/LoadBar.prompt.md":"1dce323893e9","components/general/OasisBlob/OasisBlob.jsx":"f60053678653","components/general/OasisBlob/OasisBlob.d.ts":"a12ee611065c","components/general/OasisBlob/OasisBlob.prompt.md":"aa5b116a718c","components/general/SleepBars/SleepBars.jsx":"12d5e0e98fa4","components/general/SleepBars/SleepBars.d.ts":"7d135f4aa1e8","components/general/SleepBars/SleepBars.prompt.md":"1ec350b11710","components/general/Sparkline/Sparkline.jsx":"79163efecf83","components/general/Sparkline/Sparkline.d.ts":"185740fc7670","components/general/Sparkline/Sparkline.prompt.md":"172918971552","components/general/StatTile/StatTile.jsx":"f931bbfc9768","components/general/StatTile/StatTile.d.ts":"d4bdf3a0fe88","components/general/StatTile/StatTile.prompt.md":"8f9fc449f752","components/general/Tag/Tag.jsx":"d3a0219a7fa8","components/general/Tag/Tag.d.ts":"8c4e979b15aa","components/general/Tag/Tag.prompt.md":"e2992b0567af","components/general/WeekCalendar/WeekCalendar.jsx":"ebb9ee318225","components/general/WeekCalendar/WeekCalendar.d.ts":"feb2e96b1309","components/general/WeekCalendar/WeekCalendar.prompt.md":"15f4526843b7","components/general/ZoneChip/ZoneChip.jsx":"a3ff80c3f59b","components/general/ZoneChip/ZoneChip.d.ts":"d94f236426e6","components/general/ZoneChip/ZoneChip.prompt.md":"901529fd81fc"},"inlinedExternals":[],"builtBy":"cc-design-sync"} */
"use strict";
var OasisDS = (() => {
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
        var o2 = {};
        for (var x in p2) if (x !== "children") o2[x] = p2[x];
        if (k !== void 0) o2.key = k;
        return o2;
      }
      function jsx(t2, p2, k) {
        var c2 = p2 && p2.children;
        return c2 === void 0 ? R.createElement(t2, np(p2, k)) : R.createElement(t2, np(p2, k), c2);
      }
      function jsxs(t2, p2, k) {
        return R.createElement.apply(R, [t2, np(p2, k)].concat(p2.children));
      }
      module.exports = R;
      module.exports.jsx = jsx;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t2, p2, k, s2) {
        return (s2 ? jsxs : jsx)(t2, p2, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // dist-ds/oasis-ds.js
  var oasis_ds_exports = {};
  __export(oasis_ds_exports, {
    CALENDAR_WEEK: () => s,
    CircularGauge: () => f,
    Initials: () => u,
    KIND_STYLE: () => o,
    LoadBar: () => g,
    OasisBlob: () => d,
    SW: () => n,
    SleepBars: () => m,
    Sparkline: () => p,
    StatTile: () => h,
    Tag: () => l,
    WeekCalendar: () => _,
    ZONE_LABEL: () => r,
    ZoneChip: () => c,
    zoneAccent: () => i,
    zoneTile: () => a
  });
  init_define_import_meta_env();
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var n = 2.25;
  var r = {
    green: "OPTIMAL",
    amber: "NEAR CAPACITY",
    red: "OVERLOADED"
  };
  var i = (e2) => `var(--zone-${e2}-accent)`;
  var a = (e2) => e2 === "green" ? "tile-mint" : e2 === "amber" ? "tile-butter" : "tile-blush";
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
        title: "DS A2 \u2014 start today",
        kind: "commitment",
        energy: -12
      }, {
        time: "3pm",
        title: "Study group \u2014 LinAlg",
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
  function c({ zone: t2, size: n2 = "sm" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: `zone-chip zone-${t2} ${n2 === "lg" ? "zone-chip-lg" : ""}`,
      children: r[t2]
    });
  }
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
  function u({ size: t2 = 40, initials: n2 = "MC" }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
      className: "inline-flex items-center justify-center shrink-0",
      style: {
        width: t2,
        height: t2,
        borderRadius: "50%",
        background: "var(--highlight)",
        border: "2px solid var(--ink)",
        color: "var(--ink)",
        fontFamily: "Archivo, sans-serif",
        fontWeight: 800,
        fontSize: t2 * 0.36,
        letterSpacing: "-0.02em"
      },
      children: n2
    });
  }
  function d({ zone: n2, size: r2 = 120, float: i2 = true }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
      className: i2 ? "blob-float" : void 0,
      width: r2,
      height: r2,
      viewBox: "0 0 200 200",
      role: "img",
      "aria-label": n2 === "green" ? "Mascot looking rested" : n2 === "amber" ? "Mascot looking strained" : "Mascot looking overloaded",
      style: {
        overflow: "visible",
        flexShrink: 0
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
          d: "M 100 14 C 143 12 174 44 179 86 C 185 130 156 174 111 183 C 66 192 25 163 17 120 C 9 76 41 22 100 14 Z",
          fill: n2 === "green" ? "var(--mint-deep)" : n2 === "amber" ? "var(--butter-deep)" : "var(--blush-deep)",
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
          d: n2 === "green" ? "M 76 116 Q 100 140 124 116" : n2 === "amber" ? "M 78 126 L 122 126" : "M 76 134 Q 100 112 124 134",
          fill: "none",
          stroke: "var(--ink)",
          strokeWidth: "4.5",
          strokeLinecap: "round"
        })
      ]
    });
  }
  function f({ value: n2, max: r2 = 100, zone: a2, label: o2, sublabel: s2, size: l2 = 136 }) {
    let u2 = Math.max(0, Math.min(1, n2 / r2)) * 360, d2 = Math.round(l2 * 0.7);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "flex flex-col items-center gap-3",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        style: {
          width: l2,
          height: l2,
          borderRadius: "50%",
          flexShrink: 0,
          background: `conic-gradient(${i(a2)} ${u2}deg, var(--surface) ${u2}deg 360deg)`,
          border: "2px solid var(--ink)",
          boxShadow: "var(--shadow-hard)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 700ms var(--ease)"
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          style: {
            width: d2,
            height: d2,
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
            style: { fontSize: l2 * 0.26 },
            children: o2
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-micro text-ink-muted",
            style: { marginTop: 4 },
            children: s2
          })]
        })
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, {
        zone: a2,
        size: "sm"
      })]
    });
  }
  function p({ values: t2, zone: n2 = "amber", height: r2 = 54 }) {
    let a2 = Math.min(...t2), o2 = Math.max(...t2) - a2 || 1;
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
      children: t2.map((r3, s2) => {
        let c2 = (r3 - a2) / o2 * 72 + 28, l2 = s2 === t2.length - 1;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
          flex: 1,
          borderRadius: 3,
          height: `${c2}%`,
          background: i(n2),
          opacity: l2 ? 1 : 0.4 + s2 / t2.length * 0.45,
          transition: "height 500ms var(--ease)"
        } }, s2);
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
        let a2 = n3.hours >= 7 ? "green" : n3.hours >= 6 ? "amber" : "red", o2 = n3.hours / 9 * 100;
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
              height: `${o2}%`,
              background: i(a2),
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
  function h({ variant: n2, icon: r2, label: i2, value: a2, unit: o2, note: s2, children: l2, zone: u2 }) {
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
          }), s2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-micro",
            style: { color: "var(--ink-2)" },
            children: s2
          })]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex items-baseline gap-1.5",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-stat text-ink",
            style: { fontSize: 46 },
            children: a2
          }), o2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "t-label",
            style: { color: "var(--ink-2)" },
            children: o2
          })]
        }),
        l2,
        u2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-auto pt-1",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, { zone: u2 })
        })
      ]
    });
  }
  function g({ label: n2, pct: r2, zone: a2 }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "flex flex-col gap-2",
      children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "flex items-center justify-between gap-3 flex-wrap",
        children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
          className: "t-label text-ink",
          children: n2
        }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex items-center gap-2",
          children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
            className: "t-stat",
            style: {
              fontSize: 16,
              color: "var(--ink)"
            },
            children: [r2, "%"]
          }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c, { zone: a2 })]
        })]
      }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "track",
        style: { height: 14 },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "bar-fill",
          style: {
            height: "100%",
            width: `${r2}%`,
            background: i(a2)
          }
        })
      })]
    });
  }
  function _({ selectedDate: n2, onDayClick: r2, days: i2 = s }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
      className: "grid grid-cols-7 gap-2 sm:gap-2.5",
      children: i2.map((i3) => {
        let a2 = n2 === i3.date;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
          onClick: () => r2(i3),
          className: "focus-ring press flex flex-col items-center justify-between p-2",
          style: {
            background: a2 ? "var(--highlight)" : i3.isToday ? "var(--sky)" : "var(--surface)",
            border: "2px solid var(--ink)",
            borderRadius: "var(--r-md)",
            boxShadow: a2 ? "var(--shadow-hard)" : "none",
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
              children: i3.day
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "t-stat text-ink",
              style: { fontSize: 26 },
              children: i3.date
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "flex items-center gap-1",
              children: i3.events.slice(0, 3).map((t2, n3) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
                width: 7,
                height: 7,
                borderRadius: 999,
                background: o[t2.kind].dot,
                border: "1.5px solid var(--ink)"
              } }, n3))
            })
          ]
        }, i3.date);
      })
    });
  }
  return __toCommonJS(oasis_ds_exports);
})();
window.OasisDS=OasisDS.__dsMainNs?Object.assign({},OasisDS,OasisDS.__dsMainNs,{__dsMainNs:undefined}):OasisDS;
