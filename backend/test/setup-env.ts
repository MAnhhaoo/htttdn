// Fixed test-only configuration. Persistence is mocked in the HTTP suite.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'http-integration-test-secret-never-use-in-production';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:1/backend_test';
process.env.APP_PREFIX = '/api';
process.env.APP_URL = 'http://localhost:3000/api';
process.env.HOST = 'localhost';
process.env.PORT = '3000';
