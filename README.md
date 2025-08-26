# 🎮 Pac-Man GitHub Contribution Eater

Generate an animated Pac-Man that eats your GitHub contributions! Transform your contribution graph into a fun, retro-style game animation perfect for your GitHub profile README.

![Pac-Man Demo](https://raw.githubusercontent.com/yourusername/pacman-github-contribution/main/examples/demo.svg)

## ✨ Features

- 🎮 **Animated Pac-Man** eating through your contribution dots
- 👻 **Customizable Ghosts** (1-4 ghosts with different colors)
- 🎨 **Multiple Themes** (Classic, Dark, Neon, Retro)
- 🏆 **Score Display** showing contributions and level
- ⚡ **Adjustable Speed** (Slow, Normal, Fast)
- 🧩 **Maze Complexity** options
- 💫 **Power Pellets** for high-contribution days
- 📱 **Responsive Design** that works in any README

## 🚀 Quick Start

### Method 1: GitHub Action (Recommended)

Add this to your repository's `.github/workflows/pacman.yml`:

```yaml
name: Generate Pac-Man Animation

on:
  schedule:
    - cron: "0 0 * * *"  # Daily at midnight
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    runs-on: ubuntu-latest
    name: Generate Pac-Man
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

### Method 2: Direct Usage

```bash
# Clone the repository
git clone https://github.com/yourusername/pacman-github-contribution.git
cd pacman-github-contribution

# Install dependencies
npm install

# Build the action
npm run build

# Run with your GitHub username
GITHUB_TOKEN=your_token GITHUB_USER_NAME=yourusername node src/index.js
```

## 📖 Usage in README

Once generated, add the SVG to your README:

```markdown
![Pac-Man Animation](https://raw.githubusercontent.com/yourusername/yourusername/main/dist/pacman.svg)
```

Or use it in HTML for more control:

```html
<div align="center">
  <img src="https://raw.githubusercontent.com/yourusername/yourusername/main/dist/pacman.svg" alt="Pac-Man eating contributions"/>
</div>
```

## ⚙️ Configuration Options

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `github_user_name` | GitHub username | **Required** | Any valid GitHub username |
| `outputs` | Output file path | `dist/pacman.svg` | Any valid file path |
| `theme` | Visual theme | `classic` | `classic`, `dark`, `neon`, `retro` |
| `ghost_count` | Number of ghosts | `2` | `1`, `2`, `3`, `4` |
| `animation_speed` | Animation speed | `normal` | `slow`, `normal`, `fast` |
| `show_score` | Show score board | `true` | `true`, `false` |
| `maze_complexity` | Maze complexity | `normal` | `simple`, `normal`, `complex` |

## 🎨 Themes

### Classic Theme
Traditional Pac-Man colors with yellow Pac-Man and colorful ghosts on black background.

### Dark Theme  
GitHub dark mode inspired with modern colors and subtle styling.

### Neon Theme
Bright, glowing neon colors perfect for a cyberpunk aesthetic.

### Retro Theme
Warm, vintage colors reminiscent of old arcade cabinets.

## 🎮 How It Works

1. **Data Collection**: Fetches your GitHub contribution data using the GitHub GraphQL API
2. **Path Generation**: Creates an intelligent path through your contributions, prioritizing areas with higher activity
3. **Animation Creation**: Generates an SVG with:
   - Pac-Man following the calculated path
   - Ghosts chasing behind with staggered timing
   - Dots representing your contributions that "disappear" as Pac-Man eats them
   - Power pellets for days with exceptional contributions (>10)
   - Real-time score calculation based on contributions

## 🏗️ Advanced Examples

### Custom Theme Configuration

```yaml
- name: Generate Neon Pac-Man
  uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    theme: neon
    ghost_count: 4
    animation_speed: fast
    show_score: true
    maze_complexity: complex
```

### Multiple Outputs

```yaml
- name: Generate Multiple Themes
  uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    outputs: |
      dist/pacman-classic.svg
      dist/pacman-dark.svg
      dist/pacman-neon.svg
    theme: classic,dark,neon
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- GitHub Personal Access Token with `repo` and `user` scopes

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/pacman-github-contribution.git
cd pacman-github-contribution

# Install dependencies
npm install

# Run tests
npm test

# Build for distribution
npm run build

# Run locally
GITHUB_TOKEN=your_token GITHUB_USER_NAME=yourusername npm run test
```

### Project Structure

```
pacman-github-contribution/
├── src/
│   ├── index.js              # Main entry point
│   ├── github-api.js         # GitHub API interactions
│   ├── pacman-generator.js   # SVG generation logic
│   └── templates/
├── dist/                     # Built files
├── examples/                 # Usage examples
└── .github/workflows/        # CI/CD
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution

- 🎨 New themes and color schemes
- 👻 Ghost AI behavior improvements
- 🎵 Sound effect integration
- 📊 Additional statistics displays
- 🌐 Internationalization
- 🧪 Test coverage improvements

## 📊 API Reference

### GitHubAPI Class

```javascript
const api = new GitHubAPI(token);

// Get contribution data
const contributions = await api.getContributions(username);

// Get user information  
const userInfo = await api.getUserInfo(username);
```

### PacManGenerator Class

```javascript
const generator = new PacManGenerator({
  theme: 'classic',
  ghostCount: 2,
  animationSpeed: 'normal',
  showScore: true,
  mazeComplexity: 'normal'
});

// Generate SVG
const svg = generator.generateSVG(contributionData, userInfo);
```

## 🐛 Troubleshooting

### Common Issues

**Error: "GITHUB_TOKEN is required"**
- Ensure your GitHub token has proper permissions
- Check that the token is correctly set in your workflow secrets

**Error: "github_user_name is required"**
- Verify the username is spelled correctly
- Ensure the user profile is public

**Animation not displaying**
- Check that the SVG file was generated successfully
- Verify the raw GitHub URL is accessible
- Clear browser cache if using GitHub Pages

**Low performance**
- Reduce `ghost_count` to 1-2 for better performance
- Use `simple` maze complexity
- Set animation speed to `slow`

### Debug Mode

Enable debug logging:

```yaml
- name: Generate Pac-Man (Debug)
  uses: yourusername/pacman-github-contribution@v1
  with:
    github_user_name: ${{ github.repository_owner }}
    debug: true
  env:
    ACTIONS_STEP_DEBUG: true
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic Pac-Man arcade game
- Built on the amazing GitHub contribution graph
- Thanks to the open-source community for inspiration and tools

## 🔗 Related Projects

- [GitHub Profile 3D Contrib](https://github.com/yoshi389111/github-profile-3d-contrib) - 3D contribution visualization
- [Snake Animation](https://github.com/Platane/snk) - Snake eating contributions
- [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats) - Dynamic GitHub stats

---

<div align="center">

**Made with 💛 for the GitHub community**

[⭐ Star this project](https://github.com/yourusername/pacman-github-contribution) • [🐛 Report Bug](https://github.com/yourusername/pacman-github-contribution/issues) • [✨ Request Feature](https://github.com/yourusername/pacman-github-contribution/issues)

</div>