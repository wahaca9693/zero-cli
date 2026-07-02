# ZERO CLI 🤖

[![Version](https://img.shields.io/npm/v/@allhands/zero-cli)](https://www.npmjs.com/package/@allhands/zero-cli)
[![License](https://img.shields.io/github/license/wahaca9693/zero-cli)](https://github.com/wahaca9693/zero-cli/blob/main/LICENSE)

![ZERO CLI Screenshot](/docs/assets/zero-screenshot.png)

**ZERO CLI** هو مساعد ذكاء اصطناعي متقدم يضم **17 وكيل متخصص** في مجالات مختلفة. يتيح لك الوصول المباشر لنماذج ZERO من سطر الأوامر، مع دعم كامل للوسائط المتعددة والتفاعل مع تيليجرام.

## 🚀 لماذا ZERO CLI؟

- **🎯 17 وكيل متخصص**: وكلاء مدراء Specialists في مجالات محددة
- **🧠 نماذج ZERO المتقدمة**: وصول للنماذج المحسنة مع نافذة سياق 1M توكن
- **💬 تكامل تيليجرام**: تواصل مزدوج من تيليجرام وTerminal
- **🔌 دعم الوسائط المتعددة**: تحليل الصور، الصوت، المستندات
- **📊 تحليل البيانات**: إحصائيات، تصورات، رؤى
- **🔒 فحص الأمان**: فحص الثغرات والـ OWASP Top 10
- **🛡️ مفتوح المصدر**: مرخص تحت Apache 2.0

---

## 🤖 الوكلاء المتخصصون (17 وكيل)

ZERO CLI يضم **17 وكيل ذكي** متخصص في مجالات مختلفة:

### 🔧 وكلاء التطوير
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Code Reviewer** | `code-reviewer-agent.ts` | مراجعة الكود - الأمان، الأخطاء، الأداء |
| **Security Scanner** | `security-scanner-agent.ts` | فحص الثغرات - OWASP Top 10 |
| **Performance Analyzer** | `performance-analyzer-agent.ts` | تحليل الأداء - التعقيد، التحسين |
| **Refactorer** | `refactorer-agent.ts` | إعادة هيكلة الكود - الديون التقنية |

### 🎨 وكلاء الوسائط المتعددة
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Multimodal** | `multimodal-agent.ts` | تحليل الصور، OCR، الرسوم البيانية |
| **Voice** | `voice-agent.ts` | تحويل الصوت لنص، استخراج الأوامر |
| **Document Analyzer** | `document-analyzer-agent.ts` | تحليل PDF، Word، Excel |

### 📊 وكلاء البيانات
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Data Analyst** | `data-analyst-agent.ts` | الإحصائيات، التصورات، الرؤى |
| **Test Generator** | `test-generator-agent.ts` | توليد الاختبارات - Unit, Integration, E2E |
| **API Designer** | `api-designer-agent.ts` | تصميم REST, GraphQL, OpenAPI |

### 🏗️ وكلاء الهندسة
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Architect** | `architect-agent.ts` | تصميم الأنظمة، Microservices |
| **Database Expert** | `database-expert-agent.ts` | تصميم قواعد البيانات، تحسين الاستعلامات |
| **DevOps** | `devops-agent.ts` | CI/CD، Docker، Kubernetes |

### 💬 وكلاء التفاعل
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Telegram Agent** | `telegram-agent.ts` | ربط تيليجرام - تواصل مزدوج |

### 🌐 الوكلاء العامون
| الوكيل | الملف | الوصف |
|--------|-------|-------|
| **Generalist** | `generalist-agent.ts` | المهام العامة |
| **Codebase Investigator** | `codebase-investigator.ts` | تحليل الكود المصدري |
| **CLI Help** | `cli-help-agent.ts` | المساعدة والتوثيق |

---

## 📦 التثبيت

### تثبيت سريع مع npx

```bash
npx @allhands/zero-cli
```

### تثبيت عالمي مع npm

```bash
npm install -g @allhands/zero-cli
```

---

## 🚀 الاستخدام

### تشغيل التطبيق

```bash
# تشغيل التطبيق
npx @allhands/zero-cli

# أو بعد التثبيت
zero
```

### استخدام وكيل معين

```bash
# استدعاء وكيل معين
zero --agent code-reviewer

# أو داخل التطبيق
@code-reviewer راجع هذا الكود...
```

---

## 📚 التوثيق

- [دليل الوكلاء الكامل](./COMPLETE_AGENTS_GUIDE.md) - تفاصيل كل وكيل
- [دليل الوكلاء المخصصين](./CUSTOM_AGENTS_GUIDE.md) - كيفية إنشاء وكلاء جدد
- [خارطة الطريق](./ROADMAP.md) - خطط التطوير المستقبلية

---

## 🔗 روابط مفيدة

- **GitHub**: https://github.com/wahaca9693/zero-cli
- **npm**: https://www.npmjs.com/package/@allhands/zero-cli
- **التوثيق**: https://github.com/wahaca9693/zero-cli#readme

## 📋 المميزات الرئيسية

### فهم وتوليد الكود

- استعلام وتعديل المشاريع الكبيرة
- توليد تطبيقات جديدة من PDF، صور، أو رسومات
- تصحيح الأخطاء واستكشاف المشاكل باللغة الطبيعية

### الأتمتة والتكامل

- أتمتة المهام التشغيلية مثل إدارة Pull Requests
- استخدام خوادم MCP للربط مع خدمات خارجية
- التشغيل التفاعلي في السكربتات للأتمتة

### قدرات متقدمة

- البحث في الويب للحصول على معلومات محدثة
- نافذة سياق كبيرة (1M توكن)
- تكامل مع منصات متعددة

## 🔧 متطلبات النظام

- **Node.js**: v20.0.0 أو أحدث
- **npm**: v8.0.0 أو أحدث
- **نظام التشغيل**: macOS, Linux, Windows (مع WSL)

---

## 📄 الرخصة

هذا المشروع مرخص تحت **Apache License 2.0**

## 🤝 المساهمة

نرحب بمساهماتكم! راجع ملف [CONTRIBUTING.md](./CONTRIBUTING.md) للمزيد من التفاصيل.

---

---

## 🔐 خيارات المصادقة

اختر طريقة المصادقة المناسبة لك:

### الخيار 1: مفتاح ZERO API

**✨ الأفضل لـ:** المطورين الذين يحتاجون تحكم بالنموذج

```bash
# الحصول على المفتاح من aistudio.google.com
export ZERO_API_KEY="YOUR_API_KEY"
zero
```

### الخيار 2: Google Cloud

**✨ الأفضل لـ:** الفرق والشركات

```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
zero
```

---

## 🚀 البدء السريع

```bash
# تثبيت
npm install -g @allhands/zero-cli

# تشغيل
zero

# أو بدون تثبيت
npx @allhands/zero-cli
```

---

## 📞 التواصل والدعم

- **GitHub Issues**: https://github.com/wahaca9693/zero-cli/issues
- **المشروع**: https://github.com/wahaca9693/zero-cli

---

## 📄 الرخصة

MIT License - راجع ملف [LICENSE](./LICENSE)

### الاستخدام الأساسي

```bash
# تشغيل في المجلد الحالي
zero

# استخدام نموذج معين
zero -m zero-2.5-flash

# الوضع غير التفاعلي
zero -p "اشرح بنية هذا الكود"
```

---

## 📚 التوثيق

- [دليل الوكلاء](./COMPLETE_AGENTS_GUIDE.md) - تفاصيل كاملة للوكلاء
- [دليل الوكلاء المخصصين](./CUSTOM_AGENTS_GUIDE.md) - إنشاء وكلاء جدد
- [خارطة الطريق](./ROADMAP.md) - خطط التطوير

---

## 🤝 المساهمة

نرحب بمساهماتكم! راجع ملف [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📖 الموارد

- **[خارطة الطريق](./ROADMAP.md)** - راجع القادم
- **[NPM Package](https://www.npmjs.com/package/@allhands/zero-cli)** - الحزمة
- **[GitHub Issues](https://github.com/wahaca9693/zero-cli/issues)** - الإبلاغ عن الأخطاء

---

## 📄 الحقوق

- **الرخصة**: [MIT License](LICENSE)
