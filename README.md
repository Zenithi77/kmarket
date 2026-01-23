# KMarket - Монгол E-Commerce Platform

Монголын шилдэг онлайн худалдааны платформ. Next.js 14, Supabase, TypeScript дээр суурилсан.

## 🚀 Онцлог

### Хэрэглэгчийн талын функцууд
- ✅ Бүтээгдэхүүн хайх, шүүх, эрэмбэлэх
- ✅ Категори, дэд категори
- ✅ Бүтээгдэхүүний дэлгэрэнгүй мэдээлэл (10-20 зураг, хэмжээ, үнэ, тайлбар)
- ✅ Сагс (Cart) удирдлага
- ✅ Хадгалсан бараа (Wishlist)
- ✅ Бүртгэл, нэвтрэх (Email + Social login)
- ✅ Профайл засварлах
- ✅ Захиалгын түүх
- ✅ Хаягийн сан

### Төлбөрийн систем
- ✅ Банкны шилжүүлгээр төлбөр хийх
- ✅ SMS Webhook-оор автомат баталгаажуулалт
- ✅ Төлбөрийн лавлах код (KM-XXXXX)
- ✅ Real-time төлбөр шалгах (Polling)
- ✅ Confetti animation амжилттай төлбөрийн дараа

### Админ панел
- ✅ Dashboard статистик
- ✅ Бүтээгдэхүүн удирдлага (CRUD)
- ✅ Захиалга удирдлага
- ✅ Хэрэглэгч удирдлага
- ✅ Категори удирдлага
- ✅ Хямдралын код удирдлага
- ✅ Тайлан, статистик
- ✅ Тохиргоо

## 🛠 Технологи

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📦 Суулгах

### 1. Dependency суулгах
```bash
npm install
```

### 2. Environment variables тохируулах
`.env.local` файл үүсгэж дараах утгуудыг оруулна:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYMENT_WEBHOOK_KEY=your_webhook_secret_key
```

### 3. Database schema үүсгэх
Supabase SQL Editor дээр `supabase/schema.sql` файлыг ажиллуулна.

### 4. Development server ажиллуулах
```bash
npm run dev
```

Хөтөч дээр [http://localhost:3000](http://localhost:3000) нээнэ.

## 📁 Бүтэц

```
kmarket/
├── src/
│   ├── app/
│   │   ├── (main)/           # Public хуудсууд
│   │   │   ├── page.tsx      # Нүүр хуудас
│   │   │   ├── products/     # Бүтээгдэхүүнүүд
│   │   │   ├── product/[slug]/ # Бүтээгдэхүүн дэлгэрэнгүй
│   │   │   ├── checkout/     # Төлбөр
│   │   │   ├── wishlist/     # Хадгалсан
│   │   │   └── profile/      # Хэрэглэгчийн профайл
│   │   ├── admin/            # Админ панел
│   │   ├── auth/             # Нэвтрэх, бүртгэл
│   │   └── api/              # API endpoints
│   ├── components/
│   │   ├── layout/           # Header, Footer
│   │   ├── product/          # ProductCard, ProductGrid
│   │   ├── checkout/         # PaymentModal
│   │   └── ui/               # Button, Input, Modal
│   ├── lib/
│   │   ├── constants.ts      # Тогтмолууд
│   │   └── supabase.ts       # Supabase client
│   ├── store/                # Zustand stores
│   └── types/                # TypeScript types
├── supabase/
│   └── schema.sql            # Database schema
└── public/                   # Static files
```

## 💳 Төлбөрийн систем

### Банкны мэдээлэл
- **Банк:** Хаан банк
- **Данс:** 5021296757
- **Эзэмшигч:** KMarket

### Webhook тохиргоо
SMS Gateway-ээс ирэх мессежийг боловсруулахын тулд:

1. SMS Gateway дээр webhook URL тохируулна: `https://yourdomain.com/api/payment/webhook`
2. `PAYMENT_WEBHOOK_KEY` environment variable-д нууц түлхүүр тохируулна
3. SMS-ийн текстэнд `KM-XXXXX` форматтай код байх ёстой

### SMS формат жишээ
```
Khan Bank: 5021296757 dans ruu 450000₮ shiljuulev. KM-ABC12 Gudamjnii ner: Batbold
```

## 🔐 Админ эрх

Хэрэглэгчид админ эрх өгөхийн тулд Supabase дээр:

```sql
UPDATE profiles SET is_admin = true WHERE email = 'admin@example.com';
```

## 📱 Responsive Design

- Mobile-first approach
- Tablet болон Desktop-д зохицсон
- Touch-friendly UI

## 🎨 Өнгөний схем

Primary өнгө нь улбар шар (Orange) - `#f97316`

## 📄 License

MIT License
