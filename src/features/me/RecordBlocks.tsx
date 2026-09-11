import {
  Award,
  CalendarCheck,
  CheckCheck,
  Clock,
  HeartHandshake,
  History,
  Lock,
  Scale,
  Shield,
} from "lucide-react"
import type { ReactNode } from "react"

import { SW, Tag } from "../../ds"
import { recordFor } from "../../logic/record"
import { useDispatch, useOasis } from "../../state/store"
import type { PastProject } from "../../state/types"

// ─── Track record ─────────────────────────────────────────────────────────────
// The reason to open Oasis in week 9 rather than week 1: a history that is
// yours, that accrues, and that starting over would cost you.
//
// Two things this screen is not, and both are load-bearing:
//
//   It is not a scoreboard. No member is named on it but you, there is nothing
//   to compare against, and the app has no way to fetch anybody else's record —
//   see src/logic/record.ts, where the function only ever reads one state.
//
//   It is not a streak. Every figure is a count of something finished. Stopping
//   for a semester subtracts nothing, so there is no version of this screen that
//   punishes a student for having a hard term.
//
// The share toggle is the only control in the entire app that changes what
// another person can see, which is why it sits at the bottom behind its own
// stroke, off by default, and says in plain words what turning it on does.

const ACHIEVEMENT_ICON: Record<string, ReactNode> = {
  "a-rescued": <HeartHandshake size={16} strokeWidth={SW} />,
  "a-on-time": <CalendarCheck size={16} strokeWidth={SW} />,
  "a-heavy": <Scale size={16} strokeWidth={SW} />,
  "a-closed": <CheckCheck size={16} strokeWidth={SW} />,
  "a-terms": <History size={16} strokeWidth={SW} />,
}

export default function RecordBlocks() {
  const state = useOasis()
  const dispatch = useDispatch()

  const record = recordFor(state)
  const shared = state.record.shared
  const empty = record.projects.length === 0

  return (
    <>
      {empty ? (
        <div className="tile tile-cream" style={{ padding: 20, gap: 10 }}>
          <span className="t-label text-ink">Nothing finished yet</span>
          <p className="t-body max-w-[46ch]" style={{ color: "var(--ink-2)" }}>
            Your record fills in as group projects end — what you carried, what
            you closed, and whether it went in on time. Nothing here is written
            by anybody but the projects themselves.
          </p>
        </div>
      ) : (
        <>
          {/* ── The summary line ──────────────────────────────────────────
              Three figures rather than a sentence, because the three are the
              whole claim and a student should be able to read them at a
              glance. Together they are the line: three projects, 92% on time,
              34% of team weight carried. */}
          <div
            className="tile tile-cream grid grid-cols-3"
            style={{ padding: 0, gap: 0, overflow: "hidden" }}
          >
            <Stat value={String(record.projects.length)} label="projects" />
            <Stat value={`${record.onTimeRate}%`} label="on time" divide />
            <Stat
              value={`${record.weightShare}%`}
              label="of team weight"
              divide
            />
          </div>

          {/* ── Every project, one card each ──────────────────────────────── */}
          <section className="flex flex-col gap-3">
            <span className="t-eyebrow" style={{ color: "var(--ink-2)" }}>
              WHAT YOU FINISHED
            </span>
            <div className="flex flex-col gap-2">
              {record.projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>

          {/* ── Achievements ─────────────────────────────────────────────── */}
          {record.achievements.length > 0 && (
            <section className="flex flex-col gap-3">
              <span className="t-eyebrow" style={{ color: "var(--ink-2)" }}>
                WHAT THAT ADDS UP TO
              </span>
              <div className="flex flex-col gap-2">
                {record.achievements.map((a) => (
                  <div key={a.id} className="flex items-start gap-3">
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 34,
                        height: 34,
                        background: "var(--highlight)",
                        border: "2px solid var(--ink)",
                        borderRadius: "var(--r-sm)",
                        color: "var(--ink)",
                      }}
                    >
                      {ACHIEVEMENT_ICON[a.id] ?? (
                        <Award size={16} strokeWidth={SW} />
                      )}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="t-label text-ink">{a.label}</span>
                      <span
                        className="t-micro"
                        style={{ color: "var(--ink-muted)", lineHeight: 1.45 }}
                      >
                        {a.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── The only switch that changes what other people see ────────────── */}
      <div
        className="flex flex-col gap-3 p-4"
        style={{
          background: "var(--surface-2)",
          border: "2px solid var(--ink)",
          borderRadius: "var(--r-md)",
        }}
      >
        <div className="flex items-center gap-2">
          {shared ? (
            <Shield size={15} strokeWidth={SW} />
          ) : (
            <Lock size={15} strokeWidth={SW} />
          )}
          <span className="t-label text-ink">
            {shared ? "Shared with your group" : "Private"}
          </span>
        </div>

        <p
          className="t-micro"
          style={{ color: "var(--ink-2)", lineHeight: 1.55 }}
        >
          {shared
            ? "Your group can see this record — the three figures above and the projects behind them. Your energy score, your sleep and your check-ins are not part of it and never become shareable."
            : "Nobody can see this. Sharing it shows your group the figures above and the projects behind them — never your energy score, your sleep or your check-ins."}
        </p>

        <button
          className={`btn ${
            shared ? "btn-secondary" : "btn-primary"
          } focus-ring w-fit`}
          onClick={() => dispatch({ type: "toggleRecordShare" })}
          aria-pressed={shared}
        >
          {shared ? "Stop showing it" : "Show my record"}
        </button>

        <p
          className="t-micro"
          style={{ color: "var(--ink-muted)", lineHeight: 1.5 }}
        >
          No peer ratings. No leaderboard. Nothing here is visible unless you
          share it.
        </p>
      </div>
    </>
  )
}

/** One third of the summary line. */
function Stat({
  value,
  label,
  divide,
}: {
  value: string
  label: string
  divide?: boolean
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 py-4 px-2"
      style={divide ? { borderLeft: "1.5px solid var(--ink)" } : undefined}
    >
      <span className="t-stat text-ink" style={{ fontSize: 30, lineHeight: 1 }}>
        {value}
      </span>
      <span className="t-micro text-center" style={{ color: "var(--ink-2)" }}>
        {label}
      </span>
    </div>
  )
}

/**
 * One finished project. The late one is marked with a clock and the word
 * "Late", not a red fill: saturated hue means a health zone in this app, and a
 * hand-in date is not a health zone.
 */
function ProjectCard({ project }: { project: PastProject }) {
  return (
    <div
      className="flex flex-col gap-2 p-3"
      style={{
        background: "var(--surface)",
        border: "2px solid var(--ink)",
        borderRadius: "var(--r-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="t-label text-ink">{project.course}</span>
          <span className="t-micro" style={{ color: "var(--ink-muted)" }}>
            {project.title}
          </span>
        </div>
        <Tag>{project.term}</Tag>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-micro" style={{ color: "var(--ink-2)" }}>
          {project.weightShare}% of the weight
        </span>
        <span className="dot" aria-hidden="true" />
        <span className="t-micro" style={{ color: "var(--ink-2)" }}>
          {project.tasksDone} of {project.total} tasks closed
        </span>
        <span className="dot" aria-hidden="true" />
        <span
          className="t-micro inline-flex items-center gap-1"
          style={{ color: "var(--ink)", whiteSpace: "nowrap" }}
        >
          {project.onTime ? (
            <>
              <CheckCheck size={13} strokeWidth={SW} /> On time
            </>
          ) : (
            <>
              <Clock size={13} strokeWidth={SW} /> Late
            </>
          )}
        </span>
      </div>
    </div>
  )
}
