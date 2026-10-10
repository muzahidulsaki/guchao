/**
 * CommonJS Loader for LiteSpeed / Phusion Passenger (lsnode.js)
 * Bridges CommonJS require() to modern ES Module import('./server.js')
 */
async function loadApp() {
  await import('./server.js');
}

loadApp().catch((err) => {
  console.error('Failed to load application:', err);
});
