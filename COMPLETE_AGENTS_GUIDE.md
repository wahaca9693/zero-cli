# 🤖 دليل شامل للوكلاء - ZERO CLI

## 📋 جدول المحتويات
1. [نظرة عامة](#نظرة-عامة)
2. [الوكلاء المتخصصون](#الوكلاء-المتخصصون)
3. [الوكلاء المتقدمون](#الوكلاء-المتقدمون)
4. [الوكلاء الخبراء](#الوكلاء-الخبراء)
5. [كيفية الاستخدام](#كيفية-الاستخدام)
6. [أمثلة عملية](#أمثلة-عملية)

---

## نظرة عامة

المشروع يحتوي على **17 وكيل ذكي** متخصص في مجالات مختلفة:

| العدد | الفئة | الوكلاء |
|-------|-------|---------|
| 5 | الوكلاء الأصليون | Codebase Investigator, CLI Help, Generalist, Browser, Skill Extraction |
| 4 | وكلاء محسنين | Code Reviewer, Security Scanner, Performance Analyzer, Telegram |
| 8 | وكلاء متقدمون | Multimodal, Voice, Document, Data Analyst, Test Generator, API Designer, DevOps |

---

## الوكلاء المتخصصون

### 1. 📝 Code Reviewer (مراجع الكود)

**القدرات:**
- ✅ تحليل الثغرات الأمنية
- ✅ اكتشاف الأخطاء المحتملة
- ✅ تحسين الأداء
- ✅ فحص أنماط الكود

**الأوامر:**
```javascript
delegate_to_agent(code_reviewer, {
  task: "review",
  code_path: "./src/services/auth.ts",
  focus_areas: ["security", "performance"]
})
```

---

### 2. 🔒 Security Scanner (فاحص الأمان)

**القدرات:**
- ✅ فحص OWASP Top 10
- ✅ كشف الثغرات الشائعة
- ✅ فحص كلمة المرور والـ secrets
- ✅ تحليل التدفق البياني

**الأوامر:**
```javascript
delegate_to_agent(security_scanner, {
  task: "scan",
  target: "./src/api",
  compliance: "OWASP"
})
```

---

### 3. ⚡ Performance Analyzer (محلل الأداء)

**القدرات:**
- ✅ تحليل التعقيد الخوارزمي
- ✅ كشف تسريبات الذاكرة
- ✅ تحسين استعلامات قاعدة البيانات
- ✅ تحليل تحميل الموارد

**الأوامر:**
```javascript
delegate_to_agent(performance_analyzer, {
  task: "analyze",
  target: "./src/database",
  focus: "queries"
})
```

---

## الوكلاء المتقدمون

### 4. 🎨 Multimodal Agent (الوكيل متعدد الوسائط)

**القدرات:**
- ✅ تحليل الصور والفيديو
- ✅ OCR استخراج النص من الصور
- ✅ فهم الرسوم البيانية والمخططات
- ✅ وصف لقطات الشاشة

**الأوامر:**
```javascript
delegate_to_agent(multimodal, {
  task: "analyze_image",
  image_path: "./screenshots/error.png",
  question: "ما هو سبب هذا الخطأ؟"
})
```

---

### 5. 🎤 Voice Agent (وكيل الصوت)

**القدرات:**
- ✅ تحويل الصوت للنص
- ✅ استخراج الأوامر من الصوت
- ✅ تحليل النية (Intent Recognition)
- ✅ تلخيص المقابلات والاجتماعات

**الأوامر:**
```javascript
delegate_to_agent(voice, {
  task: "transcribe",
  audio_path: "./recordings/meeting.mp3",
  language: "ar"
})
```

---

### 6. 📄 Document Analyzer (محلل المستندات)

**القدرات:**
- ✅ تحليل ملفات PDF
- ✅ استخراج البيانات من Word
- ✅ قراءة ملفات Excel
- ✅ مقارنة المستندات

**الأوامر:**
```javascript
delegate_to_agent(document_analyzer, {
  task: "extract",
  document_path: "./contracts/agreement.pdf",
  extract: "terms"
})
```

---

### 7. 📊 Data Analyst (محلل البيانات)

**القدرات:**
- ✅ التحليل الإحصائي
- ✅ كشف الأنماط والاتجاهات
- ✅ توليد التصورات البيانية
- ✅ استخراج الرؤى

**الأوامر:**
```javascript
delegate_to_agent(data_analyst, {
  task: "analyze",
  data_source: "./data/sales.csv",
  analysis_type: "trend"
})
```

---

### 8. 🧪 Test Generator (مولد الاختبارات)

**القدرات:**
- ✅ توليد اختبارات الوحدة (Unit Tests)
- ✅ إنشاء اختبارات التكامل (Integration)
- ✅ كتابة اختبارات E2E
- ✅ تحسين التغطية (Coverage)

**الأوامر:**
```javascript
delegate_to_agent(test_generator, {
  task: "generate",
  target: "./src/utils",
  test_type: "unit"
})
```

---

### 9. 🔌 API Designer (مصمم APIs)

**القدرات:**
- ✅ تصميم واجهات REST
- ✅ تصميم GraphQL
- ✅ إنشاء OpenAPI specs
- ✅ توثيق APIs

**الأوامر:**
```javascript
delegate_to_agent(api_designer, {
  task: "design",
  requirements: "api للتجارة الإلكترونية",
  style: "REST"
})
```

---

### 10. 🚀 DevOps Agent (وكيل DevOps)

**القدرات:**
- ✅ إعداد خطوط CI/CD
- ✅ إنشاء Dockerfiles
- ✅ إعداد Kubernetes
- ✅ كتابة Terraform

**الأوامر:**
```javascript
delegate_to_agent(devops, {
  task: "setup_pipeline",
  platform: "github_actions",
  project_path: "./"
})
```

---

### 11. 🏗️ Architect Agent (وكيل الهندسة)

**القدرات:**
- ✅ تصميم البنى التحتية
- ✅ تصميم microservices
- ✅ اختيار أنماط التصميم
- ✅ تقييم trade-offs

**الأوامر:**
```javascript
delegate_to_agent(architect, {
  project_type: "e-commerce",
  scale: "enterprise"
})
```

---

### 12. 🗄️ Database Expert (خبير قواعد البيانات)

**القدرات:**
- ✅ تصميم المخططات (Schemas)
- ✅ تحسين الاستعلامات
- ✅ إنشاء الفهارس
- ✅ إدارة الترحيلات

**الأوامر:**
```javascript
delegate_to_agent(database_expert, {
  task: "optimize",
  database_type: "postgresql"
})
```

---

### 13. 🔄 Refactorer (مُعيد الهيكلة)

**القدرات:**
- ✅ تحسين جودة الكود
- ✅ إزالة الديون التقنية
- ✅ تطبيق أنماط التصميم
- ✅ تحديث الكود القديم

**الأوامر:**
```javascript
delegate_to_agent(refactorer, {
  target: "./src/legacy",
  focus: "readability"
})
```

---

## كيفية الاستخدام

### 1. استدعاء وكيل معين

```bash
# من سطر الأوامر
zero --agent code-reviewer "راجع هذا الملف"

# داخل التطبيق
@code-reviewer راجع ./src/auth.ts
```

### 2. استخدام وكيل متعدد الوسائط

```bash
@multimodal حلل هذه الصورة
# ثم ارفق الصورة
```

### 3. توليد اختبارات

```bash
@test-generator أنشئ اختبارات لهذا الملف
```

---

## أمثلة عملية

### مثال 1: مراجعة أمان
```
@security-scanner افحص هذا الكود
```

### مثال 2: تحليل بيانات
```
@data-analyst حلل بيانات المبيعات
```

### مثال 3: تصميم API
```
@api-designer صمم API لنظام إدارة المهام
```

---

## 📊 ملخص القدرات

| الوكيل | اللغات المدعومة | أفضل استخدام |
|--------|----------------|--------------|
| Code Reviewer | JS, TS, Python, Java | مراجعة الكود |
| Security Scanner | All | فحص الأمان |
| Performance | All | تحسين الأداء |
| Multimodal | Images, PDF | تحليل المحتوى المرئي |
| Voice | AR, EN, FR | تحويل الصوت |
| Document | PDF, DOCX, XLSX | استخراج البيانات |
| Data Analyst | CSV, JSON | التحليل الإحصائي |

---

*تم تطوير هذا الدليل بواسطة ZERO CLI Team*
