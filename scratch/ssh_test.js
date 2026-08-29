import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  conn.exec('curl -i https://paarthviayurveda.com/api/health', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
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
