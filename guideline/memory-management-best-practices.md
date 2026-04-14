# Memory Management Best Practices

## 1. Triết lý nền tảng

AI Model giống như một lập trình viên cực giỏi nhưng mất trí nhớ mỗi phiên làm việc. Mỗi lần invoke, bộ não này bắt đầu từ trắng. Memory là hệ thống lưu trữ bên ngoài — được tổ chức, duy trì bởi con người — để nạp lại đúng "trí nhớ" cần thiết cho mỗi phiên làm việc.

Một lập trình viên giỏi cần: biết kỹ thuật (technical knowledge), hiểu nghiệp vụ (domain knowledge), nắm luật chơi dự án (rules), và hiểu việc mình đang làm (context). Memory architecture phản ánh đúng 4 loại hiểu biết này.

---

## 2. Nguyên tắc SOLID áp dụng cho Memory

### 2.1. S — Single Responsibility

> Mỗi đơn vị memory chỉ chứa một chủ đề, chỉ có một lý do để thay đổi.

**Áp dụng ở 2 cấp:**

Cấp store: mỗi memory store chỉ chứa một loại hiểu biết. Technical store thay đổi khi tech stack đổi. Domain store thay đổi khi nghiệp vụ đổi. Rules store thay đổi khi constraint đổi. Ba store độc lập, không trộn lẫn.

Cấp file: mỗi file chỉ nói về một chủ đề cụ thể. File về async/await không trộn lẫn với EF Core. File về payment workflow không trộn lẫn với order lifecycle.

**Kiểm tra:** nếu phải giải thích nội dung file bằng "A và B" thì nên tách thành 2 files.

**Sai:**
```
csharp-everything.md          → Chứa async, LINQ, generics, DI — quá nhiều chủ đề
payment-and-order.md          → 2 domain khác nhau trong 1 file
coding-and-security-rules.md  → 2 loại constraint khác nhau
```

**Đúng:**
```
csharp-async.md               → Chỉ async/await
csharp-linq.md                → Chỉ LINQ
payment-workflow.md           → Chỉ payment
coding-standards.md           → Chỉ coding conventions
security.md                   → Chỉ security rules
```

### 2.2. O — Open/Closed

> Memory mở cho việc thêm mới, đóng cho việc sửa cấu trúc.

Thêm knowledge mới = tạo file mới + thêm entry vào registry. Không sửa file nào khác, không sửa cấu trúc store.

**Ví dụ:** team bắt đầu dùng gRPC trong dự án.

Thêm mới:
```
1. Tạo file: technical/framework/grpc-patterns.md
2. Thêm entry vào technical/_registry.yaml
3. Xong.
```

Không cần sửa: các file technical khác, domain registry, rules registry, hay bất kỳ thứ gì đang có.

**Kiểm tra:** khi thêm 1 đơn vị knowledge mới, nếu phải sửa bất kỳ file nào ngoài registry → đang vi phạm O.

### 2.3. I — Interface Segregation

> Không bắt ai phải nhận memory mà họ không cần.

Khi truy xuất memory, chỉ load đúng những files cần thiết cho công việc hiện tại. Không dump toàn bộ store.

Cơ chế thực hiện: registry đóng vai trò index — đọc registry trước để xác định files nào cần, chỉ load những files đó. Không bao giờ load toàn bộ store.

**Sai:** load tất cả 15 files technical vào context dù chỉ cần 3 files liên quan.

**Đúng:** đọc registry → xác định 3 files cần thiết → chỉ load 3 files đó.

### 2.4. D — Dependency Inversion

> Phụ thuộc vào loại memory, không phụ thuộc file cụ thể.

Bất kỳ thứ gì cần truy xuất memory đều làm việc thông qua registry, không trỏ thẳng vào file path cố định. Nếu file được di chuyển, đổi tên, hoặc tách nhỏ → chỉ cần cập nhật registry, không cần sửa bất kỳ thứ gì khác.

Registry là lớp trung gian duy nhất giữa "người cần memory" và "file chứa memory".

---

## 3. Cấu trúc Memory

### 3.1. Ba memory stores

```
memory/
├── technical/            # Hiểu biết kỹ thuật
│   ├── _registry.yaml
│   └── [files...]
│
├── domain/               # Hiểu biết nghiệp vụ
│   ├── _registry.yaml
│   └── [files...]
│
├── rules/                # Ràng buộc dự án
│   ├── _registry.yaml
│   └── [files...]
│
└── HARNESS.yaml          # File gốc, mô tả tổng quan
```

