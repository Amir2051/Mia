const levels = { info: '✦', warn: '⚠', error: '✖', debug: '·' };

function log(level, msg) {
  const ts = new Date().toISOString();
  console[level === 'error' ? 'error' : 'log'](`[${ts}] ${levels[level]} ${msg}`);
}

export const logger = {
  info:  msg => log('info', msg),
  warn:  msg => log('warn', msg),
  error: msg => log('error', msg),
  debug: msg => log('debug', msg),
};
