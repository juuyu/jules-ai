package store

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// Docs 正文以独立文本文件存储：
//   data/docs/md/<id>.md
//   data/docs/json/<id>.json            原始 JSON，可被外部工具直接使用
//   data/docs/json/<id>.comments.json   注释 sidecar
// 主索引 aihub.json 的 docs 树只保留元数据（含相对路径 file 字段）。

var docRelRe = regexp.MustCompile(`^docs/(md|json)/[A-Za-z0-9_-]{8,}\.(md|json)$`)

// ErrConflict 表示文件在客户端读取后被别处改动（mtime 不匹配）。
var ErrConflict = errors.New("doc modified on disk")

// DocMeta 是索引中一条笔记的定位信息。
type DocMeta struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Fmt       string `json:"fmt"`
	File      string `json:"file"`
	UpdatedAt int64  `json:"updatedAt"`
}

// safeRel 校验相对路径必须落在 docs/md 或 docs/json 内，杜绝目录穿越。
func (s *Store) safeRel(rel string) (string, bool) {
	rel = filepath.ToSlash(filepath.Clean("/" + rel))[1:]
	if !docRelRe.MatchString(rel) {
		return "", false
	}
	dir, ext := filepath.Dir(rel), filepath.Ext(rel)
	if (dir == "docs/md" && ext != ".md") || (dir == "docs/json" && ext != ".json") {
		return "", false
	}
	return rel, true
}

func (s *Store) relAbs(rel string) string { return filepath.Join(s.dir, filepath.FromSlash(rel)) }

// AbsPath 返回数据文件在本机上的绝对路径（供界面展示）。
func (s *Store) AbsPath(rel string) (string, bool) {
	rel, ok := s.safeRel(rel)
	if !ok {
		return "", false
	}
	return s.relAbs(rel), true
}

func commentsRel(rel string) string { return strings.TrimSuffix(rel, ".json") + ".comments.json" }

