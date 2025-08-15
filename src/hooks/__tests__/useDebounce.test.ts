import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'changed', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed');
  });

  it('should debounce number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 100, delay: 300 });
    expect(result.current).toBe(0);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(100);
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'changed' });
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed');
  });

  it('should cancel previous timeout when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    );

    // Change value multiple times rapidly
    rerender({ value: 'changed1', delay: 1000 });
    rerender({ value: 'changed2', delay: 1000 });
    rerender({ value: 'changed3', delay: 1000 });

    expect(result.current).toBe('initial');

    // Advance time but not enough to trigger the first change
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('initial');

    // Advance time to trigger the last change
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('changed3');
  });

  it('should handle object values', () => {
    const initialObj = { name: 'John', age: 30 };
    const changedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: changedObj, delay: 200 });
    expect(result.current).toEqual(initialObj);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toEqual(changedObj);
  });

  it('should handle array values', () => {
    const initialArray = [1, 2, 3];
    const changedArray = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialArray, delay: 150 } }
    );

    expect(result.current).toEqual(initialArray);

    rerender({ value: changedArray, delay: 150 });
    expect(result.current).toEqual(initialArray);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(result.current).toEqual(changedArray);
  });
});
