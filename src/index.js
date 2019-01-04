import loaderUtils from 'loader-utils';
import { getThreadPool } from './thread_pool';

function pitch() {
  const options = loaderUtils.getOptions(this) || {};
  const callback = this.async();

  const threadPool = getThreadPool(options);
  threadPool.enqueue({
    loaders: this.loaders.slice(this.loaderIndex + 1).map(loader => {
      return { loader: loader.path, options: loader.options, ident: loader.ident };
    }),
    resource: this.resourcePath + (this.resourceQuery || ''),
    resolve: this.resolve,
    emitError: this.emitError,
    emitWarning: this.emitWarning,
    sourceMap: this.sourceMap,
    optionsContext: this.rootContext || this.options.context
  }, (err, res) => {
    if (err) {
      callback(err, null);
      return;
    }
    res.fileDependencies.forEach(dep => this.addDependency(dep));
    res.contextDependencies.forEach(dep => this.addContextDependency(dep));
    callback(null, ...res.result);
  });
}

export { pitch };
