(() => {
  'use strict';

  const productCents = 39700;
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = cents => currency.format(cents / 100);
  const quoteApi = document.querySelector('[data-frete-api]').dataset.freteApi.trim();
  const form = document.getElementById('quote-form');
  const postalCode = document.getElementById('cep');
  const button = form.querySelector('button');
  const status = document.getElementById('quote-status');
  const summary = document.getElementById('quote-summary');
  const email = document.getElementById('email-order');
  const emailAddress = 'mailto:ruadofilho@gmail.com?subject=' + encodeURIComponent('Compra direta do mini piano');
  let pending;

  function updateEmail(cep, shippingCents) {
    const lines = ['Olá! Quero comprar um mini piano por Pix.', 'Pianinho: ' + money(productCents) + '.'];
    if (cep.length === 8) lines.push('CEP de entrega: ' + cep.slice(0, 5) + '-' + cep.slice(5) + '.');
    if (Number.isInteger(shippingCents)) {
      lines.push('SEDEX cotado: ' + money(shippingCents) + '.', 'Total com frete: ' + money(productCents + shippingCents) + '.');
    }
    lines.push('Podem confirmar o pedido e me enviar os dados para o Pix?');
    email.href = emailAddress + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  postalCode.addEventListener('input', () => {
    pending?.abort();
    pending = undefined;
    button.disabled = false;
    summary.hidden = true;
    status.textContent = '';
    const digits = postalCode.value.replace(/\D/g, '').slice(0, 8);
    postalCode.value = digits.length > 5 ? digits.slice(0, 5) + '-' + digits.slice(5) : digits;
    updateEmail(digits);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const cep = postalCode.value.replace(/\D/g, '');
    if (!/^\d{8}$/.test(cep)) return;
    summary.hidden = true;
    updateEmail(cep);

    if (!quoteApi) {
      status.textContent = 'A cotação on-line ainda não está disponível. Seu CEP já está no pedido por e-mail.';
      return;
    }

    pending?.abort();
    const request = new AbortController();
    pending = request;
    const timeout = setTimeout(() => request.abort(), 12000);
    button.disabled = true;
    status.textContent = 'Consultando o SEDEX…';
    try {
      const url = new URL('/frete', quoteApi);
      url.searchParams.set('cep', cep);
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw Error('Cotação indisponível');
      const { shippingCents } = await response.json();
      if (!Number.isSafeInteger(shippingCents) || shippingCents <= 0) throw Error('Cotação inválida');
      if (pending !== request) return;

      document.getElementById('product-price').textContent = money(productCents);
      document.getElementById('shipping-price').textContent = money(shippingCents);
      document.getElementById('order-total').textContent = money(productCents + shippingCents);
      summary.hidden = false;
      status.textContent = 'Frete SEDEX calculado para ' + postalCode.value + '.';
      updateEmail(cep, shippingCents);
    } catch {
      if (pending === request) status.textContent = 'O SEDEX está indisponível agora. Você pode pedir a cotação por e-mail.';
    } finally {
      clearTimeout(timeout);
      if (pending === request) {
        pending = undefined;
        button.disabled = false;
      }
    }
  });
  updateEmail('');
})();
