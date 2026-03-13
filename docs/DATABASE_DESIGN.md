# Báo cáo Thiết kế Cơ sở dữ liệu
## University Idea Management System

---

## 1. Database Overview

**Công nghệ:** PostgreSQL 18 (Neon/Docker)  
**ORM:** Prisma 7  
**Quy ước:** UUID cho primary key, snake_case bảng, `createdAt`/`updatedAt` trên mọi bảng.

---

## 2. Security

### 2.1 Mật khẩu và Xác thực

| Biện pháp | Mô tả |
|-----------|-------|
| **Password hashing** | Mật khẩu được băm (bcrypt/argon) qua `hashPassword()` trước khi lưu; không lưu plaintext. |
| **`passwordHash`** | Lưu trong bảng `users`, kiểu `TEXT`/`VARCHAR` phù hợp, không có index (tránh tấn công tìm kiếm). |
| **JWT Access Token** | Thời gian sống ngắn (mặc định 15 phút, `JWT_ACCESS_EXPIRES`); vai trò/phòng ban cập nhật có hiệu lực sau khi token hết hạn. |
| **Refresh Token** | Lưu token ID trong `refresh_tokens`; token reuse detection: khi phát hiện reuse, thu hồi toàn bộ family token → giảm thiểu token theft. |

### 2.2 Token và Phiên

| Bảng | Mục đích |
|------|----------|
| `refresh_tokens` | Lưu `tokenId`, `userId`, `expiresAt`; `onDelete: Cascade` khi user bị xóa. |
| `password_reset_tokens` | Token reset mật khẩu dạng hash, có thời hạn; `tokenHash` unique để tránh trùng. |

### 2.3 Phân quyền (Authorization)

- **Zero-trust:** Không tin client-supplied roles; JWT roles được lấy từ DB tại thời điểm login.
- **Guards:** `JwtAuthGuard` → `RolesGuard` / `PermissionsGuard` bảo vệ endpoint.
- **Permissions:** Định nghĩa trong `ROLE_PERMISSION_TABLE`; chỉ ADMIN có quyền `USERS`, `DEPARTMENTS`, `ACADEMIC_YEARS`, `SYSTEM_CONFIG`.

### 2.4 Bảo vệ ứng dụng

| Biện pháp | Chi tiết |
|-----------|----------|
| **Rate limiting** | Throttler (mặc định 100 req/60s) tránh brute-force và DoS. |
| **Validation** | Zod schema loại bỏ unknown keys mặc định → giảm mass-assignment. |
| **CORS** | Bắt buộc cấu hình `CORS_ORIGINS` trong production. |
| **Env validation** | `env.schema.ts` (Zod) validate biến môi trường tại bootstrap. |

---

## 3. Appropriate Data Types

### 3.1 Định danh (IDs)

| Kiểu | Mô tả |
|------|-------|
| `UUID` | Primary key cho tất cả bảng (`gen_random_uuid()`); không lộ thứ tự, an toàn hơn auto-increment. |

### 3.2 Chuỗi

| Kiểu DB | Ví dụ | Lý do |
|---------|-------|-------|
| `VarChar(n)` | `email` (unique), `fullName`(255), `phone`(30), `title`(500) | Giới hạn độ dài phù hợp nghiệp vụ và hiệu năng. |
| `Text` | `description`, `message`, `address`, `error` | Cho nội dung dài, không cần index. |
| `VarChar(64)` | `tokenHash` | Hash có độ dài cố định. |
| `VarChar(10)` | `value` (vote/reaction: "up"/"down"), `status` | Enum-like, nhỏ gọn. |

### 3.3 Số và Boolean

| Kiểu | Ví dụ |
|------|-------|
| `Int` | `sizeBytes`, `progress` (0–100) |
| `Boolean` | `isActive`, `isRead`, `isAnonymous`, `isLocked`, `wasEverClosed` |
| `Date` | `dateOfBirth` (@db.Date) khi chỉ cần ngày |

### 3.4 Thời gian

| Kiểu | Mô tả |
|------|-------|
| `DateTime` | `createdAt`, `updatedAt`, `startDate`, `endDate`, `expiresAt`, `ideaSubmissionClosesAt`, `interactionClosesAt` |

### 3.5 Quy ước chung

