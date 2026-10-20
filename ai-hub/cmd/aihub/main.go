// Command aihub 启动 AI Hub 本地服务：托管前端单页并提供文件存储 API。
package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"

	web "aihub"
	"aihub/internal/api"
	"aihub/internal/store"
)

func main() {
	addr := flag.String("addr", ":1066", "HTTP 监听地址")
	dataDir := flag.String("data", "./data", "数据文件目录（aihub.json / prefs.json）")
	noBrowser := flag.Bool("no-browser", false, "启动后不自动打开浏览器")
	flag.Parse()

	st, err := store.New(*dataDir)
	if err != nil {
		log.Fatalf("初始化存储失败: %v", err)
	}
	if err := st.MigrateOnStartup(); err != nil {
		log.Printf("警告: Docs 文件迁移未完成: %v", err)
	}

	h := &api.Handler{Store: st, Page: web.Page}

	// 先绑定端口拿到实际地址（支持 :0 随机端口），再开浏览器，最后开始服务
	ln, err := net.Listen("tcp", *addr)
	if err != nil {
		log.Fatalf("监听 %s 失败: %v", *addr, err)
	}
	url := fmt.Sprintf("http://localhost:%d", ln.Addr().(*net.TCPAddr).Port)
	log.Printf("AI Hub 已启动: %s （数据目录: %s）", url, *dataDir)

	if !*noBrowser {
		if err := openBrowser(url); err != nil {
			log.Printf("自动打开浏览器失败（可手动访问 %s）: %v", url, err)
		}
	}
	log.Fatal(http.Serve(ln, h.Mux()))
}
