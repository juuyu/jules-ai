package web

import _ "embed"

// Page 是嵌入到二进制中的前端单页（ai-hub.html）
//
//go:embed ai-hub.html
var Page []byte
