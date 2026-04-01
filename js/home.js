  // ── Unit definitions ────────────────────────────────
  const UNITS = {
    length:      ['Kilometer','Meter','Centimeter','Millimeter','Mile','Foot','Inch','Yard'],
    weight:      ['Kilogram','Gram','Milligram','Pound','Ounce','Ton'],
    temperature: ['Celsius','Fahrenheit','Kelvin'],
    volume:      ['Liter','Milliliter','Cubic Meter','Gallon','Fluid Ounce','Cup'],
  };

  // ── Conversion to SI base ────────────────────────────
  const TO_SI = {
    length:      { Kilometer:1000, Meter:1, Centimeter:.01, Millimeter:.001, Mile:1609.344, Foot:.3048, Inch:.0254, Yard:.9144 },
    weight:      { Kilogram:1, Gram:.001, Milligram:1e-6, Pound:.453592, Ounce:.0283495, Ton:1000 },
    volume:      { Liter:1, Milliliter:.001, 'Cubic Meter':1000, Gallon:3.78541, 'Fluid Ounce':.0295735, Cup:.236588 },
    temperature: null, // handled separately
  };

  function convertToSI(val, unit, type) {
    if (type === 'temperature') return val; // handled inline
    return val * TO_SI[type][unit];
  }
  function convertFromSI(si, unit, type) {
    if (type === 'temperature') return si;
    return si / TO_SI[type][unit];
  }
  function convertTemperature(val, from, to) {
    let c;
    if (from === 'Celsius')    c = val;
    else if (from==='Fahrenheit') c = (val-32)*5/9;
    else                       c = val - 273.15;
    if (to === 'Celsius')      return c;
    if (to === 'Fahrenheit')   return c*9/5 + 32;
    return c + 273.15;
  }

  // ── State ──────────────────────────────────────────
  let currentType   = 'length';
  let currentAction = 'comparison';
  let currentOp     = '+';

  // ── Populate dropdowns ─────────────────────────────
  function fillDropdowns() {
    const units = UNITS[currentType];
    ['unit1','unit2'].forEach((id,i) => {
      const sel = document.getElementById(id);
      sel.innerHTML = units.map((u,j) =>
        `<option value="${u}" ${j===i ? 'selected':''}>${u}</option>`
      ).join('');
    });
    // default second unit selection for common conversions
    if (currentType==='length') document.getElementById('unit2').value='Meter';
    if (currentType==='weight') document.getElementById('unit2').value='Gram';
    if (currentType==='volume') document.getElementById('unit2').value='Milliliter';
    if (currentType==='temperature') document.getElementById('unit2').value='Fahrenheit';
    hideResult();
  }

  function setType(type, el) {
    currentType = type;
    document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
    fillDropdowns();
  }

  function setAction(action, el) {
    currentAction = action;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
    // show/hide second value for conversion (single input)
    const toGroup  = document.getElementById('to-group');
    const arithOps = document.getElementById('arith-ops');
    if (action === 'conversion') {
      toGroup.querySelector('input').style.display = 'none';
      toGroup.querySelector('label').textContent = 'To';
      arithOps.classList.remove('visible');
    } else if (action === 'arithmetic') {
      toGroup.querySelector('input').style.display = '';
      toGroup.querySelector('label').textContent = 'Value 2';
      arithOps.classList.add('visible');
    } else {
      toGroup.querySelector('input').style.display = '';
      toGroup.querySelector('label').textContent = 'To';
      arithOps.classList.remove('visible');
    }
    hideResult();
  }

  function setOp(op, el) {
    currentOp = op;
    document.querySelectorAll('.op-btn').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
  }

  function hideResult() {
    const box = document.getElementById('result-box');
    box.classList.remove('show');
  }

  // ── Calculate ──────────────────────────────────────
  function calculate() {
    const v1    = parseFloat(document.getElementById('val1').value);
    const v2    = parseFloat(document.getElementById('val2').value);
    const u1    = document.getElementById('unit1').value;
    const u2    = document.getElementById('unit2').value;
    const box   = document.getElementById('result-box');
    const txt   = document.getElementById('result-text');

    if (isNaN(v1)) { alert('Please enter a valid number in the FROM field.'); return; }

    let html = '';

    if (currentAction === 'conversion') {
      let result;
      if (currentType === 'temperature') {
        result = convertTemperature(v1, u1, u2);
      } else {
        const si = convertToSI(v1, u1, currentType);
        result   = convertFromSI(si, u2, currentType);
      }
      html = `<div style="margin-bottom:6px;color:var(--muted);font-size:.85rem;">Conversion Result</div>
              <div class="result-value">${fmt(v1)} ${u1} = <strong>${fmt(result)} ${u2}</strong></div>`;

    } else if (currentAction === 'comparison') {
      if (isNaN(v2)) { alert('Please enter a value in the TO field.'); return; }
      // convert both to SI for fair comparison
      let siA, siB;
      if (currentType === 'temperature') {
        siA = convertTemperature(v1, u1, 'Celsius');
        siB = convertTemperature(v2, u2, 'Celsius');
      } else {
        siA = convertToSI(v1, u1, currentType);
        siB = convertToSI(v2, u2, currentType);
      }
      const sym = siA > siB ? '>' : siA < siB ? '<' : '=';
      const color = siA > siB ? '#f72585' : siA < siB ? '#4361ee' : '#2ecc71';
      html = `<div style="margin-bottom:6px;color:var(--muted);font-size:.85rem;">Comparison Result</div>
              <div class="result-value" style="color:${color}">
                ${fmt(v1)} ${u1} <span style="font-size:2rem;vertical-align:middle;">${sym}</span> ${fmt(v2)} ${u2}
              </div>`;

    } else if (currentAction === 'arithmetic') {
      if (isNaN(v2)) { alert('Please enter a value in the Value 2 field.'); return; }
      // Convert both to SI, operate, then convert back to unit1
      let res;
      if (currentType === 'temperature') {
        // arithmetic on raw values (kelvin makes more sense, but we use raw for UX)
        const c1 = convertTemperature(v1,u1,'Kelvin');
        const c2 = convertTemperature(v2,u2,'Kelvin');
        const opResult = doOp(c1,c2);
        if (opResult === null) return;
        res = convertTemperature(opResult,'Kelvin',u1);
      } else {
        const si1 = convertToSI(v1,u1,currentType);
        const si2 = convertToSI(v2,u2,currentType);
        const opResult = doOp(si1,si2);
        if (opResult === null) return;
        res = convertFromSI(opResult,u1,currentType);
      }
      const opSym = {'+':'+','-':'−','*':'×','/':'÷'}[currentOp];
      html = `<div style="margin-bottom:6px;color:var(--muted);font-size:.85rem;">Arithmetic Result</div>
              <div class="result-value">${fmt(v1)} ${u1} ${opSym} ${fmt(v2)} ${u2} = <strong>${fmt(res)} ${u1}</strong></div>`;
    }

    txt.innerHTML = html;
    box.classList.remove('show');
    void box.offsetWidth; // reflow to re-trigger animation
    box.classList.add('show');
  }

  function doOp(a,b) {
    if (currentOp==='+') return a+b;
    if (currentOp==='-') return a-b;
    if (currentOp==='*') return a*b;
    if (currentOp==='/') {
      if (b===0) { alert('Cannot divide by zero.'); return null; }
      return a/b;
    }
  }

  function fmt(n) {
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n!==0)) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toString();
  }

  // ── Session guard ──────────────────────────────────
  (function() {
    const session = JSON.parse(localStorage.getItem('qm_session') || 'null');
    if (!session) {
      window.location.href = 'index.html';
      return;
    }
    const msg = document.getElementById('welcomeMsg');
    if (msg) msg.textContent = `👋 Hi, ${session.name}`;
  })();

  function logout() {
    localStorage.removeItem('qm_session');
    window.location.href = 'index.html';
  }

  // ── Init ───────────────────────────────────────────
  fillDropdowns();