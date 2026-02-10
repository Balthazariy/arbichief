# ArbiChief – Менеджер турнірів

<div align="center">
  <h3>🏆 Професійна система управління шаховими та шашковими турнірами</h3>
  <p>Progressive Web App з IndexedDB та ООП архітектурою</p>
</div>

## 🎯 Огляд

ArbiChief — це кроссплатформний веб-застосунок для організації та проведення турнірів по шахматам і шашкам. Система автоматизує:
- 🎲 Жеребкування (швейцарська та кругова системи)
- 📊 Ведення турнірної таблиці
- 🧮 Підрахунок очок та тай-брейків
- 👥 Управління гравцями та командами
- 📄 Експорт звітів (JSON, CSV)

## ✨ Особливості

### Технічні
- **React + TypeScript** - типобезпечна розробка
- **IndexedDB** - локальна база даних (замість SQLite для веб)
- **ООП архітектура** - композиція замість наслідування
- **PWA** - працює офлайн, встановлюється як застосунок
- **Responsive** - адаптивний дизайн для мобільних та десктопів

### Функціональні
- **Автоматичне жеребкування** - швейцарська та кругова системи
- **Live таблиця лідерів** - миттєве оновлення після внесення результатів
- **Тай-брейки** - Бухгольц, Бергер, Прогресивний
- **Командні турніри** - підтримка командних змагань
- **Експорт даних** - JSON та CSV формати

## 🏗️ Архітектура

Проєкт побудовано на принципах ООП з чітким розділенням на шари:

```
UI Layer (React Components)
    ↓
Integration Layer (React Hooks)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database Layer (IndexedDB)
```

### Ключові принципи

1. **Композиція замість наслідування** - класи компонують інші об'єкти
2. **Маленькі, фокусовані класи** - кожен клас має одну відповідальність
3. **Патерни проектування** - Repository, Strategy, Facade

Детальніше: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📦 Структура проєкту

```
src/
├── components/          # React компоненти
│   ├── ui/             # Shadcn компоненти
│   ├── DashboardView.tsx
│   ├── TournamentsView.tsx
│   ├── PlayersView.tsx
│   └── TeamsView.tsx
├── lib/
│   ├── database/       # IndexedDB шар
│   │   ├── Connection.ts
│   │   ├── BaseRepository.ts
│   │   ├── PlayerRepository.ts
│   │   ├── TournamentRepository.ts
│   │   ├── MatchRepository.ts
│   │   └── DatabaseManager.ts
│   ├── services/       # Бізнес-логіка
│   │   ├── StandingsService.ts
│   │   ├── PairingService.ts
│   │   ├── TieBreakService.ts
│   │   └── ExportService.ts
│   ├── types.ts        # TypeScript типи
│   └── helpers.ts      # Утиліти
├── hooks/              # React хуки
│   └── use-database.ts
└── App.tsx            # Головний компонент
```

## 🚀 Швидкий старт

### Встановлення

```bash
npm install
```

### Розробка

```bash
npm run dev
```

Застосунок буде доступний за адресою `http://localhost:5173`

### Збірка для продакшену

```bash
npm run build
```

## 📖 Використання

### 1. Створення турніру

1. Перейдіть у розділ "Турніри"
2. Натисніть "Створити турнір"
3. Виберіть:
   - Вид гри (шахи / шашки)
   - Формат (особистий / командний)
   - Система (швейцарська / кругова)
   - Кількість турів
4. Збережіть турнір

### 2. Додавання гравців

1. Розділ "Гравці" → "Додати гравця"
2. Заповніть ПІБ, рейтинг, стать
3. Система автоматично генерує унікальний код

### 3. Жеребкування

1. Відкрийте турнір
2. Додайте учасників
3. Натисніть "Генерувати тур"
4. Система автоматично створить пари

### 4. Внесення результатів

1. Виберіть партію в поточному турі
2. Введіть результат (1-0, 0-1, 0.5-0.5)
3. Таблиця лідерів оновиться автоматично

### 5. Експорт даних

1. Відкрийте турнір
2. Натисніть "Експорт"
3. Виберіть формат (JSON / CSV)
4. Файл завантажиться автоматично

## 🔧 API Приклади

### Робота з базою даних

```typescript
import { getDatabase } from '@/lib/database';

// Отримання інстансу БД
const db = await getDatabase();

// CRUD операції
const player = await db.players.create(newPlayer);
const players = await db.players.findAll();
const player = await db.players.findById(id);
await db.players.update(updatedPlayer);
await db.players.delete(id);

// Спеціалізовані запити
const player = await db.players.findByUniqCode('ABC12');
const results = await db.players.search('Іванов');
const active = await db.tournaments.findActive();
```

### Використання сервісів

```typescript
import { 
  PairingService, 
  SwissPairingStrategy,
  StandingsCalculator,
  TieBreakService 
} from '@/lib/services';

// Жеребкування
const strategy = new SwissPairingStrategy(players);
const pairingService = new PairingService(strategy);
const matches = pairingService.generatePairings(ids, round, prevMatches);

// Турнірна таблиця
const calc = new StandingsCalculator();
const standings = calc.calculateStandings(ids, matches);

// Тай-брейки
const tieBreak = new TieBreakService();
const enriched = tieBreak.enrichStandingsWithTieBreaks(standings, matches);
```

### React Hook

```typescript
import { useDatabase } from '@/hooks/use-database';

function MyComponent() {
  const { 
    data: players, 
    loading, 
    error,
    create, 
    update, 
    remove 
  } = useDatabase<Player>('players');

  const handleAdd = async () => {
    await create(newPlayer);
  };

  return <div>{players.map(p => <Card player={p} />)}</div>;
}
```

## 🎨 Дизайн

- **Кольори**: Глибокий синій + теплий бурштиновий акцент
- **Шрифти**: Space Grotesk (заголовки), Inter (текст)
- **Компоненти**: Shadcn v4
- **Стилізація**: Tailwind CSS v4
- **Іконки**: Phosphor Icons

## 📱 PWA функціональність

ArbiChief можна встановити як застосунок:

### Android / iOS
1. Відкрийте сайт у браузері
2. Натисніть "Додати на головний екран"
3. Застосунок працює офлайн!

### Desktop (Chrome/Edge)
1. Іконка встановлення в адресному рядку
2. "Встановити ArbiChief"

## 🔐 Безпека даних

- Всі дані зберігаються локально в браузері
- Використовується IndexedDB (не синхронізується між пристроями)
- Експортуйте дані для резервного копіювання

## 🤝 Внесок у розвиток

Будемо раді вашим ідеям та покращенням!

## 📄 Ліцензія

MIT

## 🙏 Подяки

Розроблено з використанням:
- React 19
- TypeScript 5
- Vite 7
- Shadcn UI v4
- Tailwind CSS v4
- IndexedDB

---

<div align="center">
  <p>Зроблено з ❤️ для арбітрів та організаторів турнірів</p>
</div>