Mỗi store hoàn toàn độc lập. Thêm, sửa, xóa trong một store không ảnh hưởng store khác.

**Context** (loại memory thứ 4) không lưu trữ trong hệ thống — do con người cung cấp mỗi lần invoke skill, mô tả công việc cần thực hiện ở thời điểm hiện tại.

### 3.2. Phân biệt 3 stores

| | Technical | Domain | Rules |
|---|---|---|---|
| **Chứa gì** | Cách làm (how) | Làm về cái gì (what) | Ràng buộc khi làm (constraint) |
| **Ví dụ** | Async patterns, EF Core, Redis caching | Payment workflow, order lifecycle, thuật ngữ nghiệp vụ | Coding standards, security requirements, API conventions |
| **Thay đổi khi** | Tech stack thay đổi | Nghiệp vụ thay đổi | Constraint dự án thay đổi |
| **Ai viết** | Tech lead, senior dev | BA, domain expert, tech lead | Tech lead, client |
| **Tần suất thay đổi** | Thấp | Trung bình | Thấp |

### 3.3. Thư mục bên dưới store

Cấu trúc thư mục bên trong mỗi store là **tùy biến** — team tự tổ chức theo cách hợp lý nhất cho dự án. Methodology không bắt buộc bao nhiêu cấp hay đặt tên thế nào.

Lý do: registry là nguồn truy xuất duy nhất. Thư mục chỉ phục vụ con người quản lý files. Miễn path trong registry trỏ đúng file là đủ.

Khuyến nghị chung:
- Nhóm files liên quan vào cùng thư mục để dễ tìm cho con người
- Đặt tên thư mục và file rõ nghĩa, dùng kebab-case
- Tránh lồng quá sâu (3-4 cấp là đủ cho hầu hết dự án)

---

## 4. Registry — Quy tắc bắt buộc

### 4.1. Mỗi store có đúng 1 registry file

```
technical/_registry.yaml
domain/_registry.yaml
rules/_registry.yaml
```

Registry là **mục lục** của store — đọc registry là biết store có gì, nằm ở đâu, chứa nội dung gì.

### 4.2. Format chuẩn

```yaml
# [store]/_registry.yaml

[category]:
  - id: [unique-id]
    path: [relative-path-to-file]
    desc: "[mô tả ngắn nội dung file]"
```

Mỗi entry có đúng 3 trường:
- **id** — định danh duy nhất trong store, dùng để tham chiếu
- **path** — đường dẫn tương đối đến file, tính từ thư mục store
- **desc** — mô tả ngắn gọn nội dung bên trong, đủ để quyết định có cần load file hay không mà không cần mở file

Không thêm trường nào khác. Mọi thông tin chi tiết nằm trong file memory, không nằm trong registry.

### 4.3. Ví dụ hoàn chỉnh

```yaml
# technical/_registry.yaml

language:
  - id: csharp-async
    path: language/csharp-async.md
    desc: "Async/await patterns, Task, ValueTask, CancellationToken"

  - id: csharp-linq
    path: language/csharp-linq.md
    desc: "LINQ best practices, deferred execution, performance"

  - id: csharp-generics
    path: language/csharp-generics.md
    desc: "Generic types, constraints, covariance/contravariance"

framework:
  - id: efcore-patterns
    path: framework/efcore-patterns.md
    desc: "EF Core usage, lazy vs eager loading, change tracking"

  - id: aspnet-middleware
    path: framework/aspnet-middleware.md
    desc: "ASP.NET middleware pipeline, filters, error handling"

database:
  - id: postgresql-indexing
    path: database/postgresql-indexing.md
    desc: "Index types, query optimization, EXPLAIN analysis"

patterns:
  - id: repository-pattern
    path: patterns/repository-pattern.md
    desc: "Repository pattern implementation với EF Core"

  - id: cqrs
    path: patterns/cqrs.md
    desc: "CQRS, command/query separation, MediatR usage"
```

