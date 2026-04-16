import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// --- Page Load Animation ---
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to let fonts load
  setTimeout(() => {
    initHeroAnimation()
    initScrollAnimations()
    initNavigation()
    initGalleryLightbox()
    initParallax()
    initMenusToggle()
    initReviewsMarquee()
    initEmailPicker()
  }, 100)
})

// Recalculate ScrollTrigger positions once images have loaded.
// Prevents content stuck invisible on mobile when image loads shift page height.
window.addEventListener('load', () => {
  ScrollTrigger.refresh()
})

// Ultimate safety net: force-reveal anything still hidden after 3 seconds.
// ScrollTrigger miscalculations or blocked JS should never leave content invisible.
setTimeout(() => {
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .gallery__item').forEach((el) => {
    const style = getComputedStyle(el)
    if (parseFloat(style.opacity) < 0.1) {
      el.style.opacity = '1'
      el.style.transform = 'none'
    }
  })
}, 3000)

// --- Email Picker (Gmail / Outlook / default / copy) ---
function initEmailPicker() {
  const picker = document.getElementById('emailPicker')
  const trigger = document.getElementById('emailPickerTrigger')
  const menu = document.getElementById('emailPickerMenu')
  const copyBtn = document.getElementById('emailCopyBtn')
  if (!picker || !trigger || !menu) return

  function close() {
    picker.classList.remove('email-picker--open')
    trigger.setAttribute('aria-expanded', 'false')
  }

  function open() {
    picker.classList.add('email-picker--open')
    trigger.setAttribute('aria-expanded', 'true')
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation()
    if (picker.classList.contains('email-picker--open')) {
      close()
    } else {
      open()
    }
  })

  document.addEventListener('click', (e) => {
    if (!picker.contains(e.target)) close()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  if (copyBtn) {
    const label = copyBtn.querySelector('.email-picker__copy-label')
    const originalText = label.textContent
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('emilystabb@gmail.com')
        label.textContent = 'Copied!'
        setTimeout(() => { label.textContent = originalText }, 1800)
      } catch (_) {
        label.textContent = 'Press Cmd+C'
      }
    })
  }
}

// --- Reviews Marquee: auto-scroll + draggable ---
function initReviewsMarquee() {
  const marquee = document.querySelector('.marquee')
  const track = document.querySelector('.marquee__track')
  if (!marquee || !track) return

  // Duplicate track children once more to ensure seamless loop works at any width
  const originals = Array.from(track.children)
  const halfCount = originals.length / 2

  const speed = 0.5 // pixels per frame (~30px/sec at 60fps)
  let rafId = null
  let isDragging = false
  let startX = 0
  let startScroll = 0
  let velocity = 0
  let lastX = 0
  let lastTime = 0
  let momentumId = null

  // Start centred so we can scroll either direction
  requestAnimationFrame(() => {
    marquee.scrollLeft = track.scrollWidth / 4
  })

  function getLoopWidth() {
    return track.scrollWidth / 2
  }

  function wrap() {
    const loop = getLoopWidth()
    if (marquee.scrollLeft >= loop * 1.5) {
      marquee.scrollLeft -= loop
    } else if (marquee.scrollLeft <= loop * 0.5) {
      marquee.scrollLeft += loop
    }
  }

  function tick() {
    if (!isDragging) {
      marquee.scrollLeft += speed
      wrap()
    }
    rafId = requestAnimationFrame(tick)
  }
  tick()

  // Drag handling (pointer events cover mouse + touch)
  let startY = 0
  let pointerActive = false
  let directionDecided = false

  marquee.addEventListener('pointerdown', (e) => {
    pointerActive = true
    directionDecided = e.pointerType === 'mouse' // mouse drags horizontally immediately
    isDragging = e.pointerType === 'mouse'
    startX = e.clientX
    startY = e.clientY
    startScroll = marquee.scrollLeft
    lastX = e.clientX
    lastTime = performance.now()
    velocity = 0
    cancelAnimationFrame(momentumId)
    if (isDragging) {
      marquee.classList.add('is-dragging')
      marquee.setPointerCapture(e.pointerId)
    }
  })

  marquee.addEventListener('pointermove', (e) => {
    if (!pointerActive) return

    // For touch, decide direction on first move — only claim horizontal drags
    if (!directionDecided) {
      const dx = Math.abs(e.clientX - startX)
      const dy = Math.abs(e.clientY - startY)
      if (dx < 6 && dy < 6) return // wait for meaningful movement
      if (dx > dy) {
        isDragging = true
        directionDecided = true
        marquee.classList.add('is-dragging')
        try { marquee.setPointerCapture(e.pointerId) } catch (_) {}
      } else {
        // Vertical scroll — abandon drag, let the page scroll
        pointerActive = false
        return
      }
    }

    if (!isDragging) return
    const dx = e.clientX - startX
    marquee.scrollLeft = startScroll - dx
    wrap()

    const now = performance.now()
    const dt = now - lastTime
    if (dt > 0) {
      velocity = (e.clientX - lastX) / dt
    }
    lastX = e.clientX
    lastTime = now
  })

  function endDrag(e) {
    pointerActive = false
    if (!isDragging) return
    isDragging = false
    marquee.classList.remove('is-dragging')
    try { marquee.releasePointerCapture(e.pointerId) } catch (_) {}

    // Momentum: keep scrolling based on fling velocity, then decay back to auto
    let v = -velocity * 16 // convert px/ms → px/frame
    function momentum() {
      if (Math.abs(v) < speed) return
      marquee.scrollLeft += v
      wrap()
      v *= 0.94
      momentumId = requestAnimationFrame(momentum)
    }
    momentum()
  }

  marquee.addEventListener('pointerup', endDrag)
  marquee.addEventListener('pointercancel', endDrag)

  // Prevent text selection + image drag interfering
  marquee.addEventListener('dragstart', (e) => e.preventDefault())
}

