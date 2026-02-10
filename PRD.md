# Planning Guide

ArbiChief є кроссплатформним веб-застосунком (Progressive Web App) для організації та проведення шахових та шашкових турнірів, що автоматизує жеребкування, ведення турнірної таблиці, підрахунок очок та тай-брейків для спрощення роботи організаторів. Застосунок побудовано на React з TypeScript з використанням IndexedDB для локального зберігання даних та ООП архітектури з композицією замість наслідування.

**Experience Qualities**:
1. **Professional** - Interface should inspire confidence with clear hierarchy, precise data presentation, and reliable functionality suitable for official tournament administration
2. **Efficient** - Streamlined workflows that minimize clicks and cognitive load, enabling arbiters to manage tournaments quickly without unnecessary friction
3. **Transparent** - Every calculation, pairing, and result should be immediately visible and understandable, with real-time updates to tournament standings

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires sophisticated state management for tournament logic, multiple interconnected data entities (players, teams, tournaments, matches), complex calculations (tie-breaks, pairings), real-time table updates, and multiple report generation features.

## Essential Features

### Tournament Management
- **Functionality**: Create, edit, view, and archive tournaments with configurable parameters (format, system, scoring rules, tie-breaks)
- **Purpose**: Enables organizers to set up tournaments matching their specific requirements for chess or checkers competitions
- **Trigger**: User clicks "Створити турнір" button from dashboard
- **Progression**: Dashboard → New Tournament Form → Configure Format/System/Rules → Save → Tournament Detail View → Ready for Player Registration
- **Success criteria**: Tournament is created with all parameters saved and appears in active tournaments list; can proceed to add players and generate pairings

### Player Management
- **Functionality**: Maintain database of players with profiles (name, surname, lastname, unique code, rating, gender)
- **Purpose**: Centralizes player data for reuse across multiple tournaments and enables proper seeding based on ratings
- **Trigger**: User navigates to "Гравці" section or adds player during tournament setup
- **Progression**: Player List View → Add/Edit Player Form → Enter Details → Generate Unique Code → Save → Player Appears in Database
- **Success criteria**: Player profiles persist across sessions, can be searched/filtered, and are available for tournament registration

### Team Management
- **Functionality**: Create teams, assign players to board positions and reserves, manage team compositions
- **Purpose**: Supports team-based tournament formats where players compete as organized squads with specific board assignments
- **Trigger**: User selects team format during tournament creation or navigates to "Команди" section
- **Progression**: Team List → Create Team → Name Team → Assign Players to Boards → Set Reserves → Save → Team Available for Tournament
- **Success criteria**: Teams maintain player assignments, enforce board rules, and calculate team scores correctly from individual board results

### Pairing Generation (Жеребкування)
- **Functionality**: Automatically generate match pairings for each round based on tournament system (Swiss, Round-robin)
- **Purpose**: Eliminates manual pairing work and ensures fair matchups according to tournament rules
- **Trigger**: Tournament organizer clicks "Генерувати тури" after player registration or after previous round results are entered
- **Progression**: Tournament View → Select Round → Click Generate → System Calculates Pairings → Review Pairings → Confirm → Matches Created
- **Success criteria**: Pairings avoid repeat matchups, balance colors in chess, respect Swiss system rules, and can be regenerated if needed before confirmation

### Results Entry
- **Functionality**: Record game results (win/loss/draw) for individual matches with automatic score calculation
- **Purpose**: Captures match outcomes and immediately updates standings without manual calculation
- **Trigger**: Arbiter clicks on match in current round to enter result
- **Progression**: Round View → Select Match → Enter Result (1-0, 0-1, 0.5-0.5, Forfeit) → Confirm → Auto-update Standings
- **Success criteria**: Results are saved immediately, standings recalculate with proper scoring, tie-breaks update automatically

### Live Tournament Table
- **Functionality**: Real-time display of current standings with points, tie-breaks, and ranking
- **Purpose**: Provides instant visibility of tournament status for organizers, arbiters, and participants
- **Trigger**: Automatically updates when results are entered; accessible via "Турнірна таблиця" tab
- **Progression**: Any Result Entry → Automatic Recalculation → Table Refreshes → New Rankings Display
- **Success criteria**: Table sorts correctly by points and tie-breaks, updates within 1 second of result entry, displays all relevant statistics

