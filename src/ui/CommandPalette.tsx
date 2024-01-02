import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import useCommandItemFilter from './useCommandItemFilter';

export type Item = {
    id: string,
    name: string
}

interface CommandPaletteProps {
    show: boolean;
    commands: Item[]
    onItemSelected?: (commandPalleteItem: Item) => void
}

const CommandPalette: React.FC<CommandPaletteProps> = ({show, commands, onItemSelected}) => {
    const [isVisible, setIsVisible] = useState(show);
    const [selected, setSelected] = useState(0);
    const [filteredCommands, byName] = useCommandItemFilter(commands);
    const filterInputRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    useEffect(() => {
        if (filterInputRef.current) {
            filterInputRef.current.focus();
        }
    }, [filterInputRef]);

    function onKeydown(e: React.KeyboardEvent<Element>) {
        const key = e.key;
        if (key === "ArrowDown") {
            e.preventDefault();
            setSelected((s) => {
                console.log(s);
                return Math.min(s + 1, filteredCommands.length - 1)
            });
            return;
        }
        if (key === "ArrowUp") {
            e.preventDefault();
            setSelected((s) => {
                console.log(s)
                return Math.max(s - 1, 0)
            });
            return;
        }
        if (key === "Enter") {
            e.preventDefault();
            if (onItemSelected) {
                onItemSelected(filteredCommands[selected]);
            }
            return;
        }
    }

    function filterItemsByName(e: React.ChangeEvent<HTMLInputElement>) {
        byName(e.target.value);
        setSelected(0);
    }

    return (
        <Modal show={isVisible} fullscreen="sm-down">
            <ModalHeader>
                <input ref={filterInputRef} 
                    type="text" 
                    className="form-control" 
                    placeholder="Search..." 
                    onChange={filterItemsByName} 
                    onKeyDown={onKeydown}
                />
            </ModalHeader>
            <ModalBody>
                <ul className="list-group">
                {filteredCommands.map((item, i) => (
                        <li  key={i.toString()} 
                            className={`list-group-item ${i === selected ? 'active' : ''}`} 
                            aria-current={i === selected ? true : false} 
                            onMouseDown={() => onItemSelected && onItemSelected(item)}
                            onMouseMove={() => setSelected(i)}
                            >
                            {item.name}
                        </li>
                        ))}
                </ul>
            </ModalBody>
        </Modal>
    );
};

export default CommandPalette;
