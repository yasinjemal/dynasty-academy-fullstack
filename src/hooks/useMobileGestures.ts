import { useEffect, useRef, useCallback } from 'react'

interface GestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDoubleTapLeft?: () => void
  onDoubleTapRight?: () => void
  onPinchIn?: () => void
  onPinchOut?: () => void
  onShake?: () => void
  onLongPress?: (x: number, y: number) => void
}

interface UseMobileGesturesOptions extends GestureHandlers {
  enabled?: boolean
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
}

export function useMobileGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: UseMobileGesturesOptions = {}
) {
  const {
    enabled = true,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    onSwipeLeft,
    onSwipeRight,
    onDoubleTapLeft,
    onDoubleTapRight,
    onPinchIn,
    onPinchOut,
    onShake,
    onLongPress,
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTapRef = useRef<{ x: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialPinchDistanceRef = useRef<number | null>(null)
  const lastShakeTimeRef = useRef(0)
  const shakeDetectionRef = useRef<{ x: number; y: number; z: number } | null>(null)

  // Swipe detection
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      // Long press detection
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current && onLongPress) {
          onLongPress(touchStartRef.current.x, touchStartRef.current.y)
        }
      }, longPressDelay)
    },
    [enabled, onLongPress, longPressDelay]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) return

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Swipe detection (horizontal only)
      if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < 100 && deltaTime < 300) {
        if (deltaX > 0) {
          onSwipeRight?.()
        } else {
          onSwipeLeft?.()
        }
        touchStartRef.current = null
        return
      }

      // Double tap detection
      const now = Date.now()
      if (lastTapRef.current && now - lastTapRef.current.time < doubleTapDelay) {
        // Double tap detected
        const tapX = touchStartRef.current.x
        const screenMidpoint = window.innerWidth / 2

        if (tapX < screenMidpoint) {
          onDoubleTapLeft?.()
        } else {
          onDoubleTapRight?.()
        }

        lastTapRef.current = null
      } else {
        lastTapRef.current = { x: touchStartRef.current.x, time: now }
      }

      touchStartRef.current = null
    },
    [enabled, swipeThreshold, doubleTapDelay, onSwipeLeft, onSwipeRight, onDoubleTapLeft, onDoubleTapRight]
  )

  // Pinch detection
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length !== 2) {
        initialPinchDistanceRef.current = null
        return
      }

      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (initialPinchDistanceRef.current === null) {
        initialPinchDistanceRef.current = distance
        return
      }

      const scale = distance / initialPinchDistanceRef.current

      if (scale > 1.2) {
        onPinchOut?.()
        initialPinchDistanceRef.current = distance
      } else if (scale < 0.8) {
        onPinchIn?.()
        initialPinchDistanceRef.current = distance
      }
    },
    [enabled, onPinchIn, onPinchOut]
  )

  // Shake detection
  const handleDeviceMotion = useCallback(
    (e: DeviceMotionEvent) => {
      if (!enabled || !onShake) return

      const acceleration = e.accelerationIncludingGravity
      if (!acceleration) return

      const now = Date.now()
      if (now - lastShakeTimeRef.current < 1000) return // Debounce

      const { x = 0, y = 0, z = 0 } = acceleration

      if (shakeDetectionRef.current) {
        const deltaX = Math.abs(x - shakeDetectionRef.current.x)
        const deltaY = Math.abs(y - shakeDetectionRef.current.y)
        const deltaZ = Math.abs(z - shakeDetectionRef.current.z)

        if (deltaX + deltaY + deltaZ > 30) {
          onShake()
          lastShakeTimeRef.current = now
        }
      }

      shakeDetectionRef.current = { x, y, z }
    },
    [enabled, onShake]
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element || !enabled) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })

    if (onShake && typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion)
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('devicemotion', handleDeviceMotion)

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [enabled, elementRef, handleTouchStart, handleTouchEnd, handleTouchMove, handleDeviceMotion, onShake])

  return null
}
