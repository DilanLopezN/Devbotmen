// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { fileURLToPath } from 'url' // ← Adicione isso
import {
  listContainers,
  startContainer,
  stopContainer
} from './dockerManager.js'

// Para ES modules, __dirname precisa ser definido assim:
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('get-containers', listContainers)
  ipcMain.handle('start-container', (_, id) => startContainer(id))
  ipcMain.handle('stop-container', (_, id) => stopContainer(id))
})
