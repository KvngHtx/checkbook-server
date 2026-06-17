const http = require('http');
const https = require('https');

const CHECKBOOK_SECRET_KEY = 'PuSW1LByQyBVPXnS83LKdIOt0Qt4RE';
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Publishable-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/process-payment') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const paymentData = JSON.parse(body);
        console.log('Payment request received:', paymentData.method);
        
        processCheckbookPayment(paymentData, (error, result) => {
          if (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: result }));
          }
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

function processCheckbookPayment(paymentData, callback) {
  let endpoint, payload;

  if (paymentData.method === 'ach') {
    endpoint = '/v3/check';
    payload = JSON.stringify({
      routing: paymentData.routing,
      account: paymentData.account,
      account_type: paymentData.account_type || 'checking',
      amount: Math.round(paymentData.amount * 100),
      description: 'Payment via Direct Entry'
    });
  } else {
    endpoint = '/v3/card/charge';
    payload = JSON.stringify({
      card_number: paymentData.card_number,
      expiry: paymentData.expiry,
      cvv: paymentData.cvv,
      amount: Math.round(paymentData.amount * 100),
      description: 'Card payment via Direct Entry'
    });
  }

  const options = {
    hostname: 'api.checkbook.io',
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHECKBOOK_SECRET_KEY,
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          callback(null, result);
        } else {
          callback(result.error || 'Payment failed', null);
        }
      } catch (e) {
        callback('Invalid response from Checkbook', null);
      }
    });
  });

  req.on('error', (e) => {
    callback('Network error: ' + e.message, null);
  });

  req.write(payload);
  req.end();
}

server.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
 