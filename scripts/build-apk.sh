#!/bin/bash

# Build script for generating APK
echo "Building APK..."

# Create the android directory if it doesn't exist
if [ ! -d "android" ]; then
  echo "Initializing Android project..."
  npx react-native init --template react-native-template-typescript TempProject
  cp -r TempProject/android .
  rm -rf TempProject
fi

# Build the APK
cd android
./gradlew assembleRelease

# Copy the APK to the root directory
cp app/build/outputs/apk/release/app-release.apk ../connect-us.apk
cd ..

echo "APK built successfully! Location: connect-us.apk"