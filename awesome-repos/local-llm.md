# 本地模型与推理

> 数据截至 2026-10-15（GitHub API 实时获取，约数）· 收录格式：仓库 | Star | 一句话 | 备注

## 本地运行器（快速上手）

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [ollama/ollama](https://github.com/ollama/ollama) | 183k | 一键本地跑模型的运行器 | 活跃；本地部署首选入口 |
| [janhq/jan](https://github.com/janhq/jan) | 45k | 100% 离线的桌面 ChatGPT 替代 | 活跃 |
| [oobabooga/textgen](https://github.com/oobabooga/textgen) | 47.7k | 本地 LLM 桌面应用（原 text-generation-webui） | 节奏放缓（2026-08 后无推送） |
| [mudler/LocalAI](https://github.com/mudler/LocalAI) | 49.6k | 全模态本地引擎（LLM / 视觉 / 语音 / 图像） | 活跃 |
| [lmstudio-ai/lms](https://github.com/lmstudio-ai/lms) | 5.4k | LM Studio 官方 CLI / SDK | GUI 本体闭源免费，SDK 活跃 |

## 推理引擎（生产部署）

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) | 131k | C/C++ 推理引擎，GGUF 格式事实标准 | 活跃 |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | 94k | 高吞吐 GPU 推理 / 服务引擎 | 活跃；生产部署事实标准 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | 37k | 高性能 LLM / 多模态服务框架 | 活跃 |
| [NVIDIA/TensorRT-LLM](https://github.com/NVIDIA/TensorRT-LLM) | 14.8k | NVIDIA GPU 极致优化库 | 活跃 |
| [ai-dynamo/dynamo](https://github.com/ai-dynamo/dynamo) | 8.3k | 数据中心级分布式推理框架 | 活跃（NVIDIA 主导） |
| [ml-explore/mlx](https://github.com/ml-explore/mlx) | 28.8k | Apple Silicon 阵列框架 | 活跃；Mac 本地推理基座 |

## 微调与训练

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [unslothai/unsloth](https://github.com/unslothai/unsloth) | 78k | 本地训练 / 微调加速（含多模态） | 活跃 |
| [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory) | 75.5k | 100+ LLM / VLM 统一微调框架 | 活跃；本地定制模型首选 |

## 前端与扩展

| 仓库 | Star | 简介 | 备注 |
| --- | --- | --- | --- |
| [open-webui/open-webui](https://github.com/open-webui/open-webui) | 156k | 最流行的本地模型 Web UI | 活跃 |
| [exo-explore/exo](https://github.com/exo-explore/exo) | 48k | 多设备组网跑大模型 | 活跃；闲置设备集群玩法 |

## 本地跑编程模型怎么选（2026-10 现状）

- **主流可本地部署模型**：Qwen3.8 系（代码用 Qwen3-Coder 系）、DeepSeek-V4、GLM-5、Kimi K2.5、MiniMax-H3、gpt-oss（20b / 120b）
- **显存参考**：27B~32B 级量化约需 24GB 显存；前沿 MoE 需多卡 / 大内存集群
- **组合建议**：
  - 快速上手：Ollama / LM Studio（GGUF / MLX 量化一键跑）
  - 生产服务：vLLM / SGLang（高并发吞吐）
  - Mac 用户：MLX 生态体验最好
- **性价比思路**：本地跑中档模型做补全 / 隐私任务，复杂任务再走云端 API
