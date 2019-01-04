import Thread from './thread';
import ThreadError from './thread_error';
import { WorkType, WorkResultType } from './constants';

const DEFAULT_THREADS_COUNT = 10;

// Thread pool object.
const ThreadPools = Object.create(null);

class ThreadPool {
  constructor(numberOfThreads, options) {
    this.numberOfThreads = numberOfThreads;
    this.options = options;
    this.tasks = [];
    this.working = {};
    this.threads = [];
  }

  setup() {
    console.log(`ThreadPool setup ${this.numberOfThreads} workers.`);
    for (let idx = 0; idx < this.numberOfThreads; idx++) {
      const thread = new Thread(this.options);
      thread.spawn(() => {
        this.threads.push(thread);
        this.execute();
      });
    }
  }

  enqueue(data, callback) {
    const taskId = ThreadPool.getUniqueId();
    this.tasks.push({ taskId, data, callback });
    this.execute();
  }

  execute() {
    if (this.tasks.length === 0) {
      return;
    }

    this.threads
      .filter(thread => thread.isOff())
      .forEach(thread => {
        thread.recycle(() => {
          this.execute();
        });
      });

    const thread = this.getAvailableThread();
    if (!thread) {
      return;
    }
    thread.busy();

    thread.onMessage(message => {
      const { type, taskId, result, error } = message;
      const { data, callback } = this.working[taskId];

      switch (type) {
      case WorkResultType.RESOLVE: {
        const { context, request } = result;
        data.resolve(context, request, (err, res) => {
          thread.postMessage({
            type: WorkResultType.RESOLVE,
            taskId,
            data: { error: ThreadPool.getThreadError(err), result: res }
          });
        });
        break;
      }
      case WorkResultType.EMIT_WARNING: {
        data.emitWarning(ThreadPool.getThreadError(error));
        break;
      }
      case WorkResultType.EMIT_ERROR: {
        data.emitError(ThreadPool.getThreadError(error));
        break;
      }
      case WorkResultType.DONE:
      case WorkResultType.ERROR: {
        if (error) {
          callback(ThreadPool.getThreadError(error), null);
        } else {
          callback(null, result);
        }
        delete this.working[taskId];
        thread.done();
        break;
      }
      default:
        console.error(`Unexpected thread message type ${type} in ThreadPool`);
        break;
      }
    });

    const { taskId, data, callback } = this.tasks.shift();
    this.working[taskId] = { data, callback };
    thread.postMessage({
      type: WorkType.DO_WORK,
      taskId,
      data: {
        loaders: data.loaders,
        resource: data.resource,
        optionsContext: data.optionsContext,
        sourceMap: data.sourceMap
      }
    });
  }

  getAvailableThread() {
    return this.threads.find(thread => thread.isReady());
  }

  static getUniqueId() {
    /* eslint-disable no-magic-numbers */
    const seed1 = new Date().getTime().toString(16);
    return seed1 + Math.floor(1000 * Math.random()).toString(16);
  }

  static getThreadError(err) {
    if (!err) {
      return null;
    }
    if (err instanceof Error) {
      return err;
    }
    return new ThreadError(err);
  }
}

function getThreadPoolOptions(options) {
  return { name: options.name };
}

function getThreadPool(options) {
  if (!options || !options.key) {
    throw Error('worker-thread-loader options must has "key"');
  }

  const { key } = options;
  if (!ThreadPools[key]) {
    const threadPool = new ThreadPool(
      parseInt(options.numberOfThreads || DEFAULT_THREADS_COUNT, 10),
      getThreadPoolOptions(options)
    );
    threadPool.setup();
    ThreadPools[key] = threadPool;
  }
  return ThreadPools[key];
}

export { getThreadPool };
