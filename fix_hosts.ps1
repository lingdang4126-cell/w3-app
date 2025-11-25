# 以管理员身份运行此脚本来修复 hosts 文件
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "此脚本需要管理员权限！"
    exit
}

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$backupFile = "$hostsFile.backup"

# 备份原文件
Copy-Item $hostsFile $backupFile -Force
Write-Host "已备份到: $backupFile"

# 读取文件内容，移除所有 GitHub 相关的行
$content = Get-Content $hostsFile
$newContent = @()
foreach ($line in $content) {
    if ($line -notmatch "github|githubusercontent") {
        $newContent += $line
    }
}

# 写回文件
$newContent | Set-Content $hostsFile -Encoding UTF8
Write-Host "Hosts 文件已清理！"

# 刷新 DNS 缓存
& ipconfig /flushdns
Write-Host "DNS 缓存已刷新"
