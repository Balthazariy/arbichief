# ArbiChief - Архітектура ООП

## Огляд

ArbiChief побудовано на принципах об'єктно-орієнтованого програмування з наголосом на **композицію замість наслідування** та **маленькі, фокусовані класи**. Застосунок використовує IndexedDB для локального зберігання даних з повною підтримкою офлайн режиму.

## Принципи ООП

### 1. Композиція замість наслідування

Замість глибоких ієрархій наслідування, класи компонують інші об'єкти для отримання функціональності:

```typescript
// ❌ ПОГАНО: Глибоке наслідування
class TournamentManager extends DataManager extends BaseManager {}

// ✅ ДОБРЕ: Композиція
class TournamentService {
  private pairingService: PairingService;
  private standingsService: StandingsService;
  private tieBreakService: TieBreakService;
  
  constructor() {
    this.pairingService = new PairingService(new SwissPairingStrategy());
    this.standingsService = new StandingsService();
    this.tieBreakService = new TieBreakService();
  }
}
```

### 2. Маленькі, фокусовані класи

Кожен клас має одну чітку відповідальність (Single Responsibility Principle):

- **PointsCalculator** - тільки обчислення очок
- **TieBreakCalculator** - тільки розрахунок тай-брейків
- **PairingService** - тільки генерація пар
- **ExportService** - тільки експорт даних

### 3. Патерни проектування

#### Repository Pattern (Репозиторій)
Абстрагує доступ до даних від бізнес-логіки:

```typescript
// База для всіх репозиторіїв
class BaseRepository<T> {
  create(entity: T): Promise<T>
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  update(entity: T): Promise<T>
  delete(id: string): Promise<void>
}

// Спеціалізовані репозиторії
class PlayerRepository extends BaseRepository<Player> {
  findByUniqCode(code: string): Promise<Player | null>
  search(query: string): Promise<Player[]>
}
```

#### Strategy Pattern (Стратегія)
Дозволяє змінювати алгоритми під час виконання:

```typescript
interface PairingStrategy {
  generatePairings(participants: string[], round: number, matches: Match[]): Match[]
}

class SwissPairingStrategy implements PairingStrategy { }
class RoundRobinPairingStrategy implements PairingStrategy { }

class PairingService {
  private strategy: PairingStrategy;
  
  setStrategy(strategy: PairingStrategy): void {
    this.strategy = strategy;
  }
}
```

#### Facade Pattern (Фасад)
DatabaseManager надає єдину точку входу до всіх репозиторіїв:

```typescript
class DatabaseManager {
  get players(): PlayerRepository
  get teams(): TeamRepository
  get tournaments(): TournamentRepository
  get matches(): MatchRepository
}

// Використання
const db = await getDatabase();
const players = await db.players.findAll();
```

## Структура шарів

```
┌─────────────────────────────────────┐
│   React Components (UI Layer)      │
│   - App.tsx                         │
│   - TournamentsView.tsx             │
│   - PlayersView.tsx                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   React Hooks (Integration)        │
│   - useDatabase<T>                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Service Layer (Business Logic)   │
│   - PairingService                  │
│   - StandingsCalculator             │
│   - TieBreakService                 │
│   - ExportService                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Repository Layer (Data Access)   │
│   - PlayerRepository                │
│   - TournamentRepository            │
│   - MatchRepository                 │
│   - TeamRepository                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Database Layer (IndexedDB)       │
│   - DatabaseConnection              │
│   - DatabaseManager                 │
└─────────────────────────────────────┘
```

## Класи та їх відповідальність

### Database Layer (`src/lib/database/`)

#### `DatabaseConnection`
- Керує з'єднанням з IndexedDB
- Створює object stores при оновленні схеми
- Методи: `open()`, `close()`, `getDatabase()`

#### `BaseRepository<T>`
- Базові CRUD операції для всіх сутностей
- Сортування, фільтрація, пагінація
- Методи: `create()`, `findById()`, `findAll()`, `update()`, `delete()`, `count()`

#### `PlayerRepository`
- Спеціалізовані запити для гравців
- Методи: `findByUniqCode()`, `findBySurname()`, `findByRatingRange()`, `search()`

#### `TeamRepository`
- Запити команд
- Методи: `findByPlayerId()`, `isPlayerInTeam()`

#### `TournamentRepository`
- Запити турнірів
- Методи: `findByStatus()`, `findByDateRange()`, `findActive()`, `findCompleted()`

#### `MatchRepository`
- Запити матчів
- Методи: `findByTournamentId()`, `findByTournamentAndRound()`, `findByParticipant()`

#### `DatabaseManager`
- Фасад для доступу до всіх репозиторіїв
- Singleton pattern через `getDatabase()`
- Властивості: `players`, `teams`, `tournaments`, `matches`

### Service Layer (`src/lib/services/`)

#### `PointsCalculator`
- Розрахунок очок за результатом партії
- Методи: `calculatePoints()`, `calculateMatchOutcome()`

