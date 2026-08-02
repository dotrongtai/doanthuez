# Hướng dẫn CI/CD + Deploy AWS (EC2 + ECR + RDS + CloudWatch + GitLab CI)

> Tài liệu mô tả **hệ thống thật đã được triển khai** (không còn là kế hoạch) — account AWS `348517220499`, region `ap-southeast-1`. Mọi resource dưới đây đã tồn tại và đang chạy. Domain hiện dùng thẳng IP; khi có domain riêng, xem mục 10.

## 0. Tổng quan kiến trúc

```
GitLab CI (push nhánh main)
   │
   ├─ test    : npm ci, typecheck, prisma generate, unit test
   ├─ build   : docker build → push ECR (tag :latest + :<commit-sha>)
   └─ deploy  : SSH vào EC2 → docker pull → docker run (restart container)
   
                          ┌─────────────────────────────┐
Internet ── HTTP(80) ────▶│  EC2 i-01acfdcd9a4387c8f      │
             (443 sẵn SG) │  Elastic IP: 52.221.4.52      │
                          │  Nginx (reverse proxy)        │
                          │   ├─ /api/* → 127.0.0.1:3001  │──┐
                          │   └─ /*     → 127.0.0.1:3000  │  │
                          │  Docker containers:           │  │
                          │   - clinic-backend  (:3001)   │  │
                          │   - clinic-frontend (:3000)   │  │
                          │  IAM Role: clinic-ec2-role     │  │
                          │  (S3 + CloudWatch + ECR pull) │  │
                          └───────────────┬────────────────┘  │
                                          │ 3306 (SG→SG)       │ awslogs driver
                          ┌───────────────▼────────────────┐  │
                          │  RDS MySQL 8.0: clinic-system-db │  │
                          │  (private, chỉ EC2 SG truy cập)  │  │
                          └───────────────────────────────┘  │
                                                              ▼
                          ┌─────────────────────────────────────┐
                          │  CloudWatch Logs                     │
                          │  /clinic-system/backend, /frontend   │
                          │  (retention 14 ngày)                 │
                          └───────────────────────────────────┘

ECR repositories: clinic-backend, clinic-frontend (lifecycle: giữ 10 image gần nhất)
```

**URL hiện tại**: http://52.221.4.52 (frontend), http://52.221.4.52/api/v1 (backend API).

## 1. Từng thành phần chi tiết

### 1.1. RDS MySQL — `clinic-system-db`

| | |
|---|---|
| Endpoint | `clinic-system-db.c5uiqgmuu787.ap-southeast-1.rds.amazonaws.com` |
| Port | 3306 |
| Database | `clinic` |
| Instance class | `db.t3.micro`, 20GB gp2 |
| Public access | Có (nhưng Security Group chặn — xem dưới) |
| Security Group | `sg-0d510c5e330e8dcf0` — cho phép port 3306 từ: (1) IP máy dev cá nhân `/32`, (2) toàn bộ `sg-0f15b7ba73b19fc15` (chính là EC2) |

Đây là database **duy nhất**, EC2 và máy dev đều trỏ vào cùng 1 instance này — không có DB riêng cho local/prod.

### 1.2. ECR (Elastic Container Registry)

2 repository, cùng account/region:
- `348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-backend`
- `348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-frontend`

Mỗi lần CI build sẽ push 2 tag: `latest` (dùng để deploy) và `<commit-sha ngắn>` (giữ lịch sử, rollback thủ công nếu cần bằng cách đổi tag trong lệnh `docker run` trên EC2). Lifecycle policy tự xoá image cũ, chỉ giữ 10 image gần nhất mỗi repo — tránh phí lưu trữ tăng vô hạn.

### 1.3. IAM — 2 identity tách biệt theo đúng nguyên tắc least-privilege

