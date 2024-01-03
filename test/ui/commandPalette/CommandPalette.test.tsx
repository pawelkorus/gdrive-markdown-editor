import React from 'react';
import renderer from 'react-test-renderer';
// import { render, fireEvent } from '@testing-library/react';
import CommandPalette from '../../../src/ui/commandPalette/CommandPalette';
import { test, expect } from '@jest/globals';

test('renders hidden', () => {
    const commands = [{
        id: 'some-command',
        name: 'Some Command',
        execute: () => {}
    }];
    
    const component = renderer.create(<CommandPalette commands={commands}/>).toJSON();

    expect(component).toMatchSnapshot();
});
