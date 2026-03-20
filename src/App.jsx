import { useState } from 'react';
import { BookOpen, Layers, MessageSquare, Database, Activity } from 'lucide-react';
import BrowseView from './components/BrowseView';
import StudyView from './components/StudyView';
import AiChatView from './components/AiChatView';
import { useFlashcards } from './hooks/useFlashcards';
import { checkAppwriteConnection } from './utils/diagnostics';

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', content: "¡Hola! Jestem Twoim nauczycielem hiszpańskiego w chmurze! Możesz ze mną po prostu porozmawiać, a ja wyłapię z naszej rozmowy słówka i użyję magii AI, by zapisać fiszki do bazy." }
  ]);

  const {
    flashcards,
    loading,
    error,
    deleteFlashcard,
    updateFlashcard,
    deleteAllFlashcards,
    addMultipleFlashcards
  } = useFlashcards();

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header (tylko na telefonach) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
            <Layers className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Fiszki AI
          </h1>
        </div>
        <button
          onClick={async () => {
            const result = await checkAppwriteConnection();
            if (result.success) alert(result.message);
            else alert(`❌ Błąd: ${result.error || result.message}.`);
          }}
          className="p-2 text-gray-400 hover:text-indigo-400 focus:outline-none"
        >
          <Activity size={20} />
        </button>
      </header>

      {/* Sidebar Navigation (Na telefonie zamienia się w Bottom Bar) */}
      <aside className="fixed bottom-0 left-0 w-full z-50 md:relative md:w-64 bg-gray-900/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-gray-800 p-2 md:p-4 flex flex-row md:flex-col justify-around md:justify-start pb-safe">
        <div className="hidden md:flex items-center gap-3 mb-4 md:mb-8 px-2">
          <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Fiszki AI
          </h1>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full md:w-auto justify-between md:justify-start overflow-x-hidden md:overflow-visible">
          <NavButton
            icon={<Database size={20} />} label="Przeglądaj"
            isActive={activeTab === 'browse'} onClick={() => setActiveTab('browse')}
          />
          <NavButton
            icon={<BookOpen size={20} />} label="Nauka"
            isActive={activeTab === 'study'} onClick={() => setActiveTab('study')}
          />
          <NavButton
            icon={<MessageSquare size={20} />} label="Czat AI"
            isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')}
          />
        </nav>

        <div className="hidden md:flex mt-auto pt-4 border-t border-gray-800 flex-col gap-2">
          <button
            onClick={async () => {
              const result = await checkAppwriteConnection();
              if (result.success) alert(result.message);
              else alert(`❌ Błąd: ${result.error || result.message}. Sprawdź instrukcje w oknie czatu.`);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
          >
            <Activity size={14} />
            Status & Diagnostyka
          </button>
          <div className="text-[10px] text-gray-500 px-2 leading-tight">
            Synchronizacja aktywna.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 pb-24 md:pb-8 md:p-8 h-[calc(100dvh-73px)] md:h-[100dvh] overflow-y-auto overflow-x-hidden">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <p className="font-bold">Błąd połączenia:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'browse' && (
          <BrowseView flashcards={flashcards} loading={loading} onDelete={deleteFlashcard} onUpdate={updateFlashcard} onDeleteAll={deleteAllFlashcards} />
        )}
        {activeTab === 'study' && <StudyView flashcards={flashcards} />}
        {activeTab === 'ai' && <AiChatView onAddBatch={addMultipleFlashcards} messages={chatMessages} setMessages={setChatMessages} />}
      </main>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center md:justify-start gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap flex-1 md:flex-none
        ${isActive
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
        }`}
    >
      <div className="transform scale-90 md:scale-100">{icon}</div>
      <span className="text-xs md:text-base">{label}</span>
      {isActive && (
        <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
      )}
    </button>
  );
}

export default App;
