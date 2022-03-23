if (typeof document !== 'undefined') {
  const insertCSS = () => {
    const cssExists = document.head.querySelector('#open-source');
    if (!cssExists) {
      const cssContainer = document.createElement('style');
      cssContainer.id = 'open-source';
      document.head.append(cssContainer);
      cssContainer.append(`
        [data-hovering] {
          box-shadow: 0px 0px 0px 2px #0969da !important;
        }
      `);
    }
  };
  insertCSS();

  let modifier = false;

  document.addEventListener('keydown', (event) => {
    if (event.altKey) modifier = true;
  });
  document.addEventListener('keyup', (event) => {
    if (event.key === 'Alt') {
      modifier = false;

      document.querySelectorAll('[data-hovering]').forEach((element) => {
        element.removeAttribute('data-hovering');
      });
    }
  });

  document.addEventListener('mouseover', (event) => {
    if (modifier) event.target.setAttribute('data-hovering', 'true');
  });
  document.addEventListener('mouseout', (event) => {
    if (modifier) event.target.removeAttribute('data-hovering');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.dataset.source) return;
    if (!event.altKey) return;

    event.preventDefault();
    modifier = false;
    const { url } = JSON.parse(event.target.dataset.source);
    window.open(url);
  });
}
