# UniSwap Backend 🎓

## إزاي تشغّل المشروع

### المتطلبات
- Node.js (نزّله من nodejs.org)
- MySQL (أو XAMPP)

---

### خطوات التشغيل

**1 — نزّل الـ Dependencies**
```bash
cd uniswap-backend
npm install
```

**2 — اعمل ملف .env**
```bash
# انسخ الملف ده
cp .env.example .env

# وافتحه وحط بياناتك فيه
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=كلمة_السر_بتاعتك
DB_NAME=uniswap
JWT_SECRET=أي_كلام_سري_هنا
```

**3 — شغّل قاعدة البيانات**
```bash
# افتح MySQL وشغّل الملفات دي بالترتيب
mysql -u root -p < ../schema.sql
mysql -u root -p < ../seed.sql
```

**4 — شغّل السيرفر**
```bash
# للتطوير (بيـ restart تلقائي)
npm run dev

# للـ Production
npm start
```

افتح المتصفح على: **http://localhost:3000/api**

---

## الـ API Endpoints

| Method | URL | الوظيفة |
|--------|-----|---------|
| POST | /api/auth/register | إنشاء حساب |
| POST | /api/auth/login | تسجيل دخول |
| GET  | /api/auth/me | بياناتي |
| GET  | /api/listings | كل الإعلانات |
| GET  | /api/listings/:id | إعلان واحد |
| POST | /api/listings | إضافة إعلان |
| GET  | /api/listings/user/my | إعلاناتي |
| DELETE | /api/listings/:id | حذف إعلان |
| POST | /api/requests | إرسال طلب |
| GET  | /api/requests/my | طلباتي |
| PATCH | /api/requests/:id/accept | قبول طلب |
| PATCH | /api/requests/:id/reject | رفض طلب |
| PATCH | /api/requests/:id/confirm | تأكيد التبادل بالكود |
| GET  | /api/messages | قائمة المحادثات |
| GET  | /api/messages/:requestId | رسائل محادثة |
| POST | /api/messages | إرسال رسالة |
| GET  | /api/needs | لوحة الاحتياجات |
| POST | /api/needs | نشر احتياج |
| GET  | /api/hub | محتوى الـ Hub |
| POST | /api/hub | رفع محتوى |
| POST | /api/ratings | تقييم بعد الصفقة |
| GET  | /api/dashboard | إحصائيات لوحة التحكم |
| GET  | /api/dashboard/notifications | الإشعارات |

---

## هيكل المجلدات

```
uniswap-backend/
├── server.js          ← نقطة البداية
├── .env               ← البيانات السرية (لا تشاركه!)
├── package.json
├── config/
│   └── db.js          ← اتصال MySQL
├── middleware/
│   └── auth.js 
│   └── validator.js 
├── validators/
│   └── فايلات كتير
├── routes/
│   ├── auth.js        ← تسجيل دخول/إنشاء حساب
│   ├── listings.js    ← الإعلانات
│   ├── requests.js    ← الطلبات والتبادل
│   ├── messages.js    ← الرسائل
│   ├── needs.js       ← لوحة الاحتياجات
│   ├── hub.js         ← Research Hub
│   ├── ratings.js     ← التقييمات
│   └── dashboard.js   ← لوحة التحكم
└── public/            ← حط هنا ملفات الـ Frontend
|   ├──  add-listing.html       
│   ├── api.js    
│   ├── dashboard.html   
│   ├── index.html   
│   ├── listing-detail.html       
│   ├── listings.html         
│   ├── login.html      
│   └── messages.html    
│   ├── needs-board.html    
│   ├── reaserch-hub.html    
│   ├── signup.html      
│   ├── style.css         

```