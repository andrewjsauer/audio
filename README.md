# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

11/29/2023: As of this writing, this was developed on an M1 running Sonoma 14.1.1 (23B81) with the following versions:

- Ruby v3.1.2
- Node v18.17.0
- NPM 9.6.7

If you are using `nvm`, then skip `brew install node`. If installing via M1 chip, see these SO discussions on common troubleshooting:

- https://stackoverflow.com/questions/64901180/how-to-run-cocoapods-on-apple-silicon-m1
- https://stackoverflow.com/questions/67443265/error-regarding-undefined-method-map-for-nilnilclass-for-flutter-app-cocoap

## Step 1: Install

```
yarn install
```

## Step 2: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native. To start Metro, run the following command:

```bash
yarn start
```

## Step 3: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
yarn android
```

### For iOS

```bash
yarn ios
```

If everything is set up _correctly_, you should see the app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Packages

Push notifications (`react-native-notifications`)

- https://wix.github.io/react-native-notifications/docs/getting-started

Internationalization (`react-i18next`)

- https://react.i18next.com/

Home Screen

- https://www.npmjs.com/package/react-native-bootsplash OR
- https://www.npmjs.com/package/react-native-splash-screen

Permissions (`react-native-permissions`)

- https://github.com/zoontek/react-native-permissions

Firebase Phone Number Authentication

- List of countries that are supported: https://firebase.google.com/support/faq/#phone-auth-countries
