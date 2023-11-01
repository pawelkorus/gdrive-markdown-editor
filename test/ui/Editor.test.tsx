import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Editor, { Props } from '../../src/ui/Editor';
import { test, expect, jest, afterEach } from '@jest/globals';


// create jest snapshot serializer that will replace all date strings values with a placeholder. Date strings will have format of "Last saved at 1/1/2021, 12:00:00 AM"
const customSnapshotSerializer = {
    test: (val:any) => {
        if(val.type == 'small' && val.props.className == 'text-success') return true
    },
    print: (val:any) => '<small>Last saved at</small>'
};

expect.addSnapshotSerializer(customSnapshotSerializer);

let component: renderer.ReactTestRenderer;

afterEach(() => {
    component.unmount()
});

test('renders without crashing', () => {
    const props:Props = {
        content: '',
        onSaveClicked: () => {},
        onCloseClicked: () => {},
        onTogglePreviewClicked: () => {}
    };
    component = renderer.create(<Editor {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders with content', () => {
    const props:Props = {
        content: 'Hello, world!',
        onSaveClicked: () => {},
        onCloseClicked: () => {},
        onTogglePreviewClicked: () => {}
    };
    component = renderer.create(<Editor {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('renders with preview enabled', () => {
    const mockOnTogglePreviewClicked = jest.fn();
    const props:Props = {
        content: 'Hello, world!',
        onSaveClicked: () => {},
        onCloseClicked: () => {},
        onTogglePreviewClicked: mockOnTogglePreviewClicked
    };
    component = renderer.create(<Editor {...props} />);
    act(() => {
        component.root.findByProps({id: 'btn-preview'}).props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('save button click', () => {
    const props:Props = {
        content: 'Hello, world!',
        onSaveClicked: () => {},
        onCloseClicked: () => {},
        onTogglePreviewClicked: () => {}
    };
    component = renderer.create(<Editor {...props} />);
    act(() => {
        component.root.findByProps({id: 'btn-save'}).props.onClick();
    });

    const tree = component.toJSON();

    // tree.replace(/Last saved at .+/, 'Last saved at 1/1/2021, 12:00:00 AM')
    expect(tree).toMatchSnapshot();
});

test('close button click', () => {
    const mockOnCloseClicked = jest.fn();
    const props:Props = {
        content: 'Hello, world!',
        onSaveClicked: () => {},
        onCloseClicked: mockOnCloseClicked,
        onTogglePreviewClicked: () => {}
    };
    component = renderer.create(<Editor {...props} />);
    act(() => {
        component.root.findByProps({id: 'btn-close'}).props.onClick();
    });

    expect(mockOnCloseClicked).toHaveBeenCalled();
});

test('preview button click', () => {
    const mockOnTogglePreviewClicked = jest.fn();
    const props:Props = {
        content: 'Hello, world!',
        onSaveClicked: () => {},
        onCloseClicked: () => {},
        onTogglePreviewClicked: mockOnTogglePreviewClicked
    };
    component = renderer.create(<Editor {...props} />);
    act(() => {
        component.root.findByProps({id: 'btn-preview'}).props.onClick();
    });

    expect(mockOnTogglePreviewClicked).toHaveBeenCalled();
});


