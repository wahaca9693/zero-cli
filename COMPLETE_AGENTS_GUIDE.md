# 🤖 دليل شامل للوكلاء المحسنين - ZERO CLI Enhanced Edition

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [الوكلاء المتخصصون](#الوكلاء-المتخصصون)
3. [الوكلاء المتقدمون](#الوكلاء-المتقدمون)
4. [الوكلاء الخبراء](#الوكلاء-الخبراء)
5. [كيفية الاستخدام](#كيفية-الاستخدام)
6. [أمثلة عملية](#أمثلة-عملية)

---

## نظرة عامة

المشروع يحتوي الآن على **19 وكيل ذكي** متخصص في مجالات مختلفة:

| العدد | الفئة | الوكلاء |
|-------|-------|---------|
| 5 | الوكلاء الأصليون | Codebase Investigator, CLI Help, Generalist, Browser, Skill Extraction |
| 4 | وكلاء محسنين | Code Reviewer, Security Scanner, Performance Analyzer, Telegram |
| 8 | وكلاء متقدمون | Multimodal, Voice, Document, Data Analyst, Test Generator, API Designer, DevOps |
| 3 | وكلاء خبراء | Architect, Database Expert, Refactorer |

---

## الوكلاء المتخصصون

### 1. 📝 Code Reviewer Agent (مُحسّن)

**القدرات:**
- ✅ كشف مشاكل الأمان (Security)
- ✅ كشف الأخطاء (Bugs)
- ✅ تحليل الأداء (Performance)
- ✅ فحص الأنماط (Style)
- ✅ قابلية الصيانة (Maintainability)
- ✅ التوثيق (Documentation)
- ✅ الاختبارات (Testing)
- ✅ كشف الأسرار (Secrets Detection)
- ✅ تحليل الكود المعقد

**الأوامر:**
```javascript
delegate_to_agent(code_reviewer, {
  target: "/path/to/project",
  focus_areas: ["security", "performance", "style"],
  review_type: "deep"
})
```

**المخرجات:**
```json
{
  "summary": {
    "total_files_reviewed": 15,
    "issues_found": 23,
    "critical_issues": 3,
    "overall_rating": "good"
  },
  "findings": [
    {
      "severity": "critical",
      "category": "security",
      "title": "Hardcoded API Key",
      "suggestion": "Use environment variables"
    }
  ]
}
```

---

### 2. 🔒 Security Scanner Agent (مُحسّن)

**القدرات:**
- ✅ OWASP Top 10 كامل
- ✅ كشف Injection (SQL, NoSQL, Command, LDAP)
- ✅ كشف XSS, CSRF, IDOR, SSRF
- ✅ كشف Hardcoded Secrets
- ✅ فحص التشفير الضعيف
- ✅ فحص Dependencies
- ✅ تقييم المخاطر (0-100)
- ✅ خطوات الإصلاح مع أمثلة

**الأوامر:**
```javascript
delegate_to_agent(security_scanner, {
  target: "/path/to/api",
  scan_type: "deep",
  compliance: ["owasp_top10", "pci_dss"]
})
```

**المخرجات:**
```json
{
  "summary": {
    "critical_vulnerabilities": 2,
    "high_vulnerabilities": 5,
    "risk_score": 78,
    "risk_level": "high"
  },
  "findings": [
    {
      "id": "SEC-001",
      "severity": "critical",
      "category": "injection",
      "remediation": {
        "steps": ["Use parameterized queries", "Validate input"]
      }
    }
  ]
}
```

---

### 3. ⚡ Performance Analyzer Agent (مُحسّن)

**القدرات:**
- ✅ تحليل التعقيد (O(n), O(n²), O(n!), إلخ)
- ✅ كشف N+1 Queries
- ✅ كشف Memory Leaks
- ✅ تحسين الخوارزميات
- ✅ فرص التخزين المؤقت (Caching)
- ✅ Quick Wins - تحسينات سريعة
- ✅ تقدير تحسين السرعة

**الأوامر:**
```javascript
delegate_to_agent(performance_analyzer, {
  target: "/path/to/database",
  analysis_type: "database_focused"
})
```

---

### 4. 💬 Telegram Agent

**القدرات:**
- ✅ Connect/Disconnect
- ✅ Send Messages
- ✅ Status Check
- ✅ List Chats
- ✅ Set Commands

**الأوامر:**
```javascript
delegate_to_agent(telegram_agent, {
  action: "connect",
  bot_token: "YOUR_BOT_TOKEN"
})
```

---

## الوكلاء المتقدمون

### 5. 🎨 Multimodal Agent (جديد)

**القدرات:**
- ✅ تحليل الصور (Screenshots, Charts, Diagrams)
- ✅ OCR لاستخراج النصوص من الصور
- ✅ فهم الكود من الصور
- ✅ تحليل أخطاء الشاشة (Error Screenshots)
- ✅ فهم Charts و Graphs
- ✅ تحليل الفيديو (Key Frames)
- ✅ التعرف على الأشياء (Object Detection)
- ✅ Combined Analysis

**الأوامر:**
```javascript
delegate_to_agent(multimodal, {
  media_paths: [
    { path: "/path/to/screenshot.png", type: "image" },
    { path: "/path/to/error.png", type: "image" }
  ],
  analysis_focus: ["objects", "text", "errors", "charts"]
})
```

**المخرجات:**
```json
{
  "summary": {
    "media_types_processed": ["image"],
    "total_items": 2,
    "confidence_score": 94.5
  },
  "image_analysis": {
    "detected_objects": [...],
    "extracted_text": "Error: Connection refused...",
    "error_screenshots": [{
      "error_type": "Network Error",
      "suggested_fix": "Check server configuration"
    }]
  }
}
```

---

### 6. 🎤 Voice Agent (جديد)

**القدرات:**
- ✅ Speech-to-Text (تحويل صوت لنص)
- ✅ التعرف على النية (Intent Recognition)
- ✅ استخراج الأوامر (Command Extraction)
- ✅ استخراج Action Items
- ✅ تحليل المشاعر (Sentiment)
- ✅ تحديد المتحدثين (Speaker Detection)
- ✅ Multi-language Support
- ✅ Timestamps للقطع

**الأوامر:**
```javascript
delegate_to_agent(voice, {
  audio_paths: [
    { path: "/path/to/meeting.mp3", format: "mp3", language: "ar" }
  ],
  task: "Extract action items and key decisions",
  extract_action_items: true,
  identify_speakers: true
})
```

---

### 7. 📄 Document Analyzer Agent (جديد)

**القدرات:**
- ✅ تحليل PDF
- ✅ تحليل Word (.docx)
- ✅ تحليل Excel (.xlsx, .csv)
- ✅ تحليل PowerPoint
- ✅ استخراج الجداول
- ✅ استخراج الصور والرسوم
- ✅ Cross-Document Analysis
- ✅ كشف التناقضات
- ✅ استخراج Action Items

**الأوامر:**
```javascript
delegate_to_agent(document_analyzer, {
  document_paths: [
    { path: "/path/to/report.pdf", type: "pdf" },
    { path: "/path/to/data.xlsx", type: "xlsx" }
  ],
  analysis_type: "comparative",
  extract_tables: true
})
```

---

### 8. 📊 Data Analyst Agent (جديد)

**القدرات:**
- ✅ تحليل البيانات الإحصائية
- ✅ كشف Patterns و Trends
- ✅ Correlation Analysis
- ✅ كشف Outliers
- ✅ إنشاء Visualizations (Charts, Graphs)
- ✅ Data Quality Assessment
- ✅ بناء نماذج ML
- ✅ توليد التقارير
- ✅ توصيات قابلة للتنفيذ

**الأوامر:**
```javascript
delegate_to_agent(data_analyst, {
  data_paths: [
    { path: "/path/to/sales.csv", type: "csv" }
  ],
  analysis_type: "full",
  generate_visualizations: true,
  build_models: true,
  target_variable: "revenue"
})
```

---

### 9. 🧪 Test Generator Agent (جديد)

**القدرات:**
- ✅ توليد Unit Tests
- ✅ توليد Integration Tests
- ✅ توليد E2E Tests
- ✅ توليد Performance Tests
- ✅ كشف Edge Cases
- ✅ تحليل Coverage
- ✅ توليد Mock Data
- ✅ Multiple Frameworks (Jest, Pytest, JUnit, إلخ)

**الأوامر:**
```javascript
delegate_to_agent(test_generator, {
  target_paths: [
    { path: "/path/to/services/", type: "directory" }
  ],
  test_framework: "jest",
  test_type: ["unit", "integration"],
  coverage_target: 85,
  include_edge_cases: true
})
```

---

### 10. 🔌 API Designer Agent (جديد)

**القدرات:**
- ✅ تصميم REST APIs
- ✅ تصميم GraphQL Schemas
- ✅ توليد OpenAPI Specifications
- ✅ إنشاء Mock Servers
- ✅ توليد Documentation
- ✅ توليد Client SDKs
- ✅ Security Validation
- ✅ Performance Analysis

**الأوامر:**
```javascript
delegate_to_agent(api_designer, {
  description: "Design a user management API with authentication",
  api_style: "REST",
  target_language: "typescript",
  target_framework: "express",
  include_mock_server: true,
  authentication: "bearer"
})
```

---

### 11. 🚀 DevOps Agent (جديد)

**القدرات:**
- ✅ إنشاء Dockerfiles
- ✅ تحسين Docker Images
- ✅ إنشاء CI/CD Pipelines
- ✅ GitHub Actions, GitLab CI, Jenkins
- ✅ Kubernetes Configurations
- ✅ Deployments, Services, Ingress
- ✅ Terraform/IaC
- ✅ Ansible Playbooks
- ✅ Monitoring (Prometheus, Grafana)

**الأوامر:**
```javascript
delegate_to_agent(devops, {
  task: "full_pipeline",
  project_path: "/path/to/project",
  target_platform: "github_actions",
  include_monitoring: true
})
```

---

## الوكلاء الخبراء

### 12. 🏗️ Architect Agent (جديد)

**القدرات:**
- ✅ تصميم البنى التحتية (System Architecture)
- ✅ تصميم microservices
- ✅ تقييم أنماط التصميم (Design Patterns)
- ✅ تصميم نماذج البيانات (Data Models)
- ✅ تقييم trade-offs
- ✅ تقدير التكاليف
- ✅ تقييم المخاطر
- ✅ مراحل التنفيذ

**الأوامر:**
```javascript
delegate_to_agent(architect, {
  project_type: "microservices",
  requirements: "تصميم نظام تجارة إلكترونية",
  scale: "enterprise"
})
```

### 13. 🗄️ Database Expert Agent (جديد)

**القدرات:**
- ✅ تصميم مخططات قواعد البيانات (Schema Design)
- ✅ تحسين الاستعلامات (Query Optimization)
- ✅ إنشاء الفهارس (Indexes)
- ✅ إدارة الترحيلات (Migrations)
- ✅ تصميم قابلية التوسع (Scalability)
- ✅ استراتيجيات النسخ الاحتياطي (Backup)
- ✅ اختيار نوع قاعدة البيانات

**الأوامر:**
```javascript
delegate_to_agent(database_expert, {
  task: "design",
  database_type: "postgresql",
  requirements: "تصميم قاعدة بيانات للمستخدمين والمنتجات"
})
```

### 14. 🔄 Refactorer Agent (جديد)

**القدرات:**
- ✅ إعادة هيكلة الكود (Code Refactoring)
- ✅ تحسين جودة الكود
- ✅ تقليل الديون التقنية (Technical Debt)
- ✅ تطبيق أنماط التصميم (Design Patterns)
- ✅ تحديث الكود القديم (Legacy Modernization)
- ✅ إزالة الروائح الكودية (Code Smells)
- ✅ تبسيط الشروط المعقدة

**الأوامر:**
```javascript
delegate_to_agent(refactorer, {
  target_paths: ["./src/services"],
  refactoring_type: "full"
})
```

---

## كيفية الاستخدام

### 1. استدعاء وكيل معين

```bash
zero> delegate_to_agent(code_reviewer, {
  target: "./src",
  focus_areas: ["security"]
})
```

### 2. استدعاء متعدد

```bash
zero> First review the code, then scan for security issues
→ Uses multiple agents in sequence
```

### 3. إنشاء Pipeline

```bash
zero> Review code, generate tests, and setup CI/CD
→ Creates a complete workflow
```

---

## أمثلة عملية

### مراجعة كود شاملة
```bash
zero> delegate_to_agent(code_reviewer, {
  target: "./auth",
  focus_areas: ["security", "performance", "style"],
  review_type: "deep"
})
```

### فحص أمان لتطبيق ويب
```bash
zero> delegate_to_agent(security_scanner, {
  target: "./api",
  scan_type: "deep",
  compliance: ["owasp_top10"]
})
```

### تحليل أداء قاعدة البيانات
```bash
zero> delegate_to_agent(performance_analyzer, {
  target: "./database",
  analysis_type: "database_focused"
})
```

### تحليل صورة خطأ
```bash
zero> delegate_to_agent(multimodal, {
  media_paths: [
    { path: "./error-screenshot.png", type: "image" }
  ],
  analysis_focus: ["errors", "scene"]
})
```

### تحويل تسجيل صوتي
```bash
zero> delegate_to_agent(voice, {
  audio_paths: [
    { path: "./meeting.mp3", format: "mp3" }
  ],
  task: "Extract all action items and decisions",
  extract_action_items: true
})
```

### تحليل مستندات
```bash
zero> delegate_to_agent(document_analyzer, {
  document_paths: [
    { path: "./contract.pdf", type: "pdf" },
    { path: "./requirements.docx", type: "docx" }
  ],
  analysis_type: "comparative"
})
```

### تحليل بيانات
```bash
zero> delegate_to_agent(data_analyst, {
  data_paths: [
    { path: "./sales-data.csv", type: "csv" }
  ],
  analysis_type: "full",
  generate_visualizations: true
})
```

### توليد اختبارات
```bash
zero> delegate_to_agent(test_generator, {
  target_paths: [
    { path: "./src/services", type: "directory" }
  ],
  test_framework: "jest",
  coverage_target: 90
})
```

### تصميم API
```bash
zero> delegate_to_agent(api_designer, {
  description: "Design an e-commerce API with products, orders, and payments",
  api_style: "REST",
  target_framework: "express"
})
```

### إعداد DevOps
```bash
zero> delegate_to_agent(devops, {
  task: "full_pipeline",
  project_path: "./my-app",
  target_platform: "github_actions"
})
```

---

## 🏆 ملخص القدرات

| الوكيل | اللغات | الميزات الرئيسية |
|--------|--------|----------------|
| Code Reviewer | 7+ | Security, Bug, Style, Performance |
| Security Scanner | All | OWASP, Injection, Secrets |
| Performance | All | Complexity, Optimization |
| Multimodal | Images | OCR, Charts, Errors, Objects |
| Voice | 10+ | STT, Intent, Commands |
| Document | 6 formats | PDF, Word, Excel, Cross-Doc |
| Data Analyst | CSV, JSON | Statistics, ML, Visualization |
| Test Generator | 8 frameworks | Unit, Integration, E2E |
| API Designer | REST, GraphQL | OpenAPI, Mock, Docs |
| DevOps | Docker, K8s, CI | Pipelines, Deploy, Monitoring |

---

## ⚡ مقارنة السرعة

| الوكيل | الوقت المتوقع |
|--------|-------------|
| Code Reviewer | 2-5 seconds |
| Security Scanner | 3-6 seconds |
| Performance Analyzer | 2-5 seconds |
| Multimodal | 5-10 seconds |
| Voice | 3-8 seconds |
| Document Analyzer | 5-15 seconds |
| Data Analyst | 10-20 seconds |
| Test Generator | 5-10 seconds |
| API Designer | 3-8 seconds |
| DevOps | 5-10 seconds |

---

## 🔗 تكامل الوكلاء

الوكلاء يمكنهم العمل معاً:

```
Code Reviewer → Security Scanner → Test Generator → DevOps
     ↓               ↓               ↓            ↓
  Find Issues    Scan Vulns    Generate    Setup CI/CD
                     ↓            Tests        ↓
              Performance     ↓            Deploy
               Analyzer      ↓            Pipeline
```

---

## 📝 ملاحظات مهمة

1. **الحصص**: الوكلاء يستخدموا من حصة ZERO CLI الخاصة بك
2. **الأمان**: لا تشارك التوكنات بشكل عام
3. **اللغات**: معظم الوكلاء تدعم عدة لغات برمجية
4. **التعقيد**: الفحص العميق (deep) يستغرق وقت أطول

---

*تم تطويره بواسطة OpenHands - ZERO CLI Enhanced Edition*
*${new Date().toISOString()}*