# Java Knowledge

## Project Structure
- `pom.xml` — Maven dependencies, plugins, build config
- `build.gradle` or `build.gradle.kts` — Gradle dependencies, plugins
- `src/main/java/` — main source code
- `src/main/resources/` — config files (application.yml, application.properties)
- `src/test/java/` — test source code
- `*Application.java` — Spring Boot entry point
- `controller/` or `rest/` — REST controllers
- `service/` — business logic layer
- `repository/` or `dao/` — data access layer
- `model/` or `entity/` or `domain/` — domain entities
- `dto/` — data transfer objects
- `config/` — Spring configuration classes
- `exception/` — custom exceptions and handlers

## Architecture Indicators
| Pattern | How to detect |
|---|---|
| Spring Boot | `spring-boot-starter` in dependencies, `@SpringBootApplication` |
| Spring MVC | `@RestController`, `@RequestMapping`, `@GetMapping` |
| Spring WebFlux | `spring-boot-starter-webflux`, reactive types (Mono, Flux) |
| Quarkus | `io.quarkus` dependencies, `@Path` annotations |
| Micronaut | `io.micronaut` dependencies |
| Hexagonal | `ports/` and `adapters/` packages |
| DDD | `domain/`, `application/`, `infrastructure/` packages |

## Domain Signal Locations
- `entity/` or `model/` — JPA entities with annotations (@Entity, @Table)
- `service/` — business logic with @Service annotation
- `repository/` — Spring Data interfaces extending JpaRepository
- `dto/` — request/response shapes
- Enums — domain states and categories
- `specification/` — JPA Specifications for complex queries

## Convention Indicators
- `checkstyle.xml` — code style rules
- `spotbugs-exclude.xml` — static analysis config
- `application.yml` / `application.properties` — Spring config patterns
- Package naming structure (com.company.project.module)
- Annotation usage patterns (@Validated, @Transactional)

## What to Sample (priority order)
1. `pom.xml` / `build.gradle` — dependencies, Spring Boot version, plugins
2. `application.yml` — configuration, profiles, database config
3. `*Application.java` — entry point, component scanning, bean definitions
4. One controller — API patterns, annotations, response handling
5. One service — business logic, transaction management, error handling
