# Harness Engineering

## Overview

**Harness Engineering** là một methodology hướng dẫn cách sử dụng AI hiệu quả trong quy trình phát triển phần mềm, được xây dựng dựa trên **Harness Principles**.

Ý tưởng cốt lõi: AI Model giống như một lập trình viên cực giỏi nhưng mất trí nhớ mỗi phiên làm việc. Methodology này cung cấp một hệ thống có cấu trúc để tổ chức, duy trì và nạp lại đúng "trí nhớ" cần thiết — giúp AI hoạt động nhất quán, chính xác và tuân thủ các ràng buộc dự án qua mọi phiên làm việc.

### Memory Architecture

![Memory Architecture](guideline/images/architecture.png)

### Harness Engineering bao gồm:

- **Memory Architecture** — Hệ thống lưu trữ knowledge bên ngoài, được tổ chức thành 3 stores: Technical, Domain, và Rules
- **Registry-based Retrieval** — Cơ chế truy xuất memory thông minh qua registry, chỉ load đúng những gì cần thiết
- **SOLID Principles for Memory** — Áp dụng các nguyên tắc SOLID vào việc tổ chức và quản lý memory
- **Guidelines** — Bộ tài liệu hướng dẫn chi tiết cách thực hành methodology

## Pre-requisites

Trước khi bắt đầu làm việc với project này, hãy đọc kỹ các guideline sau:

| Guideline | Mô tả |
|---|---|
| [Memory Management Best Practices](guideline/memory-management-best-practices.md) | Hướng dẫn toàn diện về cách tổ chức, viết, và bảo trì memory system — bao gồm cấu trúc stores, registry, quy tắc viết memory files, và quy trình thêm/sửa/xóa |

## Project Structure

```
harness-engineering/
├── README.md
├── guideline/                # Tài liệu hướng dẫn methodology
│   └── memory-management-best-practices.md
└── memory/                   # Memory system của dự án
    ├── HARNESS.yaml          # File gốc, mô tả tổng quan memory system
    ├── technical/            # Hiểu biết kỹ thuật: ngôn ngữ, framework, patterns
    │   └── _registry.yaml
    ├── domain/               # Hiểu biết nghiệp vụ: workflow, business rules, thuật ngữ
    │   └── _registry.yaml
    └── rules/                # Ràng buộc dự án: coding standards, security, API conventions
        └── _registry.yaml
```

## License

This project is licensed under the [MIT License](LICENSE).
