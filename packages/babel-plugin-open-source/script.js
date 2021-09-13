if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!event.target.dataset.source) return;
    if (!event.altKey) return;

    const { filename, start } = JSON.parse(event.target.dataset.source)
    window.open('vscode://file' + filename + ':' + start)
  })
}