#### `StandingsCalculator`
- Обчислення турнірної таблиці
- Композиція: використовує `PointsCalculator`
- Методи: `calculateStandings()`

#### `TieBreakCalculator`
- Розрахунок коефіцієнтів Бухгольца, Бергера, Прогресивного
- Методи: `calculateBuchholz()`, `calculateBerger()`, `calculateProgressive()`

#### `TieBreakService`
- Збагачення турнірної таблиці тай-брейками
- Композиція: використовує `TieBreakCalculator`
- Методи: `enrichStandingsWithTieBreaks()`, `sortByTieBreaks()`

#### `PairingService`
- Генерація жеребкування
- Strategy Pattern: використовує `PairingStrategy`
- Методи: `generatePairings()`, `setStrategy()`

#### `SwissPairingStrategy`
- Алгоритм швейцарської системи
- Імплементує `PairingStrategy`

#### `RoundRobinPairingStrategy`
- Алгоритм кругової системи
- Імплементує `PairingStrategy`

#### `ExportService`
- Експорт даних турніру
- Strategy Pattern: використовує `ExportFormat`
- Методи: `exportTournament()`, `setFormat()`, `downloadFile()`

#### `JSONExportFormat`
- Експорт у JSON
- Імплементує `ExportFormat`

#### `CSVExportFormat`
- Експорт у CSV
- Імплементує `ExportFormat`

## Приклади використання

### 1. Робота з базою даних

```typescript
import { getDatabase } from '@/lib/database';

const db = await getDatabase();

// Створення гравця
const player = await db.players.create({
  id: generateId(),
  name: 'Іван',
  surname: 'Іванов',
  lastname: 'Іванович',
  uniqCode: 'ABC12',
  rating: 1500,
  gender: 'М'
});

// Пошук гравця
const found = await db.players.findByUniqCode('ABC12');

// Всі активні турніри
const activeTournaments = await db.tournaments.findActive();
```

### 2. Використання сервісів

```typescript
import { PairingService, SwissPairingStrategy } from '@/lib/services';

const players = await db.players.findAll();
const strategy = new SwissPairingStrategy(players);
const pairingService = new PairingService(strategy);

const matches = pairingService.generatePairings(
  participantIds,
  currentRound,
  previousMatches
);
```

### 3. Розрахунок таблиці з тай-брейками

```typescript
import { StandingsCalculator, TieBreakService } from '@/lib/services';

const standingsCalc = new StandingsCalculator();
const tieBreakService = new TieBreakService();

const standings = standingsCalc.calculateStandings(participantIds, matches);
const enriched = tieBreakService.enrichStandingsWithTieBreaks(standings, matches);
const sorted = tieBreakService.sortByTieBreaks(enriched);
```

### 4. Експорт турніру

```typescript
import { ExportService, CSVExportFormat } from '@/lib/services';

const exportService = new ExportService(new CSVExportFormat());
const csv = exportService.exportTournament({
  tournament,
  players,
  matches,
  standings
});

exportService.downloadFile(csv, 'tournament.csv');

// Зміна формату
exportService.setFormat(new JSONExportFormat());
const json = exportService.exportTournament(data);
```

### 5. Використання хука в React

```typescript
import { useDatabase } from '@/hooks/use-database';

function PlayersView() {
  const { data: players, create, update, remove, loading } = useDatabase<Player>('players');
  
  const handleCreate = async () => {
    await create(newPlayer);
  };
  
  return (
    <div>
      {loading ? <Spinner /> : players.map(player => <PlayerCard player={player} />)}
    </div>
  );
}
```

## Переваги архітектури

### 1. Тестованість
Кожен клас можна тестувати незалежно завдяки чіткому розділенню відповідальності.

### 2. Розширюваність
Додавання нових функцій не вимагає зміни існуючого коду:
- Новий формат експорту? Створіть клас, що імплементує `ExportFormat`
- Нова система жеребкування? Створіть клас, що імплементує `PairingStrategy`

### 3. Підтримуваність
Маленькі класи легше розуміти та змінювати. Баг у розрахунку Бухгольца? Шукайте в `TieBreakCalculator.calculateBuchholz()`.

### 4. Повторне використання
Сервіси можна використовувати в різних контекстах:
- `PointsCalculator` може використовуватися і в `StandingsCalculator`, і окремо для швидкого підрахунку
- `ExportService` працює з будь-яким форматом

## Міграція даних

`DataMigrationService` автоматично переносить дані з старого useKV сховища в IndexedDB при першому запуску застосунку.

```typescript
// Автоматично викликається в App.tsx
await dataMigrationService.migrateFromKV();
```

## Offline Support

IndexedDB забезпечує повну підтримку офлайн режиму. Всі дані зберігаються локально в браузері та доступні без інтернет-з'єднання.

## Майбутні розширення

Архітектура підготовлена для:
- Синхронізації з сервером (додати `SyncService`)
- Аутентифікації користувачів (додати `AuthService`)
- Історії змін (додати `AuditService`)
- Резервного копіювання (розширити `ExportService`)
