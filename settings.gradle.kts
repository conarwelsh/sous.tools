pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "sous-tools"

// --- Android Modules ---

// 1. Wear OS (Native Kotlin)
include(":apps:wearos")
project(":apps:wearos").projectDir = file("apps/wearos")

// 2. Tauri Apps (Included Builds)
if (file("apps/native/src-tauri/gen/android").exists()) {
    includeBuild("apps/native/src-tauri/gen/android")
}
if (file("apps/native-headless/src-tauri/gen/android").exists()) {
    includeBuild("apps/native-headless/src-tauri/gen/android")
}
if (file("apps/native-kds/src-tauri/gen/android").exists()) {
    includeBuild("apps/native-kds/src-tauri/gen/android")
}
if (file("apps/native-pos/src-tauri/gen/android").exists()) {
    includeBuild("apps/native-pos/src-tauri/gen/android")
}
