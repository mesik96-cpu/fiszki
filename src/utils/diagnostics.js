import { databases } from '../appwriteClient';
import { ID } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export async function checkAppwriteConnection() {
    console.log("🔍 Rozpoczynam diagnostykę Appwrite...");

    if (!databases) {
        console.error("❌ BŁĄD: Klient Appwrite nie został zainicjalizowany!");
        return { success: false, message: "Klient nieobecny (sprawdź .env)" };
    }

    try {
        // 1. Sprawdzenie odczytu
        console.log("📡 Próbuję pobrać dane z tabeli 'flashcards'...");
        const readData = await databases.listDocuments(DB_ID, COL_ID);

        const rowCount = readData.total || 0;
        console.log(`✅ ODCZYT OK! Znaleziono wierszy: ${rowCount}`);

        // 2. Sprawdzenie zapisu (WRITE TEST)
        console.log("📝 Próbuję wykonać testowy zapis (WRITE TEST)...");
        const testCard = {
            word: "DIAGNOSTYKA_TEST",
            translation: "TEST",
            category: "SYSTEM"
        };

        const writeData = await databases.createDocument(
            DB_ID,
            COL_ID,
            ID.unique(),
            testCard
        );

        console.log("✅ ZAPIS OK! Testowa fiszka dodana.");

        // 3. Sprzątanie (Usuwanie testu)
        if (writeData && writeData.$id) {
            console.log("🧹 Usuwam rekord testowy...");
            await databases.deleteDocument(DB_ID, COL_ID, writeData.$id);
        }

        return {
            success: true,
            message: `Wszystko działa! Odczyt i Zapis są aktywne. W bazie jest ${rowCount} fiszek. Spróbuj teraz dodać coś przez czat.`
        };

    } catch (err) {
        console.error("❌ BŁĄD DIAGNOSTYKI:", err);
        return {
            success: false,
            error: err.message,
            message: "Upewnij się, że podałeś poprawne ID oraz włączyłeś uprawnienia w Settings!"
        };
    }
}
