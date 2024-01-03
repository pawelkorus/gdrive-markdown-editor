import React from 'react';
import { render, fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';
import CommandPalette from '../../../src/ui/commandPalette/CommandPalette';

function prepareCommands() {
    const commands = [{
        id: 'aa',
        name: 'aa',
        execute: () => {}
    },
    {
        id: 'ab',
        name: 'ab',
        execute: () => {}
    },
    {
        id: 'bb',
        name: 'bb',
        execute: () => {}
    }];

    return commands;
}

test('command palette opens after pressing /', () => {   
    render(<CommandPalette commands={prepareCommands()}/>);

    expect(document.body).toMatchSnapshot();

    fireEvent.keyDown(document, { key: '/' });

    expect(document.body).toMatchSnapshot();
})

test('should execute callback after command is selected by keyboard', () => {
    const mockOnSelectCallback = jest.fn();

    render(<CommandPalette commands={prepareCommands()} onItemSelected={mockOnSelectCallback}/>);

    fireEvent.keyDown(document, { key: '/' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(mockOnSelectCallback).toHaveBeenCalledWith({id: 'ab', name: 'ab', execute: expect.any(Function)});
    waitForElementToBeRemoved(() => screen.getByRole('dialog'));
})

test('should execute callback after command is selected by mouse click', () => {
    const mockOnSelectCallback = jest.fn();

    render(<CommandPalette commands={prepareCommands()} onItemSelected={mockOnSelectCallback}/>);

    fireEvent.keyDown(document, { key: '/' });
    fireEvent.mouseDown(screen.getByText('ab'));

    expect(mockOnSelectCallback).toHaveBeenCalledWith({id: 'ab', name: 'ab', execute: expect.any(Function)});
    waitForElementToBeRemoved(() => screen.getByRole('dialog'));
})

test('should filter commands based on input value', () => {
    render(<CommandPalette commands={prepareCommands()} />);

    fireEvent.keyDown(document, { key: '/' });

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'a' } });

    expect(document.body).toMatchSnapshot();

    fireEvent.change(filterInput, { target: { value: 'aa' } });

    expect(document.body).toMatchSnapshot();
});

