const postcss = require('postcss')
const prettier = require("prettier");

let plugin = require('../lib/index.js')

async function run(input, output, opts) {
  output = format(output)
  let result = await postcss([plugin(opts)]).process(input, { from: 'index.css' });
  const css = format(result.css)
  // console.log(css)
  expect(css).toBe(output);
}

function format(css) {
  return prettier.format(css, { parser: 'css' })
}

const rulesMap = {
  '#fff': '#000',
  '#AAA': '#dbdbdb'
}

const themeNames = ['light', 'dark']

it("color", async () => {
  await run(`a { color: #fff; }`, `  
  a { }
  .light a {
    color: #fff
  }
  .dark a {
    color: #000
  }`, {
    rulesMap: rulesMap,
    themeNames: themeNames
  })
});

it("borderColor", async () => {
  await run(`a { border: 1px #fff ;}`, `
  a {}
  .light a { border: 1px #fff ;}
  .dark a { border: 1px #000 ;}
  `, {
    rulesMap: rulesMap,
    themeNames: themeNames
  })
});

it("match lowcase", async () => {
  await run(`a { border: 1px #aaa ;}`, `
  a {}
  .light a { border: 1px #aaa ;}
  .dark a { border: 1px #dbdbdb ;}
  `, {
    rulesMap: rulesMap,
    themeNames: themeNames
  })
});

it("@media color", async () => {
  await run(`@media screen { a { color: #fff; }}`, `
  @media screen { 
    a { }
    .light a {
        color: #fff
    }
    .dark a {
        color: #000
    }
  }`, {
    rulesMap: rulesMap,
    themeNames: themeNames
  })
})

it("no transform", async () => {
  await run(`a { color: #fafafa; }`, `a { color: #fafafa; }`, {
    rulesMap: rulesMap,
    themeNames: themeNames
  })
})

it("no transform when no config", async () => {
  await run(`a { color: #fafafa; }`, `a { color: #fafafa; }`)
})