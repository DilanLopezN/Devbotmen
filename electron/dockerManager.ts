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
      image: c.Image, // ← Adicionar imagem
      ports:
        c.Ports?.map(p =>
          p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : `${p.PrivatePort}`
        ) || [], // ← Adicionar portas
      uptime: c.Status // ← Usar status como uptime por agora
    }))

    console.log('Containers processados:', result)
    return result
  } catch (error) {
    console.error('Erro ao listar containers:', error)
    return [] // ← Retornar array vazio em vez de throw
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
