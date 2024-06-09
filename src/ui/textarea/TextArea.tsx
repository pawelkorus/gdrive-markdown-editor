import React, { useCallback, useEffect, useRef } from 'react'
import autosize from 'autosize'

interface TextAreaProps {
  value: string
  onChange?: (value: string) => void
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange }) => {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resizeTextArea = useCallback(() => {
    const textAreaRef = ref.current

    if (textAreaRef) {
      autosize(textAreaRef)
    }
  }, [])

  useEffect(resizeTextArea, [value])
  useEffect(resizeTextArea, [])

  function onTextAreaValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange && onChange(e.target.value)
  }

  return (
    <textarea
      ref={ref}
      style={{ margin: 0, padding: 0, border: 'none', outline: 'none' }}
      defaultValue={value}
      onChange={onTextAreaValueChange}
      rows={0}
      onInput={resizeTextArea}
    />
  )
}

export default TextArea
