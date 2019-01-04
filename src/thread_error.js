export default class ThreadError extends Error {
  constructor(err) {
    super(err);

    Error.captureStackTrace(this, this.constructor);

    const originLines = (err.stack || '')
      .split('\n')
      .filter(line => line.trim().startsWith('at'));
    const lines = this.stack
      .split('\n')
      .filter(line => line.trim().startsWith('at'));
    const diff = lines.slice(0, lines.length - originLines.length).join('\n');
    originLines.unshift(diff);
    originLines.unshift(err.message);
    this.stack = originLines;
  }
}
