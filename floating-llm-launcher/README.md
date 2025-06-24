# Floating LLM Launcher

A lightweight desktop application that provides a floating icon launcher for LLM chat interfaces like Claude.ai and ChatGPT.

## Features

- **Floating Icon**: Small, always-on-top floating icon that stays visible on desktop
- **Single Click Action**: Click to open Claude.ai in your default browser
- **Context Menu**: Right-click for additional options (Open Claude, Settings, Quit)
- **Minimal UI**: Only the floating icon is visible when idle
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Draggable**: Repositionable floating icon
- **Transparency**: Semi-transparent when not hovered, fully opaque on hover

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   cd floating-llm-launcher
   npm install
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Building Executables
```bash
npm run build
```

## Configuration

### Changing the Target URL

To customize the LLM service URL, edit the `DEFAULT_LLM_URL` constant in `src/main.js`:

```javascript
const DEFAULT_LLM_URL = 'https://claude.ai'; // Change this to your preferred LLM service
```

Popular alternatives:
- ChatGPT: `https://chat.openai.com`
- Perplexity: `https://perplexity.ai`
- Bard: `https://bard.google.com`

### Icon Positioning

The icon defaults to the bottom-right corner. To change this, modify the positioning code in `src/main.js`:

```javascript
// Current: bottom-right
floatingWindow.setPosition(width - 60, height - 60);

// Examples:
// Top-right: floatingWindow.setPosition(width - 60, 10);
// Bottom-left: floatingWindow.setPosition(10, height - 60);
// Top-left: floatingWindow.setPosition(10, 10);
```

## Controls

- **Left Click**: Open configured LLM service in browser
- **Right Click**: Show context menu with options
- **Drag**: Move the floating icon to a new position

## File Structure

```
floating-llm-launcher/
├── src/
│   ├── main.js                 # Main Electron process
│   ├── renderer/
│   │   └── floating-icon.html  # Floating icon UI
│   └── assets/
│       └── icon.png           # Application icon
├── package.json               # Project configuration
└── README.md                 # This file
```

## Technical Details

- **Framework**: Electron
- **Window Size**: 48x48 pixels
- **Transparency**: 70% opacity when idle, 100% on hover
- **Always On Top**: Yes
- **System Tray**: Backup tray icon included
- **Memory Usage**: Minimal when idle

## Troubleshooting

### App won't start
- Ensure Node.js is installed
- Run `npm install` to install dependencies
- Check that port 48x48 window can be created

### Icon not visible
- Check if window is positioned off-screen
- Try different screen resolution settings
- Verify transparency settings in OS

### Multiple instances
The app prevents multiple instances from running simultaneously.

## License

MIT License - feel free to modify and distribute.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Future Enhancements

- [ ] Settings window for URL configuration
- [ ] Multiple LLM service quick-switch
- [ ] Custom icon upload
- [ ] Keyboard shortcuts
- [ ] Auto-start on system boot
- [ ] Position memory across sessions