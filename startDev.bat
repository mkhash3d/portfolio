@echo off
cd /d C:\Users\mkhas\Documents\Astro\portfolio
call nvm use 22
start "" "http://localhost:4321/admin/index.html"
npx tinacms dev -c "astro dev" || pause