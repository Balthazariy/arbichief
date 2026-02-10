@echo off
REM Batch скрипт для сборки Android APK
REM Использование: build-android.bat [debug|release]

setlocal enabledelayedexpansion

set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=debug

echo === ArbiChief Android Build Script ===
echo.

REM Проверка наличия Android проекта
if not exist "android\gradlew.bat" (
    echo ERROR: Android проект не найден. Запустите 'npx cap add android' сначала.
    exit /b 1
)

REM Шаг 1: Сборка веб-приложения
echo [1/4] Сборка веб-приложения...
call npm run build
if errorlevel 1 (
    echo ERROR: Ошибка при сборке веб-приложения
    exit /b 1
)

REM Шаг 2: Синхронизация с Capacitor
echo [2/4] Синхронизация с Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Ошибка при синхронизации Capacitor
    exit /b 1
)

REM Шаг 3: Сборка APK
echo [3/4] Сборка Android APK (%BUILD_TYPE%)...
cd android

if "%BUILD_TYPE%"=="release" (
    call gradlew.bat assembleRelease
    set APK_PATH=app\build\outputs\apk\release\app-release.apk
    set OUTPUT_NAME=ArbiChief-release.apk
) else (
    call gradlew.bat assembleDebug
    set APK_PATH=app\build\outputs\apk\debug\app-debug.apk
    set OUTPUT_NAME=ArbiChief-debug.apk
)

if errorlevel 1 (
    echo ERROR: Ошибка при сборке APK
    cd ..
    exit /b 1
)

cd ..

REM Шаг 4: Копирование APK в папку release
echo [4/4] Копирование APK...
if not exist "release" mkdir release

if exist "android\!APK_PATH!" (
    copy /Y "android\!APK_PATH!" "release\!OUTPUT_NAME!"
    echo.
    echo === УСПЕШНО ===
    echo APK создан: release\!OUTPUT_NAME!
) else (
    echo ERROR: APK файл не найден
    exit /b 1
)

echo.
echo Для установки на устройство:
echo   adb install -r release\!OUTPUT_NAME!

endlocal

