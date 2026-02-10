# Автоматическая сборка ArbiChief Electron
# Этот скрипт выполняет полную сборку приложения

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ArbiChief - Автоматическая сборка" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Очистка старых файлов
Write-Host "[1/4] Очистка старых файлов сборки..." -ForegroundColor Yellow
if (Test-Path ".\release") {
    Remove-Item -Path ".\release" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      ✓ Папка release очищена" -ForegroundColor Green
}
if (Test-Path ".\dist") {
    Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "      ✓ Папка dist очищена" -ForegroundColor Green
}

# Шаг 2: Установка зависимостей (если нужно)
Write-Host ""
Write-Host "[2/4] Проверка зависимостей..." -ForegroundColor Yellow
if (-not (Test-Path ".\node_modules")) {
    Write-Host "      ! node_modules не найден, устанавливаю..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "      ✓ Зависимости установлены" -ForegroundColor Green
}

# Шаг 3: Сборка приложения
Write-Host ""
Write-Host "[3/4] Сборка Electron приложения..." -ForegroundColor Yellow
Write-Host "      (это может занять несколько минут)" -ForegroundColor Gray
npm run electron:build:win

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Ошибка при сборке!" -ForegroundColor Red
    exit 1
}

# Шаг 4: Создание портативной версии
Write-Host ""
Write-Host "[4/4] Создание портативной версии..." -ForegroundColor Yellow
if (Test-Path ".\release\win-unpacked") {
    Copy-Item ".\release\win-unpacked" ".\release\ArbiChief-Portable" -Recurse -Force

    # Создание README
    $readmeContent = @"
# ArbiChief - Портативная версия

Для запуска откройте: ArbiChief.exe

Это портативная версия - не требует установки.
Можно запускать с USB или любой папки.

Системные требования:
- Windows 10/11 (64-bit)
- 4 ГБ RAM

---
ArbiChief v1.0.0
Менеджер турнірів
"@

    Set-Content -Path ".\release\ArbiChief-Portable\README.txt" -Value $readmeContent -Encoding UTF8
    Write-Host "      ✓ Портативная версия создана" -ForegroundColor Green
}

# Итоговая информация
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ СБОРКА ЗАВЕРШЕНА УСПЕШНО!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Готовые файлы в папке: .\release\" -ForegroundColor White
Write-Host ""
Write-Host "   1. ArbiChief-1.0.0-win.zip" -ForegroundColor Cyan
Write-Host "      → ZIP архив приложения" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. win-unpacked\ArbiChief.exe" -ForegroundColor Cyan
Write-Host "      → Готовый exe-файл" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. ArbiChief-Portable\" -ForegroundColor Cyan
Write-Host "      → Портативная версия с README" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Быстрый запуск:" -ForegroundColor Yellow
Write-Host "   .\release\win-unpacked\ArbiChief.exe" -ForegroundColor White
Write-Host ""
Write-Host "📤 Для распространения:" -ForegroundColor Yellow
Write-Host "   - Отправьте ZIP архив, или" -ForegroundColor White
Write-Host "   - Скопируйте папку ArbiChief-Portable" -ForegroundColor White
Write-Host ""
Write-Host "Готово! 🎉" -ForegroundColor Green

