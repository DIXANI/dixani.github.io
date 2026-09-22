(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const isMargin = Boolean(get('targetMargin'));
  let mode = isMargin ? 'margin' : 'selling';
  let summary = '';
  const money = value => `${get('currency').value} ${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const percent = value => value === null ? 'N/A' : `${value.toFixed(2)}%`;
  const cents = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const set = (id, text) => { if (get(id)) get(id).textContent = text; };
  function number(id, name, min, max, precision = 2, fallback) {
    const text = get(id).value.trim();
    if (!text && fallback !== undefined) return fallback;
    if (!new RegExp(`^-?\\d+(?:\\.\\d{1,${precision}})?$`).test(text)) throw new Error(`${name}: enter a number with up to ${precision} decimal places.`);
    const value = Number(text);
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${name} must be between ${min} and ${max}.`);
    return value;
  }
  function reset() {
    summary = '';
    get('copyBreakdown').disabled = true;
    get('copyFallback').hidden = true;
    get('copyFallback').value = '';
    set('copyStatus', '');
    set('calculatorError', '');
    get('calculatorError').classList.remove('show');
    document.querySelectorAll('.result-panel strong[id]').forEach(el => el.textContent = '—');
    document.querySelector('.result-primary').classList.remove('loss', 'positive');
    set('primaryResultNote', 'Enter your values and calculate. Results clear when inputs change.');
  }
  function switchMode(next) {
    mode = next;
    document.querySelectorAll('.calc-tab').forEach(tab => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    const target = mode === 'target' || mode === 'selling';
    get('sellingPriceGroup').classList.toggle('hidden', target);
    get(isMargin ? 'targetMarginGroup' : 'markupInputGroup').classList.toggle('hidden', !target);
    const heading = target ? 'Calculate Selling Price Before Discount' : `Calculate ${isMargin ? 'Margin' : 'Markup'} After Discount`;
    set('inputHeading', heading);
    set('inputDescription', target ? 'Your target sets the price before discount. The discount reduces your achieved profit.' : 'Enter cost and selling price before discount to see the achieved profit.');
    set('primaryResultLabel', target ? 'Selling Price Before Discount' : isMargin ? 'Achieved Gross Margin' : 'Achieved Markup');
    get('formulaBox').textContent = mode === 'target' ? 'Target price = cost ÷ (1 − margin ÷ 100).' : mode === 'selling' ? 'Target price = cost × (1 + markup ÷ 100).' : isMargin ? 'Achieved margin = gross profit ÷ price after discount × 100.' : 'Achieved markup = gross profit ÷ cost × 100.';
    reset();
  }
  function calculate() {
    reset();
    try {
      const cost = number('costPrice', 'Unit cost', 0, 1e9);
      const discount = number('discountPercent', 'Discount', 0, 100);
      const qty = number('quantity', 'Quantity', 0.001, 1e6, 3, 1);
      const target = mode === 'target' || mode === 'selling';
      let raw;
      if (target && cost === 0) throw new Error('Enter a cost above zero to calculate a target price.');
      if (mode === 'target') raw = cost / (1 - number('targetMargin', 'Target margin', 0, 99.99) / 100);
      else if (mode === 'selling') raw = cost * (1 + number('markupPercentInput', 'Markup', -100, 10000) / 100);
      else raw = number('sellingPrice', 'Selling price', 0, 1e9);
      const price = target ? Math.max(0, Math.ceil(raw * 100 - 1e-7) / 100) : raw;
      if (!Number.isFinite(price) || price > 1e9) throw new Error('Calculated price is too large. Reduce the cost or target.');
      const after = cents(price * (1 - discount / 100));
      const profit = cents(after - cost);
      const margin = after === 0 ? null : profit / after * 100;
      const markup = cost === 0 ? null : profit / cost * 100;
      const revenue = cents(after * qty), totalCost = cents(cost * qty);
      const totalProfit = cents(revenue - totalCost);
      if (Math.max(revenue, totalCost, Math.abs(totalProfit)) > 1e12) throw new Error('Order totals are too large. Reduce quantity or unit amounts.');
      set('primaryResult', target ? money(price) : percent(isMargin ? margin : markup));
      set('primaryResultNote', profit < 0 ? 'The price after discount is below cost: each unit makes a gross loss.' : 'Profit and percentages below use the price after discount.');
      document.querySelector('.result-primary').classList.toggle('loss', profit < 0);
      document.querySelector('.result-primary').classList.toggle('positive', profit > 0);
      for (const [id, value] of Object.entries({profitPerUnit: money(profit), markupPercent: percent(markup), resultMarkup: percent(markup), resultMargin: percent(margin), achievedMargin: percent(margin), resultSellingPrice: money(price), afterDiscount: money(after), resultCostPrice: money(cost), totalRevenue: money(revenue), totalCost: money(totalCost), totalProfit: money(totalProfit)})) set(id, value);
      summary = `DIXANI pricing breakdown\nUnit cost: ${money(cost)}\nSelling price before discount: ${money(price)}\nDiscount: ${discount}%\nPrice after discount: ${money(after)}\nGross profit per unit: ${money(profit)}\nAchieved gross margin: ${percent(margin)}\nAchieved markup: ${percent(markup)}\nQuantity: ${qty}\nTotal revenue: ${money(revenue)}\nTotal cost: ${money(totalCost)}\nTotal gross profit: ${money(totalProfit)}\nCurrency label only; no conversion. Taxes, fees and overhead excluded unless included in cost.`;
      get('copyBreakdown').disabled = false;
    } catch (error) {
      set('calculatorError', error.message);
      get('calculatorError').classList.add('show');
    }
  }
  document.querySelectorAll('.calc-tab').forEach(tab => tab.addEventListener('click', () => switchMode(tab.dataset.mode)));
  ['costPrice', 'sellingPrice', 'targetMargin', 'markupPercentInput', 'quantity', 'discountPercent'].forEach(id => {
    const el = get(id); if (!el) return;
    el.addEventListener('input', reset);
    el.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); calculate(); } });
  });
  get('currency').addEventListener('change', () => {
    set('costCurrency', get('currency').value); set('sellingCurrency', get('currency').value); reset();
  });
  get('calculateButton').addEventListener('click', calculate);
  get('clearButton').addEventListener('click', () => {
    ['costPrice', 'sellingPrice', 'targetMargin', 'markupPercentInput', 'quantity'].forEach(id => { if (get(id)) get(id).value = ''; });
    get('discountPercent').value = '0'; reset();
  });
  get('exampleButton').addEventListener('click', () => {
    get('costPrice').value = '75'; get('sellingPrice').value = '100'; get('quantity').value = '10'; get('discountPercent').value = '10';
    if (isMargin) get('targetMargin').value = '25'; else get('markupPercentInput').value = '50';
    calculate();
  });
  get('copyBreakdown').addEventListener('click', async () => {
    if (!summary) return;
    const text = summary;
    try {
      await navigator.clipboard.writeText(text);
      if (summary === text) set('copyStatus', 'Pricing breakdown copied.');
    } catch {
      if (summary !== text) return;
      get('copyFallback').value = text; get('copyFallback').hidden = false;
      get('copyFallback').focus(); get('copyFallback').select();
      set('copyStatus', 'Automatic copy is unavailable. Copy the selected breakdown below.');
    }
  });
  switchMode(mode);
})();
