import { EnhancedEventBus, createEventBus } from './index';

// 定义测试事件类型
interface TestEvents {
  message: string;
  data: { id: number; value: string };
  count: number;
}

describe('EnhancedEventBus', () => {
  let eventBus: EnhancedEventBus<TestEvents>;

  beforeEach(() => {
    eventBus = createEventBus<TestEvents>();
  });

  afterEach(() => {
    eventBus.destroy();
  });

  describe('基础功能测试', () => {
    it('应该能够注册和触发事件', () => {
      const mockHandler = jest.fn();
      
      eventBus.on('message', mockHandler);
      eventBus.emit('message', 'Hello World');
      
      expect(mockHandler).toHaveBeenCalledWith('Hello World');
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('应该支持多个 handler 监听同一事件', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      eventBus.emit('message', 'Test');
      
      expect(handler1).toHaveBeenCalledWith('Test');
      expect(handler2).toHaveBeenCalledWith('Test');
    });

    it('应该能够获取当前值', () => {
      eventBus.emit('count', 42);
      
      expect(eventBus.getCurrentValue('count')).toBe(42);
    });

    it('应该能够检查是否有监听器', () => {
      expect(eventBus.hasListeners('message')).toBe(false);
      
      eventBus.on('message', () => {});
      
      expect(eventBus.hasListeners('message')).toBe(true);
    });

    it('应该能够获取监听器数量', () => {
      expect(eventBus.getListenerCount('message')).toBe(0);
      
      eventBus.on('message', () => {});
      eventBus.on('message', () => {});
      
      expect(eventBus.getListenerCount('message')).toBe(2);
    });
  });

  describe('方案一：返回取消函数', () => {
    it('on 方法应该返回取消函数', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on('message', handler);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('取消函数应该能够移除特定的 handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const unsubscribe1 = eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      
      // 移除第一个 handler
      unsubscribe1();
      
      eventBus.emit('message', 'Test');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('Test');
    });

    it('取消函数应该能够正确清理内部状态', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on('message', handler);
      
      expect(eventBus.hasListeners('message')).toBe(true);
      expect(eventBus.getListenerCount('message')).toBe(1);
      
      unsubscribe();
      
      expect(eventBus.hasListeners('message')).toBe(false);
      expect(eventBus.getListenerCount('message')).toBe(0);
    });

    it('多次调用取消函数应该是安全的', () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on('message', handler);
      
      unsubscribe();
      unsubscribe(); // 第二次调用不应该报错
      
      eventBus.emit('message', 'Test');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('方案二：off 方法精确移除', () => {
    it('off 方法应该能够移除特定的 handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      
      // 移除特定 handler
      eventBus.off('message', handler1);
      
      eventBus.emit('message', 'Test');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('Test');
    });

    it('移除不存在的 handler 应该是安全的', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.on('message', handler1);
      
      // 尝试移除未注册的 handler
      eventBus.off('message', handler2);
      
      eventBus.emit('message', 'Test');
      expect(handler1).toHaveBeenCalledWith('Test');
    });

    it('移除不存在事件类型的 handler 应该是安全的', () => {
      const handler = jest.fn();
      
      // 尝试移除不存在事件类型的 handler
      expect(() => {
        eventBus.off('message', handler);
      }).not.toThrow();
    });
  });

  describe('原有功能兼容性', () => {
    it('off() 无参数应该只给出警告，不清除任何内容', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      eventBus.on('message', handler1);
      eventBus.on('data', handler2);
      
      // 调用 off() 无参数
      eventBus.off();
      
      // 应该输出警告
      expect(consoleSpy).toHaveBeenCalledWith(
        'off() called without parameters. Use clear() to remove all listeners and cached values, or specify event type to remove specific listeners.'
      );
      
      // 监听器应该仍然存在
      eventBus.emit('message', 'Test');
      eventBus.emit('data', { id: 1, value: 'test' });
      
      expect(handler1).toHaveBeenCalledWith('Test');
      expect(handler2).toHaveBeenCalledWith({ id: 1, value: 'test' });
      
      consoleSpy.mockRestore();
    });

    it('off(type) 应该移除该类型的所有 handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      eventBus.on('data', handler3);
      
      eventBus.off('message');
      
      eventBus.emit('message', 'Test');
      eventBus.emit('data', { id: 1, value: 'test' });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('clear 方法应该清除所有事件和状态', () => {
      const handler = jest.fn();
      
      eventBus.on('message', handler);
      eventBus.emit('message', 'Test');
      
      eventBus.clear();
      
      expect(eventBus.hasListeners('message')).toBe(false);
      expect(eventBus.getCurrentValue('message')).toBeUndefined();
    });

    it('destroy 方法应该等同于 clear', () => {
      const handler = jest.fn();
      
      eventBus.on('message', handler);
      eventBus.emit('message', 'Test');
      
      eventBus.destroy();
      
      expect(eventBus.hasListeners('message')).toBe(false);
      expect(eventBus.getCurrentValue('message')).toBeUndefined();
    });
  });

  describe('混合使用场景', () => {
    it('应该支持同时使用两种移除方式', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();
      
      const unsubscribe1 = eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      eventBus.on('message', handler3);
      
      // 使用取消函数移除第一个
      unsubscribe1();
      
      // 使用 off 方法移除第二个
      eventBus.off('message', handler2);
      
      eventBus.emit('message', 'Test');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalledWith('Test');
    });

    it('移除所有 handlers 后应该正确清理内部状态', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const unsubscribe1 = eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      
      expect(eventBus.hasListeners('message')).toBe(true);
      expect(eventBus.getListenerCount('message')).toBe(2);
      
      // 移除所有 handlers
      unsubscribe1();
      eventBus.off('message', handler2);
      
      expect(eventBus.hasListeners('message')).toBe(false);
      expect(eventBus.getListenerCount('message')).toBe(0);
    });
  });

  describe('边界情况', () => {
    it('应该正确处理复杂的事件数据类型', () => {
      const handler = jest.fn();
      const complexData = { id: 1, value: 'test', nested: { prop: true } };
      
      eventBus.on('data', handler);
      eventBus.emit('data', complexData);
      
      expect(handler).toHaveBeenCalledWith(complexData);
    });

    it('应该支持 Symbol 类型的事件名', () => {
      const symbolEvent = Symbol('test');
      const handler = jest.fn();
      
      // 注意：这里需要扩展事件类型定义
      const symbolEventBus = createEventBus<{ [symbolEvent]: string }>();
      
      symbolEventBus.on(symbolEvent, handler);
      symbolEventBus.emit(symbolEvent, 'Symbol Event');
      
      expect(handler).toHaveBeenCalledWith('Symbol Event');
      
      symbolEventBus.destroy();
    });

    it('应该正确处理快速连续的事件', () => {
      const handler = jest.fn();
      
      eventBus.on('count', handler);
      
      for (let i = 0; i < 100; i++) {
        eventBus.emit('count', i);
      }
      
      expect(handler).toHaveBeenCalledTimes(100);
      expect(handler).toHaveBeenLastCalledWith(99);
    });
  });
});
