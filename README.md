# 🎯 miit

> **Enhanced mitt** - The event emitter that never forgets

[![npm version](https://img.shields.io/npm/v/miit.svg)](https://www.npmjs.com/package/miit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/miit.svg)](https://bundlephobia.com/package/miit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**miit** is an enhanced event emitter inspired by [mitt](https://github.com/developit/mitt), designed to solve the common "missed event" problem in modern applications. Built with RxJS BehaviorSubject for intelligent event caching.

## 🤔 The Problem

Ever experienced this frustrating scenario?

```typescript
// With traditional event emitters (including mitt)
eventBus.emit('userLogin', { id: 1, name: 'John' }); // Event fired
// ... component mounts later ...
eventBus.on('userLogin', (user) => {
  console.log(user); // 😢 Nothing! Event was missed
});
```

## ✨ The Solution

**miit** automatically caches the latest event, so you never miss important state changes:

```typescript
// With miit - same API, better behavior
eventBus.emit('userLogin', { id: 1, name: 'John' }); // Event cached automatically
// ... component mounts later ...
eventBus.on('userLogin', (user) => {
  console.log(user); // 🎉 { id: 1, name: 'John' } - Got it!
});
```

## 🚀 Features

- 🎯 **Never miss events** - Intelligent caching with BehaviorSubject
- 🔄 **100% mitt compatible** - Drop-in replacement, same API
- 🎨 **TypeScript first** - Full type safety out of the box
- ⚡ **Zero learning curve** - If you know mitt, you know miit
- 🔧 **Enhanced debugging** - Get current state anytime

## 📦 Installation

```bash
npm install miit
# or
yarn add miit
# or
pnpm add miit
```

## 🎯 Quick Start

```typescript
import { createEventBus } from 'miit';

// Create a typed event bus
interface Events {
  userLogin: { id: number; name: string };
  notification: { message: string; type: 'info' | 'error' };
}

const eventBus = createEventBus<Events>();

// Emit events
eventBus.emit('userLogin', { id: 1, name: 'John' });

// Listen to events (even if emitted before!)
eventBus.on('userLogin', (user) => {
  console.log(`Welcome ${user.name}!`); // ✅ Works even if listener added later
});
```

## 📚 API Reference

### `createEventBus<Events>()`

Creates a new event bus instance.

```typescript
const eventBus = createEventBus<{
  event1: string;
  event2: { data: number };
}>();
```

### `on<Key>(type, handler)` → `() => void`

Listen to an event. If the event was previously emitted, the handler will be called immediately with the cached value.

**🆕 Enhanced**: Now returns an unsubscribe function for precise handler removal.

```typescript
// Basic usage
eventBus.on('userLogin', (user) => {
  console.log('User logged in:', user);
});

// 🆕 Get unsubscribe function
const unsubscribe = eventBus.on('userLogin', (user) => {
  console.log('User logged in:', user);
});

// Remove this specific handler later
unsubscribe();
```

### `emit<Key>(type, event)`

Emit an event. The event will be cached and delivered to current and future listeners.

```typescript
eventBus.emit('userLogin', { id: 1, name: 'John' });
```

### `off<Key>(type?, handler?)`

Remove event listeners with enhanced precision control.

**🆕 Enhanced**: Now supports removing specific handlers while maintaining backward compatibility.

```typescript
// Remove all listeners for specific event (original behavior)
eventBus.off('userLogin');

// Use clear() instead to remove all listeners and cached values
eventBus.clear(); // Actually removes all listeners and cached values

// 🆕 Remove specific handler only
const handler1 = (user) => console.log('Handler 1:', user);
const handler2 = (user) => console.log('Handler 2:', user);

eventBus.on('userLogin', handler1);
eventBus.on('userLogin', handler2);

// Remove only handler1, handler2 continues to work
eventBus.off('userLogin', handler1);
```

### `once<Key>(type, handler)`

Listen to an event only once. The handler will be automatically removed after the first execution.

```typescript
eventBus.once('userLogin', (user) => {
  console.log('First login detected:', user);
});
```

### `getCurrentValue<Key>(type)`

Get the current cached value of an event (if any).

```typescript
const currentUser = eventBus.getCurrentValue('userLogin');
if (currentUser) {
  console.log('Current user:', currentUser.name);
}
```

### `hasListeners<Key>(type)`

Check if there are active listeners for an event.

```typescript
if (eventBus.hasListeners('userLogin')) {
  console.log('Someone is listening to user login events');
}
```

### `getListenerCount<Key>(type)`

Get the number of active listeners for an event.

```typescript
const count = eventBus.getListenerCount('userLogin');
console.log(`${count} listeners for userLogin`);
```

### `clear()`

Remove all listeners and clear all cached events. This is the proper way to completely reset the event bus.

**⚠️ Important**: Unlike `off()` without parameters (which only shows a warning), `clear()` actually removes everything:

- All event listeners
- All cached event values
- Completes all BehaviorSubjects

```typescript
// Complete cleanup - removes listeners AND cached values
eventBus.clear();

// After clear(), getCurrentValue() returns undefined
const value = eventBus.getCurrentValue('userLogin'); // undefined
```

### `destroy()`

Alias for `clear()`. Completely cleanup the event bus.

```typescript
eventBus.destroy();
```

## 🆚 miit vs mitt

| Feature                  | mitt | miit |
| ------------------------ | ---- | ---- |
| **Basic Events**         | ✅   | ✅   |
| **TypeScript**           | ✅   | ✅   |
| **Event Caching**        | ❌   | ✅   |
| **Never Miss Events**    | ❌   | ✅   |
| **Current State Access** | ❌   | ✅   |
| **mitt API Compatible**  | ✅   | ✅   |

## 🎨 Usage Patterns

### React Integration

```typescript
import { createEventBus } from 'miit'
import { useEffect, useState } from 'react'

const globalEvents = createEventBus<{
  themeChange: { theme: 'light' | 'dark' }
  userUpdate: { id: number; name: string }
}>()

function ThemeProvider() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Will get current theme immediately if already set
    globalEvents.on('themeChange', ({ theme }) => {
      setTheme(theme)
    })
  }, [])

  return <div className={theme}>...</div>
}

// Somewhere else in your app
globalEvents.emit('themeChange', { theme: 'dark' })
```

### Vue Integration

```typescript
import { createEventBus } from 'miit';
import { ref, onMounted } from 'vue';

const globalEvents = createEventBus<{
  notification: { message: string; type: string };
}>();

export function useNotifications() {
  const notifications = ref([]);

  onMounted(() => {
    // Get current notification state immediately
    globalEvents.on('notification', (notification) => {
      notifications.value.push(notification);
    });
  });

  return { notifications };
}
```

### State Management

```typescript
interface AppState {
  user: { id: number; name: string } | null;
  settings: { theme: string; language: string };
  notifications: Array<{ id: string; message: string }>;
}

const stateEvents = createEventBus<AppState>();

// Update state
stateEvents.emit('user', { id: 1, name: 'John' });
stateEvents.emit('settings', { theme: 'dark', language: 'en' });

// Components can get current state immediately
const currentUser = stateEvents.getCurrentValue('user');
const currentSettings = stateEvents.getCurrentValue('settings');
```

## 🎛️ Advanced Handler Management

miit provides two powerful ways to manage event handlers with precision:

### Method 1: Unsubscribe Functions (Recommended)

Every `on()` call returns an unsubscribe function for clean, direct handler removal:

```typescript
const eventBus = createEventBus<{ update: string }>();

// Each handler gets its own unsubscribe function
const unsubscribe1 = eventBus.on('update', (data) => console.log('Handler 1:', data));
const unsubscribe2 = eventBus.on('update', (data) => console.log('Handler 2:', data));
const unsubscribe3 = eventBus.on('update', (data) => console.log('Handler 3:', data));

// Remove specific handlers independently
unsubscribe2(); // Only Handler 2 is removed

eventBus.emit('update', 'test');
// Output:
// Handler 1: test
// Handler 3: test
```

### Method 2: Precise `off()` with Handler Reference

Pass the exact handler function to `off()` for targeted removal:

```typescript
const eventBus = createEventBus<{ click: { x: number; y: number } }>();

// Define handlers as variables to reference later
const logHandler = (pos) => console.log('Position:', pos);
const trackHandler = (pos) => analytics.track('click', pos);
const debugHandler = (pos) => console.debug('Debug click:', pos);

// Register multiple handlers
eventBus.on('click', logHandler);
eventBus.on('click', trackHandler);
eventBus.on('click', debugHandler);

// Remove only the debug handler
eventBus.off('click', debugHandler);

eventBus.emit('click', { x: 100, y: 200 });
// Only logHandler and trackHandler will execute
```

### Comparison: When to Use Which Method

| Scenario                        | Unsubscribe Function    | `off(type, handler)`      |
| ------------------------------- | ----------------------- | ------------------------- |
| **React useEffect cleanup**     | ✅ Perfect fit          | ❌ Requires handler ref   |
| **Component unmounting**        | ✅ Clean & direct       | ✅ Works well             |
| **Conditional handler removal** | ✅ Store unsubscribe fn | ✅ Store handler ref      |
| **Bulk handler management**     | ❌ Need multiple refs   | ✅ Easy with handler refs |
| **Anonymous functions**         | ✅ Always works         | ❌ Can't reference later  |

### Real-World Examples

#### React Hook Pattern

```typescript
function useGlobalState() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Method 1: Clean unsubscribe pattern
    const unsubscribe = globalEvents.on('userUpdate', setUser);
    return unsubscribe; // Perfect cleanup
  }, []);

  return user;
}
```

#### Dynamic Handler Management

```typescript
class NotificationManager {
  private handlers = new Map<string, Function>();

  addHandler(id: string, handler: Function) {
    // Method 2: Store handler reference for later removal
    this.handlers.set(id, handler);
    eventBus.on('notification', handler);
  }

  removeHandler(id: string) {
    const handler = this.handlers.get(id);
    if (handler) {
      eventBus.off('notification', handler);
      this.handlers.delete(id);
    }
  }
}
```

## 🔧 TypeScript Support

miit is built with TypeScript and provides excellent type safety:

```typescript
interface StrictEvents {
  stringEvent: string;
  numberEvent: number;
  objectEvent: { id: number; name: string };
}

const typedBus = createEventBus<StrictEvents>();

// ✅ Type safe
typedBus.emit('stringEvent', 'hello');
typedBus.emit('numberEvent', 42);
typedBus.emit('objectEvent', { id: 1, name: 'John' });

// ❌ TypeScript errors
typedBus.emit('stringEvent', 123); // Error: number not assignable to string
typedBus.emit('invalidEvent', 'x'); // Error: event doesn't exist

// ✅ Handlers are properly typed
typedBus.on('objectEvent', (obj) => {
  console.log(obj.name); // obj is properly typed as { id: number; name: string }
});
```

## 🤝 When to Use miit vs mitt

### Use **mitt** when:

- You need the absolute smallest bundle size
- Events are simple notifications (fire-and-forget)
- You don't need state persistence
- Components always mount before events are emitted

### Use **miit** when:

- You need reliable state management
- Components might mount after events are emitted
- You want to access current state at any time
- You're building complex applications with async component loading
- You need better debugging capabilities

## 🐛 Migration from mitt

miit is a drop-in replacement for mitt. Simply change your import:

```typescript
// Before
import mitt from 'mitt';
const emitter = mitt();

// After
import { createEventBus } from 'miit';
const emitter = createEventBus();

// All your existing code works exactly the same!
```

The only difference is that your events will now be cached and never missed. 🎉

## 💡 Inspiration

miit is inspired by the excellent [mitt](https://github.com/developit/mitt) library by [@developit](https://github.com/developit). While mitt is perfect for simple event handling, we found ourselves constantly running into the "missed event" problem in React/Vue applications where components mount asynchronously.

## 📄 License

MIT © [evansam](https://github.com/yuanzhhh)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
