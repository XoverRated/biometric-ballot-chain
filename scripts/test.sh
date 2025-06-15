
#!/bin/bash

echo "Running comprehensive test suite..."

# Run unit tests with coverage
echo "🧪 Running unit tests..."
npm run test:unit -- --coverage

# Run integration tests
echo "🔗 Running integration tests..."
npm run test:integration

# Run e2e tests
echo "🎭 Running end-to-end tests..."
npm run test:e2e

# Run performance tests
echo "⚡ Running performance tests..."
npm run test:performance

# Generate test report
echo "📊 Generating test report..."
npm run test:report

echo "✅ All tests completed!"
