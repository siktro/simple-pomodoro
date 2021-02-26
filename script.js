// one config to rule them all
const config = {
  imgPath: './assets/digits.png',
  unitWidth: 150,
  unitHeight: 190,
  animationTime: 0.5,
  // allow time overflow? 1:30 == 90
  // allow auto increment higher 
  // time format hh:mm:ss
  // hide hours if not clock?
  // hide leading zeros
}

const filterByUnitType = filter => elem => elem.dataset.unitType === filter

function loadImage( url ) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject('Unable to load an image'))
    img.src = url
  })
}

function calcUnitPivots( width, height ) {
  const wp = []
  const hp = []
  for (let w = 0; w < width; w += config.unitWidth) wp.push(w)
  for (let h = 0; h < height; h += config.unitHeight) hp.push(h)
  return [ wp, hp ]
}

function generateCssAnimations( heightPivots ) {
  const result = []

  // "head to tail" shift
  const shiftArray = arr => {
    const [head, ...tail] = arr
    tail.push(head)
    return tail
  }

  // generate css animations with different steps
  // each animation will start one step "later" than previous
  let prev = heightPivots
  const fraction = Math.ceil(100 / heightPivots.length) // each step amount
  for (let i = 0; i < heightPivots.length; ++i) {

    const domStr = `
      @keyframes#set-cycle-${i} {
        ${prev.reduce((acc, el, idx) => {
          acc += `${Math.min((idx+1) * fraction, 100)}% { background-position-y: ${el}px; }`
          return acc
        }, '')} 
      }
    `.replace(/\s/gm, '').replace(/#/, ' ') // clear rules a bit, not really necessary

    result.push(domStr)
    prev = shiftArray(prev)
  }

  return result
}

function createEmptyStyleSheet() {
  const css = document.createElement('style')
  document.head.appendChild(css)
  return css.sheet
}

function attachAnimation( elementsArr, rulesAmount ) {
  const postConfig = `${config.animationTime}s infinite steps(1, jump-start)`

  const generateAnimationName = x => `set-cycle-${x % rulesAmount}`
  const generateConfigStr = x => `${generateAnimationName(x)} ${postConfig}`

  // attach animation to digit symbols
  elementsArr
    .filter(filterByUnitType('digit'))
    .forEach((elem, i) => elem.style.animation = generateConfigStr(i))
  
  elementsArr
    .filter(filterByUnitType('divider'))
    .forEach((elem, i) => elem.style.animation = generateConfigStr(i))
}

function fixNonDigitSymbols( elementsArr, widthPivots ) {
  elementsArr
    .filter(filterByUnitType('divider'))
    .forEach(elem => elem.style.backgroundPositionX = `-${widthPivots[10]}px`)
}

function displayClock( groups, widthPivots ) {
  const date = new Date()
  const parts = [
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ].map(elem => elem.toString().padStart(2, '0'))

  groups.forEach(
    (group, idx) => {
      const [tens, ones] = group
      const part = parts[idx]

      tens.style.backgroundPositionX = `-${widthPivots[+part[0]]}px`
      ones.style.backgroundPositionX = `-${widthPivots[+part[1]]}px`
    }
  )
}

function attachListeners() {
  const root = document.getElementById('root')
  const controls = document.getElementById('controls')

  root.addEventListener('mouseenter', () => {
    // if (!document.hasFocus()) return
    console.log('hello')
    // controls.style.display = 'block'
  })

  root.addEventListener('mouseleave', () => {
    console.log('bye')
    // controls.style.display = ''
  })
}

async function initApplication() {
  // loading img with numbers and other symbols
  const img = await loadImage( config.imgPath )
  const { width, height } = img

  const [ widthPivots, heightPivots ] = calcUnitPivots( width, height )

  // array of css rules
  const cssAnimations = generateCssAnimations( heightPivots )

  // creating stylesheet for custom animations
  const styleSheet = createEmptyStyleSheet()
  cssAnimations.forEach(rule => styleSheet.insertRule(rule))

  const unitElements = Array.from(document.querySelectorAll('[data-unit-type]'))
  attachAnimation( unitElements, heightPivots.length )
  fixNonDigitSymbols( unitElements, widthPivots )

  const groups = ['hours', 'minutes', 'seconds'].reduce((arr, id) => {
    const group = document.getElementById(id)
    arr.push([group.firstElementChild, group.lastElementChild])
    return arr
  }, [])
}

// initApplication()
//   .then(value => {
//     attachListeners()
//   })