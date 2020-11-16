import { BrowserWindow, app, App} from 'electron';
import * as mydefine from "./mydefine";

class myMascot {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/index.html`

    constructor(app: App) {
        this.app = app;
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this))
        // this.app.commandLine.appendSwitch('enable-unsafe-es3-apis');
        this.app.on('ready', this.create.bind(this));
        this.app.on('activate', this.onActivated.bind(this));
    }

    private onWindowAllClosed() {
        this.app.quit();
    }

    private create() {
        this.mainWindow = new BrowserWindow({
            width: mydefine.window_width,
            height: mydefine.window_height,
            x: 2000,
            y: 950,
            resizable: true,
            titleBarStyle: 'hidden',
            transparent: true,
            frame: false,
            autoHideMenuBar: true,
        });
        
        this.mainWindow.setIgnoreMouseEvents(false);
        // this.mainWindow.webContents.openDevTools();
        this.mainWindow.setAlwaysOnTop(true);
        this.mainWindow.loadURL(this.mainURL);
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private onActivated() {
        if (this.mainWindow === null) {
            this.create();
        }
    }
}

const MyApp: myMascot = new myMascot(app)