**a) `clinic-ec2-role`** (IAM Role, gắn vào EC2 qua instance profile cùng tên) — dùng bởi **ứng dụng chạy trên EC2**:
- Quyền S3 (đọc/ghi bucket `clinic-files` — *xem lưu ý mục 8*)
- Quyền CloudWatch Logs (`logs:PutLogEvents`, `CreateLogGroup`, `CreateLogStream`... scope vào `/clinic-system/*`)
- Quyền **kéo** image từ ECR (`ecr:BatchGetImage`, `GetDownloadUrlForLayer`, `BatchCheckLayerAvailability`, `GetAuthorizationToken`)
- Không có access key tĩnh nào — EC2 tự lấy credentials tạm thời qua instance metadata service. Verify: SSH vào EC2 chạy `curl http://169.254.169.254/latest/meta-data/iam/security-credentials/` → phải in ra `clinic-ec2-role`.

**b) `clinic-ci-deploy`** (IAM User, có access key) — dùng bởi **GitLab CI runner** (không chạy trên hạ tầng AWS nên không gắn Role được, đây là ngoại lệ duy nhất còn cần access key tĩnh):
- Chỉ có quyền **đẩy (push)** image lên đúng 2 ECR repo trên (`PutImage`, `InitiateLayerUpload`, `UploadLayerPart`, `CompleteLayerUpload`, `BatchCheckLayerAvailability`, `GetAuthorizationToken`) — không có quyền gì khác (không S3, không EC2, không IAM).
- Access Key ID/Secret đã tạo — đưa vào GitLab CI/CD Variables (mục 4), **không** lưu trong repo dưới bất kỳ hình thức nào.

### 1.4. EC2 — `i-01acfdcd9a4387c8f`

| | |
|---|---|
| Type | `t3.micro` (2 vCPU, 1GB RAM) |
| AMI | Ubuntu 22.04 LTS (`ami-06afb763249172368`) |
| Elastic IP | `52.221.4.52` (cố định, không đổi khi restart) |
| Security Group | `sg-0f15b7ba73b19fc15` — `22` (SSH, chỉ IP admin), `80`/`443` (public) |
| Key pair | `clinic-ec2-key` (file `.pem` — giữ ở máy dev, dùng để SSH thủ công khi cần debug) |
| Cài sẵn (qua user-data lúc launch) | Docker CE, Docker Compose plugin, AWS CLI v2, Nginx, Certbot, CloudWatch Agent |

Docker daemon và Nginx đều **enabled** (tự khởi động cùng EC2 reboot). Container chạy với `--restart unless-stopped` nên cũng tự sống lại sau khi Docker daemon khởi động — không cần PM2 hay bất kỳ process manager nào khác, Docker tự đảm nhiệm vai trò đó.

### 1.5. 2 container đang chạy trên EC2

```
clinic-backend   347...amazonaws.com/clinic-backend:latest    127.0.0.1:3001->3001
clinic-frontend  347...amazonaws.com/clinic-frontend:latest   127.0.0.1:3000->3000
```

Cả 2 chỉ bind vào `127.0.0.1` (không expose trực tiếp ra internet) — **Nginx là cửa ngõ duy nhất** ra ngoài qua port 80/443, đúng nguyên tắc reverse-proxy: TLS termination, header chuẩn hoá, và không lộ port ứng dụng thô.

Biến môi trường của `clinic-backend` nằm trong `~/clinic/backend.env` trên EC2 (không tracked bởi git, không nằm trong image) — build 1 lần, deploy lại không cần build lại file này trừ khi đổi cấu hình.

Log của cả 2 container dùng Docker log driver `awslogs` — đẩy thẳng stdout lên CloudWatch Log Group tương ứng (`/clinic-system/backend`, `/clinic-system/frontend`), **không cần CloudWatch Agent tail file** như cách làm PM2 truyền thống — đơn giản hơn nhiều vì Docker tích hợp sẵn.

### 1.6. Nginx (cài trực tiếp trên EC2 host, không container hoá)

Route `/api/*` → backend, còn lại → frontend. Cấu hình tại `/etc/nginx/sites-available/clinic` trên EC2 (không nằm trong repo — sửa qua SSH nếu cần đổi domain/SSL, xem mục 10).

### 1.7. CloudWatch Logs

2 Log Group, retention 14 ngày (tự xoá log cũ, tránh phí lưu trữ tăng vô hạn):
- `/clinic-system/backend`
- `/clinic-system/frontend`

