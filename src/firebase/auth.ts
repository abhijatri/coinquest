import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  ConfirmationResult,
  ActionCodeSettings,
} from 'firebase/auth'
import { auth } from './config'

// ─── Google OAuth ─────────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

// ─── Phone / SMS OTP ─────────────────────────────────────────────────────────
let recaptchaVerifier: RecaptchaVerifier | null = null

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved automatically
    },
    'expired-callback': () => {
      // Reset on expiry — user must retry
    },
  })
  return recaptchaVerifier
}

export async function sendPhoneOTP(
  phoneNumber: string,
  containerId: string,
): Promise<ConfirmationResult> {
  const verifier = setupRecaptcha(containerId)
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export async function verifyPhoneOTP(
  confirmation: ConfirmationResult,
  otp: string,
): Promise<void> {
  await confirmation.confirm(otp)
}

// ─── Email Magic Link ─────────────────────────────────────────────────────────
export function getEmailLinkSettings(): ActionCodeSettings {
  const url = typeof window !== 'undefined' ? window.location.origin + '/auth?emailLink=true' : ''
  return {
    url,
    handleCodeInApp: true,
  }
}

export async function sendEmailLink(email: string): Promise<void> {
  const settings = getEmailLinkSettings()
  await sendSignInLinkToEmail(auth, email, settings)
  // Save email so user doesn't have to re-enter on same device
  localStorage.setItem('coinquest_email_for_link', email)
}

export function checkIsEmailLink(url: string): boolean {
  return isSignInWithEmailLink(auth, url)
}

export async function completeEmailLink(url: string): Promise<void> {
  let email = localStorage.getItem('coinquest_email_for_link')
  if (!email) {
    throw new Error('NEED_EMAIL')
  }
  await signInWithEmailLink(auth, email, url)
  localStorage.removeItem('coinquest_email_for_link')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  localStorage.removeItem('coinquest_email_for_link')
  await firebaseSignOut(auth)
}
