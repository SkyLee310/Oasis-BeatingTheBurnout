import { activeProject } from '../logic/group'
import { useOasis } from '../state/store'
import ProjectDetail from '../features/group/ProjectDetail'

// --- Group ------------------------------------------------------------------
// Group assignments go wrong in two specific ways: the split is lopsided and
// nobody says it, and half the tasks have no owner. The detail view shows both
// as numbers, then hands over a message that raises it for you -- the same move
// as the Decision Check, applied to a team instead of a request.
//
// This file is the routing between the list of assignments and one of them.
// Which project is open lives in the store, not here: a request answered from
// the inbox reads activeProject(state) to say which project it changed, so a
// selection held in local state would leave the app telling a teammate about a
// project the student is not looking at.

export default function GroupPage() {
  const state = useOasis()
  const project = activeProject(state)

  if (!project) {
    return (
      <div className="card p-5 max-w-[560px]">
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          No group projects yet. Open an invite link and the split appears here.
        </p>
      </div>
    )
  }

  return <ProjectDetail project={project} />
}
