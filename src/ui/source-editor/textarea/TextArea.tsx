import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import autosize from 'autosize'

type TextAreaProps = {
  value: string
  onChange?: (value: string) => void
}

export type TextAreaHandle = {
  insertText: (text: string) => void
}

const TextArea = forwardRef<TextAreaHandle, TextAreaProps>(({ value, onChange }, ref) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [textAreaKey, setTextAreaKey] = useState(0)

  const resizeTextArea = useCallback(() => {
    const textAreaRefCurrent = textAreaRef.current

    if (textAreaRefCurrent) {
      autosize(textAreaRefCurrent)
    }
  }, [])

  useEffect(() => {
    setTextAreaKey(prev => prev + 1)
  }, [value])

  useEffect(resizeTextArea, [textAreaKey])

  function onTextAreaValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      if (textAreaRef.current) {
        const start = textAreaRef.current.selectionStart
        const end = textAreaRef.current.selectionEnd
        const currentValue = textAreaRef.current.value

        textAreaRef.current.value = currentValue.slice(0, start) + text + currentValue.slice(end)
        textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + text.length

        if (onChange) {
          onChange(textAreaRef.current.value)
        }
      }
    },
  }))

  return (
    <textarea
      key={textAreaKey}
      ref={textAreaRef}
      style={{ margin: 0, border: 'none', outline: 'none', width: '100%' }}
      defaultValue={value}
      onChange={onTextAreaValueChange}
      rows={0}
      onInput={resizeTextArea}
    />
  )
})

export default TextArea