Xem log: CloudWatch Console → Log groups → chọn group → Log streams (mỗi lần container restart tạo 1 stream mới).

## 2. Dockerfile — giải thích từng bước

### Backend (`clinic_system/Dockerfile`)

Multi-stage build:
1. **Stage `build`**: cài `openssl` **trước** khi chạy `prisma generate` — lý do: nếu thiếu, Prisma tự đoán sai phiên bản OpenSSL (`openssl-1.1.x`) trong khi Debian 12 (base image `node:20-slim`) thực tế dùng OpenSSL 3.x, dẫn đến query engine không load được lúc chạy thật (lỗi rất khó debug vì image build "thành công" nhưng container crash khi start). Sau đó `npm ci` → copy code → `prisma generate` → `npm run build` (biên dịch TypeScript qua `nest build`) → `npm prune --omit=dev` (xoá devDependencies, giữ lại `@prisma/client` đã generate vì nó là dependency thật, không phải dev).
2. **Stage `production`**: base image sạch, cài `fonts-dejavu-core`/`fonts-noto` (bắt buộc để `pdf.service.ts` render được dấu tiếng Việt trong phiếu khám/đơn thuốc/PDF), copy `dist/`, `node_modules/` đã prune, `prisma/` (schema cần thiết lúc runtime để Prisma resolve datasource), `package.json`. Entrypoint: `node dist/main.js`.

### Frontend (`clinic_system_frontend/Dockerfile`)

Dựa trên Next.js **standalone output** (`next.config.mjs` đã bật `output: 'standalone'`) — build ra `.next/standalone` chỉ chứa đúng phần dependency đã được tree-shake cần thiết để chạy `node server.js`, không cần copy nguyên `node_modules`.

**Điểm quan trọng nhất cần nhớ**: `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_APP_NAME` được Next.js **bake cứng vào bundle JS lúc build**, không đọc lúc container chạy — nên phải truyền qua `--build-arg` khi `docker build`, không phải qua `-e`/`--env-file` khi `docker run` (khác hoàn toàn với biến môi trường backend, vốn đọc runtime). Đổi domain/IP sau này bắt buộc phải build lại image mới, không sửa được bằng cách restart container với env khác.

## 3. GitLab CI/CD pipeline — 3 stage

`.gitlab-ci.yml` đã có sẵn trong cả 2 repo (nhánh `main`/`develop`), 3 stage:

1. **`test`** — chạy trên push vào `main` **và** `develop`: `npm ci`, typecheck, `prisma generate` (backend), unit test — chặn sớm code lỗi trước khi merge, không đợi đến lúc deploy mới phát hiện.
2. **`build`** — chỉ chạy khi push `main`: `docker build` bằng Docker-in-Docker (`docker:24-dind` service), login ECR bằng access key của `clinic-ci-deploy`, push 2 tag (`latest` + `$CI_COMMIT_SHORT_SHA`).
3. **`deploy`** — chỉ chạy khi push `main`: SSH vào EC2 bằng `SSH_PRIVATE_KEY`, trên EC2 tự `aws ecr get-login-password` (dùng IAM Role của chính EC2, **không** cần truyền access key nào qua SSH) → `docker pull` → `docker stop`/`rm` container cũ → `docker run` container mới → `docker image prune -f` dọn image cũ không dùng nữa.

## 4. GitLab CI/CD Variables cần thêm (Settings → CI/CD → Variables)

### Cả 2 repo (`clinic_system` và `clinic_system_frontend`):

| Key | Giá trị | Type | Ghi chú |
|---|---|---|---|
| `AWS_ACCESS_KEY_ID` | Access Key của user `clinic-ci-deploy` | Variable | Masked, Protected |
| `AWS_SECRET_ACCESS_KEY` | Secret Key tương ứng | Variable | Masked, Protected |
| `SSH_PRIVATE_KEY` | Toàn bộ nội dung file `clinic-ec2-key.pem` | **File** | Protected — dùng type "File" (không phải "Variable") để GitLab giữ đúng format nhiều dòng của PEM key |
| `EC2_HOST` | `52.221.4.52` | Variable | |
| `EC2_USER` | `ubuntu` | Variable | |

