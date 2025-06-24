const { app, BrowserWindow, shell, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let trayIcon;
let webviewWindow;
let currentLLMUrl = 'https://chatgpt.com';

// LLM service URLs
const LLM_URLS = {
  claude: 'https://claude.ai',
  chatgpt: 'https://chatgpt.com',
  gemini: 'https://gemini.google.com'
};

// Keep a global reference to prevent garbage collection
let floatingWindow;

function createFloatingWindow() {
  // Create a small floating window
  floatingWindow = new BrowserWindow({
    width: 48,
    height: 48,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Set the highest window level for macOS to appear over fullscreen apps
  if (process.platform === 'darwin') {
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // Position window at bottom-right corner
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  floatingWindow.setPosition(width - 60, height - 60);
  
  // Load the floating icon renderer
  floatingWindow.loadFile(path.join(__dirname, 'renderer', 'floating-icon.html'));
  
  // Handle window events
  floatingWindow.on('closed', () => {
    floatingWindow = null;
  });

  // Show window when ready
  floatingWindow.once('ready-to-show', () => {
    floatingWindow.show();
  });

  // Handle click events from renderer
  const { ipcMain } = require('electron');
  
  ipcMain.on('open-llm', () => {
    createWebviewWindow();
  });

  // Handle LLM URL changes
  ipcMain.on('llm-url-changed', (event, url) => {
    currentLLMUrl = url;
    console.log('LLM URL changed to:', url);
  });

  ipcMain.on('show-context-menu', (event, x, y) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Claude',
        click: () => {
          createWebviewWindow();
        }
      },
      {
        label: 'Settings',
        click: () => {
          // TODO: Implement settings window
          console.log('Settings clicked');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    contextMenu.popup({
      window: floatingWindow,
      x: x,
      y: y
    });
  });

  return floatingWindow;
}

function createWebviewWindow() {
  // If window already exists, move it to current desktop
  if (webviewWindow) {
    if (webviewWindow.isVisible() && !webviewWindow.isMinimized()) {
      webviewWindow.minimize();
    } else {
      // Move window to current desktop by setting it visible on all workspaces temporarily
      if (process.platform === 'darwin') {
        webviewWindow.setVisibleOnAllWorkspaces(true);
        webviewWindow.restore();
        webviewWindow.show();
        webviewWindow.focus();
        // Remove from all workspaces after showing - now it stays on current desktop
        setTimeout(() => {
          webviewWindow.setVisibleOnAllWorkspaces(false);
        }, 100);
      } else {
        webviewWindow.restore();
        webviewWindow.show();
        webviewWindow.focus();
      }
    }
    return;
  }

  // Create the webview window with custom title bar
  webviewWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    alwaysOnTop: true,
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: true,
      experimentalFeatures: false
    }
  });

  // Load the custom LLM window with dropdown
  webviewWindow.loadFile(path.join(__dirname, 'renderer', 'llm-window.html'));

  // Show window when ready
  webviewWindow.once('ready-to-show', () => {
    webviewWindow.show();
    webviewWindow.focus();
  });

  // Handle window closed
  webviewWindow.on('closed', () => {
    webviewWindow = null;
  });

  // Handle navigation
  webviewWindow.webContents.on('new-window', (event, navigationUrl) => {
    // Allow navigation within the same domain
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = new URL(DEFAULT_LLM_URL);
    
    if (parsedUrl.hostname === currentUrl.hostname) {
      // Allow same-domain navigation
      return;
    } else {
      // Open external links in system browser
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  return webviewWindow;
}

function createTrayIcon() {
  // Create a simple tray icon as backup
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  
  // Create a simple icon if none exists
  const icon = nativeImage.createEmpty();
  trayIcon = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Claude',
      click: () => {
        createWebviewWindow();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  trayIcon.setContextMenu(contextMenu);
  trayIcon.setToolTip('Floating LLM Launcher');
}

// App event handlers
app.whenReady().then(() => {
  createFloatingWindow();
  createTrayIcon();
});

app.on('window-all-closed', (event) => {
  // Prevent the app from quitting when all windows are closed
  event.preventDefault();
});

app.on('activate', () => {
  if (!floatingWindow) {
    createFloatingWindow();
  }
});

app.on('before-quit', () => {
  if (floatingWindow) {
    floatingWindow.destroy();
  }
  if (webviewWindow) {
    webviewWindow.destroy();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (floatingWindow) {
      floatingWindow.focus();
    }
  });
}