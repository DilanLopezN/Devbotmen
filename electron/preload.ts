import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getContainers: () => ipcRenderer.invoke('get-containers'),
  startContainer: (id: string) => ipcRenderer.invoke('start-container', id),
  stopContainer: (id: string) => ipcRenderer.invoke('stop-container', id),
  restartContainer: (id: string) => ipcRenderer.invoke('restart-container', id),
  getContainerLogs: (id: string) =>
    ipcRenderer.invoke('get-container-logs', id),
  getDependencyTree: () => ipcRenderer.invoke('get-dependency-tree')
})