### Chỉ repo `clinic_system_frontend` (thêm 2 biến build-arg):

| Key | Giá trị |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://52.221.4.52/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `Clinic Management System` |

Access Key/Secret của `clinic-ci-deploy` và nội dung `.pem` mình đã gửi riêng qua kênh khác — không lặp lại ở đây theo nguyên tắc không lưu secret vào tài liệu/repo.

**Chỉ cần khai báo 1 lần** (protected/masked variables ở cấp Project áp dụng cho mọi pipeline run trên nhánh protected) — không phải làm lại mỗi lần push.

## 5. Test pipeline

Sau khi khai báo đủ variables ở mục 4, push 1 commit bất kỳ (hoặc bấm "Run pipeline" thủ công trong GitLab → CI/CD → Pipelines) trên nhánh `main` để pipeline chạy thật lần đầu — theo dõi từng stage trong GitLab UI, `deploy` stage log sẽ in ra kết quả SSH/docker run trên EC2.

## 6. Deploy thủ công (khi cần, không qua CI)

```bash
# Build + push (từ máy dev, cần Docker Desktop + AWS CLI đã login đúng account)
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com

cd clinic_system
docker build -t 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-backend:latest .
docker push 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-backend:latest

cd ../clinic_system_frontend
docker build --build-arg NEXT_PUBLIC_API_URL=http://52.221.4.52/api/v1 \
  -t 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-frontend:latest .
docker push 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-frontend:latest

# SSH vào EC2 và pull + restart
ssh -i clinic-ec2-key.pem ubuntu@52.221.4.52
sudo docker pull 348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-backend:latest
sudo docker stop clinic-backend && sudo docker rm clinic-backend
sudo docker run -d --name clinic-backend --restart unless-stopped -p 127.0.0.1:3001:3001 \
  --env-file ~/clinic/backend.env \
  --log-driver=awslogs --log-opt awslogs-region=ap-southeast-1 --log-opt awslogs-group=/clinic-system/backend --log-opt awslogs-create-group=true \
  348517220499.dkr.ecr.ap-southeast-1.amazonaws.com/clinic-backend:latest
# tương tự cho clinic-frontend (đổi port 3000, group /clinic-system/frontend)
```

## 7. Đổi cấu hình backend (`.env` runtime)

Sửa trực tiếp `~/clinic/backend.env` trên EC2 (SSH vào), rồi `docker restart clinic-backend` (không cần build lại image — biến này đọc runtime, khác với frontend). File hiện có: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `S3_BUCKET` (đang để trống, xem mục 8), `SMTP_*` (đang để trống — email chưa hoạt động cho tới khi điền), `GROQ_API_KEY` (AI feature, đang để trống).

## 8. S3 — bucket `aucophuha-clinic-files`

Tên `clinic-files` bị trùng với 1 account khác (bucket name unique toàn cầu trên S3) nên bucket thật dùng tên **`aucophuha-clinic-files`**.

**CloudFront bị chặn**: account AWS này còn mới, CloudFront báo lỗi *"Your account must be verified before you can add new CloudFront resources"* — cần liên hệ AWS Support để verify trước khi dùng được CloudFront. Đã tạo sẵn 1 Origin Access Control (`clinic-files-oac`, id `E3KINNRZKZA7QY`) chờ dùng sau khi account được verify.

**Phương án đang dùng thay thế**: bucket **public-read trực tiếp** (không qua CloudFront) — vẫn an toàn vì:
- Block Public Access chỉ mở đúng phần "cho phép bucket policy" (`BlockPublicPolicy=false`), **vẫn chặn ACL public** (`BlockPublicAcls=true`) — không ai upload/list được, chỉ `GetObject` (đọc) là public.
- Bucket policy giới hạn đúng action `s3:GetObject` trên `arn:aws:s3:::aucophuha-clinic-files/*`, không cấp quyền nào khác.
- Ghi/xoá file chỉ qua `clinic-ec2-role` (IAM Role của EC2) — đã test thật: upload + đọc public đều thành công.

