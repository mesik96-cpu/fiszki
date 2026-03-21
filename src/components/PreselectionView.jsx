import { useState } from 'react';
import { CheckSquare, Trash2, Save, Square } from 'lucide-react';

export default function PreselectionView({ cards, setCards, onSaveToDb, onNavigateTarget, existingFlashcards = [] }) {
    // Trzyma indeksy zaznaczonych fiszek
    const [selectedIndices, setSelectedIndices] = useState(new Set());

    const handleToggle = (index) => {
        const next = new Set(selectedIndices);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setSelectedIndices(next);
    };

    const handleSelectAll = (select) => {
        if (select) setSelectedIndices(new Set(cards.map((_, i) => i)));
        else setSelectedIndices(new Set());
    };

    const handleSave = async () => {
        const toSaveRaw = cards.filter((_, i) => selectedIndices.has(i));
        if (toSaveRaw.length === 0) return;

        // Anti-duplicate logic
        const existingWords = new Set(existingFlashcards.map(c => c.word.toLowerCase().trim()));
        const toSave = toSaveRaw.filter(c => !existingWords.has(c.word.toLowerCase().trim()));
        const duplicatesCount = toSaveRaw.length - toSave.length;

        if (toSave.length === 0) {
            alert(`Wszystkie zaznaczone fiszki (${duplicatesCount}) to duplikaty, które już posiadasz w bazie! Spróbuj innych słówek.`);
            setCards([]); // Czyścimy preselekcję
            setSelectedIndices(new Set());
            return;
        }

        const result = await onSaveToDb(toSave);
        if (result.success) {
            const duplInfo = duplicatesCount > 0 ? `\n(Pominięto automatycznie ${duplicatesCount} duplikatów)` : '';
            alert(`Pomyślnie zapisano ${toSave.length} fiszek!${duplInfo}`);
            setCards([]); // Czyścimy preselekcję
            setSelectedIndices(new Set());
            onNavigateTarget('browse'); // Wracamy do bazy
        } else {
            alert(`Błąd podczas zapisu: ${result.error}`);
        }
    };

    const handleDiscard = () => {
        if (window.confirm("Na pewno odrzucić te wygenerowane fiszki?")) {
            setCards([]);
            setSelectedIndices(new Set());
        }
    };

    if (!cards || cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <CheckSquare className="w-16 h-16 opacity-20" />
                <p className="text-xl">Brak fiszek w poczekalni.</p>
                <p className="text-sm">Porozmawiaj najpierw z AI, a wyłapane słówka trafią tutaj do akceptacji przed docelowym zapisaniem w Bazie.</p>
                <button
                    onClick={() => onNavigateTarget('ai')}
                    className="mt-4 px-6 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-xl transition-colors font-medium border border-indigo-500/20"
                >
                    Przejdź do Czatu AI
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-3 md:gap-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between glass-panel p-3 md:p-6 rounded-2xl border border-indigo-500/20 shrink-0">
                <div>
                    <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-indigo-300">
                        <CheckSquare className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" /> Preselekcja
                        <span className="text-xs md:text-sm font-normal text-gray-400 bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800">Czeka {cards.length} fiszek</span>
                    </h2>
                    <p className="hidden md:block text-sm text-gray-400 mt-1">
                        Te fiszki zostały wygenerowane przez AI i czekają na potwierdzenie. Wybierz tylko te przydatne, aby nie zaśmiecać swojej bazy.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={handleSave}
                        disabled={selectedIndices.size === 0}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none text-sm md:text-base"
                    >
                        <Save className="w-4 h-4" />
                        <span>Zapisz ({selectedIndices.size})</span>
                    </button>
                    <button
                        onClick={handleDiscard}
                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors font-medium text-sm md:text-base"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Odrzuć</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 px-2">
                <button onClick={() => handleSelectAll(true)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Zaznacz wszystkie</button>
                <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                <button onClick={() => handleSelectAll(false)} className="text-sm text-gray-500 hover:text-gray-300 font-medium">Odznacz wszystkie</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8 overflow-y-auto">
                {cards.map((card, idx) => {
                    const isSelected = selectedIndices.has(idx);
                    return (
                        <div
                            key={idx}
                            onClick={() => handleToggle(idx)}
                            className={`rounded-2xl p-5 flex flex-col gap-3 cursor-pointer border-2 transition-all ${isSelected
                                ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                                : 'bg-gray-900 border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-700'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg ${isSelected ? 'text-indigo-300' : 'text-gray-400'}`}>{card.word}</h3>
                                    <p className={isSelected ? 'text-gray-200' : 'text-gray-500'}>{card.translation}</p>
                                </div>
                                <div>
                                    {isSelected ? <CheckSquare className="text-indigo-400" /> : <Square className="text-gray-600" />}
                                </div>
                            </div>
                            {(card.example || card.example_pl) && (
                                <div className="text-sm mt-2 pt-3 border-t border-white/5">
                                    {card.example && <p className={isSelected ? 'text-purple-300' : 'text-gray-600'}>"{card.example}"</p>}
                                    {card.example_pl && <p className={isSelected ? 'text-gray-400 italic' : 'text-gray-600 italic'}>"{card.example_pl}"</p>}
                                </div>
                            )}
                            {card.category && card.category !== 'Bez kategorii' && (
                                <span className={`text-xs font-medium px-2 py-1 bg-white/5 rounded-md mt-auto w-max ${isSelected ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {card.category}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
