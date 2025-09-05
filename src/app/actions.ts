'use server'

import { generateImageCaption } from '@/ai/flows/generate-image-caption'
import { generateRelevantHashtags } from '@/ai/flows/generate-relevant-hashtags'
import { adjustTextColorContrast } from '@/ai/flows/adjust-text-color-contrast'
import { cookies } from 'next/headers'
import { auth as adminAuth, db } from '@/lib/firebase-admin'

export async function createSessionCookie(idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return { success: false, error: 'Could not create session.' };
  }
}

export async function clearSessionCookie() {
  cookies().delete('session');
}

export async function signup(email: string, password_provided: string) {
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password: password_provided,
    });

    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      role: 'user', // default role
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    });

    return { success: true, userId: userRecord.uid };
  } catch (error: any) {
    console.error('Error during sign up:', error);
    let message = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-exists') {
      message = 'This email is already registered.';
    } else if (error.code === 'auth/invalid-password') {
      message = 'Password must be at least 6 characters long.';
    }
    return { success: false, error: message };
  }
}

export async function getUserStatus(uid: string) {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return { status: 'not_found' };
    }
    const userData = userDoc.data();
    return { status: userData?.approvalStatus || 'pending' };
  } catch (error) {
    console.error('Error fetching user status:', error);
    return { status: 'error' };
  }
}


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
