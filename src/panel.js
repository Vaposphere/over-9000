function l() {
  console.info('testing');
  document.body.insertAdjacentHTML('beforeend', 'quack');
};

document.addEventListener('DOMContentLoaded', l, true);
