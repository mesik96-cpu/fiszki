import { useState, useRef, useEffect } from 'react';
import { Send, UploadCloud, Loader2, Wand2, DatabaseZap, Trash2 } from 'lucide-react';
import { callGeminiApi } from '../utils/gemini';
import { parseChatVocabulary } from '../utils/parser';

export default function AiChatView({ onExtractSuccess, messages, setMessages, existingFlashcards = [] }) {
    const [input, setInput] = useState('');
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, status]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!apiKey) {
            alert("Najpierw podaj klucz Gemini API w prawym panelu!");
            return;
        }

        const userMessage = input.trim();
        setInput('');
        setMessages(p => [...p, { role: 'user', content: userMessage }]);
        setLoading(true);
        setStatus("Czekam na odpowiedź AI...");

        try {
            // 1. Chat Response
            const formattedHistory = messages
                .filter(m => m.role !== 'system' && m.content)
                .map(m => ({ role: m.role, parts: [{ text: m.content }] }));

            formattedHistory.push({ role: 'user', parts: [{ text: userMessage }] });

            const chatInstruction = "Jesteś ekspertem powołanym do nauki języka hiszpańskiego. Zawsze domyślnie tłumacz słowa podane przez użytkownika na język hiszpański (chyba że użytkownik wyraźnie poprosi o inny język). ZAKAZ UŻYWANIA JAKICHKOLWIEK INNYCH JĘZYKÓW POZA HISZPAŃSKIM ORAZ POLSKIM (np. absolutnie zero włoskiego, francuskiego itp.). Poprawiaj błędy, ucz nowych słówek i zachęcaj do nauki po hiszpańsku.";
            const replyText = await callGeminiApi(apiKey, "gemini-flash-lite-latest", formattedHistory, chatInstruction);
            setMessages(p => [...p, { role: 'model', content: replyText }]);

            // 2. Extraction in background
            const uniqueCategories = [...new Set(existingFlashcards.map(c => c.category).filter(c => c && c !== 'Bez kategorii'))].slice(0, 30);
            const categoriesStr = uniqueCategories.length > 0 ? `ISTNIEJĄCE KATEGORIE BAZY (Dąż bezwględnie do ich mądrego ponownego użycia zamiast tworzenia nowych!): ${uniqueCategories.join(', ')}` : '';

            const instruction = `Jesteś systemem DATA EXTRACTION do fiszek. Wyodrębnij słówka.
Format (KAŻDA LINIA): KATEGORIA | SŁÓWKO | TŁUMACZENIE | PRZYKŁAD | TŁUMACZENIE PRZYKŁADU

Zasady krytyczne:
- JĘZYK DOMYŚLNY TO HISZPAŃSKI. Tłumacz zawsze na hiszpański, chyba że w rozmowie była mowa o innym.
- ZAKAZ UŻYWANIA JAKICHKOLWIEK INNYCH JĘZYKÓW (np. włoskiego, francuskiego itp.) - TYLKO HISZPAŃSKI I POLSKI.
- ${categoriesStr ? categoriesStr : 'Grupuj wiedzę w broad kategorie (np. Podstawy, Podróż, Jedzenie).'}
- NIE TWORZ WĄSKICH KATEGORII DLA POJEDYNCZYCH SŁÓWEK. Zawsze używaj szerokich, ogólnych działów.
- PRZYKŁADY SĄ OBOWIĄZKOWE. Jeśli w tekście nie ma przykładu, WYMYŚL krótki, naturalny przykład w obu językach.
- Zwróć tylko surowy tekst fiszek.
- Jeśli brak słówek, zwróć: BRAK.`;

            const extractionContext = [
                { role: 'user', parts: [{ text: `WYREGULUJ I WYDOBĄDŹ SŁÓWKA Z TEJ ODPOWIEDZI (DODAJ PRZYKŁADY JEŚLI BRAKUJE):\n${replyText}` }] }
            ];

            const rawExtraction = await callGeminiApi(apiKey, "gemini-flash-lite-latest", extractionContext, instruction);

            if (rawExtraction && rawExtraction.length > 2 && !rawExtraction.toUpperCase().includes("BRAK")) {
                const parsed = parseChatVocabulary(rawExtraction);
                if (parsed.length > 0) {
                    onExtractSuccess(parsed);
                    setStatus(`✨ Sukces! Zebrano ${parsed.length} fiszek. Zobacz zakładkę Preselekcji!`);
                } else {
                    setStatus("ℹ️ AI wysłało dane, ale parser ich nie rozpoznał.");
                }
            } else {
                setStatus("ℹ️ Skryba nie widzi nowych słówek w tej wiadomości.");
            }

        } catch (err) {
            console.error(err);
            setStatus(`⚠️ Błąd: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        if (confirm("Czy na pewno chcesz wyczyścić historię rozmowy?")) {
            setMessages([
                { role: 'model', content: "¡Hola! Historia wyczyszczona. Jakiego hiszpańskiego słówka uczymy się dzisiaj?" }
            ]);
            setStatus('');
        }
    };

    const handlePasteRawText = () => {
        const parsed = parseChatVocabulary(input);
        if (parsed.length > 0) {
            onExtractSuccess(parsed);
            setInput('');
        } else {
            alert("Nie udało się rozpoznać formatu list (Słówko - Tłumaczenie).");
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden border border-gray-800 min-h-0">
            <div className="bg-gray-900/50 border-b border-gray-800 p-3 md:p-4 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
                        <span className="text-indigo-400"><Wand2 size={20} /></span> AI Mój Skryba
                    </h2>
                    <p className="hidden md:block text-sm text-gray-500">Historia jest zapisywana nawet gdy zmieniasz zakładki.</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2 bg-gray-950/80 p-1 md:p-1.5 rounded-lg border border-gray-800/80">
                    <button
                        onClick={handlePasteRawText}
                        className="px-2 py-1 md:px-3 text-xs md:text-sm text-indigo-400 hover:text-white hover:bg-indigo-500/20 rounded-md flex items-center gap-1.5 transition-colors"
                        title="Zapisz gotowy tekst od razu do bazy jako fiszki"
                    >
                        <UploadCloud size={16} /> <span className="hidden sm:inline">Szybki Import</span>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-800"></div>
                    <button
                        onClick={handleClearChat}
                        className="p-1.5 md:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Wyczyść historię"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-gray-800 text-gray-200 border border-gray-700/50 rounded-bl-sm'
                            }`}>
                            <div className="text-xs opacity-50 mb-1">{m.role === 'user' ? 'Ty' : 'Gemini AI'}</div>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800/50 text-gray-400 p-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> AI pisze...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 md:p-4 bg-gray-900/50 border-t border-gray-800 flex flex-col gap-2 shrink-0">
                {status && (
                    <div className="text-xs text-indigo-400 font-medium px-2 py-1 bg-indigo-500/10 rounded-lg flex items-center gap-2 border border-indigo-500/20">
                        <DatabaseZap size={12} /> {status}
                    </div>
                )}
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Znasz jakieś słówka o morzu?"
                        className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-500 transition-colors h-14"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
