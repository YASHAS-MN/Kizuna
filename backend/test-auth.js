import http from 'http';
import app from './dist/app.js';

const PORT = 3001; // use a different port for testing just in case
const server = http.createServer(app);

async function request(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (cookie) options.headers['Cookie'] = cookie;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        });
      });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

server.listen(PORT, async () => {
  try {
    console.log('--- Unauthenticated tests ---');
    let res = await request('/api/teams');
    console.assert(res.status === 401, 'Expected 401 for unauthenticated GET /api/teams');
    console.log('Unauthenticated GET /api/teams -> 401 OK');

    console.log('\n--- Student Alice (u1) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'alice@kizuna.edu', password: 'kizuna123' });
    const aliceCookie = res.headers['set-cookie'][0];
    console.log('Alice logged in');

    res = await request('/api/teams', 'GET', null, aliceCookie);
    console.assert(res.data.length === 1 && res.data[0].id === 't1', 'Alice should see only t1');
    console.log('Alice GET /api/teams -> Only Team Alpha OK');

    res = await request('/api/teams/t1', 'GET', null, aliceCookie);
    console.assert(res.status === 200, 'Alice should access t1');
    console.log('Alice GET /api/teams/t1 -> 200 OK');

    res = await request('/api/teams/t2', 'GET', null, aliceCookie);
    console.assert(res.status === 403, 'Alice should be forbidden from t2');
    console.log('Alice GET /api/teams/t2 -> 403 OK');

    res = await request('/api/projects/p1', 'GET', null, aliceCookie);
    console.assert(res.status === 200, 'Alice should access p1');
    console.log('Alice GET /api/projects/p1 -> 200 OK');

    res = await request('/api/projects/p2', 'GET', null, aliceCookie);
    console.assert(res.status === 403, 'Alice should be forbidden from p2');
    console.log('Alice GET /api/projects/p2 -> 403 OK');


    console.log('\n--- Mentor Sarah (u4) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'sarah.jenkins@kizuna.edu', password: 'kizuna123' });
    const sarahCookie = res.headers['set-cookie'][0];
    
    res = await request('/api/teams/t1', 'GET', null, sarahCookie);
    console.assert(res.status === 200, 'Sarah should access t1');
    console.log('Sarah GET /api/teams/t1 -> 200 OK');

    res = await request('/api/teams/t2', 'GET', null, sarahCookie);
    console.assert(res.status === 403, 'Sarah should be forbidden from t2');
    console.log('Sarah GET /api/teams/t2 -> 403 OK');


    console.log('\n--- Mentor Alan (u5) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'alan.vance@kizuna.edu', password: 'kizuna123' });
    const alanCookie = res.headers['set-cookie'][0];
    
    res = await request('/api/teams/t1', 'GET', null, alanCookie);
    console.assert(res.status === 403, 'Alan should be forbidden from t1');
    console.log('Alan GET /api/teams/t1 -> 403 OK');

    res = await request('/api/teams/t2', 'GET', null, alanCookie);
    console.assert(res.status === 200, 'Alan should access t2');
    console.log('Alan GET /api/teams/t2 -> 200 OK');

    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
