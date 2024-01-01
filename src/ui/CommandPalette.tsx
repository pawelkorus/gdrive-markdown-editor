import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

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

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    function onKeydown(e: React.KeyboardEvent<Element>) {
        const key = e.key;
        if (key === "ArrowDown") {
            e.preventDefault();
            setSelected((s) => {
                console.log(s);
                return Math.min(s + 1, commands.length - 1)
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
                onItemSelected(commands[selected]);
            }
            return;
        }
    }

    return (
        <Modal show={isVisible}>
            <Modal.Body onKeyDown={onKeydown}>
                <div className="list-group">
                {commands.map((item, i) => (
                        <a  key={i.toString()} 
                            href="#" 
                            className={`list-group-item list-group-item-action ${i === selected ? 'active' : ''}`} 
                            aria-current={i === selected ? true : false} 
                            onMouseDown={() => onItemSelected && onItemSelected(item)}
                            onMouseMove={() => setSelected(i)}
                            >
                            {item.name}
                        </a>
                        ))}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CommandPalette;
