const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const {exec} = require('child_process');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function readJson(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
}

function openBrowser(url) {
    const cmd = process.platform === 'darwin' ? 'open'
        : process.platform === 'win32' ? 'start ""'
        : 'xdg-open';
    exec(`${cmd} "${url}"`, () => {});
}

const SUCCESS_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>Authorization complete</title>
<style>body{font-family:system-ui;background:#111;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
.card{text-align:center;padding:2rem}h1{margin:0 0 .5rem}</style></head>
<body><div class="card"><h1>Authorization complete</h1><p>You can close this tab.</p></div></body></html>`;

function captureAuthCode(port) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url, `http://127.0.0.1:${port}`);
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');
            if (error) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end(`Authorization failed: ${error}`);
                server.close();
                reject(new Error(`OAuth error: ${error}`));
                return;
            }
            if (!code) {
                res.writeHead(400, {'Content-Type': 'text/plain'});
                res.end('Missing authorization code');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(SUCCESS_HTML);
            server.close();
            resolve(code);
        });
        server.on('error', reject);
        server.listen(port, '127.0.0.1');
    });
}

async function runLoopbackFlow(clientId, clientSecret) {
    const server = http.createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const {port} = server.address();
    server.close();

    const redirectUri = `http://127.0.0.1:${port}`;
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });

    console.log('\nOpening browser for authorization. If it does not open, visit:');
    console.log(authUrl + '\n');
    openBrowser(authUrl);

    const code = await captureAuthCode(port);
    const {tokens} = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    return oAuth2Client;
}

async function initAuthorize() {
    let credentials;
    try {
        credentials = await readJson(CREDENTIALS_PATH);
    } catch (err) {
        console.error(
            'The credentials.json file could not be found or was invalid.\n' +
            'Please visit: https://developers.google.com/calendar/quickstart/nodejs\n' +
            'and generate a credentials.json file from that site. Then, place your\n' +
            'credentials file into the "Utility" directory of this application.'
        );
        throw err;
    }

    const clientConfig = credentials.installed || credentials.web;
    if (!clientConfig) {
        throw new Error('credentials.json must contain an "installed" or "web" OAuth client configuration');
    }
    const {client_secret, client_id} = clientConfig;

    try {
        const token = await readJson(TOKEN_PATH);
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    } catch {
        return runLoopbackFlow(client_id, client_secret);
    }
}

module.exports = {
    SCOPES,
    initAuthorize,
};
