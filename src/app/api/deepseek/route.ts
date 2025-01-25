import { NextResponse } from 'next/server'

type GenreType = 'psychological' | 'cosmic' | 'paranormal' | 'urban-legends' | 'creature' | 'folk' | 'ghost';

const genrePrompts: Record<GenreType, string> = {
  'psychological': 'You are a psychological horror story writing assistant. Focus on mental anguish and existential dread. Keep the atmosphere tense and unsettling.',
  'cosmic': 'You are a cosmic horror story writing assistant. Emphasize humanity\'s insignificance against ancient, unknowable entities.',
  'paranormal': 'You are a paranormal story writing assistant. Focus on supernatural occurrences and ghostly phenomena. Build suspense gradually.',
  'urban-legends': 'You are an urban legend story writing assistant. Focus on modern fears and plausible deniability. Include local folklore elements.',
  'creature': 'You are a creature horror story writing assistant. Include detailed monster descriptions and survival elements.',
  'folk': 'You are a folk horror story writing assistant. Incorporate rural traditions and pagan elements. Use earthy, archaic language.',
  'ghost': 'You are a ghost story writing assistant. Focus on haunted locations and restless spirits. Build atmospheric tension.'
}

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: 'DeepSeek API key not configured' },
      { status: 500 }
    )
  }

  try {
    const { prompt, category } = await req.json()

    const systemPrompt = category && genrePrompts[category as GenreType]
      ? genrePrompts[category as GenreType]
      : 'You are a horror story writing assistant. Continue the story in a spooky and suspenseful way, maintaining the dark atmosphere.'

    const apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `${systemPrompt} Keep your response to 200 characters or less.`
          },
          {
            role: 'user',
            content: `Continue this spooky story: ${prompt}`
          }
        ],
        max_tokens: 60,
        temperature: category === 'cosmic' ? 0.8 : 0.7
      })
    })

    if (!apiResponse.ok) {
      const error = await apiResponse.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    const data = await apiResponse.json()
    return NextResponse.json({
      suggestion: data.choices[0].message.content.trim()
    })

  } catch (error) {
    console.error('DeepSeek Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
} 