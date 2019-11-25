import _ from 'lodash'

const stringToReg = _.memoize((key) => {
  return key instanceof RegExp ? key : new RegExp(key, 'i');
})

export function matchColor(propValue, key) {
  const regex = stringToReg(key)
  return regex.test(propValue);
}

export function transformToTargetColor(propValue, key, value) {
  const regex = stringToReg(key)
  return propValue.replace(regex, value)
}