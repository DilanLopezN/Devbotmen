import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getContainers: () => ipcRenderer.invoke('get-containers'),
  startContainer: (id: string) => ipcRenderer.invoke('start-container', id),
  stopContainer: (id: string) => ipcRenderer.invoke('stop-container', id)
})
