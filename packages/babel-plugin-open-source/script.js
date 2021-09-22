(function () {
  
  // Element being clicked might not have the dataset source on it directly.
  // Get the nearest available in the tree
  // e.g. this happens for Chakra UI Components.
  function getSource(element) {
    while (element && !element.dataset.source) {
      element = element.parentElement;
    }

    return element ? element.dataset.source : null;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', (event) => {
      if (!event.altKey) return;
      let source = getSource(event.target)
      if (!source) return;

      event.preventDefault();
      const { filename, start } = JSON.parse(source)
      window.open('vscode://file/' + filename + ':' + start)
    }, true)
  }
})();