### Reports and Export
- **Functionality**: Generate and export tournament data in multiple formats (JSON, CSV) with final standings, crosstables, and player cards through dedicated export page. Import previously exported JSON tournament files to restore or clone tournament data.
- **Purpose**: Creates archival records and shareable results for tournament documentation and publication. Enables tournament data portability, backup restoration, and template reuse by importing from JSON files.
- **Trigger**: User navigates to "Експорт" section from main navigation. For import, user clicks "Імпортувати турнір" button and selects JSON file.
- **Progression Export**: Export Page → Select Tournament → Choose Format (JSON/CSV) → Review Export Contents → Click Export → Download File. **Progression Import**: Export Page → Click Import Button → Select JSON File → System Validates File → Review Import Summary → Confirm → New Tournament Created as Draft → Success Notification
- **Success criteria**: Exported files contain complete tournament data (tournament info, participants, matches, standings with tie-breaks), are properly formatted, and can be imported to spreadsheet software or re-imported to system. Imported tournaments successfully create new draft tournaments with all players and match structures preserved. Existing players are recognized by unique code or name match; new players are added to database. Match results are reset to allow fresh tournament execution.

### Theme Switching
- **Functionality**: Toggle between light and dark themes with persistent preference storage
- **Purpose**: Allows users to choose visual appearance based on personal preference and lighting conditions
- **Trigger**: User clicks theme toggle button (moon/sun icon) in application header
- **Progression**: Any View → Click Theme Toggle Button → Theme Changes Instantly → Preference Saved
- **Success criteria**: Theme applies immediately across all views, persists between sessions, and provides appropriate contrast in both modes

### Tournament Reminders
- **Functionality**: Create, manage, and receive reminders for tournaments with customizable date, time, message, and recurrence patterns (daily, weekly, monthly)
- **Purpose**: Helps organizers remember important tournament dates and recurring events without relying on external calendar apps
- **Trigger**: User navigates to "Нагадування" tab in tournament detail view and clicks "Додати нагадування"
- **Progression**: Tournament Detail → Reminders Tab → Add Reminder → Set Date/Time → Select Recurrence (None/Daily/Weekly/Monthly) → Enter Message → Enable/Disable Toggle → Save → Automatic Notification at Scheduled Time → For Recurring: Auto-reschedule Next Occurrence
- **Success criteria**: Reminders display as toast notifications at scheduled time, can be toggled on/off without deletion, persist between sessions, show on dashboard with upcoming events. One-time reminders mark as notified after display. Recurring reminders automatically update to next occurrence (next day/week/month) after each notification and display last notification date.

### Unified Calendar View
- **Functionality**: Display all tournament reminders across all tournaments in a unified monthly calendar view with daily reminder details and upcoming reminders list
- **Purpose**: Provides a centralized overview of all scheduled reminders across tournaments, making it easy to see busy days and plan ahead
- **Trigger**: User clicks "Календар" in main navigation
- **Progression**: Main Navigation → Select Calendar → View Current Month → Navigate Between Months (Previous/Next/Today) → Click Day with Reminders → View Day Details → See Upcoming Reminders List
- **Success criteria**: Calendar displays correct month with days showing reminder indicators (dots), highlights current day, shows all reminders for selected day with tournament context, displays next 5 upcoming reminders sorted by date/time, supports month navigation, and updates in real-time when reminders are added/modified

## Edge Case Handling

- **Late Registration** - Allow adding players to tournament before first round starts; prevent additions after pairings are confirmed
- **Forfeit Handling** - Support recording forfeits and byes with proper point allocation (0 for forfeit loss, 1 for bye, 0.5 for double forfeit)
- **Odd Player Count** - Automatically assign bye to lowest-rated unpaired player in Swiss system rounds
- **Rating Ties** - When players have identical ratings, use registration order or random selection for initial seeding
- **Empty States** - Display helpful prompts when no tournaments/players/teams exist yet with quick action buttons
- **Invalid Results** - Prevent impossible results (both players winning) and require confirmation for unusual outcomes
- **Data Persistence** - All data stored in browser using IndexedDB (via OOP repository pattern), survives page refreshes and session closures
- **Database Migration** - Legacy useKV data automatically migrated to IndexedDB on first load
- **Import Validation** - Imported JSON files validated for required fields (tournament structure, players array, matches array) with detailed error messages for missing or malformed data
- **Player Deduplication** - During import, system matches imported players with existing database by unique code or name combination to avoid duplicates while adding genuinely new players
- **Tournament Cloning** - Imported tournaments receive new ID and set to draft status, allowing tournament templates to be reused for multiple events
- **Offline Support** - Full functionality available offline as a Progressive Web App
- **Theme Persistence** - User theme preference (light/dark) stored in useKV and automatically restored on app load
- **Past Reminders** - Reminders in the past are still editable and toggleable but display "notified" badge if already triggered (for one-time) or "last notified" date (for recurring)
- **Duplicate Reminders** - System allows multiple reminders for same tournament to support pre-event notifications at different times
- **Recurring Reminders** - Recurring reminders automatically advance to next occurrence after triggering (daily +1 day, weekly +7 days, monthly +1 month), can be edited or disabled at any time, and won't trigger multiple times on same day

## Technical Architecture

