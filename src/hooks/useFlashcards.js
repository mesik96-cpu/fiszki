import { useState, useEffect } from 'react';
import { databases } from '../appwriteClient';
import { ID, Query } from 'appwrite';

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export function useFlashcards() {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all flashcards
    const fetchFlashcards = async () => {
        try {
            setLoading(true);
            if (!databases) throw new Error("Appwrite client not initialized. Sprawdź .env");

            const response = await databases.listDocuments(
                DB_ID,
                COL_ID,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );

            // Map Appwrite documents to our flashcards state
            const mappedCards = response.documents.map(doc => ({
                id: doc.$id,
                word: doc.word,
                translation: doc.translation,
                example: doc.example || '',
                example_pl: doc.example_pl || '',
                category: doc.category || 'Bez kategorii',
                created_at: doc.$createdAt
            }));

            setFlashcards(mappedCards);
        } catch (err) {
            setError(err.message);
            console.error("Błąd pobierania fiszek:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards();
    }, []);

    // Add new flashcard
    const addFlashcard = async (card) => {
        try {
            const documentPayload = {
                word: card.word,
                translation: card.translation,
                example: card.example || '',
                example_pl: card.example_pl || '',
                category: card.category || 'Bez kategorii'
            };

            const data = await databases.createDocument(
                DB_ID,
                COL_ID,
                ID.unique(),
                documentPayload
            );

            const newCard = {
                id: data.$id,
                word: data.word,
                translation: data.translation,
                example: data.example || '',
                example_pl: data.example_pl || '',
                category: data.category || 'Bez kategorii',
                created_at: data.$createdAt
            };

            setFlashcards(prev => [newCard, ...prev]);
            return { success: true, data: newCard };
        } catch (err) {
            console.error("Błąd dodawania fiszki:", err);
            return { success: false, error: err.message };
        }
    };

    // Add multiple (from AI)
    const addMultipleFlashcards = async (cards) => {
        try {
            const addedCards = [];
            // Appwrite doesn't have a bulk insert out of the box, so we iterate
            for (const card of cards) {
                const documentPayload = {
                    word: card.word,
                    translation: card.translation,
                    example: card.example || '',
                    example_pl: card.example_pl || '',
                    category: card.category || 'Bez kategorii'
                };

                const data = await databases.createDocument(
                    DB_ID,
                    COL_ID,
                    ID.unique(),
                    documentPayload
                );

                addedCards.push({
                    id: data.$id,
                    word: data.word,
                    translation: data.translation,
                    example: data.example || '',
                    example_pl: data.example_pl || '',
                    category: data.category || 'Bez kategorii',
                    created_at: data.$createdAt
                });
            }

            setFlashcards(prev => [...addedCards, ...prev]);
            return { success: true, data: addedCards };
        } catch (err) {
            console.error("Błąd zapisywania grupy fiszek:", err);
            return { success: false, error: err.message };
        }
    };

    // Update existing
    const updateFlashcard = async (id, updates) => {
        try {
            // Filter out system fields like id or created_at before sending to appwrite
            const updatePayload = {
                word: updates.word,
                translation: updates.translation,
                example: updates.example,
                example_pl: updates.example_pl,
                category: updates.category
            };

            // Remove undefined values
            Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

            const data = await databases.updateDocument(
                DB_ID,
                COL_ID,
                id,
                updatePayload
            );

            const updatedCard = {
                id: data.$id,
                word: data.word,
                translation: data.translation,
                example: data.example || '',
                example_pl: data.example_pl || '',
                category: data.category || 'Bez kategorii',
                created_at: data.$createdAt
            };

            setFlashcards(prev => prev.map(c => c.id === id ? updatedCard : c));
            return { success: true, data: updatedCard };
        } catch (err) {
            console.error("Błąd modyfikacji:", err);
            return { success: false, error: err.message };
        }
    };

    // Delete
    const deleteFlashcard = async (id) => {
        try {
            await databases.deleteDocument(
                DB_ID,
                COL_ID,
                id
            );
            setFlashcards(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (err) {
            console.error("Błąd usuwania:", err);
            return { success: false, error: err.message };
        }
    };

    // Delete ALL
    const deleteAllFlashcards = async () => {
        try {
            // Appwrite requires deleting documents one by one
            const response = await databases.listDocuments(DB_ID, COL_ID);
            for (const doc of response.documents) {
                await databases.deleteDocument(DB_ID, COL_ID, doc.$id);
            }

            setFlashcards([]);
            return { success: true };
        } catch (err) {
            console.error("Błąd usuwania wszystkiego:", err);
            return { success: false, error: err.message };
        }
    };

    return {
        flashcards,
        loading,
        error,
        fetchFlashcards,
        addFlashcard,
        addMultipleFlashcards,
        updateFlashcard,
        deleteFlashcard,
        deleteAllFlashcards
    };
}
