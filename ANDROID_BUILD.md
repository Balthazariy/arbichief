# ArbiChief - Android Build Guide

## Требования

1. **Java Development Kit (JDK)**
   - JDK 17 или выше
   - Проверка: `java -version`

2. **Android Studio** (опционально)
   - Для визуальной разработки и отладки
   - Включает Android SDK, Gradle, эмулятор

3. **Android SDK** (обязательно)
   - Если не используете Android Studio, установите Command Line Tools
   - Переменные окружения:
     - `ANDROID_HOME` → путь к Android SDK
     - `ANDROID_SDK_ROOT` → путь к Android SDK

4. **Gradle**
   - Входит в состав Android проекта (`android/gradlew.bat`)

## Быстрый старт

### Вариант 1: Использование скриптов

**Debug сборка (для тестирования):**
```powershell
.\build-android.ps1
# или
.\build-android.bat
# или через npm
npm run android:build:debug
```

**Release сборка (для публикации):**
```powershell
.\build-android.ps1 release
# или
.\build-android.bat release
# или через npm
npm run android:build:release
```

Готовый APK будет в папке `release/`:
- `ArbiChief-debug.apk` (debug)
- `ArbiChief-release.apk` (release, требует подписи)

### Вариант 2: Через Android Studio

1. Откройте Android Studio
2. Запустите:
   ```powershell
   npm run android:open
   # или
   npx cap open android
   ```
3. В Android Studio:
   - **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Для release: **Build → Generate Signed Bundle / APK**

## Что делают скрипты

1. **npm run build** - собирает веб-приложение в `dist/`
2. **npx cap sync android** - копирует `dist/` в Android проект
3. **gradlew assembleDebug/Release** - компилирует APK
4. Копирует APK в `release/` для удобства

## Установка на устройство

### Через USB (Android Debug Bridge)

1. Включите **USB отладку** на устройстве:
   - Настройки → О телефоне → 7 раз тапните на "Номер сборки"
   - Настройки → Для разработчиков → USB отладка

2. Подключите устройство к компьютеру

3. Проверьте подключение:
   ```powershell
   adb devices
   ```

4. Установите APK:
   ```powershell
   adb install -r release\ArbiChief-debug.apk
   ```

### Прямая установка APK

1. Скопируйте `release\ArbiChief-debug.apk` на устройство
2. Откройте файл на устройстве
3. Разрешите установку из неизвестных источников

## Подпись Release APK

Для публикации в Google Play нужна подпись:

### 1. Создание ключа (keystore)

```powershell
keytool -genkey -v -keystore arbichief-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias arbichief
```

Сохраните:
- Пароль keystore
- Пароль ключа (alias)
- Путь к файлу `.jks`

### 2. Настройка Gradle

Создайте `android/key.properties`:
```properties
storePassword=ваш_пароль_keystore
keyPassword=ваш_пароль_ключа
keyAlias=arbichief
storeFile=C:/путь/к/arbichief-release-key.jks
```

**НЕ коммитьте `key.properties` в Git!**

### 3. Обновите `android/app/build.gradle`

После `android {` добавьте:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...existing code...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Соберите подписанный APK

```powershell
.\build-android.ps1 release
```

## Настройка иконки и splash screen

### Иконка приложения

1. Подготовьте иконку 1024×1024 px (PNG)
2. Используйте [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
3. Замените файлы в `android/app/src/main/res/`:
   - `mipmap-hdpi/ic_launcher.png`
   - `mipmap-mdpi/ic_launcher.png`
   - `mipmap-xhdpi/ic_launcher.png`
   - `mipmap-xxhdpi/ic_launcher.png`
   - `mipmap-xxxhdpi/ic_launcher.png`

### Splash Screen

Добавьте в `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ...existing config...
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};
```

## Добавление Capacitor плагинов

### Filesystem
```powershell
npm install @capacitor/filesystem
npx cap sync
```

### Camera
```powershell
npm install @capacitor/camera
npx cap sync
```

### Push Notifications
```powershell
npm install @capacitor/push-notifications
npx cap sync
```

### В коде React:

```typescript
import { Filesystem } from '@capacitor/filesystem';
import { Camera } from '@capacitor/camera';

// Пример использования
const takePhoto = async () => {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: 'uri'
  });
};
```

## Отладка

### Просмотр логов:
```powershell
adb logcat | Select-String "chromium"
```

### Chrome DevTools:
1. Подключите устройство через USB
2. В Chrome откройте: `chrome://inspect`
3. Выберите ваше приложение

## Troubleshooting

### Ошибка: "SDK location not found"

Установите переменные окружения:
```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', 'C:\Users\YourName\AppData\Local\Android\Sdk', 'User')
```

Перезапустите PowerShell.

### Ошибка: "Gradle build failed"

1. Проверьте версию JDK: `java -version` (нужна 17+)
2. Очистите кэш Gradle:
   ```powershell
   cd android
   .\gradlew clean
   cd ..
   ```
3. Пересоберите:
   ```powershell
   .\build-android.ps1
   ```

### Приложение падает при запуске

1. Проверьте логи: `adb logcat`
2. Убедитесь, что `npm run build` завершился успешно
3. Пересинхронизируйте: `npx cap sync android`

## Команды

| Команда | Описание |
|---------|----------|
| `npm run android:build:debug` | Собрать debug APK |
| `npm run android:build:release` | Собрать release APK |
| `npm run android:open` | Открыть в Android Studio |
| `npx cap sync android` | Синхронизировать веб → Android |
| `adb devices` | Список подключенных устройств |
| `adb install -r <apk>` | Установить APK |
| `adb uninstall com.arbichief.app` | Удалить приложение |

## Структура проекта

```
arbichief/
├── android/                    # Android проект
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/        # Веб-приложение (dist/)
│   │   │   ├── res/           # Ресурсы (иконки, splash)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle       # Настройки приложения
│   ├── build.gradle           # Настройки проекта
│   ├── variables.gradle       # Версии SDK/библиотек
│   └── gradlew.bat           # Gradle wrapper
├── capacitor.config.ts        # Конфигурация Capacitor
├── build-android.ps1          # Скрипт сборки (PowerShell)
└── build-android.bat          # Скрипт сборки (Batch)
```

## Дополнительные ресурсы

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

