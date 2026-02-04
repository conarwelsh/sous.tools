// Root build.gradle.kts
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.11.0")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25")
    }
}

// Ensure the clean task works without needing specific imports if possible
tasks.register("clean", Delete::class) {
    delete(layout.buildDirectory)
}
