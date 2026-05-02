const fs = require('fs');
const html = fs.readFileSync('c:/Antigravity/ANKON V2/Website/code/index.html', 'utf8');

let stack = [];
let lines = html.split('\n');

lines.forEach((line, i) => {
    // Regex for opening tags (excluding self-closing ones like img, br, input, link, meta)
    let openRegex = /<([a-zA-Z0-9]+)(?![^>]*\/>)[^>]*>/g;
    let closeRegex = /<\/([a-zA-Z0-9]+)>/g;
    
    let match;
    let voidTags = ['img', 'br', 'input', 'link', 'meta', 'hr', 'source', 'embed', 'param', 'track', 'wbr'];

    while ((match = openRegex.exec(line)) !== null) {
        let tag = match[1].toLowerCase();
        if (!voidTags.includes(tag) && !match[0].endsWith('/>')) {
            stack.push({ tag: tag, line: i + 1 });
        }
    }
    while ((match = closeRegex.exec(line)) !== null) {
        let tag = match[1].toLowerCase();
        if (stack.length === 0) {
            console.log(`Error: Extra closing tag </${tag}> on line ${i + 1}`);
        } else {
            let last = stack.pop();
            if (last.tag !== tag) {
                console.log(`Error: Tag mismatch. Expected </${last.tag}> (from line ${last.line}) but got </${tag}> on line ${i + 1}`);
                // Don't push back, just continue
            }
        }
    }
});

if (stack.length > 0) {
    console.log("Unclosed tags:");
    stack.forEach(t => console.log(`- <${t.tag}> on line ${t.line}`));
} else {
    console.log("All tags balanced.");
}
