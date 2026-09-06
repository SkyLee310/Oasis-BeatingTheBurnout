import { useState } from 'react'
import { ThemeProvider } from '@figma/astraui'
import {
  Calendar, HelpCircle, Home, Mic, Shield, Users,
} from 'lucide-react'

// ─── Design system ────────────────────────────────────────────────────────────
// Every primitive below is published from src/ds/index.ts. Screens live in
// src/pages and feature UI in src/features; this file is the shell and the
// navigation that switches between them.
import { Initials, OasisBlob, SW } from './ds'

import { OasisProvider, useEnergy } from './state/store'

import DashboardPage from './pages/DashboardPage'
import SmartBandPage from './pages/BandPage'
import LoadPage from './pages/LoadPage'
import RecoveryPage from './pages/RecoveryPage'
import GroupPage from './pages/GroupPage'
import JoinLanding from './features/group/JoinLanding'
import WidgetPreview from './features/widget/WidgetPreview'
import WidgetView from './features/widget/WidgetView'
import HowItWorksPage from './pages/HowItWorksPage'
import ScenarioBar, { demoMode } from './features/demo/ScenarioBar'
import { useAmbientTemp } from './features/shell/useAmbientTemp'
import VoiceAssistantPanel from './features/assistant/VoiceAssistantPanel'
import VoiceSheet from './features/assistant/VoiceSheet'

// ─── App-only types ───────────────────────────────────────────────────────────
type Page = 'dashboard' | 'band' | 'load' | 'recovery' | 'group' | 'phone' | 'how'

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Page; icon: React.ReactNode; label: string; short: string }[] = [
  { id: 'dashboard', icon: <Home size={20} strokeWidth={SW} />, label: 'Dashboard', short: 'Home' },
  { id: 'load', icon: <Calendar size={20} strokeWidth={SW} />, label: 'Schedule & load', short: 'Schedule' },
  { id: 'group', icon: <Users size={20} strokeWidth={SW} />, label: 'Group project', short: 'Group' },
  { id: 'recovery', icon: <Shield size={20} strokeWidth={SW} />, label: 'Recovery', short: 'Recover' },
]

// Smart band keeps its page — it is reached from the Home card rather than the
// bar, because the group project earns the fourth slot and a wearable readout
// is something you check once a day, not something you navigate to.

/**
 * Routing, such as it is: one read of the query string at mount. ?join=<code>
 * replaces the whole shell with the invite landing, which is what makes the
 * download loop demonstrable on a second phone.
 */
function joinCode(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('join')
}

/** ?view=widget — what the installed app opens to. Read once, at mount. */
function widgetMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('view') === 'widget'
}