// ReadDoc 读取正文文件与修改时间（UnixNano）；文件不存在视为空内容、mtime=0。
func (s *Store) ReadDoc(rel string) ([]byte, int64, error) {
	rel, ok := s.safeRel(rel)
	if !ok {
		return nil, 0, errors.New("invalid doc path")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	b, err := os.ReadFile(s.relAbs(rel))
	if errors.Is(err, os.ErrNotExist) {
		return nil, 0, nil
	}
	if err != nil {
		return nil, 0, err
	}
	st, err := os.Stat(s.relAbs(rel))
	if err != nil {
		return nil, 0, err
	}
	return b, st.ModTime().UnixNano(), nil
}

// ReadComments 读取注释 sidecar；缺失时返回空 map。
func (s *Store) ReadComments(rel string) (map[string]any, int64, error) {
	rel, ok := s.safeRel(rel)
	if !ok || filepath.Ext(rel) != ".json" {
		return map[string]any{}, 0, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	p := s.relAbs(commentsRel(rel))
	out := map[string]any{}
	st, err := os.Stat(p)
	if errors.Is(err, os.ErrNotExist) {
		return out, 0, nil
	}
	if err != nil {
		return nil, 0, err
	}
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, 0, err
	}
	_ = json.Unmarshal(b, &out)
	return out, st.ModTime().UnixNano(), nil
}

// WriteDoc 写入正文。base 为客户端读取时的 mtime：文件已被别处改动且未 force 时返回 ErrConflict。
func (s *Store) WriteDoc(rel string, b []byte, base int64, force bool) (int64, error) {
	rel, ok := s.safeRel(rel)
	if !ok {
		return 0, errors.New("invalid doc path")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	p := s.relAbs(rel)
	if base > 0 && !force {
		if st, err := os.Stat(p); err == nil && st.ModTime().UnixNano() != base {
			return st.ModTime().UnixNano(), ErrConflict
		}
	}
	if err := atomicWrite(p, b); err != nil {
		return 0, err
	}
	st, err := os.Stat(p)
	if err != nil {
		return time.Now().UnixNano(), nil
	}
	return st.ModTime().UnixNano(), nil
}

// WriteComments 写入注释 sidecar，冲突语义同 WriteDoc。
func (s *Store) WriteComments(rel string, comments map[string]any, base int64, force bool) (int64, error) {
	rel, ok := s.safeRel(rel)
	if !ok || filepath.Ext(rel) != ".json" {
		return 0, errors.New("invalid comments path")
	}
	b, err := json.MarshalIndent(comments, "", "  ")
	if err != nil {
		return 0, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	p := s.relAbs(commentsRel(rel))
	if base > 0 && !force {
		if st, err := os.Stat(p); err == nil && st.ModTime().UnixNano() != base {
			return st.ModTime().UnixNano(), ErrConflict
		}
	}
	if err := atomicWrite(p, b); err != nil {
		return 0, err
	}
	st, err := os.Stat(p)
	if err != nil {
		return time.Now().UnixNano(), nil
	}
	return st.ModTime().UnixNano(), nil
}

// FindDoc 在索引 JSON 中按 id 查找笔记节点。
func FindDoc(indexRaw []byte, id string) (*DocMeta, error) {
	var root map[string]any
	if err := json.Unmarshal(indexRaw, &root); err != nil {
		return nil, err
	}
	docs, _ := root["docs"].([]any)
	found := (*DocMeta)(nil)
	walkDocs(docs, func(n map[string]any) {
		if found != nil {
			return
		}
		if getString(n, "id") == id {
			fmt := getString(n, "fmt")
			if fmt == "" {
				fmt = "md"
			}
			found = &DocMeta{
				ID:        id,
				Name:      getString(n, "name"),
				Fmt:       fmt,
				File:      getString(n, "file"),
				UpdatedAt: getInt64(n, "updatedAt"),
			}
		}
	})
	if found == nil {
		return nil, ErrNotFound
	}
	return found, nil
}

// IngestDB 接收整份索引 JSON：把内嵌正文迁移成文件、清理孤儿文件，再原子落盘，返回规范化后的字节。
func (s *Store) IngestDB(raw []byte) ([]byte, error) {
	if !json.Valid(raw) {
		return nil, errors.New("invalid json body")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	var root map[string]any
	if err := json.Unmarshal(raw, &root); err != nil {
		return nil, err
	}
	docs, _ := root["docs"].([]any)

	referenced := map[string]bool{}
	allHaveFiles := true
	var migrateErr error
	walkDocs(docs, func(n map[string]any) {
		if migrateErr != nil {
			return
		}
		id := getString(n, "id")
		docFmt := getString(n, "fmt")
		if docFmt == "" {
			docFmt = "md"
		}
		ext := "md"
		if docFmt == "json" {
			ext = "json"
		}
		rel := getString(n, "file")
		if _, ok := s.safeRel(rel); !ok {
			rel = fmt.Sprintf("docs/%s/%s.%s", docFmt, id, ext)
		}
		if _, ok := s.safeRel(rel); !ok {
			allHaveFiles = false
			return
		}
		n["file"] = rel
		referenced[rel] = true

		// 老格式：正文/注释内嵌在索引里 → 导出为独立文件后剥离。
		if content, has := n["content"]; has {
			var text string
			switch v := content.(type) {
			case string:
				text = v
			default:
				b, _ := json.MarshalIndent(v, "", "  ")
				text = string(b)
			}
			if err := atomicWrite(s.relAbs(rel), []byte(text)); err != nil {
				migrateErr = err
				return
			}
			delete(n, "content")
			if docFmt == "json" {
				if cm, has := n["comments"]; has {
					if cmMap, ok := cm.(map[string]any); ok {
						if err := atomicWrite(s.relAbs(commentsRel(rel)), mustJSON(cmMap)); err != nil {
							migrateErr = err
							return
						}
					}
					delete(n, "comments")
				}
			} else {
				delete(n, "comments")
			}
		}
	})
	if migrateErr != nil {
		return nil, migrateErr
	}

	if allHaveFiles {
		s.garbageCollect(referenced)
	}

	out, err := json.Marshal(root)
	if err != nil {
		return nil, err
	}
	if err := atomicWrite(s.dbPath(), out); err != nil {
		return nil, err
	}
	return out, nil
}

// MigrateOnStartup 启动时做一次老格式迁移；发生改动前备份 aihub.json.bak。
func (s *Store) MigrateOnStartup() error {
	s.mu.Lock()
	raw, err := os.ReadFile(s.dbPath())
	s.mu.Unlock()
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	var probe map[string]any
	if err := json.Unmarshal(raw, &probe); err != nil {
		return nil // 损坏文件不碰，交给 GET/PUT 流程暴露
	}
	docs, _ := probe["docs"].([]any)
	need := false
	walkDocs(docs, func(n map[string]any) {
		if _, has := n["content"]; has {
			need = true
		}
	})
	if !need {
		return nil
	}
	_ = os.WriteFile(s.dbPath()+".bak", raw, 0o600)
	_, err = s.IngestDB(raw)
	return err
}

// garbageCollect 删除索引中不再引用的正文文件及其注释 sidecar。
func (s *Store) garbageCollect(ref map[string]bool) {
	for _, dir := range []string{"docs/md", "docs/json"} {
		entries, err := os.ReadDir(s.relAbs(dir))
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			name := e.Name()
			if strings.HasPrefix(name, ".tmp-") {
				continue
			}
			rel := dir + "/" + name
			if strings.HasSuffix(name, ".comments.json") {
				contentRel := strings.TrimSuffix(rel, ".comments.json") + ".json"
				if !ref[contentRel] {
					_ = os.Remove(s.relAbs(rel))
				}
				continue
			}
			if !ref[rel] {
				_ = os.Remove(s.relAbs(rel))
				_ = os.Remove(s.relAbs(commentsRel(rel)))
			}
		}
	}
}

// ExportAssembled 读取索引并把每篇笔记的正文/注释内联，产出单文件备份 JSON。
func (s *Store) ExportAssembled() ([]byte, error) {
	s.mu.Lock()
	raw, err := os.ReadFile(s.dbPath())
	s.mu.Unlock()
	if errors.Is(err, os.ErrNotExist) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	var root map[string]any
	if err := json.Unmarshal(raw, &root); err != nil {
		return nil, err
	}
	docs, _ := root["docs"].([]any)
	walkDocs(docs, func(n map[string]any) {
		rel, ok := s.safeRel(getString(n, "file"))
		if !ok {
			return
		}
		if b, err := os.ReadFile(s.relAbs(rel)); err == nil {
			n["content"] = string(b)
			if filepath.Ext(rel) == ".json" {
				cm, _, _ := s.ReadComments(rel)
				if len(cm) > 0 {
					n["comments"] = cm
				}
			}
		}
	})
	return json.MarshalIndent(root, "", "  ")
}

// SearchDocs 扫描全部笔记的文件名与正文，返回命中的笔记元数据。
func (s *Store) SearchDocs(q string, limit int) ([]DocMeta, error) {
	s.mu.Lock()
	raw, err := os.ReadFile(s.dbPath())
	s.mu.Unlock()
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var root map[string]any
	if err := json.Unmarshal(raw, &root); err != nil {
		return nil, err
	}
	q = strings.ToLower(q)
	hits := []DocMeta{}
	walkDocs(anySlice(root["docs"]), func(n map[string]any) {
		if limit > 0 && len(hits) >= limit {
			return
		}
		id := getString(n, "id")
		name := getString(n, "name")
		fmt := getString(n, "fmt")
		if fmt == "" {
			fmt = "md"
		}
		rel, ok := s.safeRel(getString(n, "file"))
		if !ok {
			return
		}
		matched := strings.Contains(strings.ToLower(name), q)
		if !matched {
			if b, err := os.ReadFile(s.relAbs(rel)); err == nil {
				matched = strings.Contains(strings.ToLower(string(b)), q)
			}
		}
		if matched {
			hits = append(hits, DocMeta{ID: id, Name: name, Fmt: fmt, File: rel})
		}
	})
	return hits, nil
}

/* ---------- 通用小工具 ---------- */

func walkDocs(docs []any, fn func(map[string]any)) {
	for _, item := range docs {
		n, ok := item.(map[string]any)
		if !ok {
			continue
		}
		if getString(n, "type") == "folder" {
			walkDocs(anySlice(n["children"]), fn)
			continue
		}
		fn(n)
	}
}

func anySlice(v any) []any {
	if v == nil {
		return nil
	}
	if s, ok := v.([]any); ok {
		return s
	}
	return nil
}

func getString(n map[string]any, key string) string {
	if v, ok := n[key].(string); ok {
		return v
	}
	return ""
}

func getInt64(n map[string]any, key string) int64 {
	switch v := n[key].(type) {
	case float64:
		return int64(v)
	case json.Number:
		i, _ := v.Int64()
		return i
	}
	return 0
}

func mustJSON(v any) []byte {
	b, _ := json.MarshalIndent(v, "", "  ")
	return b
}
