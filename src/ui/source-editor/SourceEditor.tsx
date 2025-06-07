import React from 'react'
import { TextArea } from './textarea'

type SourceEditorProps = React.ComponentProps<typeof TextArea>

const SourceEditor: React.FC<SourceEditorProps> = (props) => {
  return <TextArea {...props} />
}

export default SourceEditor
