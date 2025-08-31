import React, { useCallback, useRef } from 'react'
import { TextArea, TextAreaHandle } from './textarea'
import { useGdriveFile } from '@app/service/gdrivefile'
import { uploadFileToDrive } from '@app/google'

type SourceEditorProps = React.ComponentProps<typeof TextArea>

const SourceEditor: React.FC<SourceEditorProps> = (props) => {
  const textAreaRef = useRef<TextAreaHandle | null>(null)
  const [fileDetails] = useGdriveFile()
  
  const handleFileDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        const parentId = fileDetails.folderId // Assuming fileDetails contains the parent directory ID

        try {
          const uploadedFile = await uploadFileToDrive(file, parentId)
          textAreaRef.current.insertText(`::gdrive{src="${uploadedFile.id}"}`)
        } catch (error) {
          console.error('Error uploading file:', error)
        }
      }
    },
    [uploadFileToDrive, fileDetails],
  )

  return <div onDrop={handleFileDrop}>
    <TextArea {...props} ref={textAreaRef} />
  </div>
}

export default SourceEditor