function SideRail({ page, onPage }: { page: Page; onPage: (p: Page) => void }) {
  return (
    <aside
      className="hide-mobile flex-col items-center justify-between py-5 px-3 shrink-0"
      style={{ width: 78, background: 'var(--surface)', borderRight: '2px solid var(--ink)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <OasisBlob zone="green" size={40} float={false} />

        <div className="flex flex-col gap-2 mt-2">
          {NAV_ITEMS.map(it => {
            const active = page === it.id
            return (
              <button
                key={it.id}
                onClick={() => onPage(it.id)}
                title={it.label}
                aria-label={it.label}
                aria-current={active ? 'page' : undefined}
                className="focus-ring press flex items-center justify-center"
                style={{
                  width: 46, height: 46, borderRadius: 'var(--r-md)',
                  background: active ? 'var(--highlight)' : 'var(--surface)',
                  border: '2px solid var(--ink)',
                  boxShadow: active ? 'var(--shadow-hard-sm)' : 'none',
                  color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                {it.icon}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* Was a dead settings button. A control that does nothing is worse
            than no control at all when you reach it with a keyboard. */}
        <button
          className="btn-icon focus-ring"
          aria-label="Where the numbers come from"
          aria-current={page === 'how' ? 'page' : undefined}
          onClick={() => onPage('how')}
          style={{ width: 40, height: 40 }}
        >
          <HelpCircle size={18} strokeWidth={SW} />
        </button>
        <Initials size={40} />
      </div>
    </aside>
  )
}

function MobileNav({
  page, onPage, onOpenVoice, isVoiceOpen,
}: {
  page: Page
  onPage: (p: Page) => void
  onOpenVoice: () => void
  isVoiceOpen: boolean
}) {
  // No aria-label here, unlike the side rail: the short text below is visible,
  // so it is already the accessible name. Naming this "Recovery" while the
  // label reads "Recover" breaks voice control — you say what you can see.
  const renderItem = (it: typeof NAV_ITEMS[number]) => {
    const active = page === it.id
    return (
      <button
        key={it.id}
        onClick={() => onPage(it.id)}
        aria-current={active ? 'page' : undefined}
        className="focus-ring flex flex-col items-center justify-center flex-1 gap-1"
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px 0', fontFamily: 'inherit' }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: 40, height: 30, borderRadius: 'var(--r-pill)',
            background: active ? 'var(--highlight)' : 'transparent',
            border: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
            color: 'var(--ink)',
            transition: 'background-color 0.2s var(--ease)',
          }}
        >
          {it.icon}
        </span>
        <span className="t-micro" style={{ color: 'var(--ink)', fontWeight: active ? 800 : 600, fontSize: 10 }}>
          {it.short}
        </span>
      </button>
    )
  }

  return (
    <nav
      className="flex items-center justify-around show-mobile"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        height: 70, paddingLeft: 8, paddingRight: 8,
        background: 'var(--surface)', borderTop: '2px solid var(--ink)',
      }}
    >
      {NAV_ITEMS.slice(0, 2).map(renderItem)}

      {/* Prominent Oasis AI button */}
      <div className="flex items-center justify-center flex-1" style={{ position: 'relative', height: '100%' }}>
        <button
          onClick={onOpenVoice}
          aria-label="Oasis AI"
          className="focus-ring flex items-center justify-center"
          style={{
            position: 'absolute', top: -20,
            width: 58, height: 58, borderRadius: '50%',
            background: isVoiceOpen ? 'var(--bold-orange)' : 'var(--highlight)',
            border: '2.5px solid var(--ink)',
            boxShadow: 'var(--shadow-hard)',
            color: 'var(--ink)', cursor: 'pointer',
            transition: 'transform 0.16s var(--ease), background-color 0.2s var(--ease)',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)' }}
          onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
          onTouchStart={e => { e.currentTarget.style.transform = 'translate(2px, 2px)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'none' }}
        >
          <Mic size={25} strokeWidth={2.5} />
        </button>
      </div>

      {NAV_ITEMS.slice(2).map(renderItem)}
    </nav>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <OasisProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </OasisProvider>
  )
}

function AppShell() {
  const [page, setPage] = useState<Page>('dashboard')
  const [showVoice, setShowVoice] = useState(false)
  const [join, setJoin] = useState<string | null>(joinCode)
  const [widget, setWidget] = useState(widgetMode)
  const [demo] = useState(demoMode)

  // One number for the whole app. src/index.css mixes the canvas and surface
  // tokens from it; nothing below here knows a colour changed.
  const { temp } = useEnergy()
  // --temp is stepped onto this node frame by frame; see useAmbientTemp.
  const ambient = useAmbientTemp<HTMLDivElement>(temp)

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage onGoLoad={() => setPage('load')} onGoRecovery={() => setPage('recovery')} onGoBand={() => setPage('band')} onGoPhone={() => setPage('phone')} onGoHow={() => setPage('how')} />
      case 'band':      return <SmartBandPage onBack={() => setPage('dashboard')} />
      case 'load':      return <LoadPage />
      case 'recovery':  return <RecoveryPage />
      case 'group':     return <GroupPage />
      case 'phone':     return <WidgetPreview onBack={() => setPage('dashboard')} />
      case 'how':       return <HowItWorksPage onBack={() => setPage('dashboard')} />
    }
  }

  // The widget opens without the shell — it is a glance, not a session.
  if (widget) {
    return (
      <div ref={ambient} data-ambient className="h-full overflow-y-auto">
        <main>
          <WidgetView onOpen={() => setWidget(false)} />
        </main>
      </div>
    )
  }

  // The invite link arrives cold — no shell, no nav, just the project.
  if (join !== null) {
    return (
      <div ref={ambient} data-ambient className="h-full overflow-y-auto">
        <main>
          <JoinLanding
            code={join}
            onEnter={() => {
              // Drop ?join= on the way in. Without this the first reload after
              // joining lands back on the invite screen, asking a teammate to
              // join a project they are already on.
              window.history.replaceState(null, '', window.location.pathname)
              setJoin(null)
              setPage('group')
            }}
          />
        </main>
      </div>
    )
  }

  return (
    <div ref={ambient} data-ambient className="h-full">
      <div className="flex h-full overflow-hidden bg-canvas">
        <SideRail page={page} onPage={setPage} />

        <div className="flex flex-1 overflow-hidden">
          {/* The one main landmark. The skip link injected by site.json jumps to
              #root; this is what makes "skip to content" skip anything. */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-9" style={{ paddingBottom: 96 }}>
            <div key={page} className="page-section-enter min-h-full">
              {renderPage()}
            </div>
          </main>

          {/* Voice panel — desktop column */}
          <div
            className="hide-mobile flex-col shrink-0"
            style={{ width: 360, minWidth: 320, maxWidth: 400, borderLeft: '2px solid var(--ink)' }}
          >
            <VoiceAssistantPanel />
          </div>

          {/* Voice panel — mobile sheet */}
          {showVoice && <VoiceSheet onClose={() => setShowVoice(false)} />}
        </div>
      </div>

      <MobileNav
        page={page}
        onPage={setPage}
        onOpenVoice={() => setShowVoice(prev => !prev)}
        isVoiceOpen={showVoice}
      />

      {/* Scaffolding, deliberately last and deliberately hidden. */}
      <ScenarioBar startOpen={demo} />
    </div>
  )
}
