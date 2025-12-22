import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = process.env.ANTHROPIC_API_KEY

if (!anthropicApiKey) {
  throw new Error('Missing Anthropic API Key environment variable')
}

export const anthropic = new Anthropic({ apiKey: anthropicApiKey })