**OOP Design Principles:**
- **Composition over Inheritance** - Services compose smaller classes (PointsCalculator, TieBreakCalculator) rather than deep inheritance hierarchies
- **Small Focused Classes** - Each class has single responsibility (PlayerRepository, MatchRepository, etc.)
- **Strategy Pattern** - Pairing algorithms (Swiss, Round-Robin) implement PairingStrategy interface
- **Repository Pattern** - Database access abstracted through repositories (BaseRepository, PlayerRepository, etc.)
- **Service Layer** - Business logic separated into services (StandingsService, PairingService, ExportService)

**Database Layer (IndexedDB):**
- **DatabaseConnection** - Manages IndexedDB connection lifecycle
- **BaseRepository<T>** - Generic CRUD operations for all entities
- **PlayerRepository** - Player-specific queries (findByUniqCode, findBySurname, search)
- **TeamRepository** - Team-specific queries (findByPlayerId, isPlayerInTeam)
- **TournamentRepository** - Tournament-specific queries (findByStatus, findByDateRange)
- **MatchRepository** - Match-specific queries (findByTournamentId, findByRound)
- **DatabaseManager** - Facade providing unified access to all repositories

**Service Layer:**
- **PointsCalculator** - Calculates individual match points
- **StandingsCalculator** - Computes tournament standings from matches
- **TieBreakCalculator** - Calculates Buchholz, Berger, Progressive tie-breaks
- **TieBreakService** - Enriches standings with tie-break data
- **PairingService** - Generates match pairings using strategy pattern
- **SwissPairingStrategy** - Swiss system pairing algorithm
- **RoundRobinPairingStrategy** - Round-robin pairing algorithm
- **ExportService** - Exports tournament data using format pattern
- **JSONExportFormat** - JSON export implementation
- **CSVExportFormat** - CSV export implementation
- **ImportService** - Imports tournament data with validation and merging logic
- **JSONImportValidator** - Validates JSON import file structure
- **CSVImportValidator** - Placeholder for future CSV import support

## Design Direction

The design should evoke a sense of authority, precision, and clarity—characteristics essential for official tournament administration. The interface should feel like a professional tool used in serious competitive environments, with visual language that communicates organization, fairness, and reliability. Colors should be bold yet dignified, typography sharp and readable at a glance, and interactions direct and purposeful. The application now supports both light and dark themes, allowing users to choose their preferred visual mode.

## Color Selection

A rich, authoritative palette inspired by classic chess aesthetics with modern vibrancy. Deep strategic blues contrast against warm accent tones, creating visual hierarchy that guides tournament administrators through complex data efficiently. Both light and dark themes maintain the same visual language while adapting to different lighting conditions.

**Light Theme:**
- **Primary Color**: Deep Strategic Blue (oklch(0.45 0.15 250)) - Represents authority, precision, and competitive intelligence; used for primary actions and navigation
- **Secondary Colors**: Neutral Stone (oklch(0.92 0.01 90)) for backgrounds and Cool Slate (oklch(0.35 0.08 245)) for secondary elements; provides professional foundation without distraction
- **Accent Color**: Amber Victory (oklch(0.75 0.18 75)) - Bright, warm highlight suggesting achievement and action; used for CTAs, active states, and important notifications

**Dark Theme:**
- **Primary Color**: Bright Strategic Blue (oklch(0.60 0.18 250)) - Lighter variant for visibility on dark backgrounds
- **Background**: Deep Navy (oklch(0.15 0.02 250)) - Rich dark base that reduces eye strain
- **Card**: Elevated Navy (oklch(0.20 0.02 250)) - Slightly lighter for layered surfaces
- **Accent Color**: Warm Amber (oklch(0.70 0.18 75)) - Adjusted for dark mode contrast

- **Foreground/Background Pairings (Light Theme)**: 
  - Background (Stone White oklch(0.98 0.005 90)): Dark Blue text (oklch(0.25 0.1 250)) - Ratio 9.8:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 250)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent (Amber oklch(0.75 0.18 75)): Dark Blue text (oklch(0.25 0.1 250)) - Ratio 5.1:1 ✓
  - Card (White oklch(1 0 0)): Foreground text (oklch(0.25 0.1 250)) - Ratio 11.5:1 ✓

- **Foreground/Background Pairings (Dark Theme)**:
  - Background (Deep Navy oklch(0.15 0.02 250)): Light text (oklch(0.95 0.01 90)) - Ratio 10.5:1 ✓
  - Primary (Bright Blue oklch(0.60 0.18 250)): Light text (oklch(0.98 0.005 90)) - Ratio 7.8:1 ✓
  - Accent (Warm Amber oklch(0.70 0.18 75)): Dark text (oklch(0.15 0.02 250)) - Ratio 8.2:1 ✓
  - Card (Elevated Navy oklch(0.20 0.02 250)): Light text (oklch(0.95 0.01 90)) - Ratio 9.1:1 ✓

