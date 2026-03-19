@echo off
echo ===================================================
echo   Publikowanie kodu na GitHub (fiszki-ai-app)...
echo ===================================================

cd /d "%~dp0flashcard_web_app"

echo Krok 1: Wstepna konfiguracja lokalnego konta...
"C:\Program Files\Git\cmd\git.exe" config --global user.name "AI Fiszki"
"C:\Program Files\Git\cmd\git.exe" config --global user.email "ai@fiszki.local"

echo Krok 2: Tworzenie repozytorium i zapis...
"C:\Program Files\Git\cmd\git.exe" init
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Antigravity: Pierwszy commit, aplikacja Appwrite"
"C:\Program Files\Git\cmd\git.exe" branch -M main

echo Krok 3: Podlaczanie zdalnego serwera Github...
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/mesik96-cpu/fiszki.git

echo Krok 4: Wysylanie do sieci...
echo.
echo UWAGA: Za chwile pojawi sie okienko logowania do GitHuba.
echo Zaloguj sie przez przegladarke, by uprawnic przeslanie kodu!
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo ===================================================
echo                     GOTOWE!
echo ===================================================
pause
