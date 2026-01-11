# Hướng Dẫn Deploy Lên Vercel

## 📋 Yêu Cầu Trước Khi Deploy

- Tài khoản Vercel (miễn phí tại [vercel.com](https://vercel.com))
- Repository GitHub/GitLab/Bitbucket (hoặc deploy trực tiếp từ CLI)
- Node.js 18+ và pnpm được cài đặt

## 🚀 Cách 1: Deploy Qua Vercel Dashboard (Khuyến Nghị)

### Bước 1: Kết Nối Repository

1. Truy cập [vercel.com/new](https://vercel.com/new)
2. Chọn "Import Git Repository"
3. Kết nối với GitHub/GitLab và chọn repository này
4. Click "Import"

### Bước 2: Cấu Hình Project

Vercel sẽ tự động phát hiện Next.js. Kiểm tra các thiết lập sau:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm run build` (đã cấu hình trong vercel.json)
- **Install Command:** `pnpm install` (đã cấu hình trong vercel.json)
- **Output Directory:** `.next` (mặc định)
- **Root Directory:** `./` (để trống)

### Bước 3: Thiết Lập Environment Variables

Thêm các biến môi trường trong phần "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1
NEXT_PUBLIC_BACKEND_URL=https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net
NODE_ENV=production
```

**Lưu ý:** Thêm cho tất cả môi trường (Production, Preview, Development)

### Bước 4: Deploy

1. Click nút "Deploy"
2. Đợi quá trình build hoàn tất (thường mất 1-3 phút)
3. Vercel sẽ cung cấp URL production (ví dụ: `https://hotel-management-system-fe.vercel.app`)

## 🖥️ Cách 2: Deploy Qua Vercel CLI

### Cài Đặt Vercel CLI

```bash
pnpm add -g vercel
```

### Login Vercel

```bash
vercel login
```

### Deploy

Từ thư mục gốc của project:

```bash
# Deploy lên Preview (môi trường test)
vercel

# Deploy lên Production
vercel --prod
```

CLI sẽ hỏi các câu hỏi sau (chọn mặc định):

- Set up and deploy? **Y**
- Which scope? **Chọn tài khoản của bạn**
- Link to existing project? **N** (lần đầu)
- What's your project's name? **hotel-management-system-fe**
- In which directory is your code located? **./**

### Thiết Lập Environment Variables Qua CLI

```bash
# Thêm từng biến
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_BACKEND_URL production
vercel env add NODE_ENV production

# Hoặc import từ file .env
vercel env pull .env.production
```

## ⚙️ Cấu Hình Đã Thiết Lập

### vercel.json

Project đã có file `vercel.json` với các cấu hình:

- **Build Command:** Sử dụng pnpm
- **Regions:** Singapore (sin1) - gần với Azure East Asia backend
- **Rewrites:** Proxy API requests đến backend
- **Security Headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### .vercelignore

Loại bỏ các file không cần thiết khỏi deployment:

- node_modules
- Test files
- Local environment files
- IDE settings

## 🔄 Cập Nhật Deployment

### Tự Động (Khuyến Nghị)

Mỗi khi push code lên branch `main` hoặc `master`, Vercel sẽ tự động:

1. Build project
2. Chạy tests (nếu có)
3. Deploy lên production

**Preview Deployments:** Mỗi pull request sẽ có URL preview riêng

### Thủ Công

```bash
# Từ CLI
vercel --prod

# Hoặc từ Dashboard
# Vào project → Deployments → Redeploy
```

## 🌐 Custom Domain (Tùy Chọn)

### Thêm Domain Riêng

1. Vào Vercel Dashboard → Project → Settings → Domains
2. Nhập domain của bạn (ví dụ: `hotel.yourdomain.com`)
3. Cấu hình DNS records theo hướng dẫn của Vercel:

   - Type: **CNAME**
   - Name: **hotel** (hoặc subdomain bạn chọn)
   - Value: **cname.vercel-dns.com**

4. Đợi DNS propagation (có thể mất 24-48 giờ)

## 📊 Monitoring & Analytics

Vercel cung cấp sẵn:

- **Real-time Logs:** Xem logs của mỗi request
- **Analytics:** Số lượng visitors, performance metrics
- **Speed Insights:** Core Web Vitals
- **Web Vitals:** LCP, FID, CLS scores

Truy cập tại: Dashboard → Project → Analytics

## 🐛 Troubleshooting

### Build Fails

1. Kiểm tra logs trong Vercel dashboard
2. Test build locally: `pnpm run build`
3. Đảm bảo tất cả dependencies trong package.json

### Environment Variables Not Working

1. Verify variables có prefix `NEXT_PUBLIC_` cho client-side
2. Redeploy sau khi thay đổi env vars
3. Clear browser cache

### API Calls Failing

1. Kiểm tra `NEXT_PUBLIC_API_URL` đúng format
2. Verify CORS settings trên backend
3. Check network tab trong DevTools

### 404 Errors on Routes

1. Đảm bảo Next.js App Router structure đúng
2. Check `next.config.ts` không có conflicting rewrites
3. Verify dynamic routes có `[param]` format

## 📝 Checklist Trước Khi Deploy

- [ ] Test build locally: `pnpm run build && pnpm start`
- [ ] Verify environment variables trong `.env.example`
- [ ] Kiểm tra API endpoints hoạt động
- [ ] Test responsive design
- [ ] Review security headers
- [ ] Chuẩn bị custom domain (nếu có)
- [ ] Backup database trước production deploy

## 🔒 Security Best Practices

1. **Không commit** file `.env` vào git
2. Sử dụng Vercel's environment variables cho secrets
3. Enable Vercel's **Deployment Protection** cho production
4. Review **Security Headers** trong vercel.json
5. Enable **Web Application Firewall** (Vercel Pro)

## 💰 Chi Phí

- **Free Tier:**

  - 100GB bandwidth/tháng
  - Unlimited deployments
  - Automatic SSL
  - Preview deployments

- **Pro ($20/tháng):**
  - 1TB bandwidth
  - Advanced analytics
  - Team collaboration
  - Password protection

## 📞 Hỗ Trợ

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## 🎯 Production URL

Sau khi deploy thành công, project sẽ có URL dạng:

```
https://hotel-management-system-fe.vercel.app
```

Hoặc custom domain của bạn.

---

**Lưu ý:** File này được tạo tự động. Cập nhật theo nhu cầu project của bạn.
