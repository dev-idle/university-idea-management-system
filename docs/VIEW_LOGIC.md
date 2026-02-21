# Logic đếm View (Idea Views)

## Tổng quan

View được ghi nhận khi user **tương tác thực sự** với idea, không phải khi chỉ mở trang. Hệ thống dùng **2 đường ghi** và **cửa sổ 20 phút** để tránh spam.

---

## 1. Database

### Bảng `IdeaView` (Prisma)

```
model IdeaView {
  id        String   @id
  ideaId    String
  userId    String
  createdAt DateTime

  @@index([ideaId])
  @@index([userId])
  @@index([ideaId, userId, createdAt])
}
```

- Mỗi record = 1 lượt view của 1 user cho 1 idea
- Không còn unique `(ideaId, userId)` — cho phép nhiều view sau mỗi 20 phút

---

## 2. Backend

### Endpoint

- **`POST /ideas/:id/view`**
- Roles: `STAFF`, `ADMIN`
- Response: `204 No Content`

### Logic `recordView()` (`ideas.service.ts`)

1. Kiểm tra idea tồn tại
2. **Cooldown 20 phút**: tìm `IdeaView` của user cho idea trong 20 phút gần nhất
3. Nếu có → **không ghi** (return)
4. Nếu không → `IdeaView.create({ ideaId, userId })`

### Nơi trả `viewCount`

`viewCount` = `_count.views` từ Prisma, map qua `mapIdeaToResponse()`:

- List ideas (Hub, My Ideas): `_count: { select: { comments: true, views: true } }`
- Idea detail: dùng cùng `mapIdeaToResponse`
- Sort "mostViewed": `{ views: { _count: 'desc' } }`

---

## 3. Frontend — Ghi view

### Hook `useIdeaViewTracker(activeIdeaId)`

**Tham số `activeIdeaId`**:
- Trang chi tiết: `id` (idea đang xem)
- Ideas Hub: `expandedId` (card đang expand)

### Hai đường ghi view

| Đường | Điều kiện | Thời điểm |
|-------|-----------|-----------|
| **Timer (dwell)** | User xem idea ≥ 5 giây | Sau 5s tab visible |
| **Action** | Vote hoặc comment | Ngay khi thao tác |

### Cửa sổ 20 phút (localStorage)

- Key: `idea-view-ts-${userId}` (scoped per user)
- Giá trị: `{ ideaId: timestamp }` (mỗi idea 1 timestamp)
- Khi đổi tài khoản → dùng key khác → cooldown độc lập
- Sau khi ghi view → lưu timestamp → trong 20 phút không ghi nữa
- Backend cũng kiểm tra cooldown (zero-trust)

### Chi tiết Timer (dwell 5s)

- Chạy khi `activeIdeaId` có giá trị và chưa trong cooldown
- **Visibility**: Tab ẩn → pause, tab hiện lại → resume
- Hết 5s → gọi `recordView.mutate(ideaId)`
- Ghi xong → cất timer

### Chi tiết Action

- **`markViewedByAction(ideaId)`** ghi view ngay lập tức
- Nếu đang chạy timer cho cùng idea → hủy timer (tránh ghi trùng)

---

## 4. Nơi gọi `markViewedByAction`

| Trang / Component | Khi nào gọi |
|------------------|-------------|
| **Trang chi tiết `/ideas/[id]`** | Vote (`handleVote`) hoặc comment (`handleComment`) |
| **Ideas Hub** | Vote trên card (`onVote`) |

### Trang chi tiết

```tsx
// activeIdeaId = id (idea đang xem)
const { markViewedByAction } = useIdeaViewTracker(id);

handleVote → markViewedByAction(id) + voteMutation
handleComment → markViewedByAction(id) + createCommentMutation
```

- Dwell: user xem trang ≥ 5s → ghi view
- Action: vote hoặc comment → ghi view ngay

### Ideas Hub

```tsx
// Parent chỉ cung cấp markViewedByAction (vote, comment); dwell xử lý trong từng IdeaCard
const { markViewedByAction } = useIdeaViewTracker(null);

// Mỗi IdeaCard: useDwellInView khi full content visible (ngắn hoặc đã expand)
// Phân nhánh: card ngắn = observe toàn card; card dài = observe header (byline + title)
onDwellComplete={markViewedByAction}
onVote={(id, v) => { markViewedByAction(id); ... }}
```

- **Card ngắn** (fit viewport): observe toàn bộ card — **100% card trong khung hình** ≥ 5s → ghi view
- **Card dài** (expand, cao hơn viewport): observe **header** (byline + tiêu đề) — header visible ≥ 5s → ghi view. Card bị lấn (sticky header, v.v.) không ảnh hưởng, miễn header còn trong viewport.
- Action: vote trên card → ghi view ngay
- **Không** ghi view khi chỉ click title/link sang trang chi tiết

---

## 5. Hiển thị View count

| Vị trí | Điều kiện hiện | Format |
|--------|----------------|--------|
| **Idea detail** (`/ideas/[id]`) | `views > 0` | `X view(s)` trong byline (time \| category \| views) |
| **Ideas Hub card** | Luôn hiện | Số trong engagement (icon Eye + số) |

### Schema frontend

```ts
viewCount: z.number().int().min(0).optional().default(0)
```

---

## 6. Mutation `useRecordViewMutation`

- Gọi `POST ideas/:id/view`
- Fire-and-forget: không invalidate query
- Số view mới chỉ hiện khi refetch (đổi trang, refetch list, v.v.)

---

## 7. Luồng tóm tắt

```
User mở idea
    ├─ Trang chi tiết (/ideas/[id])
    │   ├─ Dwell 5s (tab visible) → POST /view
    │   └─ Vote hoặc comment → POST /view
    │
    └─ Ideas Hub
        ├─ Dwell 5s: (a) bài ngắn → full card visible, (b) bài dài (expand) → header visible
        └─ Vote → POST /view

Mỗi lần ghi view:
    1. Kiểm tra localStorage (20 phút)
    2. Nếu OK → recordView.mutate(ideaId)
    3. Backend kiểm tra cooldown 20 phút
    4. Nếu OK → IdeaView.create()
```

---

## 8. Files liên quan

| File | Vai trò |
|------|---------|
| `backend/prisma/schema.prisma` | Model `IdeaView` |
| `backend/src/modules/ideas/ideas.controller.ts` | `POST :id/view` |
| `backend/src/modules/ideas/ideas.service.ts` | `recordView()`, `mapIdeaToResponse()` |
| `frontend/src/hooks/use-idea-view-tracker.ts` | Timer + Action, localStorage |
| `frontend/src/hooks/use-dwell-in-view.ts` | Dwell 5s; card ngắn = observe full, card dài = observe header |
| `frontend/src/hooks/use-ideas.ts` | `useRecordViewMutation()` |
| `frontend/src/app/(app)/ideas/[id]/page.tsx` | Dùng tracker, hiện views trong byline |
| `frontend/src/components/features/ideas/ideas-hub-content.tsx` | Dùng tracker, hiện views trên card |
