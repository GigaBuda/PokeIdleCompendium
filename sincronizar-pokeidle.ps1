$repo = "$env:USERPROFILE\Desktop\PokeIdleCompendium"

Set-Location $repo

git fetch origin main

$local = git rev-parse HEAD
$remote = git rev-parse origin/main

if ($local -ne $remote) {
    git pull --ff-only origin main
}
