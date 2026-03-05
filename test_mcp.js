const { spawn } = require('child_process');

// spawn the MCP server
const mcp = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', [
    '-y',
    '@insforge/mcp@latest',
    '--api_key',
    'ik_8e7dff5e049a78b09c585d21a7df1b0e',
    '--api_base_url',
    'https://ciyndj73.us-east.insforge.app'
], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true,
    env: { ...process.env, npm_config_cache: 'C:\\Users\\ch\\libreM\\temp_npm_cache' }
});

let output = '';

mcp.stdout.on('data', (data) => {
    output += data.toString();
    // check if we got a full json-rpc response
    if (output.includes('\n')) {
        const lines = output.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].trim()) {
                console.log("RESPONSE:", lines[i]);
            }
        }
        output = lines[lines.length - 1];
    }
});

// wait a bit for it to start
setTimeout(() => {
    // send the initialize request
    const initReq = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
        }
    });
    mcp.stdin.write(initReq + '\n');

    setTimeout(() => {
        // after initialization, call the tool
        const toolReq = JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
                name: "fetch-docs",
                arguments: {}
            }
        });
        mcp.stdin.write(toolReq + '\n');

        // wait a bit then exit
        setTimeout(() => {
            mcp.kill();
            process.exit(0);
        }, 5000);
    }, 2000);
}, 2000);
