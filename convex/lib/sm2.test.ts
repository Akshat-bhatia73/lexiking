import { describe, expect, it } from "vitest"
import {
  calculateNextReview,
  getDefaultSM2State,
  getRatingLabel,
  getRatingValue,
} from "./sm2"

const MS_PER_DAY = 24 * 60 * 60 * 1000

describe("SM-2 Algorithm", () => {
  describe("getDefaultSM2State", () => {
    it("returns correct default values", () => {
      const state = getDefaultSM2State()
      expect(state.easeFactor).toBe(2.5)
      expect(state.interval).toBe(0)
      expect(state.repetitions).toBe(0)
      expect(state.nextReviewAt).toBeLessThanOrEqual(Date.now())
    })
  })

  describe("calculateNextReview", () => {
    const reviewedAt = 1000000000000

    it("resets on 'Again' rating (0)", () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
      }
      const result = calculateNextReview(state, 0, reviewedAt)

      expect(result.repetitions).toBe(0)
      expect(result.interval).toBe(1)
      expect(result.easeFactor).toBe(2.3)
      expect(result.nextReviewAt).toBe(reviewedAt + 1 * 24 * 60 * 60 * 1000)
    })

    it("resets on 'Hard' rating (2)", () => {
      const state = {
        easeFactor: 2.5,
        interval: 10,
        repetitions: 5,
      }
      const result = calculateNextReview(state, 2, reviewedAt)

      expect(result.repetitions).toBe(0)
      expect(result.interval).toBe(1)
      expect(result.easeFactor).toBe(2.3)
    })

    it("sets interval to 1 on first successful review (Good)", () => {
      const state = getDefaultSM2State()
      const result = calculateNextReview(state, 4, reviewedAt)

      expect(result.repetitions).toBe(1)
      expect(result.interval).toBe(1)
    })

    it("sets interval to 6 on second successful review (Good)", () => {
      const state = {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
      }
      const result = calculateNextReview(state, 4, reviewedAt)

      expect(result.repetitions).toBe(2)
      expect(result.interval).toBe(6)
    })

    it("multiplies interval by easeFactor on subsequent reviews", () => {
      const state = {
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
      }
      const result = calculateNextReview(state, 4, reviewedAt)

      expect(result.repetitions).toBe(3)
      expect(result.interval).toBe(15)
    })

    it("increases ease factor on 'Easy' rating (5)", () => {
      const state = {
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
      }
      const result = calculateNextReview(state, 5, reviewedAt)

      expect(result.easeFactor).toBe(2.6)
    })

    it("maintains ease factor on 'Good' rating (4)", () => {
      const state = {
        easeFactor: 2.5,
        interval: 6,
        repetitions: 2,
      }
      const result = calculateNextReview(state, 4, reviewedAt)

      expect(result.easeFactor).toBe(2.5)
    })

    it("clamps ease factor to minimum of 1.3", () => {
      const state = {
        easeFactor: 1.4,
        interval: 10,
        repetitions: 5,
      }
      const result = calculateNextReview(state, 0, reviewedAt)

      expect(result.easeFactor).toBe(1.3)
    })

    it("does not go below minimum ease factor even with low ratings", () => {
      const state = {
        easeFactor: 1.3,
        interval: 10,
        repetitions: 5,
      }
      const result = calculateNextReview(state, 0, reviewedAt)

      expect(result.easeFactor).toBe(1.3)
    })

    it("uses current timestamp if reviewedAt not provided", () => {
      const state = getDefaultSM2State()
      const beforeCall = Date.now()
      const result = calculateNextReview(state, 4)
      const afterCall = Date.now()

      expect(result.nextReviewAt).toBeGreaterThanOrEqual(
        beforeCall + MS_PER_DAY
      )
      expect(result.nextReviewAt).toBeLessThanOrEqual(afterCall + MS_PER_DAY)
    })
  })

  describe("getRatingLabel", () => {
    it("returns 'Again' for rating 0", () => {
      expect(getRatingLabel(0)).toBe("Again")
    })

    it("returns 'Hard' for rating 2", () => {
      expect(getRatingLabel(2)).toBe("Hard")
    })

    it("returns 'Good' for rating 4", () => {
      expect(getRatingLabel(4)).toBe("Good")
    })

    it("returns 'Easy' for rating 5", () => {
      expect(getRatingLabel(5)).toBe("Easy")
    })

    it("returns 'Unknown' for unknown ratings", () => {
      expect(getRatingLabel(3)).toBe("Unknown")
      expect(getRatingLabel(1)).toBe("Unknown")
      expect(getRatingLabel(99)).toBe("Unknown")
    })
  })

  describe("getRatingValue", () => {
    it("returns correct values for known labels", () => {
      expect(getRatingValue("again")).toBe(0)
      expect(getRatingValue("AGAIN")).toBe(0)
      expect(getRatingValue("Hard")).toBe(2)
      expect(getRatingValue("GOOD")).toBe(4)
      expect(getRatingValue("Easy")).toBe(5)
    })

    it("throws for unknown labels", () => {
      expect(() => getRatingValue("unknown")).toThrow("Unknown rating label")
    })
  })
})
