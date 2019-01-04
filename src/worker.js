import fs from 'fs';
import { parentPort } from 'worker_threads';
import loaderRunner from 'loader-runner';
import { WorkType, WorkResultType } from './constants';

// Override because exception occurs in worker.
process.umask = () => {
  /* eslint-disable no-magic-numbers */
  return 0o777;
};

// Resolve callback map.
let callbackMap = Object.create(null);

function toErrorObj(error) {
  if (!error) {
    return null;
  }
  return {
    message: error.message,
    details: error.details,
    stack: error.stack,
    hideStack: error.hideStack
  };
}

function toNativeError(obj) {
  if (!obj) {
    return null;
  }
  const error = new Error(obj.message);
  error.details = obj.details;
  error.missing = obj.missing;
  return error;
}

/**
 * To main thread
 */

function postEmitWarning(taskId, error) {
  const type = WorkResultType.EMIT_WARNING;
  parentPort.postMessage({ type, taskId, result: null, error });
}

function postEmitError(taskId, error) {
  const type = WorkResultType.EMIT_ERROR;
  parentPort.postMessage({ type, taskId, result: null, error });
}

function postDone(taskId, result, error) {
  const type = WorkResultType.DONE;
  parentPort.postMessage({ type, taskId, result, error });
}

function postError(taskId, error) {
  const type = WorkResultType.ERROR;
  parentPort.postMessage({ type, taskId, result: null, error });
}

function postResolve(taskId, result) {
  const type = WorkResultType.RESOLVE;
  parentPort.postMessage({ type, taskId, result, error: null });
}

function postRefresh() {
  const type = WorkResultType.REFRESHED;
  parentPort.postMessage({ type });
}

function run(taskId, data) {
  try {
    loaderRunner.runLoaders({
      loaders: data.loaders,
      resource: data.resource,
      readResource: fs.readFile.bind(fs),
      context: {
        version: 2,
        resolve: (context, request, callback) => {
          callbackMap[taskId] = callback;
          postResolve(taskId, { context, request });
        },
        emitWarning: warning => {
          postEmitWarning(taskId, toErrorObj(warning));
        },
        emitError: error => {
          postEmitError(taskId, toErrorObj(error));
        },
        options: { context: data.optionsContext },
        sourceMap: data.sourceMap,
        webpack: true
      }
    }, (error, result) => {
      const obj = {
        result: result.result,
        contextDependencies: result.contextDependencies,
        fileDependencies: result.fileDependencies,
        cacheable: result.cacheable
      };
      postDone(taskId, obj, toErrorObj(error));
    });
  } catch (error) {
    postError(taskId, toErrorObj(error));
  }
}

function refresh() {
  callbackMap = Object.create(null);
  postRefresh();
}


/**
 * From main thread
 */

parentPort.on('message', message => {
  const { type, taskId, data } = message;

  switch (type) {
  case WorkType.DO_WORK: {
    run(taskId, data);
    break;
  }
  case WorkType.DO_RESOLVE: {
    const { result, error } = data;
    const callback = callbackMap[taskId];
    if (callback) {
      callback(toNativeError(error), result);
      delete callbackMap[taskId];
    }
    break;
  }
  case WorkType.DO_REFRESH: {
    refresh();
    break;
  }
  default:
    console.error(`Worker get unexpected type ${type}`);
    break;
  }
});
