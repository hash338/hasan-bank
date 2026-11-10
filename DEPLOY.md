# نشر HasanBankApi أونلاين مجاناً

المشروع صار جاهز للنشر على **Render** (خطة Free) باستخدام Docker.

## شو اللي تغيّر بالمشروع

| الملف | التغيير |
|---|---|
| `HasanBankApi.Server.csproj` | ضفت `Microsoft.EntityFrameworkCore.Sqlite`، وشلت `SpaProxy` + ربط الـclient (كان بيمنع الـbuild على Linux) |
| `Program.cs` | دعم SQLite و SQL Server، إنشاء الداتابيز تلقائياً عند الإقلاع، `ForwardedHeaders` للـproxy، بورت من `PORT`، CORS من الإعدادات، ما في secret مكتوب بالكود |
| `appsettings.json` | شلت الـGemini key والـJWT secret وبيانات الـSomee. الـdefault صار SQLite محلي |
| `DataSeeder.cs` | يوزر/باسورد الأدمن من الإعدادات (env vars) |
| `ClientService.cs` | `SumAsync` على decimal صار بالذاكرة (SQLite ما بيدعمها) |
| `Properties/launchSettings.json` | شلت إشارة الـSpaProxy |
| `Dockerfile` / `.dockerignore` / `render.yaml` | جداد للنشر |

**الـAPI متجرّبة محلياً:** login, create client, deposit, accounts, summary, transactions, send-money, internal transfer, AI chat — كلها شغالة على SQLite.

---

## الخطوات (10 دقايق)

### 1. ارفع الكود على GitHub

```powershell
cd C:\Users\hasan\source\repos\HasanBankApi
git add -A
git commit -m "Make the app deployable: SQLite, env secrets, Docker"
git push origin main
```

### 2. Render

1. سجّل على <https://render.com> (بلا بطاقة للخطة Free).
2. **New +** → **Blueprint**.
3. اختار الـrepo `hash338/hasan-bank` → **Connect**.
4. Render بيقرأ `render.yaml` لحاله → **Apply**.

### 3. المتغيّرات (Environment)

بعد ما ينعمل الـservice، افتح **Environment** وضيف:

| Key | Value |
|---|---|
| `Gemini__ApiKey` | مفتاح Gemini الجديد تبعك |
| `Seed__AdminPassword` | باسورد قوي للأدمن |

الـ`Jwt__Secret` بينعمل تلقائياً من `render.yaml`.

### 4. افتح الموقع

بعد أول build (٣–٥ دقايق) بيعطيك رابط متل:

```
https://hasan-bank.onrender.com
```

سجّل دخول: `admin` + الباسورد اللي حطيتو.

---

## شغلات لازم تعرفها

- **الخطة المجانية بتنام**: بعد ١٥ دقيقة بلا زيارات، أول طلب بياخد حوالي دقيقة ليصحى. طبيعي.
- **حدود الخطة**: 750 ساعة بالشهر، 512MB RAM، 5GB bandwidth.
- **البيانات (مهم)**: الملف `hasanbank.db` عايش داخل الكونتينر. Render بتقول صريح إنّ الـFree service بتمسح الملفات المحلية **عند كل deploy / restart / spin-down**.
  - يعني إذا الموقع نام ١٥ دقيقة، البيانات اللي دخلتها بتروح.
  - منيح لـdemo/عرض جامعي، بس مش لاستعمال حقيقي.
  - للبيانات الدائمة بدون دفع: **Neon Postgres مجاني** (بلا انتهاء) — بدها تحويل الـEF provider، قلّي إذا بدك إياها.
  - أو **Render Disk** بيبلّش من $0.25/شهر (بس بدها طريقة دفع).
- **SQL Server**: إذا بدك ترجع تستعمل SQL Server، بس حط:
  `ConnectionStrings__DefaultConnection` = الـconnection string، والكود بيكتشفها لحاله ويستعمل `Migrate()`.
  (الداتابيز تبع Somee الحالية **مش متاحة من برّا** — جرّبتها ورفضت الاتصال.)
- **بدّل الـsecrets القديمة**: الـGemini key والـSomee password كانوا مكتوبين بالكود والـgit history.
  - رح الـGemini key من Google AI Studio واعمل واحد جديد.
  - بدّل باسورد الـSomee إذا الحساب بعدو شغال.

---

## التطوير محلياً

```powershell
# الـAPI + الواجهة المبنية (http://localhost:5125)
dotnet run --project HasanBankApi.Server

# الواجهة مع hot-reload (https://localhost:53000)
cd HasanBankApi.Server/hasanbankapi.client
npm run dev
```

عدّلت React؟ ابنيها بتروح على `wwwroot`:

```powershell
cd HasanBankApi.Server/hasanbankapi.client
npm run build
```
