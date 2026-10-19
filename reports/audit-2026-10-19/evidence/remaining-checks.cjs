const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.cwd();
const outDir = path.join(root, 'reports', 'audit-2026-10-19', 'evidence');
const PORT = 8893;
const DPORT = 9293;
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = path.join(process.env.TEMP, 'dixani-remaining-' + Date.now());
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };

const server = http.createServer((req, res) => {
  const route = decodeURIComponent(req.url.split('?')[0]);
  const file = route.endsWith('/') ? path.join(root, route, 'index.html') : path.join(root, route);
  fs.readFile(file, (error, body) => {
    if (error) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  });
});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await new Promise(resolve => server.listen(PORT, '127.0.0.1', resolve));
  const chrome = spawn(chromePath, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking',
    `--remote-debugging-port=${DPORT}`, `--user-data-dir=${profile}`,
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'
  ], { stdio: 'ignore' });

  let version;
  for (let i = 0; i < 100; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${DPORT}/json/version`)).json(); break; }
    catch { await wait(100); }
  }
  if (!version) throw new Error('Chrome DevTools endpoint did not start.');

  const target = await (await fetch(`http://127.0.0.1:${DPORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 0;
  const pending = new Map();
  const runtimeErrors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    } else if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
  };
  await new Promise(resolve => { ws.onopen = resolve; });
  const send = (method, params = {}) => new Promise(resolve => {
    const id = ++nextId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text);
    return response.result.result.value;
  };
  const navigate = async route => {
    runtimeErrors.length = 0;
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}${route}` });
    for (let i = 0; i < 50; i++) {
      await wait(80);
      if (await evaluate('document.readyState') === 'complete') break;
    }
    await wait(180);
  };
  const tab = async () => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await wait(25);
  };
  const active = async () => evaluate(`(() => { const e=document.activeElement; if(!e) return null; const s=getComputedStyle(e); const r=e.getBoundingClientRect(); return {tag:e.tagName,id:e.id,cls:e.className?.toString().slice(0,50),text:(e.innerText||e.value||'').trim().slice(0,60),outline:s.outline,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow,w:+r.width.toFixed(1),h:+r.height.toFixed(1)}; })()`);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
  const results = { inspectedAt: new Date().toISOString(), chrome: version.Browser, keyboard: {}, checkboxTargets: [], accuracy: [], backup: {}, printPdf: [] };

  await navigate('/');
  const homeTabs = [];
  for (let i = 0; i < 8; i++) { await tab(); homeTabs.push(await active()); }
  results.keyboard.homepageTabSequence = homeTabs;

  await navigate('/inventory/reorder-point/');
  const reorderTabs = [];
  let calculateFocus = null;
  for (let i = 0; i < 80; i++) {
    await tab();
    const item = await active();
    reorderTabs.push(item);
    if (item && item.id === 'calculateButton') { calculateFocus = item; break; }
  }
  results.keyboard.reorderCalculate = calculateFocus;
  results.keyboard.reorderTabCount = reorderTabs.length;

  await navigate('/inventory/cycle-count-planner/');
  results.checkboxTargets = await evaluate(`(() => [...document.querySelectorAll('input[name="workingDay"]')].map(e => { const label=e.closest('label'); const ir=e.getBoundingClientRect(); const lr=label?.getBoundingClientRect(); return {id:e.id,value:e.value,input:{w:+ir.width.toFixed(1),h:+ir.height.toFixed(1),x:+ir.x.toFixed(1),y:+ir.y.toFixed(1)},label:label?.innerText.trim(),labelBox:lr&&{w:+lr.width.toFixed(1),h:+lr.height.toFixed(1),x:+lr.x.toFixed(1),y:+lr.y.toFixed(1)},labelFor:label?.getAttribute('for')}; }))()`);
  if (results.checkboxTargets.length) {
    const first = results.checkboxTargets[0];
    const selector = `input[name="workingDay"][value="${first.value}"]`;
    const clickPoint = await evaluate(`(async () => { const input=document.querySelector(${JSON.stringify(selector)}); const label=input.closest('label'); label.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,60)); const b=label.getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2,before:input.checked,labelBox:{w:b.width,h:b.height}}; })()`);
    const before = await evaluate(`document.querySelector(${JSON.stringify(selector)}).checked`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: clickPoint.x, y: clickPoint.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: clickPoint.x, y: clickPoint.y, button: 'left', clickCount: 1 });
    await wait(60);
    const after = await evaluate(`document.querySelector(${JSON.stringify(selector)}).checked`);
    results.checkboxTargets[0].labelCenterClick = { before, after, toggled: before !== after, clickPoint, scrolledLabelBox: clickPoint.labelBox };
    const labelClick = await evaluate(`(() => { const input=document.querySelector(${JSON.stringify(selector)}); const before=input.checked; input.closest('label').click(); return {before,after:input.checked,toggled:before!==input.checked}; })()`);
    results.checkboxTargets[0].programmaticLabelClick = labelClick;
    results.checkboxTargets[0].scrollState = await evaluate(`({scrollY:window.scrollY,scrollHeight:document.scrollingElement.scrollHeight,innerHeight:window.innerHeight,bodyOverflow:getComputedStyle(document.body).overflow,htmlOverflow:getComputedStyle(document.documentElement).overflow})`);
  }

  const analyzeCase = async (name, csv) => {
    await navigate('/inventory/inventory-accuracy-analyzer/');
    await evaluate(`(() => { const e=document.getElementById('pasteData'); e.value=${JSON.stringify(csv)}; e.dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('importPaste').click(); document.getElementById('analyzeButton').click(); return true; })()`);
    await wait(120);
    const value = await evaluate(`(() => ({ message:document.getElementById('message')?.innerText||'', rowCount:document.getElementById('rowCount')?.innerText||'', accuracy:document.getElementById('accuracyKpi')?.innerText||'', exposure:document.getElementById('exposureKpi')?.innerText||'', shortage:document.getElementById('shortageKpi')?.innerText||'', units:document.getElementById('unitsKpi')?.innerText||'', summary:document.getElementById('analysisSummary')?.innerText||'', rows:[...document.querySelectorAll('#resultsBody tr')].map(r=>r.innerText.replace(/\\s+/g,' ').trim()) }))()`);
    results.accuracy.push({ name, csv, value, runtimeErrors: [...runtimeErrors] });
  };
  await analyzeCase('negative quantities and cost', 'SKU,Location,System Qty,Physical Qty,Unit Cost\nNEG,A-01,-5,-10,5');
  await analyzeCase('blank numeric fields', 'SKU,Location,System Qty,Physical Qty,Unit Cost\nBLANK,A-01,,,10');
  await analyzeCase('unclosed quoted field', 'SKU,Description,Location,System Qty,Physical Qty,Unit Cost\n"BROKEN,Unclosed description,A-01,10,9,5');
  await analyzeCase('future count date', 'SKU,Location,System Qty,Physical Qty,Unit Cost,Last Count Date\nFUTURE,A-01,10,10,100,2099-01-01');
  await analyzeCase('missing count date', 'SKU,Location,System Qty,Physical Qty,Unit Cost,Last Count Date\nMISSING,A-01,10,10,100,');
  await analyzeCase('all annual usage zero', 'SKU,Location,System Qty,Physical Qty,Unit Cost,Annual Usage\nZERO1,A-01,10,10,100,0\nZERO2,A-02,10,10,50,0');

  await navigate('/inventory/cycle-count-planner/');
  const setBackup = async (text, name) => {
    runtimeErrors.length = 0;
    await evaluate(`(() => { const input=document.getElementById('restoreBackup'); const dt=new DataTransfer(); dt.items.add(new File([${JSON.stringify(text)}], ${JSON.stringify(name)}, {type:'application/json'})); input.files=dt.files; input.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
    await wait(220);
    return evaluate(`(() => ({message:document.getElementById('plannerMessage')?.innerText||'',className:document.getElementById('plannerMessage')?.className||'',storage:document.getElementById('storageStatus')?.innerText||''}))()`);
  };
  results.backup.malformedJson = await setBackup('{not valid json', 'bad.json');
  results.backup.malformedJson.runtimeErrors = [...runtimeErrors];
  results.backup.unsupportedJson = await setBackup('{}', 'unsupported.json');
  results.backup.unsupportedJson.runtimeErrors = [...runtimeErrors];

  for (const [route, file] of [['/inventory/inventory-accuracy-analyzer/', 'accuracy-analyzer-print.pdf'], ['/inventory/reorder-point/', 'reorder-point-print.pdf']]) {
    await navigate(route);
    const response = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
    const data = response.result?.data;
    if (data) {
      fs.writeFileSync(path.join(outDir, file), Buffer.from(data, 'base64'));
      results.printPdf.push({ route, file, bytes: Buffer.byteLength(data, 'base64') });
    } else {
      results.printPdf.push({ route, file, error: response.error || 'No PDF data returned' });
    }
  }

  fs.writeFileSync(path.join(outDir, 'remaining-checks-results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ keyboard: results.keyboard.reorderCalculate, checkboxTargets: results.checkboxTargets, accuracy: results.accuracy.map(x => ({name:x.name,message:x.value.message,accuracy:x.value.accuracy,units:x.value.units,rows:x.value.rows})), backup: results.backup, printPdf: results.printPdf }, null, 2));
  ws.close();
  chrome.kill();
  server.close();
})().catch(error => { console.error(error); server.close(); process.exit(1); });
