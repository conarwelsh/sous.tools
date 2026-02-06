pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "sous-tools"

// Include the new Wear OS app
include(":apps:wearos")
project(":apps:wearos").projectDir = file("apps/wearos")

// Include the Tauri Android App (if generated)
// We check if the directory exists to avoid build errors on fresh clones
if (file("apps/native/src-tauri/gen/android").exists()) {
    include(":apps:native")
    project(":apps:native").projectDir = file("apps/native/src-tauri/gen/android/app")
}
