# Advanced Configuration

This guide covers advanced usage scenarios and customization options.

## Custom Themes

### Using Built-in Themes

```yaml
- name: Generate Neon Pacman Graph
  uses: your-username/pacman-github-contribution@v1
  with:
    username: ${{ github.repository_owner }}
    theme: 'neon'
    show_stats: true
```

### Theme Options

#### Classic Theme (Default)
- Background: Dark GitHub-like colors
- Pacman: Yellow (#ffff00)
- Ghosts: Red, teal, blue, green
- Dots: GitHub contribution colors

#### Neon Theme
- Background: Pure black
- Pacman: Bright green
- Ghosts: Magenta, cyan, hot pink, purple
- Dots: White and orange

#### Retro Theme
- Background: Deep purple
- Pacman: Bright yellow
- Ghosts: Classic arcade colors
- Dots: Retro game palette

## Advanced Workflow Examples

### Generate Multiple Themes

```yaml
name: Generate Multiple Pacman Graphs

on:
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  generate-graphs:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        theme: [classic, neon, retro]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Generate ${{ matrix.theme }} theme
      uses: ./
      with:
        username: ${{ github.repository_owner }}
        theme: ${{ matrix.theme }}
        output_path: 'pacman-${{ matrix.theme }}.svg'
        
    - name: Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: pacman-graphs-${{ matrix.theme }}
        path: 'pacman-${{ matrix.theme }}.svg'
```

### Profile README Integration

Update your profile README automatically:

```yaml
name: Update Profile README

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  update-readme:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Generate Pacman Graph
      uses: your-username/pacman-github-contribution@v1
      with:
        username: ${{ github.repository_owner }}
        theme: 'classic'
        output_path: 'assets/pacman-contrib.svg'
        show_stats: true
        
    - name: Update README
      run: |
        # Update timestamp in README
        sed -i "s/Last updated: .*/Last updated: $(date)/" README.md
        
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add assets/pacman-contrib.svg README.md
        git diff --staged --quiet || git commit -m "🎮 Update Pacman contribution graph"
        git push
```

### Organization Usage

Generate graphs for multiple organization members:

```yaml
name: Organization Pacman Graphs

on:
  schedule:
    - cron: '0 8 * * 0' # Weekly on Sunday
  workflow_dispatch:

jobs:
  generate-org-graphs:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        member: [alice, bob, charlie, diana]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Generate graph for ${{ matrix.member }}
      uses: ./
      with:
        username: ${{ matrix.member }}
        theme: 'retro'
        output_path: 'team/${{ matrix.member }}-pacman.svg'
        show_stats: false
        
    - name: Commit member graphs
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add team/
        git diff --staged --quiet || git commit -m "Update team Pacman graphs"
        git push
```

## Customization Options

### Conditional Statistics

Show stats only for certain users:

```yaml
- name: Generate with conditional stats
  uses: ./
  with:
    username: ${{ github.repository_owner }}
    show_stats: ${{ github.repository_owner == 'your-username' }}
```

### Dynamic Output Paths

Use dates or commit info in filenames:

```yaml
- name: Generate with timestamp
  uses: ./
  with:
    username: ${{ github.repository_owner }}
    output_path: 'graphs/pacman-${{ github.run_number }}.svg'
```

## Error Handling

### Handle Private Repositories

```yaml
- name: Generate with error handling
  uses: ./
  with:
    username: ${{ github.repository_owner }}
    token: ${{ secrets.PERSONAL_ACCESS_TOKEN }} # Use PAT for private repos
  continue-on-error: true
  
- name: Fallback on error
  if: failure()
  run: |
    echo "Failed to generate contribution graph"
    # Create a placeholder or use cached version
    cp assets/placeholder-pacman.svg pacman-contribution-graph.svg
```

## Integration with Other Actions

### Combine with Issue Creation

```yaml
- name: Generate Pacman Graph
  id: pacman
  uses: ./
  with:
    username: ${{ github.repository_owner }}
    
- name: Create issue with graph
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: 'Weekly Contribution Report',
        body: `## Pacman Contribution Graph\n\n![Pacman Graph](./pacman-contribution-graph.svg)\n\nGenerated on: ${new Date().toISOString()}`
      });
```

## Performance Tips

1. **Caching**: Use action caching for Node.js dependencies
2. **Scheduling**: Avoid peak hours for API calls
3. **Rate Limiting**: Space out multiple user requests
4. **Token Usage**: Use personal access tokens for higher rate limits

## Troubleshooting

Common issues and solutions:

1. **API Rate Limits**: Use authentication token
2. **Missing Contributions**: Check user privacy settings  
3. **Large Files**: Consider reducing graph complexity
4. **Memory Issues**: Process data in chunks for heavy users
