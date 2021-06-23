// Grabs an element
const $ = id => document.getElementById(id)

// Converts between a number of seconds and a minute:second string
const s2m = s => {
  const mins = '' + Math.floor(s / 60)
  const secs = ('00' + (s % 60)).slice(-2)
  return mins + ':' + secs
}
const m2s = m => {
  const mins = ~~m.split(':')[0]
  const secs = ~~m.split(':')[1]
  return mins * 60 + secs;
}

// Switches from the countdown state to the paused state
let clock = null
const stop = () => {
  clearInterval(clock)

  $('edit').hidden = true
  $('stop').hidden = true
  $('reset').hidden = false
  $('start').hidden = false
}

// Switches from the paused/alarm state to the reset state
let total = 65
const reset = () => {
  clearInterval(clock)
  $('time').innerText = s2m(total)

  $('edit').hidden = false
  $('stop').hidden = true
  $('reset').hidden = true
  $('start').hidden = false

  $('bell').pause()
  $('bell').currentTime = 0
}

// Handle a second passing while in the countdown state
const step = () => {
  const time = m2s($('time').innerText)
  
  // If there's still time, carry on in the countdown state
  if (time > 0) {
    $('time').innerText = s2m(time - 1)
  }
  
  // If the end is reached, switch to the alarm state
  else {
    clearInterval(clock)

    $('edit').hidden = true
    $('stop').hidden = true
    $('reset').hidden = false
    $('start').hidden = true

    $('bell').play()
    clock = setInterval(() => $('bell').play(), 2000)
  }
}

// Switch from the reset/paused state to the countdown state
const start = () => {
  clock = setInterval(step, 1000)

  $('edit').hidden = true
  $('stop').hidden = false
  $('reset').hidden = true
  $('start').hidden = true
}

// Switch from the reset state to the total time editor
const edit = () => {
}

// Isomorphic touch and mouse event handlers (Dylan Sharhon)
function addHandlers (element, handlers) {
  const { onPress, onRelease, onHold, holdDelay = 750 } = handlers

  let holdTimeout = null

  const release = event => {
    event.preventDefault()
    if (onHold) clearTimeout(holdTimeout)
    if (onRelease) onRelease(element)
  }

  const press = event => {
    event.preventDefault()
    if (onHold) {
      clearTimeout(holdTimeout)
      holdTimeout = setTimeout(() => onHold(element), holdDelay)
    }
    if (onPress) onPress(element)
  }

  element.addEventListener('touchstart', press)
  element.addEventListener('mousedown', press)
  element.addEventListener('touchend', release)
  element.addEventListener('mouseup', release)
}

// Start up
try {

  // Cache PWA assets
  navigator.serviceWorker.register('cache.js')
  
  // Register button functions
  addHandlers($('edit'), { onPress: edit })
  addHandlers($('stop'), { onPress: stop })
  addHandlers($('reset'), { onPress: reset })
  addHandlers($('start'), { onPress: start })
  
  // Start from the reset state
  reset()
} catch (e) {
  alert(e)
}