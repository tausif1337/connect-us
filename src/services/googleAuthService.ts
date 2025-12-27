import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthSessionResult } from 'expo-auth-session';
import { 
  GoogleAuthProvider, 
  signInWithCredential,
  OAuthCredential
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// This is required for the auth session to work properly on web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs from environment variables
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Google auth configuration
 * Export this to use in components
 */
export const googleConfig = {
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  webClientId: GOOGLE_WEB_CLIENT_ID,
};

// Re-export the useAuthRequest hook for use in components
export { useAuthRequest } from 'expo-auth-session/providers/google';

/**
 * Process Google authentication response and sign in to Firebase
 * @param response - The response from Google OAuth
 * @returns Promise<void>
 */
export async function handleGoogleSignIn(
  response: AuthSessionResult
): Promise<{ success: boolean; error?: string }> {
  try {
    if (response.type !== 'success') {
      if (response.type === 'cancel') {
        return { success: false, error: 'Google sign-in was cancelled' };
      }
      return { success: false, error: 'Google sign-in failed' };
    }

    const { id_token, access_token } = response.params;

    if (!id_token && !access_token) {
      return { success: false, error: 'No authentication token received' };
    }

    // Create Firebase credential from Google token
    const credential: OAuthCredential = GoogleAuthProvider.credential(
      id_token,
      access_token
    );

    // Sign in to Firebase with the Google credential
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      
      await setDoc(userDocRef, {
        displayName: displayName,
        email: user.email || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        authProvider: 'google',
      });
    } else {
      // Update last login time and ensure auth provider is set
      const existingData = userDoc.data();
      await setDoc(
        userDocRef,
        {
          ...existingData,
          lastLoginAt: new Date(),
          authProvider: existingData.authProvider || 'google',
        },
        { merge: true }
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific Firebase errors
    const errorCode = error?.code || '';
    const errorMessages: Record<string, string> = {
      'auth/account-exists-with-different-credential': 
        'An account already exists with the same email but different sign-in credentials',
      'auth/invalid-credential': 
        'The credential is malformed or has expired',
      'auth/operation-not-allowed': 
        'Google sign-in is not enabled. Please contact support',
      'auth/user-disabled': 
        'This account has been disabled',
      'auth/user-not-found': 
        'No account found with this email',
      'auth/network-request-failed': 
        'Network error. Please check your connection',
      'auth/popup-closed-by-user': 
        'Sign-in popup was closed',
      'auth/cancelled-popup-request': 
        'Sign-in was cancelled',
    };

    const errorMessage = errorMessages[errorCode] || 
      error?.message || 
      'Failed to sign in with Google. Please try again';

    return { success: false, error: errorMessage };
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutUser(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
