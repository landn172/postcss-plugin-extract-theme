import * as postcss from "postcss";
import _ from 'lodash'
import { matchColor, transformToTargetColor } from "./color";

module.exports = postcss.plugin("postcss-plugin-extract-theme", (options = {}) => {

  /**
   *  rulesMap:
   *    theme color mapping
   *  themeNames:
   *    theme name
   *  output:
   *    a function can output this plugin some info
   * */
  const { rulesMap = {}, themeNames = [], output = (() => { }) } = options;

  const ruleMappingFunc = generateRuleMappingFunc(rulesMap);
  return root => {
    // cache  postcss rule for replacing
    const ruleCacheMap = new Map();
    const outputResult = new Map();
    root.walkRules(rule => {
      if (ruleCacheMap.has(rule.selector)) {
        const decl = ruleCacheMap.get(rule.selector);
        decl.forEach(({ prop, value }) => {
          rule.append({ prop, value });
        });
        ruleCacheMap.delete(rule.selector);
        return;
      }
      let extractDecl = [];
      // Transform each rule here
      rule.walkDecls(decl => {
        const { value, prop } = decl;
        const { isMatch } = ruleMappingFunc(value);
        if (isMatch) {
          extractDecl.push(decl);
          const nodes = decl.parent.nodes;
          const idx = nodes.findIndex(node => node === decl);
          if (idx >= 0) {
            nodes.splice(idx, 1);
          }
        }
      });

      if (extractDecl.length) {
        const eSelector = `${rule.selector}.${themeNames[0]}`;
        extractDecl = extractDecl.map(decl => ({ prop: decl.prop, value: decl.value }))
        ruleCacheMap.set(eSelector, extractDecl);
        rule.parent.append({ selector: eSelector });

        const dSelector = `${rule.selector}.${themeNames[1]}`;
        ruleCacheMap.set(dSelector, extractDecl.map((decl) => {
          return {
            prop: decl.prop,
            value: ruleMappingFunc(decl.value).propValue
          }
        }));
        rule.parent.append({ selector: dSelector });
        // output result
        if (outputResult.has(rule.selector)) {
          const decls = outputResult.get(rule.selector);
          decls.push(...extractDecl);
          outputResult.set(rule.selector, decls)
        } else {
          outputResult.set(rule.selector, extractDecl)
        }
      }
    });

    output({
      file: root.source.input.file,
      outputResult
    })
  };
});

function generateRuleMappingFunc(rulesMap) {
  if (typeof rulesMap === 'function') {
    return _.memoize(rulesMap);
  }
  return _.memoize((value) => {
    return getTargetProp(value, rulesMap);
  })
}

function getTargetProp(propValue, rulesMap) {
  const keys = Object.keys(rulesMap);
  for (const key of keys) {
    if (matchColor(propValue, key)) {
      const value = rulesMap[key];
      return {
        isMatch: true,
        propValue: transformToTargetColor(propValue, key, value)
      };
    }
  }
  return {
    isMatch: false,
    propValue: propValue
  }
}