- Dùng `VarChar` khi cần giới hạn độ dài, `Text` cho nội dung không giới hạn.
- `DateTime` cho mọi timestamp; `Date` cho trường chỉ cần ngày.
- Các trường enum-like dùng `VarChar(10–50)` thay vì enum PostgreSQL để dễ mở rộng.

---

## 4. Role Implementation

### 4.1 Bảng `roles`

```prisma
model Role {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @unique
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("roles")
}
```

- **`name`** unique: đảm bảo mỗi vai trò tồn tại duy nhất.
- **Các vai trò cố định:** ADMIN, QA_MANAGER, QA_COORDINATOR, STAFF (seed qua `seedRoles()`).

### 4.2 Liên kết User ↔ Role

```prisma
model User {
  roleId  String @db.Uuid
  role    Role   @relation(fields: [roleId], references: [id], onDelete: Restrict)
  // ...
}
```

- **One-to-Many:** Mỗi user có **một** role; mỗi role có nhiều user.
- **`onDelete: Restrict`:** Không cho xóa role nếu còn user gắn với role đó.
- **`roleId` bắt buộc:** Mọi user phải có role.

### 4.3 Permission Mapping (Application Layer)

| Role | Permissions |
|------|-------------|
| ADMIN | SYSTEM_CONFIG, USERS, DEPARTMENTS, ACADEMIC_YEARS |
| QA_MANAGER | (role-based endpoints, không dùng permission table) |
| QA_COORDINATOR | (role-based endpoints) |
| STAFF | (role-based endpoints) |

- Mapping định nghĩa trong `roles.ts` (`ROLE_PERMISSION_TABLE`), không lưu trong DB.
- `PermissionsGuard` và `RolesGuard` kiểm tra tại runtime dựa trên JWT payload.

### 4.4 Route Protection

| Endpoint pattern | Guard | Ví dụ roles |
|------------------|-------|-------------|
| CRUD users/departments/academic-years | `JwtAuthGuard`, `PermissionsGuard` | USERS, DEPARTMENTS, ACADEMIC_YEARS |
| Categories | `RolesGuard` | QA_MANAGER |
| Submission cycles | `RolesGuard` | QA_MANAGER |
| Ideas (submit, vote, comment) | `RolesGuard` | STAFF, QA_COORDINATOR, QA_MANAGER |
| Export | `RolesGuard` | QA_MANAGER |
| Cloudinary | `RolesGuard` | ADMIN |

---

## 5. Referential Integrity

### 5.1 Foreign Keys và Delete Behavior

| Quan hệ | onDelete | Lý do |
|---------|----------|-------|
| `User.roleId` → `Role.id` | **Restrict** | Không xóa role khi còn user |
| `User.departmentId` → `Department.id` | **SetNull** | Cho phép xóa department; user mất department |
| `Idea.submittedById` → `User.id` | **Restrict** | Không xóa user còn idea |
| `Idea.categoryId` → `Category.id` | **SetNull** | Idea có thể không có category |
| `Idea.cycleId` → `IdeaSubmissionCycle.id` | **Restrict** | Không xóa cycle khi còn idea |
| `IdeaVote`, `IdeaComment`, `IdeaView`, `IdeaAttachment` → `Idea.id` | **Cascade** | Xóa idea thì xóa phiếu bầu, bình luận, view, đính kèm |
| `RefreshToken`, `PasswordResetToken`, `ExportJob`, `Notification` → `User.id` | **Cascade** | Xóa user thì xóa token, job, notification |
| `IdeaComment.parentCommentId` → `IdeaComment.id` | **Cascade** | Xóa comment gốc thì xóa reply |
| `CycleCategory` | **Cascade** (cycle, category) | Xóa cycle/category thì xóa liên kết |

### 5.2 Unique Constraints

| Bảng | Constraint | Mục đích |
|------|------------|----------|
| `idea_votes` | `(ideaId, userId)` | Mỗi user chỉ vote 1 lần/idea |
| `idea_comment_reactions` | `(commentId, userId)` | Mỗi user chỉ 1 reaction/comment |
| `cycle_categories` | `(cycleId, categoryId)` | Không trùng category trong một cycle |
| `users` | `email`, `phone` | Email và số điện thoại unique |
| `roles` | `name` | Tên role unique |
| `categories` | `name` | Tên category unique |

### 5.3 Indexes (Hiệu năng)

