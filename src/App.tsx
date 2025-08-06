import { useState } from 'react'
import { ContainerView } from './components/ContainerView'
import { DependencyTree } from './components/DependencyThree'

type MenuOption = 'containers' | 'dependencies'

function App() {
  const [activeView, setActiveView] = useState<MenuOption>('containers')

  // Ícones do menu
  const ContainerIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" />
    </svg>
  )

  const TreeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  )

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-[--color-background] text-white">
      {/* Menu Superior */}
      <header className="bg-[--color-card] border-b border-slate-800 shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo/Título */}
          <div className="flex items-center gap-3">
            <div className="text-2xl">🐳</div>
            <h1 className="text-xl font-bold text-[--color-accent]">
              Docker Manager
            </h1>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveView('containers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeView === 'containers'
                  ? 'bg-[--color-accent] text-black font-medium shadow-lg shadow-[--color-accent]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ContainerIcon />
              <span>Containers</span>
            </button>

            <button
              onClick={() => setActiveView('dependencies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeView === 'dependencies'
                  ? 'bg-[--color-accent] text-black font-medium shadow-lg shadow-[--color-accent]/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <TreeIcon />
              <span>Árvore de Dependências</span>
            </button>
          </nav>

          {/* Indicador de Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full">
              <div className="w-2 h-2 bg-[--color-success] rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Docker Conectado</span>
            </div>
          </div>
        </div>
      </header>

      {/* Área de Conteúdo */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'containers' && <ContainerView />}
        {activeView === 'dependencies' && <DependencyTree />}
      </main>
    </div>
  )
}

export default App
