import React, { useCallback, useEffect, useRef, useState } from 'react'
import autosize from 'autosize'

type TextAreaProps = {
  value: string
  onChange?: (value: string) => void
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange }) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [textAreaKey, setTextAreaKey] = useState(0)

  const resizeTextArea = useCallback(() => {
    console.log('resizeTextArea')
    const textAreaRef = ref.current

    if (textAreaRef) {
      autosize(textAreaRef)
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

  return (
    <textarea
      key={textAreaKey}
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
