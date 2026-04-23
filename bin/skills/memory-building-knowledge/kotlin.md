# Kotlin Android Knowledge

## Project Structure
- `build.gradle.kts` (root) — project-level plugins, repositories, version catalogs
- `app/build.gradle.kts` — app module dependencies, Android SDK versions, build types
- `gradle/libs.versions.toml` — version catalog (modern dependency management)
- `settings.gradle.kts` — module declarations, repository settings
- `app/src/main/java/` or `app/src/main/kotlin/` — main source code
- `app/src/main/AndroidManifest.xml` — app components, permissions, intent filters
- `app/src/main/res/` — resources (drawables, strings, themes)
- `ui/` or `presentation/` — Composable screens and UI components
- `viewmodel/` — ViewModels with UI state management
- `data/` — repositories, data sources, API services
- `domain/` — use cases, domain models, repository interfaces
- `di/` or `hilt/` — Hilt modules and dependency injection setup
- `navigation/` — NavHost, route definitions, navigation graphs
- `db/` or `local/` — Room database, DAOs, entities
- `network/` or `remote/` — Retrofit interfaces, API models

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| MVVM | `ViewModel` subclasses, `StateFlow`/`LiveData` in ViewModels, `collectAsState()` in Composables |
| Clean Architecture | `domain/`, `data/`, `presentation/` packages, UseCase classes, repository interfaces in domain |
| Multi-module | Multiple directories in `settings.gradle.kts` (`:core`, `:feature:home`, `:data`) |
| Jetpack Compose | `androidx.compose` dependencies, `@Composable` functions, no XML layouts |
| Hilt DI | `@HiltAndroidApp` on Application, `@AndroidEntryPoint`, `@Inject`, `@Module` with `@InstallIn` |
| Navigation Compose | `androidx.navigation:navigation-compose`, `NavHost`, `composable()` route declarations |
| Room | `androidx.room` dependencies, `@Database`, `@Dao`, `@Entity` annotations |
| Retrofit | `com.squareup.retrofit2` dependencies, interface with `@GET`/`@POST` annotations |
| DataStore | `androidx.datastore` dependencies, `dataStore` delegate, `Preferences` or Proto |
| Coroutines | `kotlinx-coroutines`, `suspend` functions, `viewModelScope.launch`, `Flow` usage |

### Android-Specific Indicators
| Signal | How to detect |
|---|---|
| Build variants | `buildTypes` and `productFlavors` in `build.gradle.kts` |
| Compose theming | `Theme.kt` with `MaterialTheme`, custom `ColorScheme`, `Typography` |
| Compose previews | `@Preview` annotated functions |
| Feature modules | `:feature:*` modules in `settings.gradle.kts`, per-feature navigation graphs |
| Version catalog | `gradle/libs.versions.toml` with `[versions]`, `[libraries]`, `[plugins]` sections |

## Domain Signal Locations
- `domain/model/` — domain entities, value objects, sealed classes for business states
- `domain/usecase/` — use case classes encapsulating single business operations
- `domain/repository/` — repository interfaces (contracts, not implementations)
- `data/model/` or `data/dto/` — API response models, database entities, mappers
- `data/repository/` — repository implementations combining remote + local sources
- `db/entity/` or `local/entity/` — Room `@Entity` classes with table structure
- `network/model/` or `remote/dto/` — Retrofit response/request data classes
- Sealed classes/interfaces — UI state (`UiState.Loading`, `UiState.Success`, `UiState.Error`), navigation events, domain results
- Enums and constants — business categories, status codes, feature flags
- `viewmodel/` — state holders exposing `StateFlow<UiState>` with business logic orchestration

## Convention Indicators
- `detekt.yml` or `detekt` plugin in `build.gradle.kts` — static analysis and code smell detection
- `ktlint` plugin or `.editorconfig` with Kotlin rules — code formatting
- `gradle/libs.versions.toml` — centralized dependency versioning
- `proguard-rules.pro` — code obfuscation and shrinking rules
- `build.gradle.kts` `composeOptions` — Compose compiler version and stability config
- `app/src/androidTest/` — instrumented UI tests (Compose testing, Espresso)
- `app/src/test/` — unit tests (JUnit, MockK, Turbine for Flow testing)
- Package naming structure (`com.company.app.feature.subpackage`)
- Compose naming conventions (PascalCase for Composables, `*Screen`, `*Content`, `*Component` suffixes)
- ViewModel naming (`*ViewModel`), UseCase naming (`*UseCase`), Repository naming (`*Repository`)

## What to Sample (priority order)
1. `app/build.gradle.kts` — dependencies, SDK versions, Compose compiler, build variants
2. `gradle/libs.versions.toml` — full dependency catalog, library versions
3. `AndroidManifest.xml` — permissions, activities, app components
4. One ViewModel — state management pattern, coroutine usage, UseCase injection
5. One Composable screen — UI patterns, theming, navigation integration, state hoisting
6. One repository implementation — data source coordination, Room + Retrofit usage, Flow patterns