```yaml
# domain/_registry.yaml

payment:
  - id: payment-workflow
    path: payment/payment-workflow.md
    desc: "Quy trình thanh toán, trạng thái, luồng xử lý"

  - id: settlement-rules
    path: payment/settlement-rules.md
    desc: "Quy tắc đối soát T+1, tính commission"

  - id: refund-process
    path: payment/refund-process.md
    desc: "Quy trình hoàn tiền, phân biệt refund vs chargeback"

order:
  - id: order-lifecycle
    path: order/order-lifecycle.md
    desc: "Vòng đời đơn hàng, state transitions"

  - id: order-statuses
    path: order/order-statuses.md
    desc: "Danh sách trạng thái, điều kiện chuyển trạng thái"

general:
  - id: glossary
    path: glossary.md
    desc: "Bảng thuật ngữ nghiệp vụ chung toàn dự án"
```

```yaml
# rules/_registry.yaml

coding:
  - id: coding-standards
    path: coding/coding-standards.md
    desc: "Naming conventions, formatting, comment rules"

  - id: error-handling
    path: coding/error-handling.md
    desc: "Exception hierarchy, logging standards, error codes"

security:
  - id: security
    path: security/security.md
    desc: "Input validation, authentication, data protection"

api:
  - id: api-design
    path: api/api-design.md
    desc: "RESTful conventions, response format, versioning, pagination"

testing:
  - id: testing-standards
    path: testing/testing-standards.md
    desc: "Unit test conventions, naming, coverage requirements"
```

### 4.4. Nguyên tắc quản lý registry

**ID phải unique trong store.** Không có 2 entries cùng id trong 1 registry. Giữa các stores thì id có thể trùng (technical có `security`, rules cũng có `security` — khác store, không conflict).

**Mỗi file trong store phải có entry trong registry.** Nếu file tồn tại mà không có trong registry thì coi như file đó không tồn tại — sẽ không bao giờ được truy xuất.

**Registry phải luôn đồng bộ với thực tế.** Thêm file → thêm entry. Xóa file → xóa entry. Di chuyển file → cập nhật path. Đây là quy tắc kỷ luật quan trọng nhất.

**desc phải đủ tốt để quyết định mà không cần mở file.** Nếu đọc desc mà vẫn không biết file có chứa thứ mình cần hay không → desc viết chưa đủ rõ.

---

## 5. Memory Files — Quy tắc viết

### 5.1. Viết cho AI đọc, không phải cho người đọc

Memory files sẽ được nạp vào context window của AI model. Cách viết phải tối ưu cho AI hiểu và tuân thủ.

**Cụ thể, không mơ hồ:**
```
Sai:  "Nên follow team conventions khi đặt tên"
Đúng: "Class names: PascalCase. Method names: camelCase. Constants: UPPER_SNAKE_CASE"
```

**Dùng từ mạnh, rõ ràng:**
```
Sai:  "Có thể dùng async khi cần"
Đúng: "PHẢI dùng async cho mọi I/O operations. KHÔNG ĐƯỢC dùng .Result hoặc .Wait()"
```

**Cho ví dụ DO/DON'T:**

AI học từ ví dụ tốt hơn học từ mô tả. Mỗi rule quan trọng nên có ít nhất 1 ví dụ đúng và 1 ví dụ sai.

```markdown
## Repository Pattern

PHẢI dùng repository interface cho data access.

✅ Đúng:
```csharp
public class OrderService
{
    private readonly IOrderRepository _repo;
    public OrderService(IOrderRepository repo) => _repo = repo;
}
```

❌ Sai:
```csharp
public class OrderService
{
    private readonly AppDbContext _context;  // Truy cập DB trực tiếp, không qua repository
}
```
```

### 5.2. Một file, một chủ đề

Mỗi file tập trung vào một chủ đề duy nhất (nguyên tắc S). Nếu file bắt đầu cover nhiều chủ đề không liên quan → tách ra.

