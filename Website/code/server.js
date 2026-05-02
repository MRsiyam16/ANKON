const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const LEADS_DIR = path.join(__dirname, 'leads');

if (!fs.existsSync(LEADS_DIR)) {
    fs.mkdirSync(LEADS_DIR);
}

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/save-lead') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const leads = data.leads || {};
                const history = data.history || [];
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `lead_${timestamp}.md`;
                const filePath = path.join(LEADS_DIR, fileName);

                let mdContent = `# Lead Capture - ${new Date().toLocaleString()}\n\n`;
                mdContent += `## Lead Details\n`;
                mdContent += `- **Name**: ${leads.name || 'N/A'}\n`;
                mdContent += `- **Email**: ${leads.email || 'N/A'}\n`;
                mdContent += `- **Website**: ${leads.website || 'N/A'}\n`;
                mdContent += `- **Phone**: ${leads.phone || 'N/A'}\n`;
                mdContent += `- **Budget**: ${leads.budget || 'N/A'}\n`;
                mdContent += `- **Timeline**: ${leads.timeline || 'N/A'}\n\n`;

                mdContent += `## Conversation Transcript\n`;
                history.forEach(msg => {
                    const role = msg.role === 'user' ? 'User' : 'AI';
                    const text = msg.parts[0].text;
                    mdContent += `### ${role}\n${text}\n\n`;
                });

                fs.writeFileSync(filePath, mdContent);
                console.log(`Lead saved: ${fileName}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', file: fileName }));
            } catch (error) {
                console.error('Error saving lead:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid data' }));
            }
        });
        return;
    }

    // Serve static files (like http.server)
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.mp4': contentType = 'video/mp4'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Leads will be saved in: ${LEADS_DIR}`);
});
