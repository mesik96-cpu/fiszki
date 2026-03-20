import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, RefreshCcw, Eye, Settings2 } from 'lucide-react';

export default function StudyView({ flashcards }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffleMode, setShuffleMode] = useState(false);
    const [reverseMode, setReverseMode] = useState(false); // true: pl->es, false: es->pl
    const [selectedCategory, setSelectedCategory] = useState("Wszystkie");

    const categories = useMemo(() => {
        const cats = new Set(flashcards.map(c => c.category || "Bez kategorii"));
        // Filter out items that are marked as headers/categories, just in case
        return ["Wszystkie", ...Array.from(cats)].filter(c => typeof c === 'string');
    }, [flashcards]);

    const studyList = useMemo(() => {
        // Filter out entries that might be category headers
        let list = flashcards.filter(c => !c.is_category);
        if (selectedCategory !== "Wszystkie") {
            list = list.filter(c => c.category === selectedCategory);
        }

        if (shuffleMode && list.length > 0) {
            const shuffled = [...list];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        return list;
    }, [flashcards, selectedCategory, shuffleMode]);

    const card = studyList[currentIndex % Math.max(1, studyList.length)];

    if (!card) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="text-xl mb-4">Nie masz jeszcze żadnych fiszek w tej kategorii.</p>
            </div>
        );
    }

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % studyList.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + studyList.length) % studyList.length);
    };

    const frontWord = reverseMode ? card.translation : card.word;
    const backWord = reverseMode ? card.word : card.translation;

    const frontExample = reverseMode ? card.example_pl : card.example;
    const backExample = reverseMode ? card.example : card.example_pl;

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto py-8">

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 glass-panel p-4 rounded-2xl">
                <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentIndex(0); setIsFlipped(false); }}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={reverseMode}
                            onChange={(e) => { setReverseMode(e.target.checked); setIsFlipped(false); }}
                            className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-800"
                        />
                        Odwrocie (Pol → Obce)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            checked={shuffleMode}
                            onChange={(e) => { setShuffleMode(e.target.checked); setCurrentIndex(0); setIsFlipped(false); }}
                            className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-800"
                        />
                        Tasuj fiszki
                    </label>
                </div>
            </div>

            {/* Progress */}
            <p className="text-center text-sm font-medium text-gray-500 tracking-widest mb-4">
                FISZKA {(currentIndex % studyList.length) + 1} Z {studyList.length}
            </p>

            {/* The Flashcard */}
            <div className="perspective-1000 w-full aspect-[4/5] sm:aspect-[4/3] max-h-[340px] md:max-h-[400px] mb-8 relative group cursor-pointer touch-manipulation" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>

                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden glass-panel rounded-3xl flex flex-col items-center justify-center p-8 text-center border-indigo-500/20 shadow-indigo-500/10 shadow-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 mb-6 leading-tight">
                            {frontWord}
                        </h2>
                        {frontExample && (
                            <p className="text-lg md:text-xl text-indigo-300/80 italic">"{frontExample}"</p>
                        )}
                        <div className="absolute bottom-6 flex items-center gap-2 text-sm text-gray-500">
                            <Eye className="w-4 h-4" /> Kliknij by odwrócić
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 flex flex-col items-center justify-center p-8 text-center shadow-indigo-500/20 shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            {backWord}
                        </h2>
                        {backExample && (
                            <p className="text-lg md:text-xl text-indigo-200 italic">"{backExample}"</p>
                        )}
                    </div>

                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between md:justify-center gap-2 md:gap-4 touch-manipulation">
                <button onClick={handlePrev} className="p-3 md:p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 active:scale-95 md:hover:scale-105 transition-all w-16 md:w-32 flex items-center justify-center gap-2 group">
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => setIsFlipped(!isFlipped)} className="flex-1 max-w-[200px] py-3 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 md:hover:scale-105 transition-all flex justify-center items-center gap-2 text-sm md:text-base">
                    <RefreshCcw className="w-5 h-5 md:w-5 md:h-5" />
                    {isFlipped ? "Ukryj" : "Odwróć"}
                </button>
                <button onClick={handleNext} className="p-3 md:p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 active:scale-95 md:hover:scale-105 transition-all w-16 md:w-32 flex items-center justify-center gap-2 group">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
            </div>

        </div>
    );
}
