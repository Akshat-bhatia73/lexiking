import { v } from "convex/values"
import { action } from "./_generated/server"

interface EnrichedWord {
  definition: string
  part_of_speech: string
  pronunciation: string
  examples: Array<string>
  synonyms: Array<string>
  antonyms: Array<string>
  etymology: string
}

export const enrichWord = action({
  args: {
    word: v.string(),
  },
  handler: async (_ctx, args): Promise<EnrichedWord> => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured")
    }

    const prompt = `You are a dictionary assistant. Provide detailed information about the word "${args.word}" in JSON format.

Return ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:
- definition: a clear, concise definition
- part_of_speech: the part of speech (noun, verb, adjective, adverb, etc.)
- pronunciation: IPA pronunciation notation (e.g., /ˈwɜːrd/)
- examples: an array of 2-3 example sentences using the word
- synonyms: an array of 3-5 synonyms (or empty array if none)
- antonyms: an array of 3-5 antonyms (or empty array if none)
- etymology: a brief origin/history of the word

If the word is not a valid English word or you cannot provide reliable information, still return a JSON object but with empty/default values.

Word: "${args.word}"

JSON:`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Gemini API error:", error)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    try {
      const cleaned = text.trim().replace(/^```json\s?|^```\s?|```$/g, "")
      const parsed = JSON.parse(cleaned)

      return {
        definition: parsed.definition || "",
        part_of_speech: parsed.part_of_speech || "",
        pronunciation: parsed.pronunciation || "",
        examples: Array.isArray(parsed.examples) ? parsed.examples : [],
        synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms : [],
        antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms : [],
        etymology: parsed.etymology || "",
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text)
      throw new Error("Failed to parse AI response")
    }
  },
})

export const extractFromText = action({
  args: {
    text: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured")
    }

    const prompt = `Extract vocabulary words from the following text. Return ONLY a valid JSON array (no markdown, no code blocks) where each item is an object with:
- word: the word (lowercase)
- definition: a brief definition
- part_of_speech: the part of speech
- pronunciation: IPA notation (optional)
- examples: array of 1-2 example sentences from the text or new ones

Extract up to 10 most important vocabulary words. Focus on uncommon or interesting words.

Text:
"""
${args.text}
"""

JSON array:`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error("Gemini API error:", error)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    try {
      const cleaned = text
        .trim()
        .replace(/^\s*\[|\]\s*$/g, "")
        .replace(/^```json\s?|^```\s?|```$/g, "")
      const parsed = JSON.parse(`[${cleaned}]`)

      return Array.isArray(parsed)
        ? parsed
            .map((item: any) => ({
              word: item.word?.toLowerCase() || "",
              definition: item.definition || "",
              part_of_speech: item.part_of_speech || "",
              pronunciation: item.pronunciation || "",
              examples: Array.isArray(item.examples) ? item.examples : [],
            }))
            .filter((w: any) => w.word && w.definition)
        : []
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text)
      throw new Error("Failed to parse AI response")
    }
  },
})
