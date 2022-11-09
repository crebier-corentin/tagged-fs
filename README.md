A simple program to tag files and search said files by tags.

Dependency [https://github.com/zserge/lorca](https://github.com/zserge/lorca) has been vendored in `deps/` to remove `--enable-automation` Chrome flag.

# Runtime Requirements

- Chrome, Chromium, or Edge
- **Linux** GTK3 (required for file picker)

# Build Requirements

- Go 1.19
- Node.js
- **Windows** [go-winres](https://github.com/tc-hib/go-winres)

# Dev Commands

Dev `server` with [watchexec](https://github.com/watchexec/watchexec)

```
watchexec.exe -r -e go -- go run .\cmd\server\
```

Dev `web`

```
npm run dev
```
