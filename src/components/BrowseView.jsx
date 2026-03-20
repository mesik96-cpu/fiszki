import { useState } from 'react';
import { Search, Trash2, Edit2, Plus, AlertTriangle, Loader2, Download } from 'lucide-react';


export default function BrowseView({ flashcards, loading, onDelete, onUpdate, onDeleteAll }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const itemsPerPage = 50;

    const filteredCards = flashcards
        .filter(c => !c.is_category)
        .filter(c =>
            c.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.translation.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
    const currentCards = filteredCards.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    if (loading && flashcards.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Baza Fiszek</h2>
                    <p className="text-gray-400">Masz {flashcards.length} zapisanych słówek w chmurze.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flashcards, null, 2));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href", dataStr);
                            downloadAnchorNode.setAttribute("download", "fiszki_backup_" + new Date().toISOString().split('T')[0] + ".json");
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                        }}
                        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-colors"
                        title="Pobierz kopię bazy (JSON)"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Backup</span>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("CZY NA PEWNO chcesz trwale usunąć WSZYSTKIE fiszki z chmury?")) {
                                onDeleteAll();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Wyczyść</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCards.map(card => (
                    <div key={card.id || card.word} className="glass-panel rounded-2xl p-5 flex flex-col gap-3 group">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-indigo-300">{card.word}</h3>
                                <p className="text-gray-200">{card.translation}</p>
                            </div>
                            <button onClick={() => onDelete(card.id)} className="text-gray-500 hover:text-red-400 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                            </button>
                        </div>
                        {(card.example || card.example_pl) && (
                            <div className="text-sm mt-2 pt-3 border-t border-white/5">
                                {card.example && <p className="text-purple-300">"{card.example}"</p>}
                                {card.example_pl && <p className="text-gray-400 italic">"{card.example_pl}"</p>}
                            </div>
                        )}
                        {card.category && card.category !== 'Bez kategorii' && (
                            <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md mt-auto w-max text-gray-400">
                                {card.category}
                            </span>
                        )}
                    </div>
                ))}
                {currentCards.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 opacity-50" />
                        <p>Nie znaleziono słówek pasujących do kryteriów.</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-auto pt-4">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        Poprzednia
                    </button>
                    <span className="text-sm text-gray-400">Strona {page + 1} z {totalPages}</span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        Następna
                    </button>
                </div>
            )}
        </div>
    );
}
