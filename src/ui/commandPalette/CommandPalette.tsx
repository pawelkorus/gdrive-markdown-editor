import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import useItemFilter from './useItemFilter';
import { CommandPaletteItem } from './types';

interface CommandPaletteProps extends PropsWithChildren<{
    commands: CommandPaletteItem[]
    onItemSelected?: (commandPalleteItem: CommandPaletteItem) => void
}> {}

const CommandPalette: React.FC<CommandPaletteProps> = ({children, commands, onItemSelected}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [selected, setSelected] = useState(0);
    const [filteredCommands, byName] = useItemFilter(commands);
    const filterInputRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        if (filterInputRef.current) {
            filterInputRef.current.focus();
        }
    }, [filterInputRef]);

    function onKeydown(e: React.KeyboardEvent<Element>) {
        const key = e.key;

        if (key === "ArrowDown" && isVisible) {
            e.preventDefault();
            setSelected((s) => {
                console.log(s);
                return Math.min(s + 1, filteredCommands.length - 1)
            });
            return;
        }
        if (key === "ArrowUp" && isVisible) {
            e.preventDefault();
            setSelected((s) => {
                console.log(s)
                return Math.max(s - 1, 0)
            });
            return;
        }
        if (key === "Enter" && isVisible) {
            e.preventDefault();
            handleCommandSelected(filteredCommands[selected]);
            return;
        }
        if (key === "/" && !isVisible) {
            e.preventDefault();
            setIsVisible(true);
            return;
        }
        if(key === 'Escape' && isVisible) {
            e.preventDefault();
            setIsVisible(false)
        }
    }

    function handleCommandSelected(item:CommandPaletteItem) {
        setIsVisible(false);
        if (onItemSelected) {
            onItemSelected(item);
        }
    }

    function filterItemsByName(e: React.ChangeEvent<HTMLInputElement>) {
        byName(e.target.value);
        setSelected(0);
    }

    return (
<>
    <div onKeyDown={onKeydown}>
        {children}

        <Modal show={isVisible} fullscreen="sm-down">
            <ModalHeader>
                <input ref={filterInputRef} 
                    type="text" 
                    className="form-control" 
                    placeholder="Search..." 
                    onChange={filterItemsByName} 
                />
            </ModalHeader>
            <ModalBody>
                <ul className="list-group">
                {filteredCommands.map((item, i) => (
                        <li  key={i.toString()} 
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
    </div>
</>
    );
};

export default CommandPalette;
