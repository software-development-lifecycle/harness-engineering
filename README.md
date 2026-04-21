# Harness Engineering

## Overview

**Harness Engineering** is a methodology for using AI effectively in software development workflows, built on **Harness Principles**.

The core idea: an AI Model is like an exceptionally skilled developer who loses all memory at the end of every session. This methodology provides a structured system for organizing, maintaining, and reloading exactly the right "memory" — so the AI behaves consistently, accurately, and in compliance with project constraints across every working session.

### Memory Architecture

![Memory Architecture](guideline/images/architecture.png)

### Harness Engineering includes:

- **Memory Architecture** — An external knowledge storage system organized into 3 stores: Technical, Domain, and Rules
- **Registry-based Retrieval** — A smart memory retrieval mechanism via registry, loading only what is needed
- **SOLID Principles for Memory** — Applying SOLID principles to the organization and management of memory
- **Guidelines** — A comprehensive set of documents detailing how to practice the methodology

## Pre-requisites

Before starting to work with this project, please read the following guidelines carefully:

| Guideline | Description |
|---|---|
| [Memory Management Best Practices](guideline/memory-management-best-practices.md) | A comprehensive guide on how to organize, write, and maintain the memory system — covering store structure, registry, rules for writing memory files, and procedures for adding, updating, and removing entries |

## Project Structure

```
harness-engineering/
├── README.md
├── guideline/                # Methodology documentation
│   └── memory-management-best-practices.md
└── memory/                   # Project memory system
    ├── HARNESS.yaml          # Root file describing the memory system overview
    ├── technical/            # Technical knowledge: languages, frameworks, patterns
    │   └── _registry.yaml
    ├── domain/               # Business knowledge: workflows, business rules, terminology
    │   └── _registry.yaml
    └── rules/                # Project constraints: coding standards, security, API conventions
        └── _registry.yaml
```

## License

This project is licensed under the [MIT License](LICENSE).
