# Генерирует WAV-файлы для POI категорий attractions, culture, nature
# Использует Microsoft Irina Desktop (встроенный голос Windows)
# Запуск: powershell -ExecutionPolicy Bypass -File scripts\generate-audio.ps1

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Irina Desktop")
$synth.Rate = -2
$synth.Volume = 100

$audioDir = "$PSScriptRoot\..\public\audio\pois"
if (!(Test-Path $audioDir)) { New-Item -ItemType Directory -Path $audioDir | Out-Null }

$json = Get-Content "$PSScriptRoot\..\public\content\pois.json" -Raw -Encoding UTF8
$pois = $json | ConvertFrom-Json
$cats = @('attractions', 'culture', 'nature')
$targets = $pois | Where-Object { $cats -contains $_.category -and $_.description.full.ru }

$total = $targets.Count
$i = 0
$generated = 0
foreach ($poi in $targets) {
    $i++
    $outFile = "$audioDir\$($poi.id).wav"
    if (Test-Path $outFile) {
        Write-Host "[$i/$total] SKIP $($poi.id)"
        continue
    }
    $synth.SetOutputToWaveFile($outFile)
    $synth.Speak($poi.description.full.ru)
    $generated++
    Write-Host "[$i/$total] OK $($poi.id) — $($poi.name.ru)"
}
$synth.SetOutputToDefaultAudioDevice()
Write-Host ""
Write-Host "Готово. Сгенерировано: $generated / Пропущено: $($total - $generated)"