## Font Selection

Typography should convey both technical precision and sporting elegance, balancing data density with readability during high-pressure tournament moments.

- **Primary Font**: Space Grotesk (Bold for headings, Medium for UI) - Geometric, technical character with excellent legibility for data-heavy interfaces
- **Secondary Font**: Inter (Regular for body, SemiBold for emphasis) - Neutral, highly readable for tables and dense information displays

- **Typographic Hierarchy**:
  - H1 (Page Titles): Space Grotesk Bold / 32px / -0.02em letter spacing / 1.1 line height
  - H2 (Section Headers): Space Grotesk Bold / 24px / -0.01em letter spacing / 1.2 line height
  - H3 (Card Titles): Space Grotesk Medium / 18px / 0em letter spacing / 1.3 line height
  - Body Text: Inter Regular / 15px / 0em letter spacing / 1.6 line height
  - Table Data: Inter Medium / 14px / 0.01em letter spacing / 1.4 line height
  - Small Labels: Inter SemiBold / 12px / 0.03em letter spacing / 1.4 line height

## Animations

Animations should emphasize state changes and guide attention during critical tournament moments—results being entered, standings updating, pairings being generated—without slowing down rapid administrative workflows.

- **Results Entry**: Subtle scale pulse (1.0 → 1.02 → 1.0) over 200ms when match result is saved, communicating confirmation
- **Table Updates**: Smooth row position transitions (300ms ease-out) when standings reorder after results entry
- **Navigation**: Quick fade-in (150ms) for view changes, maintaining context without delay
- **Loading States**: Gentle rotation on pairing generation and report export to indicate processing
- **Hover Feedback**: Instant background color shift (100ms) on interactive elements for immediate tactile response

## Component Selection

- **Components**:
  - **Sidebar**: Navigation hub with collapsible sections for Tournaments, Players, Teams, Reports
  - **Tabs**: Switch between tournament details, pairings, standings, and results within tournament view
  - **Table**: Core component for displaying player lists, team rosters, standings, and match results with sortable columns
  - **Dialog**: Modal forms for creating/editing tournaments, players, teams, and entering match results
  - **Card**: Container for tournament overview, player profiles, and team compositions
  - **Select**: Dropdown for tournament format, system selection, gender, and result options
  - **Input**: Text fields for names, ratings, unique codes with clear validation states
  - **Button**: Primary (Amber accent for main actions), Secondary (Blue for navigation), Destructive (Red for delete)
  - **Badge**: Display player status, match results, round numbers with color-coded states
  - **Separator**: Subtle dividers between sections maintaining visual organization
  - **Sonner Toasts**: Quick success/error notifications for CRUD operations and result submissions

- **Customizations**:
  - **Crosstable Grid**: Custom component showing head-to-head results in matrix format for round-robin tournaments
  - **Pairing Board**: Visual display of current round matches with drag-to-reorder capability (future enhancement)
  - **Standing Table**: Enhanced table with automatic tie-break column visibility based on tournament settings

- **States**:
  - **Buttons**: Default (solid), Hover (brightness +10%), Active (scale 0.98), Disabled (opacity 40%)
  - **Inputs**: Default (border-input), Focus (ring-2 ring-primary), Error (border-destructive), Success (border-green-500)
  - **Match Cards**: Pending (border-muted), In Progress (border-accent), Completed (border-primary)

- **Icon Selection**:
  - Trophy (Tournament/Championship) for main tournament icon
  - Users (Players) for player management
  - UsersThree (Teams) for team section
  - Shuffle (Pairing/жеребкування) for pairing generation
  - Table (Standings) for tournament table view
  - DownloadSimple (Export) for report generation
  - UploadSimple (Import) for tournament import
  - CheckCircle (Success) for successful import validation
  - WarningCircle (Error) for failed import validation
  - Plus (Add) for create actions
  - PencilSimple (Edit) for modification
  - Trash (Delete) for removal operations
  - CheckCircle (Win) for match results
  - Circle (Draw) for draw results
  - Moon (Dark theme) for dark mode toggle
  - Sun (Light theme) for light mode toggle

- **Spacing**:
  - Page padding: p-6 (24px)
  - Card padding: p-4 to p-6 (16-24px)
  - Section gaps: gap-6 (24px)
  - Form field gaps: gap-4 (16px)
  - Table cell padding: px-4 py-2 (16px horizontal, 8px vertical)

- **Mobile**:
  - Sidebar collapses to bottom navigation bar on <768px
  - Tables switch to card-based vertical layout on mobile
  - Forms stack vertically with full-width inputs
  - Tournament standings show condensed view with expandable details
  - Match result entry uses full-screen dialog for better touch targets
