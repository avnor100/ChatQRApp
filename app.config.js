/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "ChatQRApp",
    slug: "chatqrapp",
    version: "1.0.0",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    android: {
      package: "com.avnor100.chatqrapp",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },

    // ✅ Required for EAS Update
    runtimeVersion: { policy: "sdkVersion" },
    updates: {
      // use *your* existing projectId here (you already have it)
      url: "https://u.expo.dev/55b3314f-0754-4695-9d15-39384b8813d9"
    },
    extra: {
      eas: { projectId: "55b3314f-0754-4695-9d15-39384b8813d9" }
    }
  }
};
