let fadeIn = () => {
    if (audio.volume < 1) {
        if (audio.volume > 1 - fadeInStep) {
            audio.volume = 1
        } else {
            audio.volume += fadeInStep 
            fadeInTimeout = window.setTimeout(fadeIn, fadeInSpeed)
        }
    }
}

let fadeOut = () => {
    if (fadeInTimeout) {
        window.clearTimeout(fadeInTimeout)
        fadeInTimeout = null
    }

    if (graceTimeout) {
        window.clearTimeout(graceTimeout)
        graceTimeout = null
    }

    if (audio.paused) {
        loadingTab = null
        return
    }

    if (shouldFadeOut && audio.volume > 0) {
        if (audio.volume < fadeOutStep) {
            audio.volume = 0
            loadingTab = null
            audio.pause()
            
            if (shouldRewind) {
                audio.currentTime = 0
            }
        } else {
            audio.volume -= fadeOutStep
            window.setTimeout(fadeOut, fadeOutSpeed)
        }
    } else {
        loadingTab = null
        audio.pause()

        if (shouldRewind) {
            audio.currentTime = 0
        }
    }
}

const shouldFadeIn = true
const shouldFadeOut = true
const fadeInSpeed = 25
const fadeOutSpeed = 25
const fadeInStep = 0.01
const fadeOutStep = 0.01
const waitBeforePlaying = 2000
const startAtRandomPosition = true
const shouldRewind = false

let fadeInTimeout, graceTimeout, loadingTab = null

let audioPath = chrome.extension.getURL('wii.mp3')

let audio = new Audio(audioPath)
audio.loop = true

if (startAtRandomPosition) {
    audio.addEventListener('loadedmetadata', () => {
        audio.currentTime = Math.random() * audio.duration
    })
}

chrome.webNavigation.onBeforeNavigate.addListener((info) => {
    if (loadingTab === null && info.frameId === 0) {
        loadingTab = info.tabId
        graceTimeout = window.setTimeout(() => {
            if (shouldFadeIn) {
                audio.volume = 0
                audio.play().then(fadeIn)
            } else {
                audio.volume = 1
                audio.play()
            }
        }, waitBeforePlaying)
    }
})

chrome.tabs.onUpdated.addListener((tabId, info) => {
    if (loadingTab === tabId && info.status === 'complete') {
        fadeOut()
    }
})
