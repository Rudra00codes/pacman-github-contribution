class PacManGenerator {
  constructor(options = {}) {
    this.theme = options.theme || 'classic';
    this.ghostCount = parseInt(options.ghostCount) || 2;
    this.animationSpeed = options.animationSpeed || 'normal';
    this.showScore = options.showScore !== 'false';
    this.mazeComplexity = options.mazeComplexity || 'normal';

    this.themes = {
      classic: {
        background: '#000000',
        wall: '#0000FF',
        dot: '#FFFF00',
        pacman: '#FFFF00',
        ghosts: ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852'],
        text: '#FFFFFF'
      },
      dark: {
        background: '#0d1117',
        wall: '#21262d',
        dot: '#f0f6fc',
        pacman: '#ffd700',
        ghosts: ['#f85149', '#bc8cff', '#7ee787', '#ffa657'],
        text: '#f0f6fc'
      },
      neon: {
        background: '#000011',
        wall: '#330066',
        dot: '#00ff00',
        pacman: '#ffff00',
        ghosts: ['#ff0080', '#8000ff', '#00ffff', '#ff8000'],
        text: '#00ff00'
      },
      retro: {
        background: '#2a1810',
        wall: '#8b4513',
        dot: '#ffd700',
        pacman: '#ffff80',
        ghosts: ['#cd5c5c', '#dda0dd', '#87ceeb', '#f4a460'],
        text: '#ffd700'
      }
    };
  }

  generateSVG(contributionData, userInfo) {
    const { contributions, totalContributions, weeks } = contributionData;
    const theme = this.themes[this.theme];

    const width = Math.max(800, weeks * 12 + 100);
    const height = 400;
    const cellSize = 10;

    // Calculate Pac-Man path through contributions
    const path = this.generatePacManPath(contributions);
    const eatenDots = this.calculateEatenDots(contributions, path);

    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${this.generateDefinitions(theme)}
        </defs>
        
        <rect width="100%" height="100%" fill="${theme.background}"/>
        
        ${this.generateMaze(contributions, theme, cellSize)}
        ${this.generateContributionDots(contributions, eatenDots, theme, cellSize)}
        ${this.generatePacMan(path, theme)}
        ${this.generateGhosts(path, theme)}
        ${this.showScore ? this.generateScoreBoard(totalContributions, eatenDots, theme, userInfo) : ''}
        ${this.generatePowerPellets(contributions, theme, cellSize)}
        
        <style>
          ${this.generateCSS(theme)}
        </style>
      </svg>
    `;
  }

  generateDefinitions(_theme) {
    return `
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      
      <filter id="shadow">
        <feDropShadow dx="1" dy="1" stdDeviation="1" opacity="0.3"/>
      </filter>
    `;
  }

  generateMaze(contributions, theme, cellSize) {
    let maze = '';
    const startX = 50;
    const startY = 50;

    // Create maze walls around contribution grid
    for (let week = 0; week < Math.max(...contributions.map(c => c.x)) + 1; week++) {
      for (let day = 0; day < 7; day++) {
        const x = startX + week * (cellSize + 2);
        const y = startY + day * (cellSize + 2);

        // Add maze walls with some randomness based on complexity
        if (this.shouldDrawWall(week, day)) {
          maze += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${theme.wall}" opacity="0.3"/>`;
        }
      }
    }

    return maze;
  }

  shouldDrawWall(_week, _day) {
    if (this.mazeComplexity === 'simple') return false;
    if (this.mazeComplexity === 'complex') return Math.random() < 0.1;
    return Math.random() < 0.05;
  }

  generateContributionDots(contributions, eatenDots, theme, cellSize) {
    let dots = '';
    const startX = 50;
    const startY = 50;

    contributions.forEach((contrib, index) => {
      if (contrib.count > 0) {
        const x = startX + contrib.x * (cellSize + 2) + cellSize / 2;
        const y = startY + contrib.y * (cellSize + 2) + cellSize / 2;
        const isEaten = eatenDots.includes(index);
        const opacity = isEaten ? 0 : 1;
        const size = Math.min(2 + contrib.level, 4);

        dots += `
          <circle 
            cx="${x}" 
            cy="${y}" 
            r="${size}" 
            fill="${theme.dot}" 
            opacity="${opacity}"
            class="dot-${index}"
          >
            ${isEaten ? `<animate attributeName="opacity" values="1;0" dur="0.3s" begin="${index * 0.1}s" fill="freeze"/>` : ''}
          </circle>
        `;
      }
    });

    return dots;
  }

  generatePacManPath(contributions) {
    // Create a path through contributions, prioritizing higher contribution areas
    const validContribs = contributions.filter(c => c.count > 0);
    if (validContribs.length === 0) return [];

    // Sort by week, then by day to create a snake-like path
    validContribs.sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });

    return validContribs.map(contrib => ({
      x: 50 + contrib.x * 12 + 5,
      y: 50 + contrib.y * 12 + 5,
      timestamp: contrib.date
    }));
  }

  generatePacMan(path, theme) {
    if (path.length === 0) return '';

    const speedMultiplier = this.getSpeedMultiplier();
    const totalDuration = path.length * 0.2 / speedMultiplier;

    let pathString = '';
    path.forEach((point, index) => {
      if (index === 0) {
        pathString += `M ${point.x} ${point.y}`;
      } else {
        pathString += ` L ${point.x} ${point.y}`;
      }
    });

    return `
      <g class="pacman" filter="url(#glow)">
        <circle cx="0" cy="0" r="8" fill="${theme.pacman}">
          <animateMotion dur="${totalDuration}s" repeatCount="indefinite">
            <mpath href="#pacman-path"/>
          </animateMotion>
          <animate attributeName="r" values="8;6;8" dur="0.5s" repeatCount="indefinite"/>
        </circle>
        <path id="pacman-mouth" d="M 0,0 L 8,0 A 8,8 0 0,1 5.66,5.66 Z" fill="${theme.background}">
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            values="0;30;0;-30;0" 
            dur="0.5s" 
            repeatCount="indefinite"
          />
          <animateMotion dur="${totalDuration}s" repeatCount="indefinite">
            <mpath href="#pacman-path"/>
          </animateMotion>
        </path>
        <path id="pacman-path" d="${pathString}" fill="none" stroke="none"/>
      </g>
    `;
  }

  generateGhosts(path, theme) {
    if (path.length === 0) return '';

    let ghosts = '';
    const speedMultiplier = this.getSpeedMultiplier();
    const totalDuration = path.length * 0.2 / speedMultiplier;

    for (let i = 0; i < Math.min(this.ghostCount, 4); i++) {
      const ghostColor = theme.ghosts[i];
      const delay = (i + 1) * 2; // Stagger ghost starts
      const ghostSize = 7;

      ghosts += `
        <g class="ghost ghost-${i}">
          <circle cx="0" cy="0" r="${ghostSize}" fill="${ghostColor}" filter="url(#shadow)">
            <animateMotion dur="${totalDuration + delay}s" repeatCount="indefinite" begin="${delay}s">
              <mpath href="#ghost-path-${i}"/>
            </animateMotion>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <path id="ghost-path-${i}" d="${this.generateGhostPath(path, i)}" fill="none" stroke="none"/>
        </g>
      `;
    }

    return ghosts;
  }

  generateGhostPath(path, ghostIndex) {
    // Ghosts follow slightly different paths to avoid overlap
    let pathString = '';
    path.forEach((point, index) => {
      const offsetX = (ghostIndex % 2 === 0 ? 1 : -1) * 15;
      const offsetY = (ghostIndex < 2 ? 1 : -1) * 10;
      const x = point.x + offsetX;
      const y = point.y + offsetY;

      if (index === 0) {
        pathString += `M ${x} ${y}`;
      } else {
        pathString += ` L ${x} ${y}`;
      }
    });
    return pathString;
  }

  generateScoreBoard(totalContributions, eatenDots, theme, userInfo) {
    const score = eatenDots * 10;
    const level = Math.floor(eatenDots / 50) + 1;

    return `
      <g class="scoreboard">
        <rect x="10" y="10" width="200" height="80" fill="${theme.background}" stroke="${theme.text}" stroke-width="2" opacity="0.9"/>
        <text x="20" y="30" fill="${theme.text}" font-family="monospace" font-size="12" font-weight="bold">
          PLAYER: ${userInfo.name || userInfo.login}
        </text>
        <text x="20" y="45" fill="${theme.text}" font-family="monospace" font-size="12">
          SCORE: ${score.toLocaleString()}
        </text>
        <text x="20" y="60" fill="${theme.text}" font-family="monospace" font-size="12">
          LEVEL: ${level}
        </text>
        <text x="20" y="75" fill="${theme.text}" font-family="monospace" font-size="12">
          CONTRIBUTIONS: ${totalContributions}
        </text>
      </g>
    `;
  }

  generatePowerPellets(contributions, theme, cellSize) {
    let pellets = '';
    const startX = 50;
    const startY = 50;

    // Add power pellets for high contribution days (>10 contributions)
    contributions.forEach((contrib, _index) => {
      if (contrib.count > 10) {
        const x = startX + contrib.x * (cellSize + 2) + cellSize / 2;
        const y = startY + contrib.y * (cellSize + 2) + cellSize / 2;

        pellets += `
          <circle cx="${x}" cy="${y}" r="6" fill="${theme.dot}" filter="url(#glow)">
            <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.7;1;0.7" dur="1s" repeatCount="indefinite"/>
          </circle>
        `;
      }
    });

    return pellets;
  }

  calculateEatenDots(contributions, path) {
    // Simulate which dots Pac-Man would eat along his path
    const eatenDots = [];
    const tolerance = 15; // Distance tolerance for "eating" a dot

    path.forEach(pathPoint => {
      contributions.forEach((contrib, index) => {
        if (contrib.count > 0) {
          const contribX = 50 + contrib.x * 12 + 5;
          const contribY = 50 + contrib.y * 12 + 5;
          const distance = Math.sqrt(
            Math.pow(pathPoint.x - contribX, 2) + Math.pow(pathPoint.y - contribY, 2)
          );

          if (distance < tolerance && !eatenDots.includes(index)) {
            eatenDots.push(index);
          }
        }
      });
    });

    return eatenDots;
  }

  getSpeedMultiplier() {
    switch (this.animationSpeed) {
    case 'slow': return 0.5;
    case 'fast': return 2;
    default: return 1;
    }
  }

  generateCSS(theme) {
    return `
      .pacman {
        filter: url(#glow);
      }
      
      .ghost {
        animation: float 2s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      
      .scoreboard text {
        text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
      }
      
      circle[fill="${theme.dot}"] {
        animation: pulse 1s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
    `;
  }
}

module.exports = PacManGenerator;
