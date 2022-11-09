export PKG_CONFIG_PATH="/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/share/pkgconfig/"

go build -o bin/linux/tagged-fs-cli -ldflags="-s -w" ./cmd/cli
go build -o bin/linux/tagged-fs-server -ldflags="-s -w" -tags=nomsgpack ./cmd/server

cd web/ && npm run build && cd ../ && go build -o bin/linux/tagged-fs-gui -ldflags="-s -w" -tags=nomsgpack ./cmd/gui
