import React, { PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { Modal, ModalBody, ModalHeader } from 'react-bootstrap'
import { CommandPaletteItem } from './types'

type CommandPaletteProps = PropsWithChildren<{
  commands: CommandPaletteItem[]
  onItemSelected?: (commandPalleteItem: CommandPaletteItem) => void
}>

const CommandPalette: React.FC<CommandPaletteProps> = ({ commands, children, onItemSelected }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [lastShiftTimestamp, setLastShiftTimestamp] = useState(0)
  const [selected, setSelected] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState([])
  const filterInputRef = React.createRef<HTMLInputElement>()

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key

    if (key === 'ArrowDown' && isVisible) {
      e.preventDefault()
      setSelected((s) => {
        return Math.min(s + 1, commands.length - 1)
      })
      return
    }
    if (key === 'ArrowUp' && isVisible) {
      e.preventDefault()
      setSelected((s) => {
        return Math.max(s - 1, 0)
      })
      return
    }
    if (key === 'Enter' && isVisible) {
      e.preventDefault()
      handleCommandSelected(filteredCommands[selected])
      return
    }
    if (key === 'Shift' && !isVisible) {
      if (Date.now() - lastShiftTimestamp < 300) {
        e.preventDefault()
        setLastShiftTimestamp(0)
        setIsVisible(true)
      }
      else {
        setLastShiftTimestamp(Date.now())
      }
      return
    }
    if (key === 'Escape' && isVisible) {
      e.preventDefault()
      setIsVisible(false)
    }
  }, [selected, isVisible, filteredCommands, lastShiftTimestamp])

  useEffect(() => {
    setFilteredCommands(commands)
  }, [commands, isVisible])

  useEffect(() => {
    if (filterInputRef.current) {
      filterInputRef.current.focus()
    }
  }, [filterInputRef])

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  function handleCommandSelected(item: CommandPaletteItem) {
    setIsVisible(false)
    if (onItemSelected) {
      onItemSelected(item)
    }
  }

  function filterItemsByName(e: React.ChangeEvent<HTMLInputElement>) {
    setFilteredCommands(commands.filter(command => command.name.toLowerCase().includes(e.target.value.toLowerCase())))
    setSelected(0)
  }

  return (
    <>
      {children}

      <Modal show={isVisible} fullscreen="sm-down">
        <ModalHeader>
          <input
            ref={filterInputRef}
            type="text"
            className="form-control"
            placeholder="Search..."
            onChange={filterItemsByName}
          />
        </ModalHeader>
        <ModalBody>
          <ul className="list-group">
            {filteredCommands.map((item, i) => (
              <li
                key={i.toString()}
                className={`list-group-item ${i === selected ? 'active' : ''}`}
                aria-current={i === selected ? true : false}
                onMouseDown={() => handleCommandSelected(item)}
                onMouseMove={() => setSelected(i)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </ModalBody>
      </Modal>
    </>
  )
}

export default CommandPalette
