const tailoringServices = [
  {name:'Formal Shirt', price:650}, {name:'Formal Pant', price:800},
  {name:'Kurta', price:800}, {name:'Modi Jacket', price:1600},
  {name:'Jacket / Blazer', price:3600}, {name:'2-Piece Suit', price:4200},
  {name:'Jodhpuri Suit', price:4500}, {name:'3-Piece Suit', price:5500}
];
function calculateBooking(quantities) {
  const subtotal = tailoringServices.reduce((sum, service, i) => sum + service.price * 100 * quantities[i], 0);
  const gst = Math.round(subtotal * 5 / 100);
  return {subtotal, gst, total:subtotal + gst};
}
function normalizeMobile(value) {
  const digits = value.replace(/[\s()+-]/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}
const bookingMoney = paise => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR'}).format(paise / 100);
function bookingMessage(name, mobile, quantities, fabric) {
  const amounts = calculateBooking(quantities);
  const lines = tailoringServices.flatMap((service, i) => quantities[i] ? [`${service.name} × ${quantities[i]} @ ${bookingMoney(service.price * 100)} = ${bookingMoney(service.price * 100 * quantities[i])}`] : []);
  return ['Hello Friends Clothes and Tailor, I would like to book stitching services.', '', `Name: ${name}`, `Mobile: +91 ${mobile}`, '', ...lines, '', `Stitching subtotal: ${bookingMoney(amounts.subtotal)}`, `GST (5%): ${bookingMoney(amounts.gst)}`, `Total stitching estimate: ${bookingMoney(amounts.total)}`, '', fabric === 'own' ? 'Fabric: I will bring my own fabric.' : 'Fabric: I will buy fabric from your store. Fabric cost is separate and not included above.', '', 'Please confirm my booking and final charges.'].join('\n');
}
if (typeof document !== 'undefined') {
  const form = document.getElementById('booking-form');
  const list = document.getElementById('service-list');
  const quantities = tailoringServices.map(() => 0);
  const error = document.getElementById('booking-error');
  const summary = document.getElementById('summary-items');
  const submit = document.getElementById('submit-booking');
  const mobile = document.getElementById('customer-mobile');
  const customerName = document.getElementById('customer-name');
  const rows = tailoringServices.map((service, i) => {
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML = `<div><h3>${service.name}</h3><p>${bookingMoney(service.price * 100)} + 5% GST</p></div><div class="quantity"><button type="button" aria-label="Decrease ${service.name} quantity">−</button><input type="number" min="0" max="99" step="1" value="0" inputmode="numeric" aria-label="${service.name} quantity"><button type="button" aria-label="Increase ${service.name} quantity">+</button></div>`;
    const input = row.querySelector('input');
    const buttons = row.querySelectorAll('button');
    const sync = () => {
      input.setCustomValidity('');
      const value = Number(input.value);
      const valid = input.value !== '' && Number.isInteger(value) && value >= 0 && value <= 99;
      if (!valid) input.setCustomValidity('Enter a whole quantity from 0 to 99.');
      quantities[i] = valid ? value : 0;
      buttons[0].disabled = valid && value === 0;
      buttons[1].disabled = valid && value === 99;
      update();
    };
    input.addEventListener('input', sync);
    buttons.forEach((button, direction) => button.addEventListener('click', () => {
      input.value = Math.max(0, Math.min(99, quantities[i] + (direction ? 1 : -1)));
      sync();
    }));
    buttons[0].disabled = true;
    list.append(row);
    return row;
  });
  function update() {
    error.textContent = '';
    summary.replaceChildren();
    tailoringServices.forEach((service, i) => {
      if (!quantities[i]) return;
      const line = document.createElement('div');
      line.className = 'summary-item';
      const label = document.createElement('span');
      label.textContent = `${service.name} × ${quantities[i]}`;
      const price = document.createElement('strong');
      price.textContent = bookingMoney(service.price * quantities[i] * 100);
      line.append(label, price);
      summary.append(line);
    });
    if (!quantities.some(Boolean)) summary.textContent = 'Choose a service to begin your booking.';
    const amounts = calculateBooking(quantities);
    ['subtotal','gst','total'].forEach(key => document.getElementById(key).textContent = bookingMoney(amounts[key]));
    const fabric = form.querySelector('input[name="fabric"]:checked')?.value;
    document.getElementById('fabric-note').textContent = fabric === 'store' ? 'Fabric cost is extra and will be confirmed in store. This total covers stitching and its GST only.' : fabric === 'own' ? 'Your own fabric · stitching and 5% GST included.' : 'Select your fabric preference.';
    submit.disabled = !quantities.some(Boolean);
  }
  document.getElementById('service-search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    // Keep invalid inputs visible so their validation messages remain reachable.
    rows.forEach((row, i) => row.hidden = !tailoringServices[i].name.toLowerCase().includes(query) && row.querySelector('input').validity.valid);
    document.getElementById('no-results').hidden = rows.some(row => !row.hidden);
  });
  form.querySelectorAll('input[name="fabric"]').forEach(input => input.addEventListener('change', update));
  mobile.addEventListener('input', () => mobile.setCustomValidity(''));
  customerName.addEventListener('input', () => customerName.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const normalized = normalizeMobile(mobile.value);
    customerName.setCustomValidity(customerName.value.trim() ? '' : 'Please enter your name.');
    mobile.setCustomValidity(normalized ? '' : 'Enter a valid 10-digit Indian mobile number.');
    if (!form.reportValidity()) return;
    if (!quantities.some(Boolean)) { error.textContent = 'Select at least one service.'; return; }
    const fabric = form.querySelector('input[name="fabric"]:checked').value;
    const message = bookingMessage(customerName.value.trim(), normalized, quantities, fabric);
    window.location.assign('https://wa.me/919819898783?text=' + encodeURIComponent(message));
  });
  update();
}
