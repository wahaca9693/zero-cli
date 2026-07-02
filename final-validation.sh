#!/bin/bash

# ZERO CLI Final Validation Script
# This script validates everything before pushing to GitHub

echo "=========================================="
echo "ZERO CLI - Final Validation"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

echo "1. Checking Package Names..."
cd /workspace/zero-cli

# Check package.json
grep -q '"@allhands/zero-cli"' package.json
check $? "Root package.json has correct name"

# Check workspace packages
for pkg in cli core sdk a2a-server devtools test-utils; do
    if [ -f "packages/$pkg/package.json" ]; then
        grep -q "@allhands/zero-cli" "packages/$pkg/package.json"
        check $? "packages/$pkg has correct package name"
    fi
done

echo ""
echo "2. Checking for Remaining Gemini References..."
GEMINI_COUNT=$(grep -r "Gemini\|gemini\|GEMINI" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v package-lock.json | wc -l)

if [ "$GEMINI_COUNT" -eq 0 ]; then
    check 0 "No Gemini references found"
else
    echo -e "${YELLOW}⚠️ Found $GEMINI_COUNT lines with 'Gemini' references${NC}"
    grep -r "Gemini\|gemini\|GEMINI" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.js" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v package-lock.json | head -20
    WARNINGS=$((WARNINGS + GEMINI_COUNT))
fi

echo ""
echo "3. Checking Agent Files..."
AGENT_COUNT=$(find packages/core/src/agents -name "*-agent.ts" 2>/dev/null | wc -l)
echo "   Found $AGENT_COUNT agent files"

EXPECTED_AGENTS=14
if [ "$AGENT_COUNT" -ge "$EXPECTED_AGENTS" ]; then
    check 0 "Agent files count: $AGENT_COUNT (expected: $EXPECTED_AGENTS+)"
else
    check 1 "Agent files count: $AGENT_COUNT (expected: $EXPECTED_AGENTS+)"
fi

echo ""
echo "4. Checking Documentation..."
[ -f "COMPLETE_AGENTS_GUIDE.md" ]
check $? "Complete Agents Guide exists"

[ -f "CUSTOM_AGENTS_GUIDE.md" ]
check $? "Custom Agents Guide exists"

echo ""
echo "5. Checking Registry..."
grep -q "MultimodalAgent" packages/core/src/agents/registry.ts
check $? "MultimodalAgent registered"

grep -q "VoiceAgent" packages/core/src/agents/registry.ts
check $? "VoiceAgent registered"

grep -q "DocumentAnalyzerAgent" packages/core/src/agents/registry.ts
check $? "DocumentAnalyzerAgent registered"

grep -q "DataAnalystAgent" packages/core/src/agents/registry.ts
check $? "DataAnalystAgent registered"

grep -q "TestGeneratorAgent" packages/core/src/agents/registry.ts
check $? "TestGeneratorAgent registered"

grep -q "APIDesignerAgent" packages/core/src/agents/registry.ts
check $? "APIDesignerAgent registered"

grep -q "DevOpsAgent" packages/core/src/agents/registry.ts
check $? "DevOpsAgent registered"

grep -q "ArchitectAgent" packages/core/src/agents/registry.ts
check $? "ArchitectAgent registered"

grep -q "DatabaseExpertAgent" packages/core/src/agents/registry.ts
check $? "DatabaseExpertAgent registered"

grep -q "RefactorerAgent" packages/core/src/agents/registry.ts
check $? "RefactorerAgent registered"

echo ""
echo "6. Checking Telegram Bridge..."
[ -d "packages/cli/src/commands/extensions/examples/telegram-bridge" ]
check $? "Telegram Bridge extension directory exists"

[ -f "packages/cli/src/commands/extensions/examples/telegram-bridge/gemini-extension.json" ]
check $? "Telegram Bridge extension config exists"

echo ""
echo "7. Checking Test Files..."
[ -f "validate-agents.ts" ]
check $? "Validation script exists"

[ -f "test-agents.ts" ]
check $? "Test script exists"

echo ""
echo "8. Checking Git Configuration..."
[ -d ".git" ]
check $? "Git repository initialized"

echo ""
echo "=========================================="
echo "VALIDATION SUMMARY"
echo "=========================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Validation Complete - Ready for GitHub!${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation Failed - Please Fix Errors${NC}"
    exit 1
fi