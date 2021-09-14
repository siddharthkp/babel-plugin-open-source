if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (!event.target.dataset.source) return;
    if (!event.altKey) return;

    const { filename, start } = JSON.parse(event.target.dataset.source);
    const createFileUrl = window.createBabelPluginOpenSourceFileUrl || ({ filename, start }) => `vscode://file${filename}:${start}`;
    window.open(createFileUrl({ filename, start }));
  })
}
