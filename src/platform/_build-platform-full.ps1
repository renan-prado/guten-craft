$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = @('hero-big-numbers.html','what-you-can-do.html','who-its-for.html','network-touchpoints.html','not-just-ai-powered-agentic.html','insights-reports.html')

$out = ''
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText((Join-Path $here $f), [System.Text.Encoding]::UTF8)
    $content = $content -replace '^﻿',''
    $out += $content.TrimEnd() + "`r`n`r`n"
}

# Inject auto-generated heading IDs to match the WP plugin that adds id="h-{slug}" to every heading on save.
# Algorithm (deterministic; mirrors the plugin output observed in platform-full-attempt.html):
#   1. Take the raw inner HTML text of each h1-h6 (HTML entities like &amp; stay intact).
#   2. Lowercase it.
#   3. Replace every non [a-z0-9] character with '-'.
#   4. Collapse runs of '-'.
#   5. Trim leading/trailing '-'.
#   6. Prefix with 'h-'.
#   7. Track duplicates inside the same document; second occurrence gets '-0', third '-1', etc.
$seen = @{}
function Get-HeadingId($rawText) {
    $slug = $rawText.ToLowerInvariant()
    $slug = [regex]::Replace($slug, '[^a-z0-9]+', '-')
    $slug = $slug.Trim('-')
    $base = "h-$slug"
    if ($seen.ContainsKey($base)) {
        $n = $seen[$base]
        $seen[$base] = $n + 1
        return "$base-$n"
    }
    $seen[$base] = 0
    return $base
}

# Match each <h1>...</h1> through <h6>...</h6>, including line breaks, and inject id="..." right after class="...".
$out = [regex]::Replace($out, '<h([1-6])([^>]*?)>(.+?)</h\1>', {
    param($m)
    $level = $m.Groups[1].Value
    $attrs = $m.Groups[2].Value
    $inner = $m.Groups[3].Value

    # Strip nested HTML tags from inner to get the text content the plugin sees (it operates on text node concatenation).
    $textOnly = [regex]::Replace($inner, '<[^>]+>', '')
    $id = Get-HeadingId $textOnly

    # Skip if the heading already has an id attribute.
    if ($attrs -match '\sid="') {
        return $m.Value
    }

    # Inject id right after the class="..." attribute. If no class, inject at the start of attrs.
    if ($attrs -match '(\sclass="[^"]*")') {
        $newAttrs = $attrs -replace '(\sclass="[^"]*")', "`$1 id=`"$id`""
    } else {
        $newAttrs = " id=`"$id`"$attrs"
    }
    return "<h$level$newAttrs>$inner</h$level>"
}, [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Decode the HTML entities WP always normalizes to literal Unicode in save() output.
# Limited to quote/dash entities that WP normalizes regardless of block type. Symbols
# like &rarr;/&mdash; are NOT decoded here because their canonical form depends on the
# block context: wp:paragraph keeps them literal, but mesa-gutenberg/user-type-accordion
# keeps them as entities both in the HTML body and as &rarr; / &mdash; in the
# JSON attribute. Sources must use the correct form per context for each block.
$entityToChar = @{
    '&rsquo;'  = [char]0x2019  # ’
    '&lsquo;'  = [char]0x2018  # ‘
    '&ldquo;'  = [char]0x201C  # “
    '&rdquo;'  = [char]0x201D  # ”
    '&ndash;'  = [char]0x2013  # –
}
foreach ($k in $entityToChar.Keys) {
    $out = $out.Replace($k, [string]$entityToChar[$k])
}

$outPath = Join-Path $here 'platform-full.html'
[System.IO.File]::WriteAllText($outPath, $out.TrimEnd() + "`r`n", (New-Object System.Text.UTF8Encoding $false))
Write-Host ("wrote {0} bytes to {1}" -f (Get-Item $outPath).Length, $outPath)
