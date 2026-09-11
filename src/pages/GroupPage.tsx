import { useState } from 'react'

import { activeProject, sharesAcrossProjects } from '../logic/group'
import { useDispatch, useOasis } from '../state/store'
import ProjectList from '../features/group/ProjectList'
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
  const dispatch = useDispatch()
  const [view, setView] = useState<'list' | 'detail'>('list')

  const project = activeProject(state)

  // The list is the landing view, so an empty state belongs to it rather than
  // to this router -- ProjectList says what to do about having no assignments.
  if (view === 'list' || !project) {
    return (
      <ProjectList
        shares={sharesAcrossProjects(state)}
        onOpen={id => {
          dispatch({ type: 'selectProject', projectId: id })
          setView('detail')
        }}
      />
    )
  }

  return (
    <div key={project.id} className="page-section-enter">
      <ProjectDetail project={project} onBack={() => setView('list')} />
    </div>
  )
}
