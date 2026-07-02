# ZERO CLI 🤖

[![Version](https://img.shields.io/npm/v/@allhands/zero-cli)](https://www.npmjs.com/package/@allhands/zero-cli)
[![License](https://img.shields.io/github/license/wahaca9693/zero-cli)](https://github.com/wahaca9693/zero-cli/blob/main/LICENSE)

**ZERO CLI** هو مساعد ذكاء اصطناعي متقدم يمنحك وصول مباشر لنماذج ZERO المتقدمة
من سطر الأوامر.

## 🚀 المميزات

- 🧠 نماذج ZERO المتقدمة مع سياق 1M توكن
- 🔍 بحث في الويب ومحتوى حقيقي (Grounding)
- 💻 عمليات على الملفات وسطر الأوامر
- 🔌 دعم MCP (Model Context Protocol)
- 🛡️ مفتوح المصدر ومرخص Apache 2.0

## 📦 التثبيت والتشغيل

### الطريقة 1: npx (بدون تثبيت)

```bash
npx @allhands/zero-cli
```

### الطريقة 2: npm (تثبيت عالمي)

```bash
npm install -g @allhands/zero-cli
zero
```

## 🔐 المصادقة

### الخيار 1: مفتاح ZERO API

```bash
export ZERO_API_KEY="YOUR_API_KEY"
zero
```

### الخيار 2: Google Cloud

```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
zero
```

## 🚀 البدء السريع

```bash
# تشغيل في المجلد الحالي
zero

# استخدام نموذج معين
zero -m zero-2.5-flash

# الوضع غير التفاعلي
zero -p "اشرح بنية هذا الكود"
```

## 🔧 متطلبات النظام

- **Node.js**: v20.0.0 أو أحدث
- **npm**: v8.0.0 أو أحدث
- **نظام التشغيل**: macOS, Linux, Windows (مع WSL)

## 📚 التوثيق

- [خارطة الطريق](./ROADMAP.md)
- [المساهمة](./CONTRIBUTING.md)

## 🤝 المساهمة

نرحب بمساهماتكم! راجع ملف [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📖 الموارد

- [خارطة الطريق](./ROADMAP.md)
- [NPM Package](https://www.npmjs.com/package/@allhands/zero-cli)
- [GitHub Issues](https://github.com/wahaca9693/zero-cli/issues)

## 🔗 الروابط

- **GitHub**: https://github.com/wahaca9693/zero-cli
- **npm**: https://www.npmjs.com/package/@allhands/zero-cli

## 📄 الرخصة والحقوق

- **الرخصة**: [MIT License](LICENSE)
- **حقوق النشر**: ZERO CLI Team © 2025
