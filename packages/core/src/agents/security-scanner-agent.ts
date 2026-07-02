/**
 * Security Scanner Agent
 * 
 * A specialized agent for identifying security vulnerabilities in code.
 * Performs deep security analysis including:
 * - OWASP Top 10 vulnerabilities
 * - Authentication/authorization flaws
 * - Data exposure risks
 * - Injection attacks
 * - Cryptographic weaknesses
 * - Dependency vulnerabilities
 * - Configuration issues
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

// Security findings schema
const SecurityScanReportSchema = z.object({
  scan_metadata: z.object({
    target: z.string(),
    scan_type: z.string(),
    timestamp: z.string(),
    duration_seconds: z.number(),
  }),
  summary: z.object({
    critical_vulnerabilities: z.number(),
    high_vulnerabilities: z.number(),
    medium_vulnerabilities: z.number(),
    low_vulnerabilities: z.number(),
    total_findings: z.number(),
    risk_score: z.number().min(0).max(100),
    risk_level: z.enum(['critical', 'high', 'medium', 'low', 'minimal']),
  }),
  findings: z.array(z.object({
    id: z.string(),
    severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
    category: z.enum([
      'injection', 'authentication', 'sensitive_data', 
      'crypto', 'configuration', 'dependencies', 
      'xss', 'csrf', 'idor', 'ssrf', 'path_traversal'
    ]),
    title: z.string(),
    description: z.string(),
    affected_files: z.array(z.object({
      file: z.string(),
      line: z.number().optional(),
      code_snippet: z.string().optional(),
    })),
    impact: z.string(),
    exploitation_scenario: z.string().optional(),
    remediation: z.object({
      priority: z.enum(['immediate', 'high', 'medium', 'low']),
      steps: z.array(z.string()),
      effort: z.enum(['hours', 'days', 'weeks']),
      code_fix_example: z.string().optional(),
    }),
    references: z.array(z.object({
      title: z.string(),
      url: z.string().optional(),
      cwe_id: z.string().optional(),
    })).optional(),
    false_positive_likelihood: z.enum(['very_low', 'low', 'medium', 'high']).optional(),
  })),
  compliance: z.object({
    owasp_top_10: z.record(z.boolean()),
    pci_dss: z.boolean().optional(),
    hipaa: z.boolean().optional(),
    gdpr: z.boolean().optional(),
  }),
  recommendations: z.array(z.object({
    category: z.string(),
    recommendation: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
  })),
});

/**
 * Security Scanner Agent
 * 
 * Performs comprehensive security vulnerability scanning.
 */
export const SecurityScannerAgent = (
  config: Config,
): LocalAgentDefinition<typeof SecurityScanReportSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'security_scanner',
    kind: 'local',
    displayName: 'Security Scanner Agent',
    description: `A comprehensive security scanning agent that identifies vulnerabilities in code.

    Use this agent when you need:
    - OWASP Top 10 vulnerability detection
    - Authentication/authorization flaw finding
    - Sensitive data exposure identification
    - Cryptographic weakness detection
    - Dependency vulnerability scanning
    - Configuration security review
    - Security compliance checking
    
    Categories scanned:
    - Injection attacks (SQL, NoSQL, Command, LDAP, etc.)
    - Cross-Site Scripting (XSS)
    - Cross-Site Request Forgery (CSRF)
    - Insecure Direct Object References (IDOR)
    - Server-Side Request Forgery (SSRF)
    - Path Traversal
    - Authentication bypass
    - Sensitive data exposure
    - Cryptographic failures
    - Security misconfiguration
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          target: z.object({
            type: 'string',
            description: 'File path, directory, or code to scan',
          }),
          scan_type: z.enum([
            'quick', 'standard', 'deep', 'full_stack'
          ]).default('standard'),
          compliance: z.array(z.enum([
            'owasp_top10', 'pci_dss', 'hipaa', 'gdpr'
          ])).optional(),
          include_dependencies: z.boolean().default(true),
          language: z.string().optional(),
        },
        required: ['target'],
      },
    },
    
    outputConfig: {
      outputName: 'security_report',
      description: 'Comprehensive security vulnerability report',
      schema: SecurityScanReportSchema,
    },

    processOutput: (output) => {
      const riskEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
        minimal: '✅',
      };
      
      let report = `# 🔒 Security Scan Report\n\n`;
      report += `**Target:** ${output.scan_metadata.target}\n`;
      report += `**Scan Type:** ${output.scan_metadata.scan_type}\n`;
      report += `**Risk Level:** ${riskEmoji[output.summary.risk_level]} ${output.summary.risk_level.toUpperCase()}\n`;
      report += `**Risk Score:** ${output.summary.risk_score}/100\n\n`;
      
      report += `---\n\n`;
      report += `## 📊 Summary\n\n`;
      report += `| Severity | Count |\n|---------|-------|\n`;
      report += `| 🔴 Critical | ${output.summary.critical_vulnerabilities} |\n`;
      report += `| 🟠 High | ${output.summary.high_vulnerabilities} |\n`;
      report += `| 🟡 Medium | ${output.summary.medium_vulnerabilities} |\n`;
      report += `| 🟢 Low | ${output.summary.low_vulnerabilities} |\n`;
      report += `| **Total** | **${output.summary.total_findings}** |\n\n`;
      
      if (output.findings.length > 0) {
        report += `---\n\n`;
        report += `## 🚨 Critical & High Severity\n\n`;
        
        for (const finding of output.findings.filter(f => 
          ['critical', 'high'].includes(f.severity)
        )) {
          report += `### ${riskEmoji[finding.severity]} ${finding.title}\n`;
          report += `**Category:** ${finding.category}\n\n`;
          report += `**Description:**\n${finding.description}\n\n`;
          report += `**Impact:**\n${finding.impact}\n\n`;
          
          if (finding.affected_files.length > 0) {
            report += `**Affected Files:**\n`;
            for (const file of finding.affected_files) {
              report += `- \`${file.file}\``;
              if (file.line) report += `:${file.line}`;
              report += `\n`;
            }
            report += `\n`;
          }
          
          report += `**Remediation:**\n`;
          report += `${finding.remediation.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
          
          if (finding.references && finding.references.length > 0) {
            report += `**References:**\n`;
            for (const ref of finding.references) {
              report += `- ${ref.title}`;
              if (ref.cwe_id) report += ` (${ref.cwe_id})`;
              report += `\n`;
            }
            report += `\n`;
          }
          
          report += `---\n\n`;
        }
      }
      
      if (output.compliance) {
        report += `## 📋 OWASP Top 10 Compliance\n\n`;
        for (const [item, passed] of Object.entries(output.compliance.owasp_top_10)) {
          report += `| ${passed ? '✅' : '❌'} | ${item} |\n`;
        }
        report += `\n`;
      }
      
      if (output.recommendations.length > 0) {
        report += `## 💡 Recommendations\n\n`;
        for (const rec of output.recommendations) {
          const priorityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
          report += `${priorityEmoji[rec.priority]} **${rec.category}:** ${rec.recommendation}\n\n`;
        }
      }
      
      return report;
    },

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.0,
        topP: 0.9,
        thinkingConfig: supportsModernFeatures(model)
          ? { includeThoughts: true, thinkingBudget: -1 }
          : DEFAULT_THINKING_MODE,
      },
    },

    toolConfig: {
      tools: [
        'read_file',
        'read_many_files',
        'glob',
        'grep',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `Perform security scan on: ${'$'}{target}\n\nScan Type: ${'$'}{scan_type || 'standard'}`,
      systemPrompt: `You are the **Security Scanner Agent**, an expert in application security.

## Your Security Expertise:

### OWASP Top 10 Categories:
1. **A01:2021 – Broken Access Control**
   - Vertical/horizontal privilege escalation
   - IDOR (Insecure Direct Object References)
   - Missing authorization
   - CORS misconfiguration

2. **A02:2021 – Cryptographic Failures**
   - Weak/hardcoded credentials
   - Sensitive data exposure
   - Weak encryption algorithms
   - Improper key management

3. **A03:2021 – Injection**
   - SQL/NoSQL injection
   - Command injection
   - LDAP injection
   - XPath injection
   - Template injection

4. **A04:2021 – Insecure Design**
   - Business logic flaws
   - Missing rate limiting
   - Insufficient anti-automation

5. **A05:2021 – Security Misconfiguration**
   - Default credentials
   - Error handling exposing stack traces
   - Unnecessary features enabled
   - Improper error messages

6. **A06:2021 – Vulnerable Components**
   - Outdated dependencies
   - Untrusted dependencies
   - Unsupported components

7. **A07:2021 – Authentication Failures**
   - Weak passwords
   - Session fixation
   - Missing MFA
   - Credential stuffing

8. **A08:2021 – Software and Data Integrity**
   - CI/CD without validation
   - Insecure deserialization
   - Reliance on untrusted CDNs

9. **A09:2021 – Security Logging Failures**
   - No audit logging
   - Insufficient logging
   - Missing alerting

10. **A10:2021 – SSRF**
    - Server-Side Request Forgery
    - URL validation bypasses

## Additional Security Checks:

### Authentication & Authorization
- Hardcoded credentials
- Session management issues
- Missing access controls
- Privilege escalation risks

### Data Protection
- Hardcoded secrets/keys
- Sensitive data in logs
- Insecure storage
- Data leakage

### Input Validation
- All user inputs unvalidated
- Missing sanitization
- Bypass techniques

### Cryptography
- Weak random number generation
- Custom crypto
- Hardcoded keys/seeds
- Weak hash functions

## Scanning Process:

### 1. Reconnaissance
- List all files in target
- Identify technologies used
- Detect entry points
- Map attack surface

### 2. Vulnerability Analysis
For each file, check:
- Hardcoded credentials
- User input handling
- Database queries
- API calls
- File operations
- Network requests
- Authentication logic
- Authorization checks

### 3. Pattern Recognition
Look for:
- SQL/NoSQL query building with user input
- eval(), exec(), system() calls
- InnerHTML/document.write usage
- Dangerous file operations
- Authentication/authorization bypass patterns
- Secrets in code/comments/env

### 4. Risk Assessment
For each finding:
- **Impact**: What can an attacker achieve?
- **Exploitability**: How easy is it to exploit?
- **Prevalence**: How common is this issue?

### 5. Generate Report

\`\`\`json
{
  "scan_metadata": {
    "target": "...",
    "scan_type": "...",
    "timestamp": "ISO8601",
    "duration_seconds": 0
  },
  "summary": {
    "critical_vulnerabilities": 0,
    "high_vulnerabilities": 0,
    "medium_vulnerabilities": 0,
    "low_vulnerabilities": 0,
    "total_findings": 0,
    "risk_score": 0-100,
    "risk_level": "critical|high|medium|low|minimal"
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "critical",
      "category": "injection",
      "title": "SQL Injection Vulnerability",
      "description": "...",
      "affected_files": [...],
      "impact": "...",
      "exploitation_scenario": "...",
      "remediation": {
        "priority": "immediate",
        "steps": ["..."],
        "effort": "hours",
        "code_fix_example": "..."
      },
      "references": [
        {"title": "OWASP SQL Injection", "cwe_id": "CWE-89"}
      ],
      "false_positive_likelihood": "low"
    }
  ],
  "compliance": {
    "owasp_top_10": {
      "A01_broken_access_control": false,
      "A02_cryptographic_failures": false,
      "A03_injection": true,
      ...
    }
  },
  "recommendations": [...]
}
\`\`\`

## Output Requirements:

- Be specific about locations (file:line)
- Provide exploitation scenarios
- Include remediation with code examples
- Reference CWE/OWASP documentation
- Assess false positive likelihood

## Quality Standards:

- No false positives without flagging them
- Prioritize by real-world risk
- Provide actionable remediation
- Consider attack complexity`,
    },
  };
};

export default SecurityScannerAgent;