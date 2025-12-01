# 修复 hosts 文件 - 删除 GitHub 本地映射
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# 检查是否已运行管理员权限
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "需要管理员权限！"
    exit 1
}

# 备份原文件
$backupPath = "$hostsPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $hostsPath $backupPath -Force
Write-Host "备份文件到: $backupPath"

# 读取文件并过滤掉 GitHub 相关的行
$lines = Get-Content $hostsPath -Encoding ASCII | Where-Object { 
    $_ -notmatch "^\s*127\.0\.0\.1\s+.*github" -and 
    $_ -notmatch "^\s*127\.0\.0\.1\s+.*githubusercontent" -and
    $_ -notmatch "^\s*#.*github" 
}

# 写回文件
$lines | Set-Content $hostsPath -Encoding ASCII -Force
Write-Host "已清理 hosts 文件中的 GitHub 映射"

# 刷新 DNS 缓存
& ipconfig /flushdns | Out-Null
Write-Host "DNS 缓存已刷新"

Write-Host "完成！"
