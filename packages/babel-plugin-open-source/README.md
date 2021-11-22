<p align="center">
  <img src="https://github.com/siddharthkp/babel-plugin-open-source/blob/main/demo.gif?raw=true" />
  <br><br>
  <b>Alt + Click on rendered JSX to open it's source code in VSCode</b>
  <br><br>
</p>

&nbsp;

#### install

```
yarn add babel-plugin-open-source --dev
```

&nbsp;

#### usage

Add the plugin to your babel config.

```diff
// .babelrc
{
   "plugins": [
      "babel-plugin-open-source",
      "editor:"vscode", // optional, default: "vscode". options: vscode | vscode-insiders | sublime | atom | phpstorm
    ]
}
```

If folks in your team use different editors, you can customise the editor just for you by adding the key `BABEL_OPEN_SOURCE_EDITOR` in your `.env` file.

---

 Docs for changing babel config: [Nextjs](https://nextjs.org/docs/advanced-features/customizing-babel-config) | [create react app](https://github.com/timarney/react-app-rewired)

&nbsp;

#### like it?

:star: this repo

&nbsp;

#### license

MIT © [siddharthkp](https://github.com/siddharthkp)
