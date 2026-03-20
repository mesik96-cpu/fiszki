import { useState } from 'react';
import { BookOpen, Layers, MessageSquare, Database, Activity, CheckSquare } from 'lucide-react';
import BrowseView from './components/BrowseView';
import StudyView from './components/StudyView';
import AiChatView from './components/AiChatView';
import PreselectionView from './components/PreselectionView';
import { useFlashcards } from './hooks/useFlashcards';
import { checkAppwriteConnection } from './utils/diagnostics';

function App() {
  const [activeTab, setActiveTab] = useState('browse');
  const [preselectionCards, setPreselectionCards] = useState([]);
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
    <div className="flex flex-col h-[100dvh] bg-gray-950 text-gray-100 md:flex-row overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 p-3 flex flex-col gap-2 md:gap-4 z-10">
        <div className="flex items-center justify-between mb-2 md:mb-6 px-1 md:px-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Layers className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Fiszki AI
            </h1>
          </div>
          <button
            onClick={async () => {
              const result = await checkAppwriteConnection();
              if (result.success) alert(result.message);
              else alert(`❌ Błąd: ${result.error || result.message}. Sprawdź instrukcje w oknie czatu.`);
            }}
            className="p-1.5 md:p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent"
            title="Status & Diagnostyka"
          >
            <Activity size={18} />
          </button>
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
            icon={<CheckSquare size={20} />}
            label="Preselekcja"
            isActive={activeTab === 'preselection'}
            onClick={() => setActiveTab('preselection')}
            newBadge={preselectionCards.length > 0 ? preselectionCards.length : null}
          />
          <NavButton
            icon={<MessageSquare size={20} />}
            label="Import & Czat AI"
            isActive={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </nav>


      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col relative w-full h-full min-h-0">
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
        {activeTab === 'preselection' && (
          <PreselectionView
            cards={preselectionCards}
            setCards={setPreselectionCards}
            onSaveToDb={addMultipleFlashcards}
            onNavigateTarget={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'ai' && (
          <AiChatView
            onExtractSuccess={(parsed) => {
              setPreselectionCards(parsed);
              setActiveTab('preselection');
            }}
            messages={chatMessages}
            setMessages={setChatMessages}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick, newBadge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap text-sm md:text-base
        ${isActive
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
        }`}
    >
      {icon}
      <span>{label}</span>
      {newBadge && (
        <span className="ml-1 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{newBadge}</span>
      )}
      {isActive && !newBadge && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
      )}
    </button>
  );
}

export default App;
