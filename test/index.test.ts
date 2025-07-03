import { EnhancedEventBus, createEventBus } from '../src/index';

describe('EnhancedEventBus', () => {
  let eventBus: EnhancedEventBus;

  beforeEach(() => {
    eventBus = new EnhancedEventBus();
  });

  afterEach(() => {
    eventBus.destroy();
  });

  describe('Basic Functionality Tests', () => {
    test('should create EnhancedEventBus instance', () => {
      expect(eventBus).toBeInstanceOf(EnhancedEventBus);
    });

    test('should create instance via createEventBus factory function', () => {
      const bus = createEventBus();
      expect(bus).toBeInstanceOf(EnhancedEventBus);
      bus.destroy();
    });
  });

  describe('Event Listening and Emitting', () => {
    test('should listen and emit events', (done) => {
      const testData = { message: 'hello world' };

      eventBus.on('test-event', (data) => {
        expect(data).toEqual(testData);
        done();
      });

      eventBus.emit('test-event', testData);
    });

    test('should listen to multiple handlers for same event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const testData = { value: 42 };

      eventBus.on('multi-event', handler1);
      eventBus.on('multi-event', handler2);
      eventBus.emit('multi-event', testData);

      expect(handler1).toHaveBeenCalledWith(testData);
      expect(handler2).toHaveBeenCalledWith(testData);
    });

    test('should listen to different event types', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);

      eventBus.emit('event1', 'data1');
      eventBus.emit('event2', 'data2');

      expect(handler1).toHaveBeenCalledWith('data1');
      expect(handler2).toHaveBeenCalledWith('data2');
    });

    test('should support Symbol type event names', () => {
      const symbolEvent = Symbol('test-symbol');
      const handler = jest.fn();
      const testData = { symbol: true };

      eventBus.on(symbolEvent, handler);
      eventBus.emit(symbolEvent, testData);

      expect(handler).toHaveBeenCalledWith(testData);
    });

    test('should receive events even when emitted before listening (core feature)', (done) => {
      const testData = { message: 'I was emitted first!' };
      
      eventBus.emit('late-listener-event', testData);
      
      eventBus.on('late-listener-event', (data) => {
        expect(data).toEqual(testData);
        done();
      });
    });

    test('should handle multiple emit-then-on scenarios', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.emit('event-a', 'data-a');
      eventBus.emit('event-b', 'data-b');
      
      eventBus.on('event-a', handler1);
      eventBus.on('event-b', handler2);
      
      expect(handler1).toHaveBeenCalledWith('data-a');
      expect(handler2).toHaveBeenCalledWith('data-b');
    });

    test('should get latest value when multiple emits happened before listening', () => {
      const handler = jest.fn();
      
      eventBus.emit('sequence-event', 'first');
      eventBus.emit('sequence-event', 'second');
      eventBus.emit('sequence-event', 'third');
      
      eventBus.on('sequence-event', handler);
      
      expect(handler).toHaveBeenCalledWith('third');
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unsubscribe Functionality', () => {
    test('should remove all listeners for specific event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('cancel-event', handler1);
      eventBus.on('cancel-event', handler2);

      eventBus.off('cancel-event');
      eventBus.emit('cancel-event', 'test');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    test('should clear all event listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);

      eventBus.off(); // Clear all listeners

      eventBus.emit('event1', 'data1');
      eventBus.emit('event2', 'data2');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    test('clear() method should remove all listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('clear-event1', handler1);
      eventBus.on('clear-event2', handler2);

      eventBus.clear();

      eventBus.emit('clear-event1', 'data1');
      eventBus.emit('clear-event2', 'data2');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Current Value Retrieval', () => {
    test('should get current value of event', () => {
      const testData = { current: 'value' };

      eventBus.emit('current-event', testData);
      const currentValue = eventBus.getCurrentValue('current-event');

      expect(currentValue).toEqual(testData);
    });

    test('should return undefined for non-emitted events', () => {
      const currentValue = eventBus.getCurrentValue('non-existent-event');
      expect(currentValue).toBeUndefined();
    });

    test('should return last emitted value', () => {
      eventBus.emit('update-event', 'first');
      eventBus.emit('update-event', 'second');
      eventBus.emit('update-event', 'third');

      const currentValue = eventBus.getCurrentValue('update-event');
      expect(currentValue).toBe('third');
    });
  });

  describe('Listener State Checking', () => {
    test('hasListeners() should correctly check for listeners', () => {
      expect(eventBus.hasListeners('test-event')).toBe(false);

      const handler = jest.fn();
      eventBus.on('test-event', handler);

      expect(eventBus.hasListeners('test-event')).toBe(true);

      eventBus.off('test-event');
      expect(eventBus.hasListeners('test-event')).toBe(false);
    });

    test('getListenerCount() should return correct listener count', () => {
      expect(eventBus.getListenerCount('count-event')).toBe(0);

      eventBus.on('count-event', jest.fn());
      expect(eventBus.getListenerCount('count-event')).toBe(1);

      eventBus.on('count-event', jest.fn());
      expect(eventBus.getListenerCount('count-event')).toBe(2);

      eventBus.on('count-event', jest.fn());
      expect(eventBus.getListenerCount('count-event')).toBe(3);

      eventBus.off('count-event');
      expect(eventBus.getListenerCount('count-event')).toBe(0);
    });
  });

  describe('Destroy Functionality', () => {
    test('destroy() should clean up all resources', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on('destroy-event1', handler1);
      eventBus.on('destroy-event2', handler2);

      eventBus.destroy();

      eventBus.emit('destroy-event1', 'data1');
      eventBus.emit('destroy-event2', 'data2');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(eventBus.hasListeners('destroy-event1')).toBe(false);
      expect(eventBus.hasListeners('destroy-event2')).toBe(false);
    });
  });

  describe('Edge Case Tests', () => {
    test('should handle null and undefined data', () => {
      const handler = jest.fn();

      eventBus.on('null-event', handler);
      eventBus.emit('null-event', null);
      expect(handler).toHaveBeenCalledWith(null);

      // Note: Due to RxJS BehaviorSubject's filter operation filtering out undefined values
      // undefined will not trigger listeners, this is expected behavior
      eventBus.emit('null-event', undefined);
      // undefined won't trigger listeners, so handler is still called only once
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenLastCalledWith(null);
    });

    test('should handle complex object data', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        function: () => 'test',
        date: new Date(),
      };

      const handler = jest.fn();
      eventBus.on('complex-event', handler);
      eventBus.emit('complex-event', complexData);

      expect(handler).toHaveBeenCalledWith(complexData);
    });

    test('should handle large number of listeners', () => {
      const handlers: jest.Mock[] = [];
      const eventCount = 100;

      // Add many listeners
      for (let i = 0; i < eventCount; i++) {
        const handler = jest.fn();
        handlers.push(handler);
        eventBus.on('bulk-event', handler);
      }

      expect(eventBus.getListenerCount('bulk-event')).toBe(eventCount);

      eventBus.emit('bulk-event', 'bulk-data');

      handlers.forEach((handler) => {
        expect(handler).toHaveBeenCalledWith('bulk-data');
      });
    });

    test('should handle rapid consecutive event emissions', () => {
      const handler = jest.fn();
      eventBus.on('rapid-event', handler);

      const eventCount = 1000;
      for (let i = 0; i < eventCount; i++) {
        eventBus.emit('rapid-event', i);
      }

      expect(handler).toHaveBeenCalledTimes(eventCount);
      expect(eventBus.getCurrentValue('rapid-event')).toBe(eventCount - 1);
    });
  });

  describe('Memory Leak Protection Tests', () => {
    test('should release subscriptions after unsubscribing', () => {
      const handler = jest.fn();

      eventBus.on('memory-event', handler);
      expect(eventBus.hasListeners('memory-event')).toBe(true);

      eventBus.off('memory-event');
      expect(eventBus.hasListeners('memory-event')).toBe(false);
      expect(eventBus.getListenerCount('memory-event')).toBe(0);
    });

    test('should release all resources after clear()', () => {
      eventBus.on('event1', jest.fn());
      eventBus.on('event2', jest.fn());
      eventBus.on('event3', jest.fn());

      eventBus.clear();

      expect(eventBus.hasListeners('event1')).toBe(false);
      expect(eventBus.hasListeners('event2')).toBe(false);
      expect(eventBus.hasListeners('event3')).toBe(false);
    });
  });

  describe('TypeScript Type Support Tests', () => {
    test('should support generic event type definitions', () => {
      // Define event type interface
      interface TestEvents {
        'string-event': string;
        'number-event': number;
        'object-event': { id: number; name: string };
      }

      const typedBus = new EnhancedEventBus<TestEvents>();
      const stringHandler = jest.fn();
      const numberHandler = jest.fn();
      const objectHandler = jest.fn();

      typedBus.on('string-event', stringHandler);
      typedBus.on('number-event', numberHandler);
      typedBus.on('object-event', objectHandler);

      typedBus.emit('string-event', 'test string');
      typedBus.emit('number-event', 42);
      typedBus.emit('object-event', { id: 1, name: 'test' });

      expect(stringHandler).toHaveBeenCalledWith('test string');
      expect(numberHandler).toHaveBeenCalledWith(42);
      expect(objectHandler).toHaveBeenCalledWith({ id: 1, name: 'test' });

      typedBus.destroy();
    });
  });
});

describe('createEventBus factory function', () => {
  test('should create new EnhancedEventBus instances', () => {
    const bus1 = createEventBus();
    const bus2 = createEventBus();

    expect(bus1).toBeInstanceOf(EnhancedEventBus);
    expect(bus2).toBeInstanceOf(EnhancedEventBus);
    expect(bus1).not.toBe(bus2); // Should be different instances

    bus1.destroy();
    bus2.destroy();
  });

  test('different instances should be independent', () => {
    const bus1 = createEventBus();
    const bus2 = createEventBus();

    const handler1 = jest.fn();
    const handler2 = jest.fn();

    bus1.on('test', handler1);
    bus2.on('test', handler2);

    bus1.emit('test', 'data1');
    bus2.emit('test', 'data2');

    expect(handler1).toHaveBeenCalledWith('data1');
    expect(handler1).not.toHaveBeenCalledWith('data2');

    expect(handler2).toHaveBeenCalledWith('data2');
    expect(handler2).not.toHaveBeenCalledWith('data1');

    bus1.destroy();
    bus2.destroy();
  });
});
