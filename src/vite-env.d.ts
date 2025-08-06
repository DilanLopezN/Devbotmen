/// <reference types="vite/client" />
type ContainerInfo = {
  id: string
  name: string
  state: string
  status: string
  image: string
  ports: string[]
  uptime: string
}

type DependencyNode = {
  containers: {
    id: string
    name: string
    type: 'container'
    state: string
    image: string
    networks: string[]
    links: string[]
    volumesFrom: string[]
    labels: Record<string, string>
  }[]
  networks: {
    id: string
    name: string
    type: 'network'
    driver: string
    scope: string
    containers: string[]
  }[]
}

interface Window {
  api: {
    getContainers(): Promise<ContainerInfo[]>
    startContainer(id: string): Promise<boolean>
    stopContainer(id: string): Promise<boolean>
    restartContainer(id: string): Promise<boolean>
    getContainerLogs(id: string): Promise<string>
    getDependencyTree(): Promise<DependencyNode>
  }
}
