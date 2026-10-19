const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = process.cwd();
const PORT = 8891;
const DPORT = 9291;
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = path.join(process.env.TEMP, 'dixani-browser-audit-' + Date.now());

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = http.createServer((req, res) => {
  let route = decodeURIComponent(req.url.split('?')[0]);
  let file = route.endsWith('/') ? path.join(root, route, 'index.html') : path.join(root, route);
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
  const fill = async (id, value) => evaluate(`(() => { const e = document.getElementById(${JSON.stringify(id)}); if (!e) throw new Error('Missing field ${id}'); e.value = ${JSON.stringify(String(value))}; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return e.value; })()`);
  const check = async (id, value) => evaluate(`(() => { const e = document.getElementById(${JSON.stringify(id)}); if (!e) throw new Error('Missing checkbox ${id}'); e.checked = ${Boolean(value)}; e.dispatchEvent(new Event('change', { bubbles: true })); return e.checked; })()`);
  const click = async id => evaluate(`(() => { const e = document.getElementById(${JSON.stringify(id)}); if (!e) throw new Error('Missing button ${id}'); e.click(); return true; })()`);
  const clickMode = async mode => evaluate(`(() => { const e = document.querySelector('[data-mode="${mode}"]'); if (!e) throw new Error('Missing mode ${mode}'); e.click(); return true; })()`);
  const text = async id => evaluate(`document.getElementById(${JSON.stringify(id)})?.innerText ?? null`);
  const values = async ids => evaluate(`(() => { const out = {}; for (const id of ${JSON.stringify(ids)}) out[id] = document.getElementById(id)?.innerText ?? null; return out; })()`);
  const run = async (name, fn) => {
    try { results.push({ name, ok: true, value: await fn(), runtimeErrors: [...runtimeErrors] }); }
    catch (error) { results.push({ name, ok: false, error: error.message, runtimeErrors: [...runtimeErrors] }); }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Qatar' });
  await send('Emulation.setDeviceMetricsOverride', { width: 1365, height: 900, deviceScaleFactor: 1, mobile: false });
  const results = [];

  await navigate('/categories/converters/unit-converter/');
  const unitVector = async (category, from, to, input, decimals = 2) => {
    await fill('conversionType', category);
    await fill('fromUnit', from);
    await fill('toUnit', to);
    await fill('decimalPlaces', decimals);
    await fill('inputValue', input);
    await click('convertButton');
    return { result: await text('resultValue'), units: await text('resultUnits'), summary: await text('conversionSummary') };
  };
  await run('unit-converter length m to ft', () => unitVector('length', 'm', 'ft', 1));
  await run('unit-converter weight kg to lb', () => unitVector('weight', 'kg', 'lb', 1));
  await run('unit-converter volume L to m3', () => unitVector('volume', 'l', 'm3', 1000, 4));
  await run('unit-converter area m2 to ft2', () => unitVector('area', 'm2', 'ft2', 1));
  await run('unit-converter reverse ft to m', () => unitVector('length', 'ft', 'm', 1));
  await run('unit-converter same unit', () => unitVector('length', 'm', 'm', 5));
  await run('unit-converter invalid text', () => unitVector('length', 'm', 'ft', 'not-a-number'));

  await navigate('/categories/converters/volumetric-weight-calculator/');
  const volumetric = async (dims, qty, actualWeight, divisor, dimensionUnit = 'cm', weightUnit = 'kg') => {
    await fill('dimensionUnit', dimensionUnit);
    await fill('weightUnit', weightUnit);
    await fill('length', dims[0]);
    await fill('width', dims[1]);
    await fill('height', dims[2]);
    await fill('quantity', qty);
    await fill('actualWeight', actualWeight);
    await fill('divisor', divisor);
    await click('calculateButton');
    return values(['chargeableWeight', 'actualWeightResult', 'volumetricWeightResult', 'cartonVolumeResult', 'totalVolumeResult', 'quantityResult', 'resultSummary']);
  };
  await run('volumetric sample 2 cartons', () => volumetric([50, 40, 30], 2, 18, '5000'));
  await run('volumetric fractional quantity', () => volumetric([50, 40, 30], 2.9, 18, '5000'));
  await run('volumetric inches and pounds', () => volumetric([20, 16, 12], 1, 10, '5000', 'in', 'lb'));
  await run('volumetric negative quantity', () => volumetric([50, 40, 30], -1, 18, '5000'));
  await run('volumetric negative weight', () => volumetric([50, 40, 30], 1, -1, '5000'));
  await run('volumetric divisor options', () => evaluate(`[...document.getElementById('divisor').options].map(o => ({ value: o.value, text: o.textContent }))`));

  await navigate('/logistics/cbm-calculator/');
  await run('cbm sample', async () => {
    await click('sampleBtn');
    return evaluate(`(() => ({ rows: [...document.querySelectorAll('tbody tr')].map(r => ({ ref: r.querySelector('.ref')?.value, cbmEach: r.querySelector('.cbmEach')?.innerText, cbmTotal: r.querySelector('.cbmTotal')?.innerText })), totals: { cartons: document.getElementById('totalCartons').innerText, cbm: document.getElementById('totalCbm').innerText, cft: document.getElementById('totalCft').innerText, weight: document.getElementById('totalWeight').innerText } }))()`);
  });
  await run('cbm fractional quantity', async () => {
    await evaluate(`(() => { const row = document.querySelector('tbody tr'); const q = row.querySelector('.qty'); q.value = '2.9'; q.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('calculateBtn').click(); return true; })()`);
    return values(['totalCartons', 'totalCbm', 'totalWeight', 'warning']);
  });

  await navigate('/logistics/pallet-calculator/');
  const pallet = async total => {
    await check('rotate', true);
    for (const [id, value] of Object.entries({ total, cl: 40, cw: 30, ch: 25, pl: 120, pw: 100, mh: 150, ph: 15, unit: 'cm', dp: 2 })) await fill(id, value);
    await click('calc');
    return values(['perLayer', 'layers', 'perPallet', 'pallets', 'full', 'last', 'height', 'util', 'cbm', 'warn']);
  };
  await run('pallet whole sample', () => pallet(200));
  await run('pallet fractional total', () => pallet(200.5));
  await run('pallet carton too tall', async () => {
    await fill('total', 10); await fill('ch', 200); await click('calc');
    return values(['perPallet', 'pallets', 'last', 'warn']);
  });

  await navigate('/logistics/container-loading-calculator/');
  const container = async total => {
    await fill('ctype', '20'); await fill('unit', 'cm');
    await check('rotate', true);
    for (const [id, value] of Object.entries({ total, cl: 50, cw: 40, ch: 30 })) await fill(id, value);
    await click('calc');
    return values(['cols', 'rows', 'layers', 'capacity', 'containers', 'last', 'containerCbm', 'cargoCbm', 'util', 'warn']);
  };
  await run('container whole sample', () => container(1000));
  await run('container fractional total', () => container(1000.5));
  await run('container carton too large', async () => {
    await fill('total', 1); await fill('cl', 1000); await click('calc');
    return values(['capacity', 'containers', 'last', 'warn']);
  });

  await navigate('/logistics/warehouse-space-calculator/');
  await run('warehouse space sample', async () => {
    await click('sample');
    return values(['mainResult', 'groundPositions', 'palletFootprint', 'totalCapacity', 'warning']);
  });
  await run('warehouse capacity sample', async () => {
    await click('capacityTab');
    await click('sample');
    return values(['mainResult', 'groundPositions', 'palletFootprint', 'totalCapacity', 'warning']);
  });

  await navigate('/categories/finance/break-even-calculator/');
  await run('break-even sample', async () => {
    for (const [id, value] of Object.entries({ fixedCosts: 10000, sellingPrice: 100, variableCost: 60, expectedUnits: 400 })) await fill(id, value);
    await click('calculateButton');
    return values(['breakEvenUnits', 'breakEvenRevenue', 'contributionPerUnit', 'contributionMargin', 'estimatedProfit', 'calculatorError']);
  });
  await run('break-even negative fixed cost', async () => {
    await fill('fixedCosts', -1); await click('calculateButton');
    return values(['calculatorError', 'breakEvenUnits']);
  });
  await run('break-even price below variable cost', async () => {
    await fill('fixedCosts', 100); await fill('sellingPrice', 10); await fill('variableCost', 20); await click('calculateButton');
    return values(['calculatorError', 'breakEvenUnits']);
  });

  await navigate('/categories/finance/discount-calculator/');
  await run('discount sample', async () => {
    await fill('originalPrice', 100); await fill('discountPercent', 20); await fill('quantity', 2); await click('calculateButton');
    return values(['primaryResult', 'totalSavings', 'finalTotal', 'calculatorError']);
  });
  await run('discount stacked', async () => {
    await clickMode('stacked');
    await fill('originalPrice', 100); await fill('discountPercent', 20); await fill('secondDiscount', 10); await fill('quantity', 1); await click('calculateButton');
    return values(['primaryResult', 'effectiveDiscount', 'finalTotal', 'calculatorError']);
  });
  await run('discount over 100 percent', async () => {
    await clickMode('price'); await fill('originalPrice', 100); await fill('discountPercent', 101); await click('calculateButton');
    return values(['primaryResult', 'calculatorError']);
  });

  await navigate('/categories/finance/vat-calculator/');
  await run('vat add', async () => {
    await clickMode('add'); await fill('amount', 1000); await fill('vatRate', 5); await click('calculateButton');
    return values(['netAmount', 'vatAmount', 'grossAmount', 'calculatorError']);
  });
  await run('vat remove', async () => {
    await clickMode('remove'); await fill('amount', 1050); await fill('vatRate', 5); await click('calculateButton');
    return values(['netAmount', 'vatAmount', 'grossAmount', 'calculatorError']);
  });
  await run('vat negative amount', async () => {
    await fill('amount', -1); await click('calculateButton');
    return values(['grossAmount', 'calculatorError']);
  });

  await navigate('/categories/finance/loan-payment-calculator/');
  await run('loan sample', async () => {
    for (const [id, value] of Object.entries({ loanAmount: 100000, interestRate: 5, loanTerm: 5, termUnit: 'years', extraPayment: 0, currency: 'USD', decimalPlaces: 2 })) await fill(id, value);
    await click('calculate');
    return values(['monthlyPayment', 'totalInterest', 'totalPaid', 'numberPayments', 'warning']);
  });
  await run('loan zero interest', async () => {
    for (const [id, value] of Object.entries({ loanAmount: 12000, interestRate: 0, loanTerm: 12, termUnit: 'months', extraPayment: 0 })) await fill(id, value);
    await click('calculate');
    return values(['monthlyPayment', 'totalInterest', 'totalPaid', 'numberPayments', 'warning']);
  });
  await run('loan negative principal', async () => {
    await fill('loanAmount', -1); await fill('interestRate', 5); await fill('loanTerm', 1); await click('calculate');
    return values(['monthlyPayment', 'warning']);
  });

  await navigate('/categories/finance/simple-interest-calculator/');
  await run('simple interest sample', async () => {
    for (const [id, value] of Object.entries({ principal: 10000, interestRate: 5, timePeriod: 3, periodUnit: 'years', currency: 'USD', decimalPlaces: 2 })) await fill(id, value);
    await click('calculate');
    return values(['simpleInterest', 'totalAmount', 'growthPercent', 'warning']);
  });
  await run('simple interest zero principal', async () => {
    await fill('principal', 0); await click('calculate');
    return values(['simpleInterest', 'totalAmount', 'warning']);
  });

  await navigate('/categories/finance/compound-interest-calculator/');
  const compound = async (principal, rate, period, periodUnit) => {
    for (const [id, value] of Object.entries({ principal, interestRate: rate, investmentPeriod: period, periodUnit, compoundFrequency: 12, contribution: 0, contributionFrequency: 0, currency: 'USD', decimalPlaces: 2 })) await fill(id, value);
    await click('calculate');
    return values(['futureValue', 'totalContributions', 'interestEarned', 'warning']);
  };
  await run('compound monthly one month', () => compound(10000, 5, 1, 'months'));
  await run('compound monthly three months', () => compound(10000, 5, 3, 'months'));
  await run('compound monthly one year', () => compound(10000, 5, 1, 'years'));

  await navigate('/inventory/reorder-point/');
  await run('reorder normal', async () => {
    for (const [id, value] of Object.entries({ avgUsage: 10, leadTime: 5, safetyStock: 20, currentStock: 40, incomingStock: 10, orderQty: 100, decimals: 2 })) await fill(id, value);
    await click('calculateButton');
    return values(['reorderPoint', 'availableStock', 'coverageDays', 'reorderStatus']);
  });
  await run('reorder negative demand', async () => {
    await fill('avgUsage', -10); await click('calculateButton');
    return values(['reorderPoint', 'coverageDays', 'reorderStatus']);
  });

  await navigate('/inventory/safety-stock/');
  await run('safety stock negative deviation', async () => {
    await click('advancedTab'); await fill('service', 1.96); await fill('std', -6); await fill('advLead', 7); await fill('advAvg', 15); await click('calculate');
    return values(['result', 'coverage']);
  });

  await navigate('/inventory/inventory-turnover/');
  await run('inventory turnover sample', async () => {
    for (const [id, value] of Object.entries({ cogs: 500000, beginning: 100000, ending: 150000, period: 365, currency: 'USD', decimals: 2 })) await fill(id, value);
    await click('calculate');
    return values(['turnover', 'avgResult', 'daysResult', 'warning']);
  });
  await run('inventory turnover negative COGS', async () => {
    await fill('cogs', -1); await click('calculate');
    return values(['turnover', 'warning']);
  });

  await navigate('/inventory/dio-calculator/');
  await run('dio sample', async () => {
    for (const [id, value] of Object.entries({ cogs: 500000, beginning: 100000, ending: 150000, target: 75, period: 365, currency: 'USD' })) await fill(id, value);
    await click('calculate');
    return values(['dio', 'turnover', 'targetInv', 'difference', 'dioDiff', 'warning']);
  });
  await run('dio negative target', async () => {
    await fill('target', -1); await click('calculate');
    return values(['dio', 'warning']);
  });

  await navigate('/inventory/eoq-calculator/');
  await run('eoq sample', async () => {
    for (const [id, value] of Object.entries({ annualDemand: 10000, orderingCost: 100, holdingCost: 0.5, workingDays: 250, currentOrderQty: 250, currency: 'USD', decimalPlaces: 2 })) await fill(id, value);
    await click('calculateButton');
    return values(['eoqResult', 'ordersPerYear', 'averageInventory', 'timeBetweenOrders', 'annualOrderingCost', 'annualHoldingCost', 'totalRelevantCost', 'currentRelevantCost', 'validationMessage']);
  });

  await navigate('/categories/business/profit-margin-calculator/');
  await run('profit margin sample', async () => {
    for (const [id, value] of Object.entries({ costPrice: 75, sellingPrice: 100, quantity: 1, discountPercent: 10, currency: 'USD' })) await fill(id, value);
    await click('calculateButton');
    return values(['primaryResult', 'profitPerUnit', 'afterDiscount', 'calculatorError']);
  });
  await run('profit margin negative cost', async () => {
    await fill('costPrice', -1); await click('calculateButton');
    return values(['primaryResult', 'calculatorError']);
  });

  await navigate('/categories/business/markup-calculator/');
  await run('markup sample', async () => {
    for (const [id, value] of Object.entries({ costPrice: 75, markupPercentInput: 50, quantity: 1, discountPercent: 0, currency: 'USD' })) await fill(id, value);
    await click('calculateButton');
    return values(['primaryResult', 'resultMarkup', 'calculatorError']);
  });

  await navigate('/categories/business/working-hours-calculator/');
  await run('working hours overnight', async () => {
    for (const [id, value] of Object.entries({ startTime: '22:00', endTime: '06:00', breakMinutes: 30, hourlyRate: 20, currency: 'USD' })) await fill(id, value);
    await click('calculateButton');
    return values(['shiftDuration', 'breakResult', 'workedTime', 'decimalHours', 'estimatedEarnings', 'workedTimeNote', 'calculatorError']);
  });
  await run('working hours same time', async () => {
    await fill('startTime', '08:00'); await fill('endTime', '08:00'); await click('calculateButton');
    return values(['workedTime', 'workedTimeNote', 'calculatorError']);
  });
  await run('working hours stale result after invalid break', async () => {
    for (const [id, value] of Object.entries({ startTime: '08:00', endTime: '17:00', breakMinutes: 60, hourlyRate: 20 })) await fill(id, value);
    await click('calculateButton');
    const valid = await values(['workedTime', 'estimatedEarnings']);
    await fill('breakMinutes', 600); await click('calculateButton');
    return { valid, invalid: await values(['workedTime', 'estimatedEarnings', 'calculatorError']) };
  });

  const cycleCsv = (rows) => 'SKU,Description,Location,ABC Class,Last Count Date,Risk Level,Interval Days\n' + rows.join('\n');
  const setWeekdays = async days => evaluate(`(() => { for (const el of document.querySelectorAll('[name="workingDay"]')) el.checked = ${JSON.stringify(days)}.includes(Number(el.value)); return true; })()`);
  const scheduleRows = () => evaluate(`[...document.querySelectorAll('#scheduleBody tr')].map(tr => [...tr.children].map(td => td.innerText.trim()))`);

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count initial counts and excluded date', async () => {
    await fill('pasteData', cycleCsv(['A-1,Item A,A,A,,High,', 'B-1,Item B,B,B,,Medium,', 'C-1,Item C,C,C,,Low,']));
    await click('importPaste');
    await fill('planStart', '2026-10-19'); await fill('planDays', '30'); await fill('dailyCapacity', '2');
    await fill('intervalA', '7'); await fill('intervalB', '14'); await fill('intervalC', '30'); await fill('excludedDates', '2026-10-20');
    await setWeekdays([1, 2, 3, 4, 5]);
    await click('generatePlan');
    return { summary: await text('planSummary'), rows: await scheduleRows(), kpis: await values(['scheduledKpi', 'lateKpi', 'unscheduledKpi']), warnings: await text('capacityWarnings') };
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count due date and capacity carry-forward', async () => {
    await fill('pasteData', cycleCsv(['A-1,Item A,A,A,2026-10-10,High,']));
    await click('importPaste');
    await fill('planStart', '2026-10-19'); await fill('planDays', '30'); await fill('dailyCapacity', '1');
    await fill('intervalA', '7'); await fill('intervalB', '14'); await fill('intervalC', '30'); await fill('excludedDates', '');
    await setWeekdays([1, 2, 3, 4, 5]);
    await click('generatePlan');
    return { summary: await text('planSummary'), rows: await scheduleRows(), kpis: await values(['scheduledKpi', 'lateKpi', 'unscheduledKpi', 'overdueKpi']) };
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count completion history', async () => {
    await fill('pasteData', cycleCsv(['A-1,Item A,A,A,2026-10-10,High,']));
    await click('importPaste');
    await fill('planStart', '2026-10-19'); await fill('planDays', '30'); await fill('dailyCapacity', '1');
    await fill('intervalA', '7'); await fill('intervalB', '14'); await fill('intervalC', '30');
    await setWeekdays([1, 2, 3, 4, 5]);
    await click('generatePlan');
    await evaluate(`(() => { const b = document.querySelector('#scheduleBody [data-complete]'); const i = b.dataset.complete; const d = document.getElementById('completion-' + i); d.value = '2026-10-19'; b.click(); return true; })()`);
    const afterComplete = { message: await text('plannerMessage'), kpis: await values(['completedKpi', 'scheduledKpi', 'unscheduledKpi']) };
    await click('generatePlan');
    return { afterComplete, afterRegenerate: { kpis: await values(['completedKpi', 'scheduledKpi', 'unscheduledKpi']), rows: await scheduleRows() } };
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count invalid completion date', async () => {
    await fill('pasteData', cycleCsv(['A-1,Item A,A,A,2026-10-10,High,']));
    await click('importPaste'); await fill('planStart', '2026-10-19'); await fill('planDays', '30'); await fill('dailyCapacity', '1'); await setWeekdays([1, 2, 3, 4, 5]); await click('generatePlan');
    await evaluate(`(() => { const b = document.querySelector('#scheduleBody [data-complete]'); const i = b.dataset.complete; document.getElementById('completion-' + i).value = '2026-10-18'; b.click(); return true; })()`);
    return values(['plannerMessage']);
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count malformed and duplicate imports', async () => {
    const outputs = [];
    await fill('pasteData', 'SKU,ABC Class\nA-1,A\n\"unclosed,A'); await click('importPaste'); outputs.push(await text('plannerMessage'));
    await fill('pasteData', cycleCsv(['DUP,A,A,A,,High,', 'DUP,A,A,A,,High,'])); await click('importPaste'); outputs.push(await text('plannerMessage'));
    return outputs;
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count local save and load', async () => {
    await fill('pasteData', cycleCsv(['A-1,Item A,A,A,,High,'])); await click('importPaste');
    await click('saveLocal');
    const saved = await text('plannerMessage');
    await evaluate(`(() => { localStorage.setItem('dixani-cycle-count-planner-v1', '{bad json'); return true; })()`);
    await click('loadLocal');
    const malformed = await text('plannerMessage');
    return { saved, malformed };
  });

  await navigate('/inventory/cycle-count-planner/');
  await run('cycle count export spreadsheet formula guard', async () => {
    await fill('pasteData', cycleCsv(['=1+1,Formula,A,A,,High,'])); await click('importPaste');
    await fill('planStart', '2026-10-19'); await fill('planDays', '30'); await fill('dailyCapacity', '1'); await setWeekdays([1, 2, 3, 4, 5]); await click('generatePlan');
    return evaluate(`(() => { const original = URL.createObjectURL; let captured = ''; URL.createObjectURL = b => { captured = b; return 'blob:test'; }; const oldClick = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function() {}; document.getElementById('exportSchedule').click(); URL.createObjectURL = original; HTMLAnchorElement.prototype.click = oldClick; return captured ? captured.text().then(t => t.split('\\n').slice(0, 2)) : 'no blob'; })()`);
  });

  await navigate('/simulators/warehouse-shift-challenge/');
  await run('warehouse shift simulator full flow', async () => {
    await click('startChallenge');
    const first = { counter: await text('scenarioCounter'), choices: await evaluate(`[...document.querySelectorAll('#decisionList button')].map(b => b.innerText.trim())`) };
    for (let i = 0; i < 6; i++) {
      const hasChoice = await evaluate(`!!document.querySelector('#decisionList button')`);
      if (!hasChoice) break;
      await evaluate(`document.querySelector('#decisionList button').click()`);
      await click('nextScenario');
    }
    return { first, finalScore: await text('finalScore'), resultTitle: await text('resultTitle'), resultsVisible: await evaluate(`!document.getElementById('resultsPanel').hidden`) };
  });

  await navigate('/ai-operations-assistant/');
  await run('ai assistant knowledge query', async () => {
    await evaluate(`(() => { const card = document.querySelector('[data-module="knowledge"]'); if (card) card.click(); const form = document.getElementById('knowledgeForm'); const input = form?.querySelector('input'); if (input) { input.value = 'What should I do about a shortage?'; input.dispatchEvent(new Event('input', { bubbles: true })); } if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); return true; })()`);
    return evaluate(`(() => ({ panel: document.getElementById('knowledgePanel')?.innerText.slice(0, 800), live: document.querySelector('[aria-live]')?.innerText.slice(0, 500) }))()`);
  });
  await run('ai assistant variance workflow', async () => {
    await evaluate(`document.querySelector('[data-module="variance"]').click()`);
    await click('loadVarianceExample');
    await evaluate(`document.getElementById('varianceForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))`);
    return values(['reportVariance', 'reportValue', 'reportStatus']);
  });
  await run('ai assistant huddle workflow', async () => {
    await evaluate(`document.querySelector('[data-module="huddle"]').click()`);
    await click('loadHuddleExample');
    await evaluate(`document.getElementById('huddleForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))`);
    return evaluate(`document.getElementById('huddleReport').innerText.slice(0, 700)`);
  });
  await run('ai assistant daily report workflow', async () => {
    await evaluate(`document.querySelector('[data-module="report"]').click()`);
    await click('loadDailyExample');
    await evaluate(`document.getElementById('dailyReportForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))`);
    return evaluate(`document.getElementById('dailyReportOutput').innerText.slice(0, 700)`);
  });

  await run('focus indicator samples', async () => {
    const out = [];
    for (const [route, selector, label] of [
      ['/inventory/reorder-point/', '#calculateButton', 'reorder calculate'],
      ['/inventory/cycle-count-planner/', '#generatePlan', 'cycle generate'],
      ['/categories/converters/unit-converter/', '#convertButton', 'unit convert'],
      ['/logistics/pallet-calculator/', '#calc', 'pallet calculate'],
      ['/', '.main-nav a', 'header nav link']
    ]) {
      await navigate(route);
      out.push(await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return { label: ${JSON.stringify(label)}, missing: true }; e.focus(); const s = getComputedStyle(e); return { label: ${JSON.stringify(label)}, tag: e.tagName, text: e.innerText.trim().slice(0, 40), outline: s.outline, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow, background: s.backgroundColor }; })()`));
    }
    return out;
  });

  await run('mobile layout dimensions', async () => {
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    const out = [];
    for (const route of ['/logistics/cbm-calculator/', '/inventory/inventory-accuracy-analyzer/']) {
      await navigate(route);
      out.push(await evaluate(`(() => { const w = document.querySelector('.table-wrap,.editable-table-wrap'); const r = w?.getBoundingClientRect(); return { route: location.pathname, innerWidth, visualWidth: visualViewport.width, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, wrap: r && { width: r.width, scrollWidth: w.scrollWidth, clientWidth: w.clientWidth, overflowX: getComputedStyle(w).overflowX } }; })()`));
    }
    return out;
  });

  const outputPath = path.join(root, 'reports', 'audit-2026-10-19', 'evidence', 'browser-interaction-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({ inspectedAt: new Date().toISOString(), chrome: version.Browser, results }, null, 2));
  console.log(JSON.stringify({ outputPath, cases: results.length, failures: results.filter(r => !r.ok).length }, null, 2));

  ws.close();
  chrome.kill();
  server.close();
})().catch(error => { console.error(error); server.close(); process.exit(1); });