Dấu hiệu cần tách:
- File có nhiều hơn 2 heading cấp 2 (##) mà các heading không liên quan chặt chẽ
- Cần giải thích bằng "file này nói về A **và** B"
- Hai phần trong file thay đổi vì lý do khác nhau, ở thời điểm khác nhau

### 5.3. Ngắn gọn, đúng trọng tâm

Mỗi token trong context window đều có giá. Viết ngắn nhất có thể mà không mất thông tin.

- Không viết lịch sử, bối cảnh dài dòng, lý do tại sao chọn cách này
- Không lặp lại thông tin đã có ở file khác
- Dùng bảng thay vì đoạn văn khi liệt kê
- Code example ngắn, chỉ đủ minh họa — không viết full class

**Sai:**
```markdown
## Giới thiệu về Async/Await

C# giới thiệu async/await từ phiên bản 5.0 vào năm 2012. Đây là một tính năng 
quan trọng giúp lập trình viên viết code bất đồng bộ dễ dàng hơn. Trước khi có 
async/await, developers phải dùng callbacks hoặc Task.ContinueWith, rất khó đọc 
và maintain. Async/await giải quyết vấn đề này bằng cách...
```

**Đúng:**
```markdown
## Async/Await

PHẢI dùng `async Task` cho I/O operations.
PHẢI pass `CancellationToken` cho mọi async methods.
KHÔNG ĐƯỢC dùng `async void` (trừ event handlers).
KHÔNG ĐƯỢC gọi `.Result` hoặc `.Wait()` (deadlock risk).
```

### 5.4. Cấu trúc khuyến nghị cho từng loại memory

**Technical memory:**
```markdown
# [Tên chủ đề]

## Khi nào dùng
[Mô tả ngắn tình huống áp dụng]

## Rules
[Liệt kê PHẢI/KHÔNG ĐƯỢC]

## Patterns
[Ví dụ code DO/DON'T]

## Lưu ý
[Edge cases, pitfalls]
```

**Domain memory:**
```markdown
# [Tên concept/workflow]

## Định nghĩa
[Concept này là gì, trong 1-2 câu]

## Quy trình / Trạng thái
[Mô tả flow hoặc state machine]

## Business rules
[Các quy tắc nghiệp vụ]

## Thuật ngữ liên quan
[Terms cần biết, link đến glossary nếu cần]
```

**Rules memory:**
```markdown
# [Tên constraint]

## PHẢI
[Liệt kê bắt buộc tuân thủ]

## KHÔNG ĐƯỢC
[Liệt kê cấm]

## Ví dụ
[DO/DON'T với code hoặc mô tả cụ thể]

## Ngoại lệ
[Trường hợp nào được phép không tuân thủ, nếu có]
```

Đây là cấu trúc khuyến nghị, không bắt buộc. Tùy nội dung mà điều chỉnh cho phù hợp — quan trọng là rõ ràng, cụ thể, và viết cho AI đọc.

---

## 6. Thêm mới memory

### Quy trình:

```
Bước 1: Xác định memory thuộc store nào (technical / domain / rules)
Bước 2: Viết file markdown theo quy tắc mục 5
Bước 3: Đặt file vào thư mục phù hợp trong store
Bước 4: Thêm entry vào _registry.yaml của store đó
```

### Nguyên tắc:

- Chỉ tạo file mới và thêm entry vào registry — không sửa file nào khác (O)
- Kiểm tra id không trùng với entry đã có trong cùng registry
- Viết desc đủ rõ để người khác hiểu file chứa gì mà không cần mở

### Ví dụ:

Team bắt đầu dùng SignalR cho real-time features.

```
1. Tạo file: technical/framework/signalr-patterns.md
2. Thêm vào technical/_registry.yaml:

   framework:
     ...entries hiện có...
     - id: signalr-patterns
       path: framework/signalr-patterns.md
       desc: "SignalR hub patterns, group management, connection lifecycle"

3. Xong. Không sửa thêm gì.
```

---

## 7. Cập nhật memory

### Khi nào cần cập nhật:

- Kỹ thuật thay đổi (upgrade framework version, đổi pattern)
- Nghiệp vụ thay đổi (client thay đổi business rule)
- Constraint thay đổi (client thêm security requirement)

### Quy trình:

```
Bước 1: Sửa nội dung file markdown
Bước 2: Nếu scope thay đổi đáng kể → cập nhật desc trong registry
Bước 3: Nếu file được tách nhỏ → tạo files mới, cập nhật registry, xóa file cũ
```

### Nguyên tắc:

- Cập nhật nội dung file: tự do, không cần thay đổi gì khác
- Cập nhật desc trong registry: chỉ khi nội dung thay đổi đáng kể đến mức desc cũ không còn chính xác
- Nếu cập nhật làm file phình to hoặc cover thêm chủ đề mới → tách file (S)

---

## 8. Xóa memory

### Khi nào cần xóa:

- Kỹ thuật không còn dùng (bỏ Redis, chuyển sang Memcached)
- Nghiệp vụ không còn tồn tại (bỏ tính năng)
- Đã merge vào file khác

### Quy trình:

```
Bước 1: Xóa entry khỏi _registry.yaml
Bước 2: Xóa file markdown
```

### Nguyên tắc:

- Xóa entry trước, xóa file sau — tránh tình trạng registry trỏ đến file không tồn tại
- Kiểm tra không có file nào khác reference đến id sắp xóa (nếu có cross-reference)
- Xóa trong 1 store không ảnh hưởng store khác

---

## 9. Bảo trì memory

### 9.1. Kiểm tra định kỳ

**Hàng sprint (2-4 tuần):**
- Có file nào trong store mà chưa có entry trong registry? (file mồ côi)
- Có entry nào trong registry mà file không tồn tại? (entry chết)
- Có file nào nội dung đã lỗi thời?

**Hàng quý:**
- Review toàn bộ technical store — còn đúng với tech stack hiện tại?
- Review toàn bộ rules store — còn đúng với constraint hiện tại?
- Có file nào phình to cần tách? (kiểm tra S)

### 9.2. Trách nhiệm

| Store | Người chịu trách nhiệm chính |
|---|---|
| Technical | Tech lead / Senior developer |
| Domain | Business analyst / Tech lead |
| Rules | Tech lead / Project manager |
| Registry sync | Tech lead (đảm bảo registry luôn đồng bộ) |

### 9.3. Dấu hiệu memory đang có vấn đề

- AI output không tuân thủ rules → kiểm tra rules store có đầy đủ và rõ ràng không
- AI output sai nghiệp vụ → kiểm tra domain store có chính xác không
- AI output dùng sai pattern/API → kiểm tra technical store có cập nhật không
- AI output đúng nhưng không nhất quán giữa các lần → kiểm tra có files conflict nhau không

---

## 10. Context — Memory ephemeral

Context là loại memory thứ 4, nhưng không lưu trữ trong hệ thống. Con người cung cấp mỗi lần invoke skill.

### Context chứa gì:

- Mô tả công việc cần thực hiện
- Acceptance criteria / expected output
- Thông tin bổ sung specific cho task hiện tại

### Context không chứa:

- Kiến thức kỹ thuật chung (thuộc technical store)
- Kiến thức nghiệp vụ chung (thuộc domain store)
- Quy tắc, conventions (thuộc rules store)

### Ranh giới rõ ràng:

Nếu thông tin sẽ **dùng lại** cho nhiều tasks → nó thuộc về 1 trong 3 stores, không phải context.

Nếu thông tin chỉ **đúng cho task này** → nó là context.

---

## 11. HARNESS.yaml — File gốc

File entry point mô tả tổng quan memory system của dự án:

```yaml
# HARNESS.yaml

project: "Tên dự án"
description: "Mô tả ngắn về dự án"

memory_stores:
  technical:
    path: technical/
    registry: technical/_registry.yaml
    description: "Hiểu biết kỹ thuật: ngôn ngữ, framework, patterns"

  domain:
    path: domain/
    registry: domain/_registry.yaml
    description: "Hiểu biết nghiệp vụ: workflow, business rules, thuật ngữ"

  rules:
    path: rules/
    registry: rules/_registry.yaml
    description: "Ràng buộc dự án: coding standards, security, API conventions"
```

Ai mới tiếp cận dự án, đọc file này là hiểu memory system được tổ chức như thế nào.

---

## Tóm tắt

| Nguyên tắc | Áp dụng |
|---|---|
| **S — Single Responsibility** | 1 store = 1 loại memory. 1 file = 1 chủ đề. |
| **O — Open/Closed** | Thêm mới = thêm file + thêm entry. Không sửa thứ khác. |
| **I — Interface Segregation** | Chỉ load files cần thiết, không dump toàn bộ store. |
| **D — Dependency Inversion** | Truy xuất qua registry, không trỏ thẳng vào file path. |
| **Registry** | Mục lục duy nhất. Entry = id + path + desc. Luôn đồng bộ với thực tế. |
| **Files** | Viết cho AI đọc. Cụ thể, có ví dụ DO/DON'T, ngắn gọn. |
| **Context** | Không lưu trữ. Do con người cung cấp mỗi lần invoke. |
| **Bảo trì** | Registry sync mỗi sprint. Full review mỗi quý. |
