// Package store 负责 AI Hub 的本地文件持久化。
// 业务数据全量存为单个 JSON 文件，界面偏好（主题/侧栏/目录树）存另一个小 JSON。
// 所有写入走「临时文件 + rename」原子替换，避免并发读到半截文件。
package store

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
)

// State 是前端界面偏好，键名与历史 localStorage 含义一致。
type State struct {
	Theme         string `json:"theme"`
	SideCollapsed bool   `json:"sideCollapsed"`
	DocsTree      bool   `json:"docsTree"`
}

// Store 用互斥锁串行化同进程内的读写；文件本身也是原子写。
type Store struct {
	mu  sync.Mutex
	dir string
}

// ErrNotFound 表示数据文件尚未创建（首次启动）。
var ErrNotFound = errors.New("data file not found")

// New 确保数据目录存在并返回 Store。
func New(dir string) (*Store, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	return &Store{dir: dir}, nil
}

func (s *Store) dbPath() string    { return filepath.Join(s.dir, "aihub.json") }
func (s *Store) statePath() string { return filepath.Join(s.dir, "prefs.json") }

// ReadDB 读取全量业务数据；文件不存在时返回 ErrNotFound。
func (s *Store) ReadDB() ([]byte, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	b, err := os.ReadFile(s.dbPath())
	if errors.Is(err, os.ErrNotExist) {
		return nil, ErrNotFound
	}
	return b, err
}

// WriteDB 校验 JSON 合法后整文件原子覆盖，返回写入字节数。
func (s *Store) WriteDB(raw []byte) (int, error) {
	if !json.Valid(raw) {
		return 0, errors.New("invalid json body")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if err := atomicWrite(s.dbPath(), raw); err != nil {
		return 0, err
	}
	return len(raw), nil
}

// ReadState 读取偏好；文件缺失或损坏时返回零值（视为默认偏好）。
func (s *Store) ReadState() State {
	s.mu.Lock()
	defer s.mu.Unlock()
	var st State
	if b, err := os.ReadFile(s.statePath()); err == nil {
		_ = json.Unmarshal(b, &st)
	}
	return st
}

// WriteState 全量覆盖偏好文件。
func (s *Store) WriteState(st State) error {
	b, err := json.MarshalIndent(st, "", "  ")
	if err != nil {
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	return atomicWrite(s.statePath(), b)
}

// atomicWrite 在同目录写临时文件后 rename，保证目标文件要么是旧内容要么是新内容。
func atomicWrite(path string, b []byte) error {
	f, err := os.CreateTemp(filepath.Dir(path), ".tmp-*")
	if err != nil {
		return err
	}
	tmp := f.Name()
	defer os.Remove(tmp)
	if _, err := f.Write(b); err != nil {
		f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}
