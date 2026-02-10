export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'navigate';
  view?: 'dashboard' | 'tournaments' | 'players' | 'teams' | 'export' | 'calendar';
  highlightMultiple?: boolean;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Ласкаво просимо до ArbiChief!',
    description: 'Цей короткий туторіал познайомить вас з основними розділами додатку для організації шахових та шашкових турнірів.',
    target: '',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Панель керування',
    description: 'Головна сторінка показує загальну статистику: кількість турнірів, гравців, команд та найближчі нагадування. Тут ви бачите загальну картину роботи додатку.',
    target: '[data-tutorial="dashboard-stats"]',
    position: 'bottom',
    view: 'dashboard',
  },
  {
    id: 'nav-tournaments',
    title: 'Турніри',
    description: 'У цьому розділі ви створюєте та керуєте турнірами. Можна налаштувати формат (швейцарка/кругова), систему жеребкування, правила підрахунку очок, тай-брейки. Кожен турнір має вкладки: Учасники, Жеребкування, Турнірна таблиця та Нагадування.',
    target: '[data-tutorial="nav-tournaments"]',
    position: 'right',
    action: 'navigate',
    view: 'tournaments',
  },
  {
    id: 'nav-players',
    title: 'Гравці',
    description: 'База даних усіх учасників. Тут ви додаєте гравців з їх даними: ім\'я, прізвище, унікальний код, рейтинг та стать. Можна шукати, сортувати, редагувати та видаляти гравців.',
    target: '[data-tutorial="nav-players"]',
    position: 'right',
    action: 'navigate',
    view: 'players',
  },
  {
    id: 'nav-teams',
    title: 'Команди',
    description: 'Розділ для командних турнірів. Створюйте команди, призначайте гравців на різні дошки, встановлюйте резервних гравців. Це важливо для правильного підрахунку командних очок.',
    target: '[data-tutorial="nav-teams"]',
    position: 'right',
    action: 'navigate',
    view: 'teams',
  },
  {
    id: 'nav-calendar',
    title: 'Календар',
    description: 'Календар показує всі нагадування з усіх турнірів в одному місці. Дні з подіями позначені точками. Переглядайте список найближчих подій, навігуйте між місяцями.',
    target: '[data-tutorial="nav-calendar"]',
    position: 'right',
    action: 'navigate',
    view: 'calendar',
  },
  {
    id: 'nav-export',
    title: 'Експорт',
    description: 'Тут ви зберігаєте та завантажуєте дані. Експортуйте турніри у JSON (для резервного копіювання) або CSV (для Excel). Імпортуйте раніше збережені турніри або шаблони.',
    target: '[data-tutorial="nav-export"]',
    position: 'right',
    action: 'navigate',
    view: 'export',
  },
  {
    id: 'complete',
    title: 'Готово!',
    description: 'Тепер ви знаєте всі основні розділи ArbiChief. Почніть з додавання гравців, потім створіть турнір та запросіть учасників. Ви можете переглянути туторіал знову з панелі керування.',
    target: '',
    position: 'center',
  },
];