Khi account được AWS verify xong, chuyển sang CloudFront theo đúng hướng dẫn cũ (mục "CloudFront" — dùng lại OAC `E3KINNRZKZA7QY` đã tạo sẵn) để không lộ bucket domain trực tiếp và có cache/CDN.

`backend.env` trên EC2 đã set: `S3_BUCKET=aucophuha-clinic-files`, `CLOUDFRONT_URL=` (trống, dùng URL S3 trực tiếp).

## 9. SMTP + AI (Groq) — đã cấu hình

`backend.env` trên EC2 đã điền đầy đủ:
- `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`/`SMTP_PASS` (Gmail App Password, không phải mật khẩu đăng nhập thường), `SMTP_SECURE=false` — dùng cho email quên/đặt lại mật khẩu, thông báo lịch hẹn.
- `GROQ_API_KEY`/`GROQ_MODEL=llama-3.3-70b-versatile` — cho tính năng trợ lý AI tóm tắt (Feature 83/86/87).

## 10.5. Lỗi hay gặp: frontend không gọi được backend sau khi đổi domain/IP

**Triệu chứng**: trang frontend load được nhưng mọi API call đều fail (network error trong console trình duyệt), dù `curl` trực tiếp vào backend vẫn trả 200 bình thường.

**Nguyên nhân**: `NEXT_PUBLIC_API_URL` bake cứng lúc build image (mục 2) — nếu build lại image với URL mới nhưng **quên pull + restart lại đúng container `clinic-frontend` trên EC2**, container cũ (bake sai URL, ví dụ vẫn còn `localhost:3001` từ lúc build test ở máy dev) tiếp tục chạy và phục vụ bundle cũ.

**Cách kiểm tra nhanh**: SSH vào EC2, chạy:
```bash
sudo docker exec clinic-frontend sh -c "grep -rl '<domain-hoặc-IP-đang-dùng>' /app 2>/dev/null | head -3"
```
Không ra kết quả nào → container đang chạy bundle build sai URL, cần build lại + `docker pull` + `docker rm -f clinic-frontend` + `docker run` lại (script deploy trong `.gitlab-ci.yml` mục 3 đã tự làm đúng bước này — lỗi này chỉ xảy ra khi deploy **thủ công** và quên bước pull/restart cho đúng container).

## 10. Chưa có domain riêng

Đang chạy thẳng qua IP `52.221.4.52`, chưa có HTTPS — xem mục 12 khi có domain.

## 9. AWS Budgets (khuyến nghị bật ngay)

1. Billing and Cost Management → Budgets → Create budget.
2. Cost budget, monthly, ngưỡng cảnh báo email ở 50%/80%/100%.
3. Account này có $100 credit — vẫn nên đặt budget để không bị bất ngờ khi credit dùng hết.

## 10. Khi có domain riêng (SSL)

```bash
ssh -i clinic-ec2-key.pem ubuntu@52.221.4.52
sudo nano /etc/nginx/sites-available/clinic   # đổi server_name từ 52.221.4.52 sang domain thật
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com       # tự cấp + tự gia hạn SSL
```

Sau khi có domain, phải **build lại frontend image** với `NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1` (cập nhật biến CI/CD `NEXT_PUBLIC_API_URL` rồi chạy lại pipeline) — nhắc lại: giá trị này bake cứng lúc build, đổi domain không tự áp dụng cho image cũ.

## 11. Ước tính chi phí hàng tháng

| Resource | Ước tính/tháng |
|---|---|
| EC2 t3.micro (24/7) | ~$8.5 |
| RDS db.t3.micro (24/7) | ~$13 |
| EBS (EC2 20GB + RDS 20GB) | ~$4 |
| ECR (2 repo, ≤10 image/repo) | <$1 |
| CloudWatch Logs (retention 14 ngày) | <$1 |
| Elastic IP (đang gắn instance chạy — miễn phí) | $0 |
| **Tổng** | **~$27–28/tháng** |

Account có $100 credit → đủ dùng khoảng 3.5 tháng nếu chạy 24/7 không tối ưu thêm gì. Muốn kéo dài: Stop EC2 (không Terminate) khi không cần demo — vẫn tính phí EBS storage nhưng compute EC2 ngừng tính.
