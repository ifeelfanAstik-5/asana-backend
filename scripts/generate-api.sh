#!/bin/bash

# Script to generate NestJS API from Asana OpenAPI spec

set -e

echo "🚀 Generating NestJS API from Asana OpenAPI spec..."

# Download OpenAPI spec if not exists
if [ ! -f "asana_oas.yaml" ]; then
    echo "📥 Downloading Asana OpenAPI spec..."
    curl -o asana_oas.yaml https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml
    echo "✅ Downloaded asana_oas.yaml"
else
    echo "✅ Using existing asana_oas.yaml"
fi

# Check if generator is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Generate code
echo "⚙️  Generating NestJS code..."
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto,enumPropertyNaming=original

echo "✅ Code generation complete!"
echo "📁 Generated files are in src/generated/"
echo ""
echo "Next steps:"
echo "1. Review generated code in src/generated/"
echo "2. Create service implementations in src/services/"
echo "3. Wire up controllers in app.module.ts"
