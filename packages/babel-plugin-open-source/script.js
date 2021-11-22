if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!event.target.dataset.source) return;
    if (!event.altKey) return;

    event.preventDefault();
    const { url } = JSON.parse(event.target.dataset.source)
    window.open(url)
  })
}
