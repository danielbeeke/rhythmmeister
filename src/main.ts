import './style.css'

document
  .querySelector('#toggle-grid')
  ?.addEventListener('click', () => document.body.classList.toggle('show-grid'))
