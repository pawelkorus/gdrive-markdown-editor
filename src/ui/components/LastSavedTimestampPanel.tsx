import React from 'react'
import { Panel } from '../nav'

export default function LastSavedTimestampPanel({ lastSavedTimestamp }: { lastSavedTimestamp: Date }): React.ReactElement {
  return (
    <Panel>
      <span className="ms-1">
        <small className="text-success">
          Last saved at
          {lastSavedTimestamp.toLocaleString()}
        </small>
      </span>
    </Panel>
  )
}
