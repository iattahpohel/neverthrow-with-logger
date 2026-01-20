# @your-org/neverthrow-with-logger

Enhanced neverthrow with automatic logging and error context detection for NestJS applications.

## Features

- 🔍 **Automatic Service Detection**: Automatically detects service and method names from stack traces
- 📝 **Automatic Logging**: Logs errors with full context (service, method, parameters)
- 🎯 **Type-Safe**: Full TypeScript support with neverthrow's Result types
- 🔧 **Flexible Logging**: Support for error, warn, info, and debug log levels
- 📦 **Zero Configuration**: Works out of the box with NestJS

## Installation

```bash
npm install @your-org/neverthrow-with-logger neverthrow
```

## Usage

### Basic Usage

```typescript
import { createError, errWithLog, logWithLevel, getLogger } from '@your-org/neverthrow-with-logger';
import { err, ok } from '@your-org/neverthrow-with-logger';

// Create error with automatic logging
async function getData(key: string) {
  const result = await someAsyncOperation(key);
  
  if (!result) {
    return err(createError(`key: ${key} is not exist`, { key }));
  }
  
  return ok(result);
}

// Use errWithLog for automatic error logging
async function processData(data: any) {
  if (!data) {
    return errWithLog('Data is required', { data });
  }
  
  return ok(data);
}

// Direct logging with logWithLevel
logWithLevel('error', 'Something went wrong', { key: 'value' });
logWithLevel('warn', 'Warning message', { userId: 123 });
logWithLevel('info', 'Info message');
logWithLevel('debug', 'Debug message', { data: 'test' });

// Get logger instance
const logger = getLogger('MyService');
logger.error('Error message');
logger.warn('Warning message');
```

### With NestJS Service

```typescript
import { Injectable } from '@nestjs/common';
import { createError, errWithLog } from '@your-org/neverthrow-with-logger';
import { Result, ok } from '@your-org/neverthrow-with-logger';

@Injectable()
export class RedisService {
  async get(key: string): Promise<Result<string, Error>> {
    const result = await this.redis.get(key);
    
    if (!result) {
      // Automatically logs: [RedisService.get] key: abc is not exist | Context: {"key":"abc"}
      return err(createError(`key: ${key} is not exist`, { key }));
    }
    
    return ok(result);
  }
}
```

## API

### `createError(message, context?, logLevel?)`

Creates an error with automatic logging. Automatically detects service and method name from call stack.

**Parameters:**
- `message` (string): Error message
- `context` (Record<string, any>, optional): Additional context
- `logLevel` ('error' | 'warn' | 'info' | 'debug', optional): Log level (default: 'error')

**Returns:** `Error` instance

### `errWithLog(error, context?)`

Enhanced `err()` function with automatic logging.

**Parameters:**
- `error` (Error | string): Error instance or error message
- `context` (Record<string, any>, optional): Additional context

**Returns:** `Result<T, Error>`

### `logWithLevel(level, message, context?)`

Log with specified level.

**Parameters:**
- `level` ('error' | 'warn' | 'info' | 'debug'): Log level
- `message` (string): Log message
- `context` (Record<string, any>, optional): Context object

**Returns:** `void`

### `getLogger(context?)`

Get logger instance for custom usage.

**Parameters:**
- `context` (string, optional): Context name for the logger

**Returns:** `Logger` instance (NestJS Logger)

## License

MIT
