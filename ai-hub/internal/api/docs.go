package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"

	"aihub/internal/store"
)

// docs 处理笔记正文相关接口（Go 1.19 的 ServeMux 没有路径参数，手工解析后缀）：
//
//	GET  /api/docs/search?q=
//	GET  /api/docs/<id>
//	PUT  /api/docs/<id>/content
//	PUT  /api/docs/<id>/comments
func (h *Handler) docs(w http.ResponseWriter, r *http.Request) {
	suffix := strings.TrimPrefix(r.URL.Path, "/api/docs/")
	parts := strings.Split(suffix, "/")

	if len(parts) == 1 && parts[0] == "search" {
		h.docSearch(w, r)
		return
	}
	if len(parts) == 1 && parts[0] != "" {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", "GET")
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		h.getDoc(w, parts[0])
		return
	}
	if len(parts) == 2 && (parts[1] == "content" || parts[1] == "comments") {
		if r.Method != http.MethodPut {
			w.Header().Set("Allow", "PUT")
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		h.putDocPart(w, parts[0], parts[1], r)
		return
	}
	http.NotFound(w, r)
}

func (h *Handler) lookupDoc(id string) (*store.DocMeta, []byte) {
	raw, err := h.Store.ReadDB()
	if errors.Is(err, store.ErrNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, nil
	}
	meta, err := store.FindDoc(raw, id)
	if err != nil {
		return nil, nil
	}
	return meta, raw
}

func (h *Handler) getDoc(w http.ResponseWriter, id string) {
	meta, _ := h.lookupDoc(id)
	if meta == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "doc not found"})
		return
	}
	content, cMt, err := h.Store.ReadDoc(meta.File)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	resp := map[string]any{
		"id":           meta.ID,
		"name":         meta.Name,
		"fmt":          meta.Fmt,
		"file":         meta.File,
		"updatedAt":    meta.UpdatedAt,
		"content":      string(content),
		"contentMtime": strconv.FormatInt(cMt, 10),
	}
	if abs, ok := h.Store.AbsPath(meta.File); ok {
		resp["absPath"] = abs
	}
	if meta.Fmt == "json" {
		comments, mMt, err := h.Store.ReadComments(meta.File)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
		resp["comments"] = comments
		resp["commentsMtime"] = strconv.FormatInt(mMt, 10)
	}
	writeJSON(w, http.StatusOK, resp)
}

type putContentReq struct {
	Content string `json:"content"`
	Base    any    `json:"base"` // 纳秒 mtime 以字符串传递，避免 JS Number 精度丢失
	Force   bool   `json:"force"`
}

type putCommentsReq struct {
	Comments map[string]any `json:"comments"`
	Base     any            `json:"base"`
	Force    bool           `json:"force"`
}

// parseBase 把客户端回传的版本号解析为 int64；支持字符串、数字或缺省（0）。
func parseBase(v any) int64 {
	switch x := v.(type) {
	case string:
		n, _ := strconv.ParseInt(x, 10, 64)
		return n
	case float64:
		return int64(x)
	}
	return 0
}

func (h *Handler) putDocPart(w http.ResponseWriter, id, part string, r *http.Request) {
	meta, _ := h.lookupDoc(id)
	if meta == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "doc not found"})
		return
	}
	raw, err := io.ReadAll(io.LimitReader(r.Body, maxDBBytes))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "read body failed"})
		return
	}

	if part == "content" {
		var req putContentReq
		if err := json.Unmarshal(raw, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
			return
		}
		mtime, err := h.Store.WriteDoc(meta.File, []byte(req.Content), parseBase(req.Base), req.Force)
		if errors.Is(err, store.ErrConflict) {
			writeJSON(w, http.StatusConflict, map[string]any{"error": "conflict", "mtime": strconv.FormatInt(mtime, 10)})
			return
		}
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "mtime": strconv.FormatInt(mtime, 10)})
		return
	}

	var req putCommentsReq
	if err := json.Unmarshal(raw, &req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
		return
	}
	if req.Comments == nil {
		req.Comments = map[string]any{}
	}
	mtime, err := h.Store.WriteComments(meta.File, req.Comments, parseBase(req.Base), req.Force)
	if errors.Is(err, store.ErrConflict) {
		writeJSON(w, http.StatusConflict, map[string]any{"error": "conflict", "mtime": strconv.FormatInt(mtime, 10)})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true, "mtime": strconv.FormatInt(mtime, 10)})
}

func (h *Handler) docSearch(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		writeJSON(w, http.StatusOK, []any{})
		return
	}
	hits, err := h.Store.SearchDocs(q, 100)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, hits)
}

// exportAll 返回内联了全部正文/注释的单文件备份 JSON。
func (h *Handler) exportAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Allow", "GET")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	b, err := h.Store.ExportAssembled()
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not_initialized"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_, _ = w.Write(b)
}
