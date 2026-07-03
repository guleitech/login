#!/bin/bash
set -Eeuo pipefail

# 基于脚本位置定位项目根目录（scripts/ 的上一级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 显式声明关键环境变量
export PORT=5000
export HOSTNAME=0.0.0.0

# 清理 5000 端口残留进程（绝不碰 9000）
kill_port_if_listening() {
    local pids
    pids=$(ss -H -lntp 2>/dev/null | awk -v port="5000" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
        echo "Port 5000 is free."
        return
    fi
    echo "Port 5000 in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
}

echo "Clearing port 5000 before start."
kill_port_if_listening

echo "Starting Next.js dev server on 0.0.0.0:5000..."
exec pnpm tsx watch src/server.ts
