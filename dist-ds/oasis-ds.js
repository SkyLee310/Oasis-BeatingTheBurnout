import { jsx as e, jsxs as t } from "react/jsx-runtime";
//#region src/ds/tokens.ts
var n = 2.25, r = {
	green: "OPTIMAL",
	amber: "NEAR CAPACITY",
	red: "OVERLOADED"
}, i = (e) => `var(--zone-${e}-accent)`, a = (e) => e === "green" ? "tile-mint" : e === "amber" ? "tile-butter" : "tile-blush", o = {
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
}, s = [
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
		isToday: !0,
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
//#endregion
//#region src/ds/ZoneChip.tsx
function c({ zone: t, size: n = "sm" }) {
	return /* @__PURE__ */ e("span", {
		className: `zone-chip zone-${t} ${n === "lg" ? "zone-chip-lg" : ""}`,
		children: r[t]
	});
}
//#endregion
//#region src/ds/Tag.tsx
function l({ children: t, tone: n = "neutral" }) {
	return /* @__PURE__ */ e("span", {
		className: "inline-flex w-fit items-center gap-1.5 t-micro",
		style: {
			background: n === "yellow" ? "var(--highlight)" : n === "green" ? "var(--zone-green-bg)" : n === "amber" ? "var(--zone-amber-bg)" : n === "red" ? "var(--zone-red-bg)" : "var(--surface)",
			color: n === "green" ? "var(--zone-green-text)" : n === "amber" ? "var(--zone-amber-text)" : n === "red" ? "var(--zone-red-text)" : "var(--ink)",
			border: "1.5px solid var(--ink)",
			borderRadius: "var(--r-pill)",
			padding: "4px 11px",
			fontWeight: 800,
			whiteSpace: "nowrap"
		},
		children: t
	});
}
//#endregion
//#region src/ds/Initials.tsx
function u({ size: t = 40, initials: n = "MC" }) {
	return /* @__PURE__ */ e("span", {
		className: "inline-flex items-center justify-center shrink-0",
		style: {
			width: t,
			height: t,
			borderRadius: "50%",
			background: "var(--highlight)",
			border: "2px solid var(--ink)",
			color: "var(--ink)",
			fontFamily: "Archivo, sans-serif",
			fontWeight: 800,
			fontSize: t * .36,
			letterSpacing: "-0.02em"
		},
		children: n
	});
}
//#endregion
//#region src/ds/OasisBlob.tsx
function d({ zone: n, size: r = 120, float: i = !0 }) {
	return /* @__PURE__ */ t("svg", {
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
			/* @__PURE__ */ e("path", {
				d: "M 100 14 C 143 12 174 44 179 86 C 185 130 156 174 111 183 C 66 192 25 163 17 120 C 9 76 41 22 100 14 Z",
				fill: n === "green" ? "var(--mint-deep)" : n === "amber" ? "var(--butter-deep)" : "var(--blush-deep)",
				stroke: "var(--ink)",
				strokeWidth: "4",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ e("ellipse", {
				cx: "60",
				cy: "118",
				rx: "11",
				ry: "7",
				fill: "var(--blush)",
				stroke: "var(--ink)",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ e("ellipse", {
				cx: "140",
				cy: "118",
				rx: "11",
				ry: "7",
				fill: "var(--blush)",
				stroke: "var(--ink)",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ e("ellipse", {
				cx: "74",
				cy: "88",
				rx: "9",
				ry: "12",
				fill: "var(--ink)"
			}),
			/* @__PURE__ */ e("ellipse", {
				cx: "126",
				cy: "88",
				rx: "9",
				ry: "12",
				fill: "var(--ink)"
			}),
			/* @__PURE__ */ e("circle", {
				cx: "77",
				cy: "83",
				r: "3.2",
				fill: "#ffffff"
			}),
			/* @__PURE__ */ e("circle", {
				cx: "129",
				cy: "83",
				r: "3.2",
				fill: "#ffffff"
			}),
			/* @__PURE__ */ e("path", {
				d: n === "green" ? "M 76 116 Q 100 140 124 116" : n === "amber" ? "M 78 126 L 122 126" : "M 76 134 Q 100 112 124 134",
				fill: "none",
				stroke: "var(--ink)",
				strokeWidth: "4.5",
				strokeLinecap: "round"
			})
		]
	});
}
//#endregion
//#region src/ds/CircularGauge.tsx
function f({ value: n, max: r = 100, zone: a, label: o, sublabel: s, size: l = 136 }) {
	let u = Math.max(0, Math.min(1, n / r)) * 360, d = Math.round(l * .7);
	return /* @__PURE__ */ t("div", {
		className: "flex flex-col items-center gap-3",
		children: [/* @__PURE__ */ e("div", {
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
			children: /* @__PURE__ */ t("div", {
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
				children: [/* @__PURE__ */ e("span", {
					className: "t-stat text-ink",
					style: { fontSize: l * .26 },
					children: o
				}), /* @__PURE__ */ e("span", {
					className: "t-micro text-ink-muted",
					style: { marginTop: 4 },
					children: s
				})]
			})
		}), /* @__PURE__ */ e(c, {
			zone: a,
			size: "sm"
		})]
	});
}
//#endregion
//#region src/ds/Sparkline.tsx
function p({ values: t, zone: n = "amber", height: r = 54 }) {
	let a = Math.min(...t), o = Math.max(...t) - a || 1;
	return /* @__PURE__ */ e("div", {
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
		children: t.map((r, s) => {
			let c = (r - a) / o * 72 + 28, l = s === t.length - 1;
			return /* @__PURE__ */ e("div", { style: {
				flex: 1,
				borderRadius: 3,
				height: `${c}%`,
				background: i(n),
				opacity: l ? 1 : .4 + s / t.length * .45,
				transition: "height 500ms var(--ease)"
			} }, s);
		})
	});
}
//#endregion
//#region src/ds/SleepBars.tsx
function m({ data: n, height: r = 76 }) {
	return /* @__PURE__ */ e("div", {
		style: {
			display: "flex",
			alignItems: "flex-end",
			gap: 6,
			width: "100%",
			height: r
		},
		children: n.map((n) => {
			let a = n.hours >= 7 ? "green" : n.hours >= 6 ? "amber" : "red", o = n.hours / 9 * 100;
			return /* @__PURE__ */ t("div", {
				style: {
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 5,
					height: r
				},
				children: [/* @__PURE__ */ e("div", {
					style: {
						flex: 1,
						width: "100%",
						borderRadius: "var(--r-sm)",
						border: `${n.isToday ? 2 : 1.5}px solid var(--ink)`,
						background: "var(--surface)",
						boxShadow: n.isToday ? "2px 2px 0 var(--ink)" : "none",
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
						overflow: "hidden",
						padding: 2
					},
					children: /* @__PURE__ */ e("div", { style: {
						width: "100%",
						height: `${o}%`,
						background: i(a),
						borderRadius: 6,
						transition: "height 600ms var(--ease)"
					} })
				}), /* @__PURE__ */ e("span", {
					className: "t-micro",
					style: {
						fontWeight: n.isToday ? 800 : 600,
						color: n.isToday ? "var(--ink)" : "var(--ink-muted)"
					},
					children: n.day
				})]
			}, n.day);
		})
	});
}
//#endregion
//#region src/ds/StatTile.tsx
function h({ variant: n, icon: r, label: i, value: a, unit: o, note: s, children: l, zone: u }) {
	return /* @__PURE__ */ t("div", {
		className: `tile tile-${n} card-pop`,
		children: [
			/* @__PURE__ */ t("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ t("span", {
					className: "inline-flex items-center gap-2 t-eyebrow",
					style: { color: "var(--ink)" },
					children: [
						r,
						" ",
						i
					]
				}), s && /* @__PURE__ */ e("span", {
					className: "t-micro",
					style: { color: "var(--ink-2)" },
					children: s
				})]
			}),
			/* @__PURE__ */ t("div", {
				className: "flex items-baseline gap-1.5",
				children: [/* @__PURE__ */ e("span", {
					className: "t-stat text-ink",
					style: { fontSize: 46 },
					children: a
				}), o && /* @__PURE__ */ e("span", {
					className: "t-label",
					style: { color: "var(--ink-2)" },
					children: o
				})]
			}),
			l,
			u && /* @__PURE__ */ e("div", {
				className: "mt-auto pt-1",
				children: /* @__PURE__ */ e(c, { zone: u })
			})
		]
	});
}
//#endregion
//#region src/ds/LoadBar.tsx
function g({ label: n, pct: r, zone: a }) {
	return /* @__PURE__ */ t("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ t("div", {
			className: "flex items-center justify-between gap-3 flex-wrap",
			children: [/* @__PURE__ */ e("span", {
				className: "t-label text-ink",
				children: n
			}), /* @__PURE__ */ t("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ t("span", {
					className: "t-stat",
					style: {
						fontSize: 16,
						color: "var(--ink)"
					},
					children: [r, "%"]
				}), /* @__PURE__ */ e(c, { zone: a })]
			})]
		}), /* @__PURE__ */ e("div", {
			className: "track",
			style: { height: 14 },
			children: /* @__PURE__ */ e("div", {
				className: "bar-fill",
				style: {
					height: "100%",
					width: `${r}%`,
					background: i(a)
				}
			})
		})]
	});
}
//#endregion
//#region src/ds/WeekCalendar.tsx
function _({ selectedDate: n, onDayClick: r, days: i = s }) {
	return /* @__PURE__ */ e("div", {
		className: "grid grid-cols-7 gap-2 sm:gap-2.5",
		children: i.map((i) => {
			let a = n === i.date;
			return /* @__PURE__ */ t("button", {
				onClick: () => r(i),
				className: "focus-ring press flex flex-col items-center justify-between p-2",
				style: {
					background: a ? "var(--highlight)" : i.isToday ? "var(--sky)" : "var(--surface)",
					border: "2px solid var(--ink)",
					borderRadius: "var(--r-md)",
					boxShadow: a ? "var(--shadow-hard)" : "none",
					minHeight: 92,
					cursor: "pointer"
				},
				children: [
					/* @__PURE__ */ e("span", {
						className: "t-eyebrow",
						style: {
							color: "var(--ink)",
							fontSize: 10
						},
						children: i.day
					}),
					/* @__PURE__ */ e("span", {
						className: "t-stat text-ink",
						style: { fontSize: 26 },
						children: i.date
					}),
					/* @__PURE__ */ e("div", {
						className: "flex items-center gap-1",
						children: i.events.slice(0, 3).map((t, n) => /* @__PURE__ */ e("span", { style: {
							width: 7,
							height: 7,
							borderRadius: 999,
							background: o[t.kind].dot,
							border: "1.5px solid var(--ink)"
						} }, n))
					})
				]
			}, i.date);
		})
	});
}
//#endregion
export { s as CALENDAR_WEEK, f as CircularGauge, u as Initials, o as KIND_STYLE, g as LoadBar, d as OasisBlob, n as SW, m as SleepBars, p as Sparkline, h as StatTile, l as Tag, _ as WeekCalendar, r as ZONE_LABEL, c as ZoneChip, i as zoneAccent, a as zoneTile };

//# sourceMappingURL=oasis-ds.js.map