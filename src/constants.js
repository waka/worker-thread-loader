export const WorkType = {
  DO_WORK: 'do_work',
  DO_RESOLVE: 'do_resolve',
  DO_REFRESH: 'do_refresh'
};

export const WorkResultType = {
  DONE: 'done',
  ERROR: 'error',
  RESOLVE: 'resolve',
  EMIT_WARNING: 'emit_warning',
  EMIT_ERROR: 'emit_error',
  REFRESHED: 'refreshed'
};

export const WorkerStatus = {
  NONE: 'none',
  SPAWNING: 'spawning',
  READY: 'ready',
  BUSY: 'busy',
  OFF: 'off',
  DEAD: 'dead'
};
