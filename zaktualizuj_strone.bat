@echo off
echo ===================================================
echo   Publikowanie nowej wersji Fiszki AI do sieci...
echo ===================================================
cd /d "%~dp0flashcard_web_app"
echo Krok 1/2: Budowanie aplikacji...
call npm run build
echo.
echo Krok 2/2: Wgrywanie na serwery Netlify...
call npx -y netlify-cli deploy --prod --dir=dist
echo.
echo ===================================================
echo   Wysylanie zakonczone!
echo   UWAGA: Jesli robisz to po raz pierwszy, 
echo   otworzy sie przegladarka zebys mogl sie zalogowac.
echo   Jesli zapyta "Link to existing site?", wybierz 
echo   "Create & configure a new site".
echo ===================================================
pause
