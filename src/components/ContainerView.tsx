import { useEffect, useState } from 'react'

type ContainerInfo = {
  id: string
  name: string
  state: string
  status: string
  image: string
  ports: string[]
  uptime: string
}

export function ContainerView() {
  const [containers, setContainers] = useState<ContainerInfo[]>([])
  const [selected, setSelected] = useState<ContainerInfo | null>(null)
  const [logs, setLogs] = useState<string>('')
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    const list = await window.api.getContainers()
    setContainers(list)
    // Atualizar o container selecionado se ele ainda existir
    if (selected) {
      const updated = list.find(c => c.id === selected.id)
      if (updated) setSelected(updated)
    }
  }

  const fetchLogs = async (id: string) => {
    setLoadingLogs(true)
    try {
      const containerLogs = await window.api.getContainerLogs(id)
      setLogs(containerLogs)
    } catch (error) {
      setLogs('Erro ao carregar logs')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleStart = async (id: string) => {
    setLoading(true)
    await window.api.startContainer(id)
    await fetch()
    setLoading(false)
  }

  const handleStop = async (id: string) => {
    setLoading(true)
    await window.api.stopContainer(id)
    await fetch()
    setLoading(false)
  }

  const handleRestart = async (id: string) => {
    setLoading(true)
    await window.api.restartContainer(id)
    await fetch()
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    // Atualizar lista a cada 5 segundos
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected) {
      fetchLogs(selected.id)
      // Atualizar logs a cada 3 segundos se o container estiver rodando
      if (selected.state === 'running') {
        const interval = setInterval(() => fetchLogs(selected.id), 3000)
        return () => clearInterval(interval)
      }
    }
  }, [selected?.id, selected?.state])

  function StatusCard({
    label,
    value,
    color
  }: {
    label: string
    value: number
    color: 'accent' | 'success' | 'danger'
  }) {
    const colorMap = {
      accent: 'text-[--color-accent]',
      success: 'text-[--color-success]',
      danger: 'text-[--color-danger]'
    }

    return (
      <div className="bg-[--color-card] p-3 rounded-lg text-center shadow border border-slate-700">
        <div className={`text-lg font-bold ${colorMap[color]}`}>{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    )
  }

  function StatusDot({ state }: { state: string }) {
    const color =
      state === 'running'
        ? 'bg-[--color-success]'
        : state === 'exited'
        ? 'bg-[--color-danger]'
        : 'bg-[--color-warning]'
    return <div className={`w-3 h-3 rounded-full ${color}`} />
  }

  // Ícones SVG inline
  const PlayIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
    </svg>
  )

  const StopIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <rect x="4" y="4" width="12" height="12" rx="1" />
    </svg>
  )

  const RestartIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
      />
    </svg>
  )

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-80 bg-[--color-card] p-4 flex flex-col shadow-lg border-r border-slate-800">
        <h2 className="text-xl font-bold text-white mb-4">Containers</h2>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatusCard label="Total" value={containers.length} color="accent" />
          <StatusCard
            label="Rodando"
            value={containers.filter(c => c.state === 'running').length}
            color="success"
          />
          <StatusCard
            label="Parados"
            value={containers.filter(c => c.state !== 'running').length}
            color="danger"
          />
        </div>

        {/* Container List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {containers.map(c => (
            <div
              key={c.id}
              className={`p-3 rounded-xl shadow-md cursor-pointer bg-[--color-background] border border-slate-700 hover:bg-slate-800 transition duration-200 ${
                selected?.id === c.id ? 'ring-2 ring-[--color-accent]' : ''
              }`}
              onClick={() => setSelected(c)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-md font-medium">{c.name}</span>
                <StatusDot state={c.state} />
              </div>
              <p className="text-sm text-slate-400">{c.image}</p>
              <p className="text-xs text-slate-500">
                {c.ports.join(', ') || 'Sem portas expostas'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-400">
            <div className="text-6xl mb-4">🖥️</div>
            <p className="text-xl font-semibold">Selecione um Container</p>
            <p className="text-sm">
              Clique em um container na barra lateral para ver os detalhes
            </p>
          </div>
        ) : (
          <>
            {/* Container Details Header */}
            <div className="bg-[--color-card] rounded-lg p-6 mb-4 border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selected.name}
                  </h2>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Imagem:</span>{' '}
                      {selected.image}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Status:</span>{' '}
                      <span
                        className={
                          selected.state === 'running'
                            ? 'text-[--color-success]'
                            : 'text-[--color-danger]'
                        }
                      >
                        {selected.status}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Portas:</span>{' '}
                      {selected.ports.join(', ') || 'Nenhuma'}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Uptime:</span>{' '}
                      {selected.uptime}
                    </p>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStart(selected.id)}
                    disabled={selected.state === 'running' || loading}
                    className="p-3 rounded-lg bg-[--color-success] text-black hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Iniciar"
                  >
                    <PlayIcon />
                  </button>
                  <button
                    onClick={() => handleStop(selected.id)}
                    disabled={selected.state !== 'running' || loading}
                    className="p-3 rounded-lg bg-[--color-danger] text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Parar"
                  >
                    <StopIcon />
                  </button>
                  <button
                    onClick={() => handleRestart(selected.id)}
                    disabled={selected.state !== 'running' || loading}
                    className="p-3 rounded-lg bg-[--color-warning] text-black hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Reiniciar"
                  >
                    <RestartIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Section */}
            <div className="flex-1 bg-[--color-card] rounded-lg p-4 border border-slate-700 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Logs do Container</h3>
                {loadingLogs && (
                  <span className="text-sm text-[--color-accent]">
                    Carregando...
                  </span>
                )}
              </div>
              <div className="flex-1 bg-black rounded p-4 overflow-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {logs || 'Nenhum log disponível'}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
