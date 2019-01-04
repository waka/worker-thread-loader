import { Worker } from 'worker_threads';
import { WorkType, WorkResultType, WorkerStatus } from './constants';

const workerPath = require.resolve('./worker');

export default class Thread {
  constructor() {
    this.status = WorkerStatus.NONE;
    this.worker = null;
  }

  spawn(callback) {
    if (this.status !== WorkerStatus.NONE) {
      console.error('The thread status must be "NONE" at spawn');
      return;
    }

    this.status = WorkerStatus.SPAWNING;
    this.worker = new Worker(workerPath);

    this.worker.once('online', () => {
      this.worker.removeAllListeners();

      // Next tick, so the worker js gets interpreted
      process.nextTick(() => {
        this.ready();
        if (callback) {
          callback();
        }
      });
    });

    this.worker.once('error', error => {
      console.error(error);
      this.worker.removeAllListeners();
      this.die();
    });
  }

  recycle(callback) {
    if (this.status !== WorkerStatus.OFF) {
      console.error('The thread status must be "OFF" at recycle');
      return;
    }

    this.worker.once('message', message => {
      if (message.type === WorkResultType.REFRESHED) {
        this.worker.removeAllListeners();
        this.ready();
        if (callback) {
          callback();
        }
      }
    });
    this.worker.postMessage({ type: WorkType.DO_REFRESH });
  }

  ready() {
    this.status = WorkerStatus.READY;
  }

  busy() {
    this.status = WorkerStatus.BUSY;
  }

  done(callback) {
    this.worker.removeAllListeners();
    this.off();
    if (callback) {
      callback();
    }
  }

  off() {
    this.status = WorkerStatus.OFF;
  }

  die() {
    this.status = WorkerStatus.DEAD;
    this.worker.terminate();
    this.worker = null;
  }

  isReady() {
    return this.status === WorkerStatus.READY;
  }

  isOff() {
    return this.status === WorkerStatus.OFF;
  }

  postMessage(message) {
    if (this.status !== WorkerStatus.BUSY) {
      console.error('The thread status must be "BUSY" at onMessage');
      return;
    }
    this.worker.postMessage(message);
  }

  onMessage(callback) {
    if (this.status !== WorkerStatus.BUSY) {
      console.error('The thread status must be "BUSY" at onMessage');
      return;
    }
    this.worker.on('message', callback);
  }
}
