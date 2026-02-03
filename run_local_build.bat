@echo off
set "JAVA_HOME=C:\Users\pc\OneDrive\Desktop\quran\jdk-17.0.12+7"
set "ANDROID_HOME=C:\Users\pc\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo [1/5] Building in current directory...
REM cd /d "%BUILD_DIR%"

echo [2/5] Running Expo Prebuild...
set CI=1
call npx expo prebuild --platform android --no-install --non-interactive

echo [3/5] Setting up local.properties...
if not exist "android" mkdir android
echo sdk.dir=C:\\Users\\pc\\AppData\\Local\\Android\\Sdk> android\local.properties

echo [4/5] Building APK with Gradle...
cd android
call gradlew.bat assembleRelease --no-daemon

echo [5/5] Copying APK back to project...
if exist "app\build\outputs\apk\release\app-release.apk" (
    copy "app\build\outputs\apk\release\app-release.apk" "C:\Users\pc\OneDrive\Desktop\quran\NUR-QURAN-v4-Local.apk"
    echo SUCCESS: APK generated at NUR-QURAN-v4-Local.apk
) else (
    echo ERROR: APK was not generated. Check logs above.
)
pause
