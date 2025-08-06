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
interface Window {
  api: {
    getContainers(): Promise<ContainerInfo[]>
    startContainer(id: string): Promise<void>
    stopContainer(id: string): Promise<void>
  }
}
