// Command aihub 启动 AI Hub 本地服务：托管前端单页并提供文件存储 API。
package main

import (
	"flag"
	"log"
	"net/http"

	web "aihub"
	"aihub/internal/api"
	"aihub/internal/store"
)

func main() {
	addr := flag.String("addr", ":8080", "HTTP 监听地址")
	dataDir := flag.String("data", "./data", "数据文件目录（aihub.json / prefs.json）")
	flag.Parse()

	st, err := store.New(*dataDir)
	if err != nil {
		log.Fatalf("初始化存储失败: %v", err)
	}

	h := &api.Handler{Store: st, Page: web.Page}
	log.Printf("AI Hub 已启动: http://localhost%s （数据目录: %s）", *addr, *dataDir)
	log.Fatal(http.ListenAndServe(*addr, h.Mux()))
}
