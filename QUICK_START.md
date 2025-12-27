# 🚀 Quick Start: Enable Google Sign-In

**Estimated time:** 15-20 minutes

## Prerequisites
- Firebase project created
- App already running locally

## Step 1: Firebase Console (5 minutes)

1. Go to https://console.firebase.google.com
2. Select your project
3. Click **Authentication** → **Sign-in method**
4. Click **Google** → Toggle **Enable**
5. **Copy the Web Client ID** shown (you'll need this)
6. Click **Save**

## Step 2: Google Cloud Console (10 minutes)

### iOS Client ID
1. Go to https://console.cloud.google.com
2. Select your Firebase project
3. **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **iOS**
6. Enter:
   - Name: `Connect Us iOS`
   - Bundle ID: `com.connectus.app`
7. Click **Create** → **Copy the Client ID**

### Android Client ID
1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Android**
3. Enter:
   - Name: `Connect Us Android`
   - Package name: `com.connectus.app`
   - SHA-1: Get it by running:
     ```bash
     keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey
     ```
     Password: `android`
4. Click **Create** → **Copy the Client ID**

## Step 3: Configure Environment (2 minutes)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Client IDs:
   ```env
   # Your existing Firebase config stays the same...
   
   # Add these new lines:
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=yyy.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=zzz.apps.googleusercontent.com
   ```

## Step 4: Test (3 minutes)

1. Restart your development server:
   ```bash
   npm start
   ```

2. Press `c` to clear cache, then:
   - iOS: Press `i`
   - Android: Press `a`

3. On the Login or Signup screen:
   - Tap **"Continue with Google"**
   - Select your Google account
   - Grant permissions
   - You're in! 🎉

## ✅ That's it!

You now have Google Sign-In working on both Login and Signup screens.

## 🆘 Troubleshooting

**"Sign-in failed"**
- Double-check all Client IDs in `.env`
- Make sure Google provider is enabled in Firebase Console
- Restart the development server (`npm start`)

**"Invalid client ID"**
- Verify no extra spaces in `.env` file
- Make sure bundle IDs match: `com.connectus.app`

**Android SHA-1 error**
- Use the debug keystore for development
- Password is always `android`

## 📖 Need More Help?

- **Detailed Setup:** See `GOOGLE_AUTH_SETUP.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Environment Variables:** See `.env.example`

## 🎯 What You Get

✅ Google Sign-In on Login screen
✅ Google Sign-In on Signup screen  
✅ Automatic user profile creation
✅ Error handling & loading states
✅ Works on iOS, Android, and Web
✅ Integrated with existing auth flow

---

**Pro Tip:** Keep your `.env` file secret! Never commit it to Git.
