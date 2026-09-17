const http = require('http');

http.get('http://localhost:9222/json', (res) => {
  let raw = '';
  res.on('data', c => raw += c);
  res.on('end', () => {
    const tabs = JSON.parse(raw);
    const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
    const wsUrl = pageTab.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 4, method: 'Page.navigate', params: { url: 'http://localhost:8080/index.html' } }));
    };
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', data.params.type, data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.log('[BROWSER EXCEPTION]', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
      }
      if (data.id === 5) {
        console.log('[EVAL RESULT]', data.result?.result?.value);
      }
    };
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 5,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const el = document.getElementById("modal-license-activation");
            if (!el) return "EL_NOT_FOUND";
            const cs = window.getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return JSON.stringify({
              className: el.className,
              display: cs.display,
              visibility: cs.visibility,
              opacity: cs.opacity,
              zIndex: cs.zIndex,
              rect: { top: r.top, left: r.left, width: r.width, height: r.height },
              parentTag: el.parentElement ? el.parentElement.tagName : null,
              parentDisplay: el.parentElement ? window.getComputedStyle(el.parentElement).display : null
            });
          })()`
        }
      }));
    }, 2500);
    setTimeout(() => {
      process.exit(0);
    }, 3500);
  });
});