// --- Hero entrance animation ---
function initHeroAnimation() {
  const tl = gsap.timeline({ delay: 0.3 })

  tl.from('.hero__line--decorative:first-of-type', {
    opacity: 0,
    scaleX: 0,
    duration: 0.8,
    ease: 'power2.out',
  })
    .from('.hero__word', {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
    }, '-=0.4')
    .from('.hero__tagline', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.5')
    .from('.hero__line--decorative:last-of-type', {
      opacity: 0,
      scaleX: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.4')
    .from('.hero__location', {
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.3')
    .from('.hero__scroll', {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.2')
    .from('.nav', {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.4')
}

// --- Scroll-triggered reveal animations ---
function initScrollAnimations() {
  // Reveal up (exclude gallery items — they get their own staggered animation)
  gsap.utils.toArray('.reveal-up:not(.gallery__item)').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
    })
  })

  // Reveal left
  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    })
  })

  // Reveal right
  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        toggleActions: 'play none none none',
      },
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    })
  })

  // Stagger gallery items
  const galleryItems = gsap.utils.toArray('.gallery__item')
  galleryItems.forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 98%',
        toggleActions: 'play none none none',
      },
      y: 0,
      opacity: 1,
      duration: 0.7,
      delay: (i % 3) * 0.1,
      ease: 'power2.out',
    })
  })
}

// --- Parallax effects ---
function initParallax() {
  // Hero background parallax
  const heroBg = document.querySelector('.hero__bg img')
  if (heroBg) {
    gsap.to(heroBg, {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 120,
      scale: 1.12,
      ease: 'none',
    })
  }
}

// --- Menus Toggle ---
function initMenusToggle() {
  const toggle = document.getElementById('menusToggle')
  const content = document.getElementById('menusContent')
  if (!toggle || !content) return

  toggle.addEventListener('click', () => {
    const isOpen = content.classList.toggle('menus-elegant__content--open')
    toggle.classList.toggle('menus-elegant__toggle--open', isOpen)
    toggle.setAttribute('aria-expanded', isOpen)
  })
}

// --- Navigation ---
function initNavigation() {
  const nav = document.getElementById('nav')
  const toggle = document.querySelector('.nav__toggle')
  const links = document.querySelector('.nav__links')
  if (!nav || !toggle || !links) return

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('nav--scrolled')
    } else {
      nav.classList.remove('nav--scrolled')
    }
  })

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('nav__links--open')
    toggle.classList.toggle('nav__toggle--active')
    toggle.setAttribute('aria-expanded', isOpen)
  })

  // Close mobile menu on link click
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('nav__toggle--active')
      links.classList.remove('nav__links--open')
    })
  })

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(anchor.getAttribute('href'))
      if (target) {
        const offset = 80
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top: targetPos, behavior: 'smooth' })
      }
    })
  })
}

// --- Gallery Lightbox ---
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = lightbox.querySelector('.lightbox__img')
  const closeBtn = lightbox.querySelector('.lightbox__close')
  const prevBtn = lightbox.querySelector('.lightbox__prev')
  const nextBtn = lightbox.querySelector('.lightbox__next')
  const galleryItems = document.querySelectorAll('.gallery__item img')

  let currentIndex = 0
  const images = Array.from(galleryItems)

  function openLightbox(index) {
    currentIndex = index
    lightboxImg.src = images[index].src
    lightboxImg.alt = images[index].alt
    lightbox.classList.add('lightbox--active')
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    lightbox.classList.remove('lightbox--active')
    document.body.style.overflow = ''
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length
    lightboxImg.src = images[currentIndex].src
    lightboxImg.alt = images[currentIndex].alt
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length
    lightboxImg.src = images[currentIndex].src
    lightboxImg.alt = images[currentIndex].alt
  }

  galleryItems.forEach((img, index) => {
    img.parentElement.addEventListener('click', () => openLightbox(index))
  })

  closeBtn.addEventListener('click', closeLightbox)
  nextBtn.addEventListener('click', showNext)
  prevBtn.addEventListener('click', showPrev)

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox()
  })

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('lightbox--active')) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') showNext()
    if (e.key === 'ArrowLeft') showPrev()
  })
}
