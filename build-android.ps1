# PowerShell скрипт для сборки Android APK
# Использование: .\build-android.ps1 [debug|release]

param(
    [string]$BuildType = "debug"
)

Write-Host "=== ArbiChief Android Build Script ===" -ForegroundColor Cyan
Write-Host ""

# Проверка наличия Android проекта
if (-not (Test-Path ".\android\gradlew.bat")) {
    Write-Host "ERROR: Android проект не найден. Запустите 'npx cap add android' сначала." -ForegroundColor Red
    exit 1
}

# Шаг 1: Сборка веб-приложения
Write-Host "[1/4] Сборка веб-приложения..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Ошибка при сборке веб-приложения" -ForegroundColor Red
    exit 1
}

# Шаг 2: Синхронизация с Capacitor
Write-Host "[2/4] Синхронизация с Capacitor..." -ForegroundColor Green
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Ошибка при синхронизации Capacitor" -ForegroundColor Red
    exit 1
}

# Шаг 3: Сборка APK
Write-Host "[3/4] Сборка Android APK ($BuildType)..." -ForegroundColor Green
cd android

if ($BuildType -eq "release") {
    .\gradlew.bat assembleRelease
    $apkPath = ".\app\build\outputs\apk\release\app-release.apk"
    $outputName = "ArbiChief-release.apk"
} else {
    .\gradlew.bat assembleDebug
    $apkPath = ".\app\build\outputs\apk\debug\app-debug.apk"
    $outputName = "ArbiChief-debug.apk"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Ошибка при сборке APK" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..

# Шаг 4: Копирование APK в папку release
Write-Host "[4/4] Копирование APK..." -ForegroundColor Green
if (-not (Test-Path ".\release")) {
    New-Item -ItemType Directory -Path ".\release" | Out-Null
}

if (Test-Path $apkPath) {
    Copy-Item $apkPath ".\release\$outputName" -Force
    Write-Host ""
    Write-Host "=== УСПЕШНО ===" -ForegroundColor Green
    Write-Host "APK создан: .\release\$outputName" -ForegroundColor Cyan

    $fileSize = (Get-Item ".\release\$outputName").Length / 1MB
    Write-Host ("Размер: {0:N2} MB" -f $fileSize) -ForegroundColor Cyan
} else {
    Write-Host "ERROR: APK файл не найден по пути $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Для установки на устройство:" -ForegroundColor Yellow
Write-Host "  adb install -r .\release\$outputName" -ForegroundColor White

