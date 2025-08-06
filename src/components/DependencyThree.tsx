import { useEffect, useState, useRef } from 'react'

type ContainerNode = {
  id: string
  name: string
  type: 'container'
  state: string
  image: string
  networks: string[]
  links: string[]
  volumesFrom: string[]
  labels: Record<string, string>
}

type NetworkNode = {
  id: string
  name: string
  type: 'network'
  driver: string
  scope: string
  containers: string[]
}

type DependencyData = {
  containers: ContainerNode[]
  networks: NetworkNode[]
}

export function DependencyTree() {
  const [data, setData] = useState<DependencyData>({
    containers: [],
    networks: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fetchDependencies = async () => {
    setLoading(true)
    try {
      const tree = await window.api.getDependencyTree()
      setData(tree)
    } catch (error) {
      console.error('Erro ao buscar dependências:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDependencies()
    const interval = setInterval(fetchDependencies, 10000) // Atualizar a cada 10 segundos
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (data && canvasRef.current) {
      drawTree()
    }
  }, [data])

  const drawTree = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar tamanho do canvas
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configurações visuais
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2

    const nodeRadius = 30
    const networkY = 100
    const containerStartY = 300
    const horizontalSpacing = 150

    // Mapear posições dos nós
    const nodePositions = new Map<
      string,
      { x: number; y: number; type: string }
    >()

    // Posicionar networks
    data.networks.forEach((network, index) => {
      const x = 100 + index * horizontalSpacing * 1.5
      nodePositions.set(network.id, { x, y: networkY, type: 'network' })
    })

    // Posicionar containers
    data.containers.forEach((container, index) => {
      const x = 100 + index * horizontalSpacing
      const y = containerStartY + (index % 2 === 0 ? 0 : 80) // Alternar alturas para evitar sobreposição
      nodePositions.set(container.id, { x, y, type: 'container' })
    })

    // Desenhar conexões
    data.containers.forEach(container => {
      const containerPos = nodePositions.get(container.id)
      if (!containerPos) return

      // Conectar com networks
      container.networks.forEach(networkName => {
        const network = data.networks.find(n => n.name === networkName)
        if (network) {
          const networkPos = nodePositions.get(network.id)
          if (networkPos) {
            // Desenhar linha curva
            ctx.beginPath()
            ctx.strokeStyle = '#00f2ff30'
            ctx.lineWidth = 2

            const controlPointY = (containerPos.y + networkPos.y) / 2
            ctx.moveTo(containerPos.x, containerPos.y)
            ctx.quadraticCurveTo(
              containerPos.x,
              controlPointY,
              networkPos.x,
              networkPos.y
            )
            ctx.stroke()
          }
        }
      })

      // Conectar com volumes de outros containers
      container.volumesFrom.forEach(volumeFrom => {
        const sourceContainer = data.containers.find(
          c => c.name === volumeFrom || c.id.startsWith(volumeFrom)
        )
        if (sourceContainer) {
          const sourcePos = nodePositions.get(sourceContainer.id)
          if (sourcePos) {
            ctx.beginPath()
            ctx.strokeStyle = '#ffcc0050'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.moveTo(containerPos.x, containerPos.y)
            ctx.lineTo(sourcePos.x, sourcePos.y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      })

      // Conectar links
      container.links.forEach(link => {
        const [linkedContainer] = link.split(':')
        const targetContainer = data.containers.find(
          c => c.name === linkedContainer || c.id.startsWith(linkedContainer)
        )
        if (targetContainer) {
          const targetPos = nodePositions.get(targetContainer.id)
          if (targetPos) {
            ctx.beginPath()
            ctx.strokeStyle = '#00ff9950'
            ctx.lineWidth = 2
            ctx.moveTo(containerPos.x, containerPos.y)
            ctx.lineTo(targetPos.x, targetPos.y)
            ctx.stroke()
          }
        }
      })
    })

    // Desenhar nós de network
    data.networks.forEach(network => {
      const pos = nodePositions.get(network.id)
      if (!pos) return

      // Círculo do network
      ctx.beginPath()
      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = '#00f2ff'
      ctx.lineWidth = 2
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Ícone de network
      ctx.fillStyle = '#00f2ff'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🌐', pos.x, pos.y)

      // Nome do network
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.fillText(network.name, pos.x, pos.y + nodeRadius + 15)
    })

    // Desenhar nós de container
    data.containers.forEach(container => {
      const pos = nodePositions.get(container.id)
      if (!pos) return

      // Círculo do container
      ctx.beginPath()
      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = container.state === 'running' ? '#00ff99' : '#ff3f3f'
      ctx.lineWidth = 3
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Ícone do container
      ctx.fillStyle = container.state === 'running' ? '#00ff99' : '#ff3f3f'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('📦', pos.x, pos.y)

      // Nome do container
      ctx.fillStyle = '#fff'
      ctx.font = '12px sans-serif'
      ctx.fillText(
        container.name.substring(0, 15),
        pos.x,
        pos.y + nodeRadius + 15
      )
    })

    // Adicionar handler de clique
    canvas.onclick = event => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Verificar clique em nós
      nodePositions.forEach((pos, id) => {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        if (distance <= nodeRadius) {
          const node =
            pos.type === 'network'
              ? data.networks.find(n => n.id === id)
              : data.containers.find(c => c.id === id)
          setSelectedNode(node)
        }
      })
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Área principal com canvas */}
      <div className="flex-1 relative bg-[--color-background] p-4">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-xl font-bold text-white mb-2">
            Árvore de Dependências
          </h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[--color-accent] rounded-full"></div>
              <span className="text-slate-400">Networks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[--color-success] rounded-full"></div>
              <span className="text-slate-400">Containers Rodando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[--color-danger] rounded-full"></div>
              <span className="text-slate-400">Containers Parados</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-[--color-accent] text-lg">
              Carregando dependências...
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer"
            style={{ minHeight: '600px' }}
          />
        )}
      </div>

      {/* Sidebar de detalhes */}
      {selectedNode && (
        <div className="w-80 bg-[--color-card] p-4 border-l border-slate-800 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4">
            Detalhes do{' '}
            {selectedNode.type === 'network' ? 'Network' : 'Container'}
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Nome</p>
              <p className="text-white font-medium">{selectedNode.name}</p>
            </div>

            {selectedNode.type === 'network' ? (
              <>
                <div>
                  <p className="text-sm text-slate-500">Driver</p>
                  <p className="text-white">{selectedNode.driver}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Escopo</p>
                  <p className="text-white">{selectedNode.scope}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">
                    Containers Conectados
                  </p>
                  <p className="text-white">{selectedNode.containers.length}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-slate-500">Imagem</p>
                  <p className="text-white text-xs">{selectedNode.image}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <p
                    className={`font-medium ${
                      selectedNode.state === 'running'
                        ? 'text-[--color-success]'
                        : 'text-[--color-danger]'
                    }`}
                  >
                    {selectedNode.state}
                  </p>
                </div>
                {selectedNode.networks.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Networks</p>
                    {selectedNode.networks.map((net: string) => (
                      <p key={net} className="text-white text-sm">
                        • {net}
                      </p>
                    ))}
                  </div>
                )}
                {selectedNode.links.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Links</p>
                    {selectedNode.links.map((link: string) => (
                      <p key={link} className="text-white text-sm">
                        • {link}
                      </p>
                    ))}
                  </div>
                )}
                {selectedNode.volumesFrom.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Volumes From</p>
                    {selectedNode.volumesFrom.map((vol: string) => (
                      <p key={vol} className="text-white text-sm">
                        • {vol}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="mt-4 w-full p-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
