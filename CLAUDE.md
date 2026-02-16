# Claude Code Rules

After making file edits, clear the .next cache and restart the dev server:
```
rm -rf .next && kill -9 $(lsof -ti tcp:3000) 2>/dev/null; npx next dev -p 3000 &
```
