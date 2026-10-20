// Package api 是 AI Hub 本地 HTTP 服务：静态托管单页前端 + /api 数据接口。
package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"aihub/internal/store"
)

// 单次 PUT /api/db 的体积上限（64 MiB，本地工具足够）。
const maxDBBytes = 64 << 20

// Handler 聚合存储与嵌入的前端页面。
type Handler struct {
	Store *store.Store
	Page  []byte
}

// Mux 注册全部路由。
func (h *Handler) Mux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/", h.index)
	mux.HandleFunc("/api/db", h.db)
	mux.HandleFunc("/api/state", h.state)
	return mux
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

// index 返回嵌入的前端单页；只接受精确的 /，其余路径 404。
func (h *Handler) index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(h.Page)
}

// db 处理全量业务数据：GET 读取（未初始化返回 {"empty":true}），PUT 整文件覆盖。
func (h *Handler) db(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		b, err := h.Store.ReadDB()
		if errors.Is(err, store.ErrNotFound) {
			// 首次启动：用 200 + 空标记而非 404，避免浏览器控制台报网络错误
			writeJSON(w, http.StatusOK, map[string]bool{"empty": true})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write(b)
	case http.MethodPut:
		raw, err := io.ReadAll(io.LimitReader(r.Body, maxDBBytes+1))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read body failed"})
			return
		}
		if len(raw) > maxDBBytes {
			writeJSON(w, http.StatusRequestEntityTooLarge, map[string]string{"error": "payload too large"})
			return
		}
		size, err := h.Store.WriteDB(raw)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "size": size})
	default:
		w.Header().Set("Allow", "GET, PUT")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

// state 处理界面偏好：GET 读取，PUT 全量替换。
func (h *Handler) state(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, http.StatusOK, h.Store.ReadState())
	case http.MethodPut:
		var st store.State
		raw, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read body failed"})
			return
		}
		if err := json.Unmarshal(raw, &st); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
			return
		}
		if err := h.Store.WriteState(st); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	default:
		w.Header().Set("Allow", "GET, PUT")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}
