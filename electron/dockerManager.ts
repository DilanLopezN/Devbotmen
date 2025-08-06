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
