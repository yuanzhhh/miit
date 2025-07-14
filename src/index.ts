import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type EventType = string | symbol;
type Handler<T = any> = (event: T) => void;

interface SubscriptionManager {
  subscription: Subscription;
  handler: Handler<any>;
}

class EnhancedEventBus<Events extends Record<EventType, any> = Record<EventType, any>> {
  private behaviorSubjects = new Map<
    keyof Events,
    BehaviorSubject<Events[keyof Events] | undefined>
  >();
  private subscriptions = new Map<string, SubscriptionManager[]>();

  on = <Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>): (() => void) => {
    const eventName = String(type);

    const subscription: Subscription = this.getBehaviorSubject(type)
      .pipe(filter((value): value is Events[Key] => value !== undefined))
      .subscribe(handler);

    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, []);
    }

    const managers = this.subscriptions.get(eventName)!;
    const subscriptionManager: SubscriptionManager = {
      subscription,
      handler,
    };
    managers.push(subscriptionManager);

    // 返回取消函数（方案一）
    return () => {
      subscription.unsubscribe();
      const index = managers.indexOf(subscriptionManager);
      if (index > -1) {
        managers.splice(index, 1);
        // 如果没有更多 handlers，删除整个事件类型
        if (managers.length === 0) {
          this.subscriptions.delete(eventName);
        }
      }
    };
  };

  emit = <Key extends keyof Events>(type: Key, event: Events[Key]): void => {
    this.getBehaviorSubject(type).next(event);
  };

  off = <Key extends keyof Events>(type?: Key, handler?: Handler<Events[Key]>): void => {
    if (type === undefined) {
      console.warn(
        'off() called without parameters. Use clear() to remove all listeners and cached values, or specify event type to remove specific listeners.'
      );
      return;
    }

    const eventName = String(type);

    if (!this.subscriptions.has(eventName)) return;

    const managers = this.subscriptions.get(eventName)!;

    if (handler === undefined) {
      // 原有行为：移除所有 handlers
      managers.forEach(({ subscription }) => subscription.unsubscribe());
      this.subscriptions.delete(eventName);
    } else {
      // 新功能：移除特定 handler
      const index = managers.findIndex((manager) => manager.handler === handler);
      if (index > -1) {
        managers[index].subscription.unsubscribe();
        managers.splice(index, 1);

        // 如果没有更多 handlers，删除整个事件类型
        if (managers.length === 0) {
          this.subscriptions.delete(eventName);
        }
      }
    }
  };

  clear = (): void => {
    this.subscriptions.forEach((managers) => {
      managers.forEach(({ subscription }) => {
        subscription.unsubscribe();
      });
    });
    this.subscriptions.clear();

    this.behaviorSubjects.forEach((subject) => subject.complete());
    this.behaviorSubjects.clear();
  };

  getCurrentValue = <Key extends keyof Events>(type: Key): Events[Key] | undefined => {
    const subject = this.behaviorSubjects.get(type);

    if (!subject) return undefined;

    const value = subject.getValue();

    return value !== undefined ? value : undefined;
  };

  hasListeners = <Key extends keyof Events>(type: Key): boolean => {
    const eventName = String(type);

    return this.subscriptions.has(eventName) && this.subscriptions.get(eventName)!.length > 0;
  };

  getListenerCount = <Key extends keyof Events>(type: Key): number => {
    const eventName = String(type);

    return this.subscriptions.get(eventName)?.length || 0;
  };

  destroy = (): void => {
    this.clear();
  };

  private getBehaviorSubject = <Key extends keyof Events>(
    type: Key
  ): BehaviorSubject<Events[Key] | undefined> => {
    if (!this.behaviorSubjects.has(type)) {
      this.behaviorSubjects.set(type, new BehaviorSubject<Events[Key] | undefined>(undefined));
    }
    return this.behaviorSubjects.get(type)!;
  };
}

function createEventBus<
  Events extends Record<EventType, any> = Record<EventType, any>,
>(): EnhancedEventBus<Events> {
  return new EnhancedEventBus<Events>();
}

export { EnhancedEventBus, createEventBus };
