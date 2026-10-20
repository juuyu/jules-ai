; ============================================================
; hotkey.ahk —— 全局热键弹出项目菜单 (AutoHotkey v2)
; 安装 AutoHotkey v2 后双击本脚本即可运行
; 开机自启: Win+R 输入 shell:startup, 把本脚本的快捷方式放进去
; 热键: Ctrl+Alt+G (避开 Win+G, 那是 Xbox Game Bar 的默认热键)
; ============================================================

#Requires AutoHotkey v2.0
#SingleInstance Force

^!g:: {
    menu := Menu()
    ; --- 项目列表: 与 projects.json 保持一致, 改路径改这里 ---
    menu.Add("ai-hub",    (n, p) => OpenProject("D:\work\ai-hub"))
    menu.Add("frontend",  (n, p) => OpenProject("D:\work\frontend"))
    menu.Add()  ; 分隔线
    menu.Add("编辑本脚本", (n, p) => Run("notepad.exe """ A_ScriptFullPath """"))
    menu.Show()
}

OpenProject(path) {
    bash := "C:\Program Files\Git\bin\bash.exe"   ; 按需修改
    ; 通过环境变量通知 .bashrc 自动进入 gemini (机制见教程 02)
    EnvSet("GEMINI_AUTOSTART", "1")
    ; 若提示找不到 wt, 改用完整路径:
    ; %LOCALAPPDATA%\Microsoft\WindowsApps\wt.exe
    Run('wt -d "' path '" nt -- "' bash '" -i -l')
}
