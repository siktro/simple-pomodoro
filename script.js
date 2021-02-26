const container = document.getElementById('root')

const groups = [
  getChildrenAsTuple('hours'),
  getChildrenAsTuple('minutes'),
  getChildrenAsTuple('seconds')
]

const config = {
  imgPath: './assets/digits.png',
  unitWidth: 150,
  unitHeight: 190,
  // allow time overflow? 1:30 == 90
  // allow auto increment higher 
  // time format hh:mm:ss
  // hide hours if not clock?
  // hide leading zeros
}

function pipe ( ...fns ) {
  return x => fns.reduce((f, g) => g(f), x)
}

function curry ( fn ) {
  const arity = fn.length
  return function curried (...args) {
    if (args.length >= fn.length) return fn.apply( this, args )
    return (...args2) => curried.apply(this, args.concat(...args2))
  }
}

function setUnitElementUrl( url, elem ) {
  console.log('setting url', url)
  elem.style.backgroundImage = `url(${url})`
  return elem
}

function setUnitElementSet( setPosition, elem ) {
  console.log('setting set')
  elem.style.backgroundPositionY = setPosition
  return elem
}

function setUnitElementValue( valuePosition, elem ) {
  console.log('setting valeu')
  elem.style.backgroundPositionX = valuePosition
  return elem
}

function* getNextRandomSetIndex( setLength ) {
  while (true) {
    yield Math.floor(Math.random() * setLength)
  }
}

function getChildrenAsTuple( id ) {
  const group = document.getElementById(id)
  return [group.firstElementChild, group.lastElementChild]
}

function prepareUnitMap( imgWidth, imgHeight ) {
  const map = { symbols: [], sets: [] }
  for (let w = 0; w < imgWidth; w += config.unitWidth) map.symbols.push(w)
  for (let h = 0; h < imgHeight; h += config.unitHeight) map.sets.push(h)
  return map
}

function initUnits( unitMap ) {
  const unitsArr = Array.from(document.querySelectorAll('[data-unit-type]'))
  const imgUrl = `url(${config.imgPath})`

  const basicSetupFn = x => pipe(
    curry(setUnitElementUrl)(imgUrl),
    curry(setUnitElementSet)(0),
    curry(setUnitElementValue)(x)
  )

  unitsArr
    .filter(elem => elem.dataset.unitType === 'digit')
    .forEach(basicSetupFn(0))

  unitsArr
    .filter(elem => elem.dataset.unitType === 'divider')
    .forEach(basicSetupFn(10))
}

const img = new Image()
img.addEventListener('load', () => {
  const unitMap = prepareUnitMap(img.width, img.height)

  initUnits(unitMap)

  function changeDigitStyle ( elem, setIdx, digit ) {
    elem.style.backgroundPosition = unitMap[setIdx][+digit]
  }

  // setInterval(() => {
  //   new Date()
  //     .toLocaleTimeString("ru-RU")
  //     .split(':')
  //     .forEach((str, idx) => {
  //       groups[idx]
  //         .forEach((elem, n) => {
  //           changeDigitStyle(elem, gen.next().value, str[n])
  //         })
  //     })
  // }, 250)
})

img.src = config.imgPath

