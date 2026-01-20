# Hướng dẫn Publish Package lên NPM

## Bước 1: Cấu hình package.json

1. Mở `shared/package.json` và cập nhật:
   - `name`: Đổi `@your-org/neverthrow-with-logger` thành tên package của bạn (ví dụ: `@your-username/neverthrow-with-logger`)
   - `author`: Thêm thông tin author
   - `repository.url`: Cập nhật URL repository (nếu có)

## Bước 2: Build Package

```bash
cd shared
npm install
npm run build
```

## Bước 3: Kiểm tra Package

```bash
# Kiểm tra files sẽ được publish
npm pack --dry-run

# Tạo tarball để test
npm pack
```

## Bước 4: Đăng nhập NPM

```bash
# Nếu chưa có tài khoản, tạo tại https://www.npmjs.com/signup
npm login
```

## Bước 5: Publish

### Publish công khai (public):
```bash
npm publish --access public
```

### Publish với scope (private hoặc public):
```bash
# Nếu package name bắt đầu với @your-org/, cần chỉ định access
npm publish --access public
```

## Bước 6: Kiểm tra sau khi publish

```bash
# Kiểm tra package đã được publish
npm view @your-org/neverthrow-with-logger
```

## Cập nhật Version

Khi cần cập nhật version:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Sau đó publish lại
npm publish --access public
```

## Lưu ý

1. **Package Name**: Đảm bảo tên package chưa tồn tại trên npm
2. **Version**: Mỗi lần publish cần tăng version
3. **Access**: Packages với scope (@your-org/...) cần chỉ định `--access public` nếu muốn public
4. **Files**: Chỉ files trong `dist/` và `README.md` sẽ được publish (theo `.npmignore`)
