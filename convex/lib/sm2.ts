/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * Rating values:
 * - 0 (Again): Complete failure, couldn't recall
 * - 2 (Hard): Significant difficulty, partial recall
 * - 4 (Good): Correct with some hesitation
 * - 5 (Easy): Perfect, instant recall
 */

export interface SM2State {
  easeFactor: number
  interval: number
  repetitions: number
}

export interface SM2Result extends SM2State {
  nextReviewAt: number
}

const MIN_EASE_FACTOR = 1.3
const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Calculate the next review state based on the current state and rating.
 */
export function calculateNextReview(
  state: SM2State,
  rating: number,
  reviewedAt: number = Date.now()
): SM2Result {
  const { easeFactor, interval, repetitions } = state

  let newRepetitions: number
  let newInterval: number
  let newEaseFactor: number

  if (rating < 3) {
    // Failed recall - reset
    newRepetitions = 0
    newInterval = 1 // 1 day
    // Decrease ease factor
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2)
  } else {
    // Successful recall
    newRepetitions = repetitions + 1

    if (newRepetitions === 1) {
      newInterval = 1 // First successful review: 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6 // Second successful review: 6 days
    } else {
      // Subsequent reviews: previous interval * ease factor
      newInterval = Math.round(interval * easeFactor)
    }

    // Update ease factor using SM-2 formula
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    newEaseFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)
    )
  }

  // Calculate next review timestamp
  const nextReviewAt = reviewedAt + newInterval * MS_PER_DAY

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}

/**
 * Get default SM-2 state for a new word.
 */
export function getDefaultSM2State(): SM2State & { nextReviewAt: number } {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: Date.now(), // Due immediately for first review
  }
}

/**
 * Get rating label from rating value.
 */
export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 0:
      return "Again"
    case 2:
      return "Hard"
    case 4:
      return "Good"
    case 5:
      return "Easy"
    default:
      return "Unknown"
  }
}

/**
 * Get rating value from label.
 */
export function getRatingValue(label: string): number {
  switch (label.toLowerCase()) {
    case "again":
      return 0
    case "hard":
      return 2
    case "good":
      return 4
    case "easy":
      return 5
    default:
      throw new Error(`Unknown rating label: ${label}`)
  }
}
