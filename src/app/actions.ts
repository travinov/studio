'use server'

import { generateImageCaption } from '@/ai/flows/generate-image-caption'
import { generateRelevantHashtags } from '@/ai/flows/generate-relevant-hashtags'
import { adjustTextColorContrast } from '@/ai/flows/adjust-text-color-contrast'

export async function getCaption(imageDescription: string) {
  try {
    const result = await generateImageCaption({ imageDescription })
    return { caption: result.caption }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to generate caption.' }
  }
}

export async function getHashtags(photoDataUri: string, description: string) {
  if (!photoDataUri) {
    return { error: 'Image data is required to generate hashtags.' }
  }
  try {
    const result = await generateRelevantHashtags({ photoDataUri, description })
    return { hashtags: result.hashtags }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to generate hashtags.' }
  }
}

export async function getTextColor(photoDataUri: string, textColor: string) {
  if (!photoDataUri) {
    return { error: 'Image data is required to adjust text color.' }
  }
  try {
    const result = await adjustTextColorContrast({ photoDataUri, textColor })
    return { adjustedTextColor: result.adjustedTextColor }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to adjust text color.' }
  }
}
