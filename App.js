const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const handlebar = require('handlebars');
const url = require('url');
const { v4: uuidv4 } = require('uuid'); 

const session_storage={}

// Helper to parse cookies
function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
  
    cookieHeader.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=').map((part) => part.trim());
      cookies[key] = value;
      console.log("the key value",key,value);
      
    });
  
    return cookies;
  }

const app = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies.sessionId;
    const session = session_storage[sessionId];

    // if (!session) {
    //     // If no session exists, create one
    //     // sessionId = uuidv4(); // Generate a new session ID
    //     // session = { data: {} }; // Create an empty session
    //     session_storage[sessionId] = session;
    
    //     // Set session ID as a cookie
    //     res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
    //   }
  

    if (parsedUrl.pathname === '/' && req.method !='POST' ) {
        // const errors = parsedUrl.query;
        if(session && session.data){
            res.writeHead(302, { Location: '/home' });
            res.end();

        }
        else{
            fs.readFile('./view/login.hbs', (err, data) => {
                if (err) {
                    
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Page not found');
                } else {
                    const template = handlebar.compile(data.toString());
                            const html = template({ errors:{} }); 
                   
    
                    res.writeHead(200, { 'Content-Type': 'text/html',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store', });
                    res.end(html);
                }
            });

        }

       
    } 
    else if (req.method === 'POST' && req.url === '/') {
        if(session && session.data){
            res.writeHead(302, { Location: '/home' });
            res.end()
        }else{
            const username = 'adilkk';
            const password = '12345678';
            let body = '';
    
            req.on('data', (chunk) => {
                body += chunk;
            });
    
            req.on('end', () => {
                const parsedBody = querystring.parse(body);
                const errors = {};
    
                if (username !== parsedBody.email) {
                    errors.username = 'Invalid email';
                }
                if (password !== parsedBody.password) {
                    errors.password = 'Invalid password';
                }
    
                if (Object.keys(errors).length > 0) {
                    fs.readFile('./view/login.hbs', (err, data) => {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('Page not found');
                        } else {
                            const template = handlebar.compile(data.toString());
                            const html = template({ errors });
            
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            
                            res.end(html);
    
                        }
                    })
            
                    // const errorQuery = querystring.stringify(errors);
                    // res.writeHead(302, { Location: `/?${errorQuery}` });
                    // res.end();
                } else {
                    console.log("the login successs full...");
                    
                    const sessionId = uuidv4();
                    session_storage[sessionId] = { data: { name: username }  };
    
                    res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
                    
    
    
                    res.writeHead(302, { Location: '/home' });
                    res.end();
                }
            });

        }

       
    } 
    else if (parsedUrl.pathname === '/home') {
        if (session && session.data) {
            console.log("inside home");
            
            fs.readFile('./view/home.hbs', (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Page not found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });

        }
        else{
            res.writeHead(302, { location:'/' });
                    res.end()
        }
       
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
   
    }
});

app.listen(7000, () => {
    console.log('Server running at http://localhost:7000');
});