- **Foreign keys:** Index trên `roleId`, `departmentId`, `categoryId`, `cycleId`, `userId`, `ideaId`, v.v.
- **Truy vấn phổ biến:** `createdAt`, `status`, `isRead`, `(userId, isRead)`, `(ideaId, userId, createdAt)` cho analytics và filter.

---

## 6. Validation (1.4.1)

### 6.1 Backend (NestJS + Zod)

| Tầng | Công cụ | Chi tiết |
|------|---------|----------|
| **Request body** | `ZodValidationPipe` + Zod schema | Mỗi DTO có schema tương ứng (login, create idea, update user, v.v.) |
| **Security** | Zod `object()` | Mặc định strip unknown keys → chống mass-assignment |
| **Giới hạn** | `min()`, `max()`, `uuid()`, `url()`, `email()` | Ví dụ: title ≤ 500, email max 255, password 8–512 ký tự |

### 6.2 Ví dụ DTO Zod

```typescript
// Login
z.object({ email: z.string().email().max(255), password: z.string().min(8).max(512) })

// Create Idea
z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(10000),
  categoryId: z.string().uuid(),
  cycleId: z.string().uuid(),
  isAnonymous: z.boolean(),
  termsAccepted: z.literal(true),
  attachments: z.array(attachmentRefSchema).max(10).optional(),
})
```

### 6.3 Frontend (Next.js + Zod)

- Schema Zod đồng bộ với backend (ideas, auth, users, categories, departments, academic-years, submission-cycles).
- `zodResolver` + react-hook-form cho form validation trước khi gửi request.

### 6.4 Database Layer

- Prisma schema định nghĩa kiểu và ràng buộc; PostgreSQL enforce NOT NULL, UNIQUE, FOREIGN KEY.
- Kiểm tra nghiệp vụ (ví dụ: idea thuộc cycle đang mở) thực hiện trong service layer.

---

## 7. Design Documentation

### 7.1 Entity Relationship Summary

| Nhóm | Bảng | Mô tả |
|------|------|-------|
| **Auth & Users** | `roles`, `users`, `departments`, `refresh_tokens`, `password_reset_tokens` | Người dùng, vai trò, phòng ban, token |
| **Nội dung** | `categories`, `ideas`, `idea_attachments`, `idea_votes`, `idea_comments`, `idea_comment_reactions`, `idea_views` | Idea và tương tác |
| **Chu kỳ** | `academic_years`, `idea_submission_cycles`, `cycle_categories` | Năm học, chu kỳ nộp ý tưởng |
| **Hệ thống** | `notifications`, `export_jobs` | Thông báo, xuất dữ liệu |

### 7.2 Quy ước đặt tên

- **Bảng:** snake_case (`users`, `idea_votes`, `idea_submission_cycles`).
- **Cột:** camelCase trong Prisma, map sang snake_case trong DB khi cần.
- **Khóa ngoại:** `{model}Id` (ví dụ: `roleId`, `cycleId`).

### 7.3 Tài liệu tham khảo trong codebase

| File | Nội dung |
|------|----------|
| `backend/prisma/schema.prisma` | Schema chính |
| `backend/src/core/seed/seed.ts` | Seed roles, departments, admin user |
| `backend/src/modules/auth/constants/roles.ts` | Định nghĩa roles và permissions |
| `backend/README.md` | Security & compliance, migration |
| `README.md` | Tech stack, kiến trúc tổng quan |

---

## 8. Các mục bổ sung (nếu cần cho báo cáo)

### 8.1 Indexing Strategy

- Index trên FK để tăng tốc JOIN.
- Index trên cột filter/sort (createdAt, status, isRead).
- Composite index cho truy vấn thường dùng (ví dụ: `(ideaId, userId, createdAt)` cho analytics).

### 8.2 Backup & Recovery

- Neon: backup tự động; có thể restore từ point-in-time.
- Local PostgreSQL: nên cấu hình `pg_dump` hoặc volume backup cho Docker.

### 8.3 Migration Workflow

- Prisma Migrate: `npx prisma migrate dev` (dev), `npx prisma migrate deploy` (prod).
- Khi dùng Neon/connection pooler: dùng `DIRECT_URL` cho migration để tránh P1002 advisory lock.

---

*Tài liệu này phục vụ báo cáo thiết kế database cho University Idea Management System.*
