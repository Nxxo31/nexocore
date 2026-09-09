import { Queue as BullMQQueue, type QueueOptions, type WorkerOptions, type ConnectionOptions } from 'bullmq'

// If MOCK_REDIS is set to true, we use a mock queue to avoid Redis connection during build/test
const useMock = process.env.MOCK_REDIS === 'true'

// Dummy connection options for mock (values don't matter as mock ignores them)
const dummyConnection: ConnectionOptions = {
  host: 'mock',
  port: 6379,
}

// Create a mock queue class that satisfies the Queue interface for basic usage
class MockQueue {
  name: string
  opts: QueueOptions | undefined
  constructor(name: string, opts?: QueueOptions) {
    this.name = name
    this.opts = opts
  }
  // Minimal mock for .add used in producer.ts
  add = async (name: string, data?: Record<string, any>, opts?: { delay?: number; jobId?: string; repeat?: any; }) => {
    // Simulate job creation
    return { id: Math.random().toString(36).substring(2, 15) } as any
  }
  // EventEmitter stubs to satisfy TypeScript checks
  on = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  once = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  off = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  removeListener = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  removeAllListeners = (event?: string | symbol) => {
    return this
  }
  setMaxListeners = (n: number) => {
    return this
  }
  getMaxListeners = () => {
    return 0
  }
  listeners = (event: string | symbol) => {
    return []
  }
  rawListeners = (event: string | symbol) => {
    return []
  }
  emit = (event: string | symbol, ...args: any[]) => {
    return false
  }
  listenerCount = (event: string | symbol) => {
    return 0
  }
  prependListener = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  prependOnceListener = (event: string | symbol, listener: (...args: any[]) => void) => {
    return this
  }
  eventNames = () => {
    return []
  }
  getEventListeners = (event: string | symbol) => {
    return []
  }
  // Minimal mock for .close if needed
  close = async () => {
    return undefined
  }
  // Additional methods that might be needed
  pause = () => {
    return this
  }
  resume = () => {
    return this
  }
  isPaused = () => {
    return false
  }
  // For health checks
  ping = async () => {
    return true
  }
}

// Email job queue
export const emailQueue = useMock
  ? new MockQueue('email')
  : new BullMQQueue('email', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
      },
    })

// Invoice generation job queue
export const invoiceQueue = useMock
  ? new MockQueue('invoice-generation')
  : new BullMQQueue('invoice-generation', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
      },
    })

// Data export job queue
export const dataExportQueue = useMock
  ? new MockQueue('data-export')
  : new BullMQQueue('data-export', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
      },
    })