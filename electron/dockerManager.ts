// electron/dockerManager.ts
import Docker from 'dockerode'

const docker = new Docker()

export async function listContainers() {
  try {
    console.log('Tentando listar containers...')
    const containers = await docker.listContainers({ all: true })
    console.log(`Encontrados ${containers.length} containers`)

    const result = containers.map(c => ({
      id: c.Id,
      name: c.Names[0].replace('/', ''),
      state: c.State,
      status: c.Status,
      image: c.Image,
      ports:
        c.Ports?.map(p =>
          p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : `${p.PrivatePort}`
        ) || [],
      uptime: c.Status
    }))

    console.log('Containers processados:', result)
    return result
  } catch (error) {
    console.error('Erro ao listar containers:', error)
    return []
  }
}

export async function startContainer(id: string) {
  try {
    console.log(`Tentando iniciar container ${id}`)
    const container = docker.getContainer(id)
    await container.start()
    console.log(`Container ${id} iniciado com sucesso`)
    return true
  } catch (error) {
    console.error(`Erro ao iniciar container ${id}:`, error)
    return false
  }
}

export async function stopContainer(id: string) {
  try {
    console.log(`Tentando parar container ${id}`)
    const container = docker.getContainer(id)
    await container.stop()
    console.log(`Container ${id} parado com sucesso`)
    return true
  } catch (error) {
    console.error(`Erro ao parar container ${id}:`, error)
    return false
  }
}

export async function restartContainer(id: string) {
  try {
    console.log(`Tentando reiniciar container ${id}`)
    const container = docker.getContainer(id)
    await container.restart()
    console.log(`Container ${id} reiniciado com sucesso`)
    return true
  } catch (error) {
    console.error(`Erro ao reiniciar container ${id}:`, error)
    return false
  }
}

export async function getContainerLogs(id: string) {
  try {
    console.log(`Obtendo logs do container ${id}`)
    const container = docker.getContainer(id)

    const logStream = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100, // Últimas 100 linhas
      timestamps: true
    })

    // Converter o buffer para string
    const logs = logStream.toString('utf-8')

    // Limpar caracteres de controle do Docker
    const cleanedLogs = logs.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

    console.log(`Logs obtidos para container ${id}`)
    return cleanedLogs
  } catch (error) {
    console.error(`Erro ao obter logs do container ${id}:`, error)
    return 'Erro ao obter logs do container'
  }
}

export async function getNetworks() {
  try {
    console.log('Obtendo lista de networks...')
    const networks = await docker.listNetworks()

    const result = networks.map(n => ({
      id: n.Id,
      name: n.Name,
      driver: n.Driver,
      scope: n.Scope,
      internal: n.Internal || false,
      containers: n.Containers ? Object.keys(n.Containers) : []
    }))

    console.log(`Encontradas ${result.length} networks`)
    return result
  } catch (error) {
    console.error('Erro ao listar networks:', error)
    return []
  }
}

export async function getContainerDetails(id: string) {
  try {
    console.log(`Obtendo detalhes do container ${id}`)
    const container = docker.getContainer(id)
    const info = await container.inspect()

    // Extrair informações de rede e dependências
    const networks = Object.keys(info.NetworkSettings.Networks || {})
    const links = info.HostConfig.Links || []
    const volumes =
      info.Mounts?.map(m => ({
        source: m.Source,
        destination: m.Destination,
        mode: m.Mode,
        type: m.Type
      })) || []

    // Verificar se tem volumes compartilhados com outros containers
    const volumesFrom = info.HostConfig.VolumesFrom || []

    // Pegar labels que podem indicar dependências (docker-compose por exemplo)
    const labels = info.Config.Labels || {}

    return {
      id: info.Id,
      name: info.Name.replace('/', ''),
      image: info.Config.Image,
      state: info.State.Status,
      networks,
      links,
      volumes,
      volumesFrom,
      env: info.Config.Env || [],
      labels,
      ports: info.NetworkSettings.Ports || {}
    }
  } catch (error) {
    console.error(`Erro ao obter detalhes do container ${id}:`, error)
    return null
  }
}

export async function getDependencyTree() {
  try {
    console.log('Construindo árvore de dependências...')

    // Obter todos os containers e networks
    const containers = await docker.listContainers({ all: true })
    const networks = await docker.listNetworks()

    // Mapear containers com suas dependências
    const containerNodes = await Promise.all(
      containers.map(async c => {
        const details = await getContainerDetails(c.Id)
        return {
          id: c.Id,
          name: c.Names[0].replace('/', ''),
          type: 'container' as const,
          state: c.State,
          image: c.Image,
          networks: details?.networks || [],
          links: details?.links || [],
          volumesFrom: details?.volumesFrom || [],
          labels: details?.labels || {}
        }
      })
    )

    // Mapear networks
    const networkNodes = networks.map(n => ({
      id: n.Id,
      name: n.Name,
      type: 'network' as const,
      driver: n.Driver,
      scope: n.Scope,
      containers: n.Containers ? Object.keys(n.Containers) : []
    }))

    return {
      containers: containerNodes,
      networks: networkNodes
    }
  } catch (error) {
    console.error('Erro ao construir árvore de dependências:', error)
    return { containers: [], networks: [] }
  }
}
