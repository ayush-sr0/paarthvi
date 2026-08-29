import { Client } from 'ssh2';
import fs from 'fs';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    // Create scratch directory
    sftp.mkdir('/home/u594640959/scratch', (err) => {
      // Ignore if directory already exists
      
      const serverCode = `
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: true, message: 'Node.js is running on Hostinger port 5002 and proxied correctly!' }));
});
server.listen(5002, '127.0.0.1', () => {
  console.log('Test server running on port 5002');
});
      `;

      // Upload test_server.js
      const serverStream = sftp.createWriteStream('/home/u594640959/scratch/test_server.js');
      serverStream.end(serverCode);
      serverStream.on('close', () => {
        console.log('test_server.js uploaded');

        // Backup existing .htaccess and write the new one
        sftp.rename(
          '/home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess',
          '/home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess.bak',
          (err) => {
            // Write new .htaccess with proxy rule
            const htaccessContent = `Options -MultiViews
RewriteEngine On

# Proxy API requests to Node server on port 5002
RewriteRule ^api/(.*)$ http://127.0.0.1:5002/api/$1 [P,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
`;
            const htStream = sftp.createWriteStream('/home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess');
            htStream.end(htaccessContent);
            htStream.on('close', () => {
              console.log('.htaccess proxy uploaded');

              // Run the node server in background using nohup
              conn.exec(
                'nohup /opt/alt/alt-nodejs20/root/usr/bin/node /home/u594640959/scratch/test_server.js > /home/u594640959/scratch/test_server.log 2>&1 &',
                (err, stream) => {
                  if (err) throw err;
                  stream.on('close', () => {
                    console.log('Server process spawned. Checking status...');
                    setTimeout(() => {
                      conn.exec('cat /home/u594640959/scratch/test_server.log; ps aux | grep test_server', (err, stream2) => {
                        if (err) throw err;
                        stream2.on('data', (d) => console.log(d.toString()));
                        stream2.on('close', () => conn.end());
                      });
                    }, 2000);
                  }).resume();
                }
              );
            });
          }
        );
      });
    });
  });
}).connect({
  host: '82.180.167.60',
  port: 65002,
  username: 'u594640959',
  password: 'Paarthvi@2026',
  readyTimeout: 20000
});
