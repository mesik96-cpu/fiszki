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
    { role: 'model', content: "Cześć! Jestem Twoim nauczycielem języków w chmurze! Możesz ze mną po prostu porozmawiać, a ja wyłapię z naszej rozmowy słówka i użyję magii AI, by zapisać fiszki do bazy. Albo wklej z innej strony listę tekstową!" }
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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-4 md:mb-8 px-2">
          <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Fiszki AI
          </h1>
        </div>

        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          <NavButton
            icon={<Database size={20} />}
            label="Przeglądaj bazę"
            isActive={activeTab === 'browse'}
            onClick={() => setActiveTab('browse')}
          />
          <NavButton
            icon={<BookOpen size={20} />}
            label="Tryb nauki"
            isActive={activeTab === 'study'}
            onClick={() => setActiveTab('study')}
          />
          <NavButton
            icon={<MessageSquare size={20} />}
            label="Import & Czat AI"
            isActive={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-800 flex flex-col gap-2">
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
          <div className="hidden md:block text-[10px] text-gray-500 px-2 leading-tight">
            Synchronizacja z chmurą aktywna.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <p className="font-bold">Błąd połączenia:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {activeTab === 'browse' && (
          <BrowseView
            flashcards={flashcards}
            loading={loading}
            onDelete={deleteFlashcard}
            onUpdate={updateFlashcard}
            onDeleteAll={deleteAllFlashcards}
          />
        )}
        {activeTab === 'study' && <StudyView flashcards={flashcards} />}
        {activeTab === 'ai' && (
          <AiChatView
            onAddBatch={addMultipleFlashcards}
            messages={chatMessages}
            setMessages={setChatMessages}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap
        ${isActive
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
        }`}
    >
      {icon}
      <span>{label}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
      )}
    </button>
  );
}

export default App;
