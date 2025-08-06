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

function App() {
  const [containers, setContainers] = useState<ContainerInfo[]>([])
  const [selected, setSelected] = useState<ContainerInfo | null>(null)

  const fetch = async () => {
    const list = await window.api.getContainers()
    setContainers(list)
  }

  const toggle = async (id: string, state: string) => {
    if (state === 'running') {
      await window.api.stopContainer(id)
    } else {
      await window.api.startContainer(id)
    }
    fetch()
  }

  useEffect(() => {
    fetch()
  }, [])

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

  return (
    <div className="flex h-screen w-full font-sans bg-[--color-background] text-white">
      {/* Sidebar */}
      <div className="w-80 bg-[--color-card] p-4 flex flex-col shadow-lg border-r border-slate-800">
        <h1 className="text-2xl font-bold text-[--color-accent] mb-4">
          Docker Manager
        </h1>

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
        <h2 className="text-lg font-semibold mb-2">Containers</h2>
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
              <p className="text-xs text-slate-500">{c.ports.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 text-center flex flex-col justify-center items-center text-slate-400">
        {!selected ? (
          <>
            <div className="text-6xl mb-4">🖥️</div>
            <p className="text-xl font-semibold">Selecione um Container</p>
            <p className="text-sm">
              Clique em um container na barra lateral para ver os detalhes
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-white mb-2">{selected.name}</h2>
            <p className="mb-1">Image: {selected.image}</p>
            <p className="mb-1">Status: {selected.status}</p>
            <p className="mb-1">Portas: {selected.ports.join(', ')}</p>
            <p className="mb-1">Uptime: {selected.uptime}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default App
