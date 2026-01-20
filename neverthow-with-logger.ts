import { Logger } from '@nestjs/common';
import { err, ok, Result, ResultAsync } from 'neverthrow';

/**
 * Enhanced neverthrow with automatic logging
 * Automatically detects service name from stack trace
 */

// Global logger instance
const logger = new Logger('NeverthrowLogger');

/**
 * Extract service/class name from stack trace
 */
function getServiceNameFromStack(): string {
  const stack = new Error().stack;
  if (!stack) return 'UnknownService';

  const stackLines = stack.split('\n');
  
  // Look for class method calls (usually line 3-5 in stack)
  for (let i = 2; i < Math.min(6, stackLines.length); i++) {
    const line = stackLines[i];
    if (!line) continue;

    // Match patterns like: at ClassName.methodName or ClassName.methodName
    const classMatch = line.match(/at\s+(\w+)\.(\w+)/);
    if (classMatch) {
      return classMatch[1]; // Return class name
    }

    // Match patterns like: at new ClassName
    const constructorMatch = line.match(/at\s+new\s+(\w+)/);
    if (constructorMatch) {
      return constructorMatch[1];
    }
  }

  // Fallback: try to extract from file path
  const fileMatch = stackLines[2]?.match(/([\w-]+)\.service\.ts|([\w-]+)\.ts/);
  if (fileMatch) {
    return fileMatch[1] || fileMatch[2] || 'UnknownService';
  }

  return 'UnknownService';
}

/**
 * Extract method name from stack trace
 */
function getMethodNameFromStack(): string {
  const stack = new Error().stack;
  if (!stack) return 'unknown';

  const stackLines = stack.split('\n');
  
  // Usually the method name is in the second or third line
  for (let i = 1; i < Math.min(4, stackLines.length); i++) {
    const line = stackLines[i];
    if (!line) continue;

    const methodMatch = line.match(/at\s+(\w+)\.(\w+)/);
    if (methodMatch) {
      return methodMatch[2]; // Return method name
    }
  }

  return 'unknown';
}

/**
 * Log with specified level
 * Can be used directly or get logger instance
 * 
 * @param level - Log level: 'error' | 'warn' | 'info' | 'debug'
 * @param message - Log message
 * @param context - Optional context object
 * 
 * @example
 * logWithLevel('error', 'Something went wrong', { key: 'value' });
 * logWithLevel('warn', 'Warning message', { userId: 123 });
 * logWithLevel('info', 'Info message');
 */
export function logWithLevel(
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  context?: Record<string, any>,
): void {
  const logContextStr = JSON.stringify(context, null, 2);
  switch (level) {
    case 'error':
      logger.error(message, logContextStr);
      break;
    case 'warn':
      logger.warn(message, logContextStr);
      break;
    case 'info':
      logger.log(message, logContextStr);
      break;
    case 'debug':
      logger.debug(message, logContextStr);
      break;
    default:
      logger.error(message, logContextStr);
  }
}

/**
 * Get logger instance for custom usage
 * 
 * @param context - Optional context name for the logger
 * @returns Logger instance
 * 
 * @example
 * const myLogger = getLogger('MyService');
 * myLogger.error('Error message');
 */
export function getLogger(context?: string): Logger {
  return new Logger(context || 'NeverthrowLogger');
}
/**
 * Create an error with automatic logging
 * Automatically detects service and method name from call stack
 * 
 * @param message - Error message
 * @param context - Optional additional context (params, etc.)
 * @returns Error instance that has been logged
 * 
 * @example
 * // In RedisService.get()
 * return err(createError(`key: ${key} is not exist in Redis`, { key }));
 */
export function createError(
  message: string,
  context?: Record<string, any>,
  logLevel: 'error' | 'warn' | 'info' | 'debug' = 'error',
): Error {
  const serviceName = getServiceNameFromStack();
  const methodName = getMethodNameFromStack();
  
  const contextStr = context
    ? ` | Context: ${JSON.stringify(context, null, 2)}`
    : '';
  
  const fullMessage = `[${serviceName}.${methodName}] ${message}${contextStr}`;
  
  // Log error with full context using logWithLevel
  logWithLevel(
    logLevel,
    fullMessage,
    {
      service: serviceName,
      method: methodName,
      message,
      context,
      stack: JSON.stringify(new Error().stack, null, 2),
    },
  );

  // Create error with enhanced message
  const error = new Error(message);
  error.stack = new Error().stack; // Preserve stack trace
  
  return error;
}

/**
 * Enhanced err() function with automatic logging
 * Drop-in replacement for neverthrow's err()
 * 
 * @param error - Error instance or error message
 * @param context - Optional additional context
 * @returns Result with error that has been logged
 * 
 * @example
 * // Instead of: return err(new Error('Something went wrong'));
 * // Use: return errWithLog('Something went wrong', { key });
 * // Or: return errWithLog(new Error('Something went wrong'), { key });
 */
export function errWithLog<T>(
  error: Error | string,
  context?: Record<string, any>,
): Result<T, Error> {
  const serviceName = getServiceNameFromStack();
  const methodName = getMethodNameFromStack();
  
  let errorInstance: Error;
  let errorMessage: string;

  if (error instanceof Error) {
    errorInstance = error;
    errorMessage = error.message;
  } else {
    errorMessage = error;
    errorInstance = new Error(errorMessage);
  }

  const contextStr = context
    ? ` | Context: ${JSON.stringify(context)}`
    : '';
  
  const fullMessage = `[${serviceName}.${methodName}] ${errorMessage}${contextStr}`;
  
  // Log error with full context
  logger.error(fullMessage, {
    service: serviceName,
    method: methodName,
    originalError: errorMessage,
    context,
    stack: errorInstance.stack || new Error().stack,
  });

  // Enhance error message but preserve original stack
  const enhancedError = new Error(errorMessage);
  if (errorInstance.stack) {
    enhancedError.stack = `Original: ${errorInstance.stack}\n\nAt: ${enhancedError.stack}`;
  }
  
  return err(enhancedError);
}

// Re-export neverthrow functions for convenience
export { err, ok, Result, ResultAsync };
