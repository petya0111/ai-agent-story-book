plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.spring") version "2.0.0"
    kotlin("plugin.jpa") version "2.0.0"
    kotlin("plugin.serialization") version "2.0.0"
}

repositories {
    mavenCentral()
}

val ktorVersion = "2.3.12"
val okhttpVersion = "4.12.0"
val coroutinesVersion = "1.8.1"
val serializationVersion = "1.7.1"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // Database
    runtimeOnly("org.postgresql:postgresql")
    
    // JSON Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$serializationVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutinesVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

    // HTTP Client
    implementation("com.squareup.okhttp3:okhttp:$okhttpVersion")
    implementation("com.squareup.okhttp3:logging-interceptor:$okhttpVersion")

    // PDF extraction
    implementation("org.apache.pdfbox:pdfbox:3.0.2")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation(kotlin("test"))
}

kotlin {
    jvmToolchain(17)
}

tasks.withType<org.springframework.boot.gradle.tasks.bundling.BootJar> {
    enabled = true
    archiveClassifier.set("")
}

// Disable the standard 'jar' task (don't disable all Jar-based tasks like bootJar/fatJar)
tasks.named<Jar>("jar") {
    enabled = false
}

// Heroku requires a 'stage' task
tasks.register("stage") {
    dependsOn("bootJar")
}

// Fallback fat jar task: assemble an executable jar including runtime dependencies.
// Some environments (or CI) may disable bootJar; fatJar ensures we can produce a runnable artifact.
tasks.register<Jar>("fatJar") {
    archiveBaseName.set("fantasy-rag-backend-fat")
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    manifest {
        attributes("Main-Class" to "com.example.BookAgentApplicationKt")
    }
    from(sourceSets.main.get().output)
    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get().filter { it.name.endsWith(".jar") }.map { zipTree(it) }
    })
}