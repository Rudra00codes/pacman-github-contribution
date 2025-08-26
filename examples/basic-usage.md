# Basic Usage Examples

## Simple Setup (Recommended for Beginners)

Create `.github/workflows/pacman.yml` in your profile repository:

```yaml
name: Generate Pac-Man Animation

on:
  schedule:
    - cron: "0 0 * * *"  # Daily at midnight UTC
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required to commit files
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Generate Pac-Man Animation
        uses: yourusername/pacman-github-contribution@v1
        with:
          github_user_name: ${{ github.repository_owner }}
          outputs: dist/pacman.svg
          theme: classic
          ghost_count: 2
          animation_speed: normal
          show_score: true
          maze_complexity: normal
          
      - name: Commit and Push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add dist/pacman.svg
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "🎮 Update Pac-Man animation"
            git push
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## README Integration

### Simple Markdown
```markdown
# Hi there! 👋

## My GitHub Activity as Pac-Man! 🎮
![Pac-Man](https://raw.githubusercontent.com/yourusername/yourusername/main/dist/pacman.svg)

<!--more content-->
```

### Centered with Title
```markdown
<div align="center">
  <h2>🎮 Pac-Man Eating My Contributions</h2>
  <img src="https://raw.githubusercontent.com/yourusername/yourusername/main/dist/pacman.svg" alt="Pac-Man Animation" width="100%"/>
  <p><em>Nom nom nom... contributions taste delicious! 🍪</em></p>
</div>
```

### With Description
```markdown
## 🕹️ GitHub Activity Game

Watch Pac-Man navigate through my contribution graph, eating dots that represent my daily coding activity. The bigger the dot, the more commits that day!

![Pac-Man Animation](https://raw.githubusercontent.com/yourusername/yourusername/main/dist/pacman.svg)

- 🟡 **Pac-Man**: That's me, coding through the year
- 🔴 **Red Ghost**: Bugs chasing me
- 🩷 **Pink Ghost**: Feature requests
- 🔵 **Blue Ghost**: Code reviews
- ⚪ **Dots**: Daily contributions
- 🟡 **Big Dots**: High-activity days (10+ contributions)
```

## Theme Examples

### Classic Arcade Style
```yaml
- uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    theme: classic
    show_score: true
```

### Modern Dark Theme
```yaml
- uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    theme: dark
    ghost_count: 3
    animation_speed: normal
```

### Cyberpunk Neon
```yaml
- uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    theme: neon
    ghost_count: 4
    animation_speed: fast
    maze_complexity: complex
```

## Performance Optimization

### Lightweight Version (for slower connections)
```yaml
- uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    theme: classic
    ghost_count: 1
    animation_speed: slow
    maze_complexity: simple
    show_score: false
```

## Troubleshooting Common Issues

### Issue: Animation not updating
**Solution**: Check your workflow is running daily
```yaml
on:
  schedule:
    - cron: "0 0 * * *"  # Make sure this is uncommented
  workflow_dispatch:      # Allows manual triggering
```

### Issue: SVG not displaying in README
**Solution**: Use raw GitHub URL and ensure file exists
```markdown
<!-- ✅ Correct -->
![Pac-Man](https://raw.githubusercontent.com/username/username/main/dist/pacman.svg)

<!-- ❌ Incorrect -->
![Pac-Man](https://github.com/username/username/blob/main/dist/pacman.svg)
```

### Issue: Repository permissions
**Solution**: Ensure workflow has write permissions
```yaml
jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Required to commit files
    steps:
      # ... rest of your workflow
```

## Multiple Versions

Generate different styles for different sections:

```yaml
name: Generate Multiple Pac-Man Versions

on:
  schedule:
    - cron: "0 6 * * *"
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        config:
          - { theme: "classic", output: "pacman-classic.svg", ghosts: 2 }
          - { theme: "dark", output: "pacman-dark.svg", ghosts: 3 }
          - { theme: "neon", output: "pacman-neon.svg", ghosts: 4 }
    steps:
      - uses: actions/checkout@v4
      - uses: yourusername/pacman-github-contribution@v1
        with:
          github_user_name: ${{ github.repository_owner }}
          theme: ${{ matrix.config.theme }}
          outputs: dist/${{ matrix.config.output }}
          ghost_count: ${{ matrix.config.ghosts }}
      - name: Commit files
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add dist/
          git diff --staged --quiet || git commit -m "🎮 Update Pac-Man animations"
          git push
```

Then use them in your README:

```markdown
## 🎮 Choose Your Style!

### Classic Arcade
![Classic Pac-Man](https://raw.githubusercontent.com/username/username/main/dist/pacman-classic.svg)

### GitHub Dark Mode
![Dark Pac-Man](https://raw.githubusercontent.com/username/username/main/dist/pacman-dark.svg)

### Cyberpunk Neon
![Neon Pac-Man](https://raw.githubusercontent.com/username/username/main/dist/pacman-neon.svg)
```