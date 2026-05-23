/**
 * Bootstrap script for E2E testing.
 * Imports the Express app and starts listening — bypasses the
 * require.main === module guard which doesn't work under tsx ESM.
 */
import app from './server';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 E2E bootstrap: Server running on port ${PORT}`);
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });
