# 🤖 دليل الوكلاء المخصصة المحسنة

## نظرة عامة

هذا الدليل يشرح الوكلاء المخصصة التي تمت إضافتها لـ ZERO CLI.

---

## 📋 قائمة الوكلاء

| الوكيل | الاسم | الوصف |
|--------|-------|-------|
| 📝 | Code Reviewer | مراجعة شاملة للكود |
| 🔒 | Security Scanner | فحص الثغرات الأمنية |
| ⚡ | Performance Analyzer | تحليل الأداء |
| 💬 | Telegram Agent | ربط التيليجرام |

---

## 📝 Code Reviewer Agent

### الوصف
وكيل متخصص في مراجعة الكود بشكل عميق وشامل.

### القدرات
- ✅ فحص الأمان (Security)
- ✅ كشف الأخطاء (Bugs)
- ✅ تحليل الأداء (Performance)
- ✅ فحص الأنماط (Style)
- ✅ قابلية الصيانة (Maintainability)
- ✅ التوثيق (Documentation)
- ✅ الاختبارات (Testing)

### الأوامر
```
delegate_to_agent(code_reviewer, {
  target: "/path/to/file.ts",
  focus_areas: ["security", "performance"],
  review_type: "deep"
})
```

### المخرجات
```json
{
  "summary": {
    "total_files_reviewed": 5,
    "issues_found": 12,
    "critical_issues": 2,
    "overall_rating": "good"
  },
  "findings": [
    {
      "file": "src/auth.ts",
      "line": 42,
      "severity": "critical",
      "category": "security",
      "title": "Hardcoded Password",
      "description": "...",
      "suggestion": "..."
    }
  ]
}
```

### اللغات المدعومة
- TypeScript
- JavaScript
- Python
- Go
- Rust
- Java
- C#

---

## 🔒 Security Scanner Agent

### الوصف
وكيل متخصص في فحص الثغرات الأمنية وفحص أمان التطبيقات.

### القدرات
- ✅ OWASP Top 10
- ✅ فحص Injection (SQL, NoSQL, Command)
- ✅ فحص XSS/CSRF
- ✅ كشف Secrets/Hardcoded Credentials
- ✅ فحص التشفير
- ✅ فحص Dependencies
- ✅ فحص التصحيحات (Patches)

### الأوامر
```
delegate_to_agent(security_scanner, {
  target: "/path/to/project",
  scan_type: "deep",
  compliance: ["owasp_top10", "pci_dss"]
})
```

### المخرجات
```json
{
  "summary": {
    "critical_vulnerabilities": 1,
    "high_vulnerabilities": 3,
    "risk_score": 75,
    "risk_level": "high"
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "critical",
      "category": "injection",
      "title": "SQL Injection Vulnerability",
      "impact": "Attacker can execute arbitrary SQL",
      "remediation": {
        "priority": "immediate",
        "steps": ["Use parameterized queries"]
      }
    }
  ]
}
```

### فئات الأمان المدعومة
| الفئة | الوصف |
|-------|-------|
| `injection` | SQL, NoSQL, Command Injection |
| `authentication` | مشاكل المصادقة |
| `sensitive_data` | تسرب البيانات الحساسة |
| `crypto` | ضعف التشفير |
| `configuration` | أخطاء الإعدادات |
| `dependencies` | مكتبات ضعيفة |
| `xss` | Cross-Site Scripting |
| `csrf` | Cross-Site Request Forgery |
| `idor` | Insecure Direct Object Reference |
| `ssrf` | Server-Side Request Forgery |
| `path_traversal` |Traversal Attack |

---

## ⚡ Performance Analyzer Agent

### الوصف
وكيل متخصص في تحليل الأداء وتحسين الكود.

### القدرات
- ✅ تحليل التعقيد (Time/Space Complexity)
- ✅ كشف N+1 Queries
- ✅ تحليل الذاكرة
- ✅ كشف تسرب الذاكرة (Memory Leaks)
- ✅ تحسين الخوارزميات
- ✅ فرص التخزين المؤقت (Caching)
- ✅ تحسين الشبكة

### الأوامر
```
delegate_to_agent(performance_analyzer, {
  target: "/path/to/api",
  analysis_type: "database_focused"
})
```

### المخرجات
```json
{
  "summary": {
    "total_files_analyzed": 10,
    "issues_found": 8,
    "estimated_speedup_potential": "3-5x",
    "overall_performance_rating": "moderate"
  },
  "complexity_analysis": [
    {
      "file": "src/sort.ts",
      "function": "quickSort",
      "time_complexity": "O(n log n)",
      "space_complexity": "O(n)",
      "risk_level": "low"
    }
  ],
  "quick_wins": [
    {
      "file": "src/db.ts",
      "line": 42,
      "description": "Add index on user_id",
      "effort": "minutes",
      "impact": "high"
    }
  ]
}
```

### درجات التعقيد
| الدرجة | الوصف | اللون |
|--------|-------|-------|
| O(1) | Constant | 🟢 Excellent |
| O(log n) | Logarithmic | 🟢 Good |
| O(n) | Linear | 🟡 Acceptable |
| O(n log n) | Linearithmic | 🟡 Moderate |
| O(n²) | Quadratic | 🟠 Warning |
| O(n³) | Cubic | 🔴 Bad |
| O(2^n) | Exponential | 🔴 Bad |

---

## 💬 Telegram Agent

### الوصف
وكيل لإدارة ربط بوت التيليجرام.

### القدرات
- ✅ الاتصال ببوت التيليجرام
- ✅ إرسال رسائل
- ✅ إدارة الأوامر (Commands)
- ✅ فحص الحالة (Status)
- ✅ List Chats

### الأوامر
```
delegate_to_agent(telegram_agent, {
  action: "connect",
  bot_token: "your_token_here",
  owner_chat_id: 123456789
})
```

### المخرجات
```json
{
  "success": true,
  "message": "✅ Successfully connected to Telegram bot!",
  "bot_token_prefix": "123456:ABC...",
  "owner_chat_id": 123456789
}
```

---

## 🔧 كيفية الاستخدام

### 1. استدعاء وكيل معين
```
delegate_to_agent(code_reviewer, {
  target: "/path/to/files"
})
```

### 2. استدعاء مع خيارات
```
delegate_to_agent(security_scanner, {
  target: "./src",
  scan_type: "deep",
  compliance: ["owasp_top10"]
})
```

### 3. الحصول على تقرير
كل وكيل يرجع تقرير JSON يحتوي على:
- Summary (ملخص)
- Findings (النتائج)
- Recommendations (التوصيات)
- (حسب الوكيل) Additional data

---

## 📊 أمثلة عملية

### مراجعة كود الأمان
```
> review this authentication module for security issues
→ Uses Code Reviewer Agent with security focus
```

### فحص الثغرات
```
> scan my API for OWASP vulnerabilities
→ Uses Security Scanner Agent
```

### تحليل الأداء
```
> find performance bottlenecks in my database queries
→ Uses Performance Analyzer Agent
```

### ربط التيليجرام
```
> connect to my Telegram bot with token xyz
→ Uses Telegram Agent
```

---

## ⚠️ ملاحظات مهمة

1. **الحصص**: الوكلاء يستخدمون من حصة ZERO CLI الخاصة بك
2. **الأمان**: لا تشارك التوكنات بشكل عام
3. **التعقيد**: الفحص العميق (deep) يستغرق وقت أطول
4. **اللغات**: معظم الوكلاء تدعم عدة لغات برمجية

---

## 🧪 الاختبارات

لتشغيل اختبارات الوكلاء:

```bash
cd packages/core/src/agents/__tests__
npx vitest run agent-benchmarks.ts
```

---

## 📝 إضافة وكلاء جدد

### الخطوة 1: إنشاء ملف الوكيل
```typescript
// packages/core/src/agents/my-agent.ts
import type { LocalAgentDefinition } from './types.js';

export const MyAgent = (config: Config): LocalAgentDefinition => ({
  name: 'my_agent',
  kind: 'local',
  displayName: 'My Agent',
  description: 'Description...',
  // ... rest of config
});
```

### الخطوة 2: تسجيل الوكيل
```typescript
// packages/core/src/agents/registry.ts
import { MyAgent } from './my-agent.js';

private loadBuiltInAgents(): void {
  // ... other agents
  this.registerLocalAgent(MyAgent(this.config));
}
```

### الخطوة 3: الاختبار
```bash
npm run build
zero
> delegate_to_agent(my_agent, { ... })
```

---

*تم إنشاؤه بواسطة OpenHands - ZERO CLI Enhanced Edition*