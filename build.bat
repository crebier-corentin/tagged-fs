go build -o bin/windows/tagged-fs-cli.exe -ldflags="-s -w" ./cmd/cli
go build -o bin/windows/tagged-fs-server.exe -ldflags="-s -w" -tags=nomsgpack ./cmd/server

cd cmd/gui && go-winres simply --icon icon.png && cd ../../ 
cd web/ && npm run build && cd ../ && go build -o bin/windows/tagged-fs-gui.exe -ldflags="-s -w -H=windowsgui" -tags=nomsgpack ./cmd/gui