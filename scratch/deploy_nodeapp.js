import { Client } from 'ssh2';
import fs from 'fs';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    // Create nodeapp directory
    sftp.mkdir('/home/u594640959/nodeapp', (err) => {
      console.log('nodeapp directory created or verified');

      // Upload full project zip
      console.log('Uploading paarthvi_full_project.zip...');
      const readStream = fs.createReadStream('/Users/ayush/Desktop/paarthvi_full_project.zip');
      const writeStream = sftp.createWriteStream('/home/u594640959/nodeapp/paarthvi_full_project.zip');
      
      readStream.pipe(writeStream);
      writeStream.on('close', () => {
        console.log('Project zip uploaded successfully');

        // Upload .env file
        console.log('Uploading .env file...');
        const envReadStream = fs.createReadStream('/Users/ayush/paarthvi/.env');
        const envWriteStream = sftp.createWriteStream('/home/u594640959/nodeapp/.env');
        envReadStream.pipe(envWriteStream);

        envWriteStream.on('close', () => {
          console.log('.env uploaded successfully');

          // SSH commands to extract, install, build and configure
          const commands = [
            `export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH`,
            `cd /home/u594640959/nodeapp`,
            `unzip -o paarthvi_full_project.zip`,
            `rm -f paarthvi_full_project.zip`,
            `npm install`,
            `npm run build`,
            // Configure Passenger in public_html/.htaccess
            `cat << 'EOF' > /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess
# Enable Passenger Node.js
PassengerEnabled on
PassengerAppType node
PassengerAppRoot /home/u594640959/nodeapp
PassengerStartupFile server/server.js
PassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node

# Redirect all requests to Passenger except actual static files
RewriteEngine On
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]

RewriteRule ^.*$ server/server.js [L]
EOF`,
            `echo "Deployment script execution complete!"`
          ].join(' && ');

          console.log('Running server side setup (installing packages and building)... this will take 1-2 minutes.');
          conn.exec(commands, (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
              console.log('Server-side setup complete. Code: ' + code);
              conn.end();
            }).on('data', (data) => {
              console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
              console.log('STDERR: ' + data);
            });
          });
        });
      });
    });
  });
}).connect({
  host: '82.180.167.60',
  port: 65002,
  username: 'u594640959',
  password: 'Paarthvi@2026',
  readyTimeout: 30000
});
