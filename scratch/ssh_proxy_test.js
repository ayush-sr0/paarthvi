import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  // Let's create a temporary node script on the server that listens on port 5002
  const serverCode = `
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Node.js is running on Hostinger port 5002 and proxied correctly!' }));
});
server.listen(5002, '127.0.0.1', () => {
  console.log('Test server running on port 5002');
});
setTimeout(() => {
  console.log('Stopping test server');
  process.exit(0);
}, 60000); // Stop after 60 seconds
  `;

  // Write this to server, write an htaccess test, and run the server
  const commands = [
    `mkdir -p /home/u594640959/scratch`,
    `cat << 'EOF' > /home/u594640959/scratch/test_server.js\n${serverCode}\nEOF`,
    // Backup original .htaccess
    `cp /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess.bak || true`,
    // Write a proxy rule into .htaccess
    `cat << 'EOF' > /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess
Options -MultiViews
RewriteEngine On

# Proxy API requests to Node server on port 5002
RewriteRule ^api/(.*)$ http://127.0.0.1:5002/api/$1 [P,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
EOF`,
    // Run the node server in background
    `/opt/alt/alt-nodejs20/root/usr/bin/node /home/u594640959/scratch/test_server.js > /home/u594640959/scratch/test_server.log 2>&1 &`,
    `sleep 2`,
    `cat /home/u594640959/scratch/test_server.log`
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Setup finished. Code: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '82.180.167.60',
  port: 65002,
  username: 'u594640959',
  password: 'Paarthvi@2026',
  readyTimeout: 20000
});
