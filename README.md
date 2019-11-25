#  postcss-plugin-extract-theme

-------------------------------

extract target color and  extract target color  for genrate theme.

## Example

```css
.test {
  color: #fff;
}
```

will be transform to `light theme` and `dark theme` :

```css
.test {
}

.test.light {
  color: #fff;
}

.test.dark {
	color: #000;
}
```

# Installation

```sh
npm install postcss-plugin-extract-theme --save-dev
```

## Usage

config `postcss.config.js`

```js
// postcss.config.js
module.export = {
  plugins: {
     'postcss-plugin-extract-theme': {
        rulesMap: {
          '#fff': '#000',
        },
        themeNames: ['light', 'dark'],
        output() {
          // something
        }
     }
  } 
}
```

