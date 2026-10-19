#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""minify.py — ai-hub 单文件 HTML 保守压缩脚本（仅用 Python 标准库，无依赖）。

用法:
    python3 minify.py                       # 压缩脚本同目录下的 ai-hub.html
    python3 minify.py <input.html>          # 指定输入文件
    python3 minify.py <input.html> -o <out.html>

默认输出为 <输入名>.min.html；脚本不会覆盖源文件。

压缩规则（保守，保证功能与显示不变）:
  * 普通 HTML 区域: 删除注释（保留 <!--[if ...]> 条件注释与 <!--! 标记注释），
    连续空白折叠为单个空格（只折叠不删除，保证内联元素之间的间距不变）
  * <style> 内容: 删除注释（保留 /*! ... */ 重要注释）、压缩空白、
    去掉 { } ; , > ~ 周围空格与 } 前多余分号
  * <script> / <pre> / <textarea> 内容: 原样保留
    （JS 含模板字符串，空白有语义，不做正则级压缩）

注意: 仅适用常规 HTML；不解析 JS/CSS 语法，属保守压缩而非极致压缩。
"""

import argparse
import gzip
import os
import re
import sys

RAW_TAGS = ("script", "style", "pre", "textarea")

# 依次匹配: 注释开始 / raw 标签的开启或闭合
TOKEN_RE = re.compile(
    r"<!--|<(/?)(" + "|".join(RAW_TAGS) + r")\b[^>]*>",
    re.IGNORECASE,
)

# 需要原样保留的注释: 条件注释 <!--[if ...] 与标记注释 <!--!
COMMENT_KEEP_RE = re.compile(r"^<!--\s*(\[if|\!)")


def minify_css(css):
    """压缩 <style> 内容；/*! ... */ 重要注释原样保留。"""
    stash = []

    def _stash(m):
        stash.append(m.group(0))
        return "\x00%d\x00" % (len(stash) - 1)

    css = re.sub(r"/\*![\s\S]*?\*/", _stash, css)   # 重要注释先存起来
    css = re.sub(r"/\*[\s\S]*?\*/", "", css)        # 删除普通注释
    css = re.sub(r"\s+", " ", css)
    # 不处理 + 与 - : calc(100% + 20px) 中的空格有语义
    css = re.sub(r"\s*([{};,>~])\s*", r"\1", css)
    css = re.sub(r":\s+", ":", css)                 # 只去冒号后空格，保留 a :hover 语义
    css = re.sub(r";\s*}", "}", css)                # } 前多余分号
    css = css.strip()
    css = re.sub(r"\x00(\d+)\x00",
                 lambda m: stash[int(m.group(1))], css)
    return css


def minify_text(s):
    """普通 HTML 文本: 连续空白折叠为单个空格。"""
    return re.sub(r"\s+", " ", s)


def minify_html(src):
    out = []
    pos = 0
    while True:
        m = TOKEN_RE.search(src, pos)
        if not m:
            out.append(minify_text(src[pos:]))
            break
        out.append(minify_text(src[pos:m.start()]))
        token = m.group(0)
        if token == "<!--":
            end = src.find("-->", m.end())
            if end == -1:                     # 未闭合注释，原样保留
                out.append(src[m.start():])
                break
            comment = src[m.start():end + 3]
            if COMMENT_KEEP_RE.match(comment):
                out.append(comment)           # 条件注释 / <!--! 保留
            pos = end + 3
            continue
        if m.group(1):                        # 闭合标签，原样保留
            out.append(token)
            pos = m.end()
            continue
        tag = m.group(2).lower()
        close_re = re.compile(r"</\s*" + tag + r"\b[^>]*>", re.IGNORECASE)
        cm = close_re.search(src, m.end())
        if cm:
            content, close_tag, pos = src[m.end():cm.start()], cm.group(0), cm.end()
        else:                                 # 未闭合，其余全部原样
            content, close_tag, pos = src[m.end():], "", len(src)
        if tag == "style":
            content = minify_css(content)
        out.append(token + content + close_tag)
    return "".join(out)


def human(n):
    return "%.1f KB" % (n / 1024)


def gz_len(s):
    return len(gzip.compress(s.encode("utf-8"), 9))


def main():
    ap = argparse.ArgumentParser(
        description="ai-hub 单文件 HTML 保守压缩脚本（Python 标准库，无依赖）")
    ap.add_argument("input", nargs="?",
                    help="输入 HTML 文件，缺省为脚本同目录下的 ai-hub.html")
    ap.add_argument("-o", "--output", help="输出文件，缺省为 <输入名>.min.html")
    args = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    inp = args.input or os.path.join(here, "ai-hub.html")
    if not os.path.isfile(inp):
        print("错误: 找不到输入文件 %s" % inp, file=sys.stderr)
        return 1

    if args.output:
        out_path = args.output
    else:
        base, ext = os.path.splitext(inp)
        out_path = "%s.min%s" % (base, ext or ".html")
    if os.path.abspath(out_path) == os.path.abspath(inp):
        print("错误: 输出文件不能与输入相同（脚本不会覆盖源文件）", file=sys.stderr)
        return 1

    with open(inp, "r", encoding="utf-8") as f:
        src = f.read()
    mini = minify_html(src)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(mini)

    a, b = len(src.encode("utf-8")), len(mini.encode("utf-8"))
    ga, gb = gz_len(src), gz_len(mini)
    saved = (1 - b / a) * 100 if a else 0
    print("输入: %s  (%s, gzip %s)" % (inp, human(a), human(ga)))
    print("输出: %s  (%s, gzip %s)" % (out_path, human(b), human(gb)))
    print("节省: %.1f%%" % saved)
    return 0


if __name__ == "__main__":
    sys.exit(main())
