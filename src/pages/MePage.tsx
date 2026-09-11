import { ArrowLeft, Lock } from 'lucide-react'

import { SW, Tag } from '../ds'
import { useDispatch, useOasis } from '../state/store'
import { BIO_MAX } from '../state/types'
import MeAvatar from '../features/me/MeAvatar'
import AvatarPicker from '../features/me/AvatarPicker'
import PatternCards from '../features/me/PatternCards'

// --- Me ---------------------------------------------------------------------
// A private mirror, not a profile card. There is no version of this screen
// anybody else can open, nothing on it is shareable, and the one switch in the
// app that changes what a teammate sees lives at the bottom of the record block
// where it always did -- off by default, saying in words what turning it on
// does.
//
// Four blocks, in this order: who you are, the pattern you recognise, what you
// have finished, and the projects behind it. There is deliberately no decision
// log: a list of everything you turned down, kept on the page about yourself,
// is a ledger of guilt.

export default function MePage({ onBack }: { onBack: () => void }) {
  const { profile } = useOasis()
  const dispatch = useDispatch()

  return (
    <div className="flex flex-col gap-6 max-w-[860px]">
      <button className="chip focus-ring hit-44 self-start show-mobile" onClick={onBack}>
        <ArrowLeft size={14} strokeWidth={SW} /> Home
      </button>

      {/* -- Who you are ------------------------------------------------- */}
      <section className="card p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <MeAvatar size={64} />
            <div className="flex flex-col gap-1 min-w-0">
              <label className="sr-only" htmlFor="me-name">Your name</label>
              <input
                id="me-name"
                value={profile.name}
                maxLength={24}
                onChange={e => dispatch({ type: 'setProfile', patch: { name: e.target.value } })}
                placeholder="Your name"
                className="t-title text-ink focus-ring"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontFamily: 'inherit',
                  width: '100%',
                  minWidth: 0,
                }}
              />
              <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                Your group sees this name on the split. Nothing else on this page.
              </span>
            </div>
          </div>
          <Tag><Lock size={13} strokeWidth={SW} /> PRIVATE</Tag>
        </div>

        <div className="flex flex-col gap-2">
          <label className="t-micro" htmlFor="me-bio" style={{ color: 'var(--ink-muted)' }}>
            About you
          </label>
          <textarea
            id="me-bio"
            value={profile.bio}
            maxLength={BIO_MAX}
            rows={2}
            onChange={e => dispatch({ type: 'setProfile', patch: { bio: e.target.value } })}
            placeholder="Year 2 CS. Three group projects running at once."
            className="t-body focus-ring w-full p-3"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'inherit',
              resize: 'none',
            }}
          />
          <span className="t-micro self-end" style={{ color: 'var(--ink-muted)' }}>
            {profile.bio.length}/{BIO_MAX}
          </span>
        </div>

        <AvatarPicker />
      </section>

      <PatternCards />
    </div>
  )
}
