import { renderHook } from '@testing-library/react';
import { CommandPaletteItem } from '../../../src/ui/commandPalette/types';
import useItemFilter from '../../../src/ui/commandPalette/useItemFilter';
import { test, expect } from '@jest/globals';
import { act } from 'react-dom/test-utils';

function prepareData():CommandPaletteItem[] {
    return [
        { name: 'aa', id: 'id1' }
        ,{ name: 'ab', id: 'id2' }
        ,{ name: 'bb', id: 'id3' }
    ];
}

test('should not filter any value if no filter called', () => {
    const items = prepareData();

    const { result } = renderHook(() => useItemFilter(items));

    const [filteredItems] = result.current;
    expect(filteredItems).toHaveLength(3);
    expect(filteredItems).toContainEqual({ name: 'aa', id: 'id1' });
    expect(filteredItems).toContainEqual({ name: 'ab', id: 'id2' });
    expect(filteredItems).toContainEqual({ name: 'bb', id: 'id3' });
});

test('should return items filtered by name - prefix', () => {
    const items = prepareData()

    const { result } = renderHook(() => useItemFilter(items));

    act(() => {
        const [, filter] = result.current;
        filter('a');
    });

    const [filteredItems] = result.current;
    expect(filteredItems).toHaveLength(2);
    expect(filteredItems).toContainEqual({ name: 'aa', id: 'id1' });
    expect(filteredItems).toContainEqual({ name: 'ab', id: 'id2' });
});

test('should return items filtered by name - suffix', () => {
    const items = prepareData()

    const { result } = renderHook(() => useItemFilter(items));

    act(() => {
        const [, filter] = result.current;
        filter('b');
    });

    const [filteredItems] = result.current;
    expect(filteredItems).toHaveLength(2);
    expect(filteredItems).toContainEqual({ name: 'ab', id: 'id2' });
    expect(filteredItems).toContainEqual({ name: 'bb', id: 'id3' });
});
