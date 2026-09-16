// Test setup — runs before each test file
process.env["DATABASE_URL"] = "postgresql://gsmedcure:gsmedcure_dev@localhost:5432/gsmedcure_test";
process.env["JWT_SECRET"] = "test_secret_key_that_is_long_enough_for_validation";
process.env["JWT_EXPIRES_IN"] = "1h";
process.env["NODE_ENV"] = "test";
process.env["PORT"] = "4001";
process.env["CORS_ORIGIN"] = "http://localhost:5173";
