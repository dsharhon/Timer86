// Tools ///////////////////////////////////////////////////////////////////////
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

// Timer mode //////////////////////////////////////////////////////////////////

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
let total = localStorage.getItem('time') || 60
const reset = () => {
  clearInterval(clock)
  $('time').innerText = s2m(total)

  $('edit').hidden = false
  $('stop').hidden = true
  $('reset').hidden = true
  $('start').hidden = false

  $('alarm').pause()
  $('alarm').currentTime = 0
  $('time').classList.remove('blinking')
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

    $('alarm').play()
    clock = setInterval(() => $('alarm').play(), 2000)
    $('time').classList.add('blinking')
  }
}

// Switch from the reset/paused state to the countdown state
const start = () => {
  clock = setInterval(step, 1000)

  $('beep').play()

  $('edit').hidden = true
  $('stop').hidden = false
  $('reset').hidden = true
  $('start').hidden = true
}

// Switch from the reset state to the editor state
const edit = () => {
  $('timer').hidden = true
  $('editor').hidden = false
}

// Editor //////////////////////////////////////////////////////////////////////

// Switch from the editor UI to the timer UI
const ok = () => {

  // Convert "editor time" to actual time (carry anything above 59 seconds)
  total = m2s($('time').innerText)
  $('time').innerText = s2m(total)
  localStorage.setItem('time', total)

  $('timer').hidden = false
  $('editor').hidden = true
}

// Delete a time decimal
const clear = () => {
  $('time').innerText = '0:00'
}

// Add a time decimal, allowing > 59 seconds in the seconds digits
const add = button => {
  const digits = $('time').innerText.split(':').join('') + button.innerText
  if (digits.length > 5) return
  const mins = digits.slice(!~~digits[0], digits.length - 2)
  const secs = digits.slice(-2)
  $('time').innerText = mins + ':' + secs
}

// Start up ////////////////////////////////////////////////////////////////////
try {

  // Cache PWA assets
  navigator.serviceWorker.register('cache.js')

  // Register button functions
  addHandlers($('edit'), { onPress: edit })
  addHandlers($('stop'), { onPress: stop })
  addHandlers($('reset'), { onPress: reset })
  addHandlers($('start'), { onPress: start })
  addHandlers($('ok'), { onPress: ok })
  addHandlers($('clear'), { onPress: clear })

  for (let i = 0; i < 10; i++) addHandlers($('p' + i), { onPress: add })

  // Start from the reset state
  reset()
} catch (e) {
  alert(e)
}
