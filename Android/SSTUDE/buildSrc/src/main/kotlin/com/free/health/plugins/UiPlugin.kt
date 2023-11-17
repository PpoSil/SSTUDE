package com.free.health.plugins

import com.android.build.gradle.BaseExtension
import com.free.health.plugins.constants.getDefaultPackagingOptions
import com.free.health.plugins.constants.setDefaultCompileOptions
import com.free.health.plugins.constants.setDefaultPackagingOptions
import com.free.health.plugins.constants.setExperimentalWarningsOptIn
import org.gradle.api.JavaVersion
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies

class UiPlugin : Plugin<Project> {

    private val Project.android: BaseExtension
        get() = extensions.findByName("android") as? BaseExtension
                ?: error("Not an Android module: $name")

    override fun apply(project: Project) =
            with(project) {
                applyPlugins()
                androidConfig()
                appDependencies()
            }

    private fun Project.applyPlugins() {
        plugins.run {
            apply(ModulePlugins.ANDROID_LIBRARY)
            apply(ModulePlugins.KOTLIN_ANDROID)
            apply(ModulePlugins.KOTLIN_KAPT)
            apply(ModulePlugins.HILT)
        }
    }

    private fun Project.androidConfig() {
        android.run {
            compileSdkVersion(Sdk.COMPILE_SDK_VERSION)

            defaultConfig {
                minSdk = Sdk.MIN_SDK_VERSION
                targetSdk = Sdk.TARGET_SDK_VERSION

                versionCode = ModuleVersions.LIBRARY_VERSION_CODE
                versionName = ModuleVersions.LIBRARY_VERSION

                testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
                consumerProguardFiles("consumer-rules.pro")
            }

            sourceSets {
                getByName("main").java.srcDirs("src/main/kotlin")
            }

            project.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile::class.java)
                .configureEach {
                    kotlinOptions {
                        jvmTarget = "11"
                    }
                }

            lintOptions {
                isWarningsAsErrors = true
                isAbortOnError = true
            }

            setDefaultCompileOptions()
            setDefaultPackagingOptions()
            setExperimentalWarningsOptIn()

            buildFeatures.compose = true

            composeOptions {
                kotlinCompilerExtensionVersion = Versions.Compose.KOTLIN_COMPILER
            }
        }
    }

    private fun Project.appDependencies() {
        dependencies {
//            add("implementation", project(Dependencies.Modules.Domain.ENTITIES))
            add("implementation", project(Dependencies.Modules.Domain.BASE))

            add("implementation",Dependencies.DI.HILT)
            add("kapt", Dependencies.DI.HILT_KAPT)
            add("implementation", Dependencies.DI.HILT_WORK_MANAGER)
            add("kapt", Dependencies.DI.HILT_WORK_MANAGER_KAPT)

            add("implementation", Dependencies.UI.CHARTS)
            add("implementation", Dependencies.Main.MATERIAL)
            add("implementation", Dependencies.Main.WORK_MANAGER)

            add("implementation", Dependencies.Compose.ACTIVITIES)
            add("implementation", Dependencies.Compose.MATERIAL3)
            add("implementation", Dependencies.Compose.FONTS)
            add("implementation", Dependencies.Compose.ANIM)
            add("implementation", Dependencies.Compose.VIEWMODEL)
            add("implementation", Dependencies.Compose.TOOLING)
            add("implementation", Dependencies.Compose.NAVIGATION)
            add("implementation", Dependencies.Compose.NAVIGATION_HILT)
            add("implementation", Dependencies.Compose.ICONS)
            add("implementation", Dependencies.Compose.GLANCE)
        }
    }
}
