import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');

  // Let's write a test Passenger configuration to .htaccess
  const commands = [
    // Backup original .htaccess
    `cp /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess.bak || true`,
    // Write Passenger config to .htaccess
    `cat << 'EOF' > /home/u594640959/domains/paarthviayurveda.com/public_html/.htaccess
PassengerEnabled on
PassengerAppType node
PassengerStartupFile scratch/test_server.js
PassengerAppRoot /home/u594640959
EOF`,
    `echo "Passenger .htaccess written"`
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
