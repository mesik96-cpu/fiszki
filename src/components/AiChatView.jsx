import { useState, useRef, useEffect } from 'react';
import { Send, UploadCloud, Loader2, Wand2, DatabaseZap, Trash2 } from 'lucide-react';
import { callGeminiApi } from '../utils/gemini';
import { parseChatVocabulary } from '../utils/parser';

export default function AiChatView({ onAddBatch, messages, setMessages }) {
    const [input, setInput] = useState('');
    const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
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

            const replyText = await callGeminiApi(apiKey, "gemini-flash-lite-latest", formattedHistory);
            setMessages(p => [...p, { role: 'model', content: replyText }]);

            // 2. Extraction in background
            const instruction = `Jesteś systemem DATA EXTRACTION do fiszek. Wyodrębnij słówka.
Format (KAŻDA LINIA): KATEGORIA | SŁÓWKO | TŁUMACZENIE | PRZYKŁAD | TŁUMACZENIE PRZYKŁADU

Zasady krytyczne:
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
                    const res = await onAddBatch(parsed);
                    if (res.success) {
                        setStatus(`✨ Sukces! Zapisałem ${parsed.length} nowych słówek z przykładami!`);
                    } else {
                        setStatus(`❌ Błąd bazy: ${res.error}`);
                    }
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
                { role: 'model', content: "Cześć! Historia wyczyszczona. W czym mogę Ci dzisiaj pomóc?" }
            ]);
            setStatus('');
        }
    };

    const handlePasteRawText = () => {
        const parsed = parseChatVocabulary(input);
        if (parsed.length > 0) {
            onAddBatch(parsed).then(res => {
                if (res.success) {
                    alert(`Dodano z powodzeniem ${parsed.length} fiszek!`);
                    setInput('');
                } else {
                    alert(`Błąd zapisu: ${res.error}`);
                }
            });
        } else {
            alert("Nie udało się rozpoznać formatu list (Słówko - Tłumaczenie).");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
            <div className="flex-[3] flex flex-col glass-panel rounded-2xl overflow-hidden border border-gray-800">
                <div className="bg-gray-900/50 border-b border-gray-800 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-indigo-400"><Wand2 size={20} /></span> AI Mój Skryba
                        </h2>
                        <p className="text-sm text-gray-500">Historia jest zapisywana nawet gdy zmieniasz zakładki.</p>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Wyczyść historię"
                    >
                        <Trash2 size={18} />
                    </button>
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

                <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex flex-col gap-2">
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

            <div className="flex-1 flex flex-col gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-gray-800 flex flex-col gap-3">
                    <h3 className="font-bold flex items-center gap-2 text-gray-300">
                        Klucz Gemini API
                    </h3>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="glass-panel p-5 rounded-xl border border-gray-800 flex flex-col gap-3">
                    <h3 className="font-bold flex items-center gap-2 text-gray-300">
                        Szybki Import
                    </h3>
                    <button
                        onClick={handlePasteRawText}
                        className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700 flex items-center justify-center gap-2"
                    >
                        <UploadCloud className="w-4 h-4" /> Zapisz tekst
                    </button>
                </div>
            </div>
        </div>
    );
}
