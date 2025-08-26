const core = require('@actions/core');
const fs = require('fs').promises;
const path = require('path');
const GitHubAPI = require('./github-api');
const PacManGenerator = require('./pacman-generator');

async function main() {
  try {
    // Get inputs from GitHub Action or environment variables
    const githubUserName = core.getInput('github_user_name') || process.env.INPUT_GITHUB_USER_NAME || process.env.INPUT_USERNAME;
    const outputPath = core.getInput('outputs') || process.env.INPUT_OUTPUT_PATH || 'dist/pacman.svg';
    const theme = core.getInput('theme') || process.env.INPUT_THEME || 'classic';
    const ghostCount = core.getInput('ghost_count') || '2';
    const animationSpeed = core.getInput('animation_speed') || 'normal';
    const showScore = core.getInput('show_score') !== 'false';
    const mazeComplexity = core.getInput('maze_complexity') || 'normal';

    // Validate inputs
    if (!githubUserName) {
      throw new Error('github_user_name is required');
    }

    console.log(`🎮 Generating Pac-Man animation for ${githubUserName}`);
    console.log(`Theme: ${theme}, Ghosts: ${ghostCount}, Speed: ${animationSpeed}`);

    // Initialize GitHub API
    const githubToken = process.env.GITHUB_TOKEN;
    
    // Check for test/dry run mode
    const isDryRun = process.env.DRY_RUN === 'true' || githubToken === 'dummy_for_test' || !githubToken;
    
    if (isDryRun) {
      console.log('🧪 Running in test mode - generating sample visualization');
      
      // Create comprehensive mock contribution data
      const contributions = [];
      const weeks = 52;
      
      for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const contributionCount = Math.floor(Math.random() * 15);
          if (contributionCount > 0) {
            contributions.push({
              date: new Date(2024, 0, weekIndex * 7 + dayIndex + 1).toISOString().split('T')[0],
              count: contributionCount,
              level: Math.min(Math.floor(contributionCount / 3), 4),
              x: weekIndex,
              y: dayIndex,
              color: contributionCount > 10 ? '#40c463' : contributionCount > 5 ? '#30a14e' : '#216e39'
            });
          }
        }
      }

      const mockContributionData = {
        contributions,
        totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
        maxCount: Math.max(...contributions.map(c => c.count)),
        weeks: weeks
      };

      const mockUserInfo = {
        name: `${githubUserName} (Test Mode)`,
        login: githubUserName,
        avatarUrl: 'https://github.com/identicons/test.png',
        publicRepos: 42,
        followers: 100
      };

      console.log(`Found ${mockContributionData.totalContributions} contributions (mock data)`);

      // Generate Pac-Man SVG with mock data
      console.log('🎨 Generating Pac-Man SVG...');
      const pacManGenerator = new PacManGenerator({
        theme,
        ghostCount: parseInt(ghostCount),
        animationSpeed,
        showScore,
        mazeComplexity
      });

      const svg = pacManGenerator.generateSVG(mockContributionData, mockUserInfo);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Write SVG file
      await fs.writeFile(outputPath, svg, 'utf8');
      console.log(`✅ Pac-Man animation saved to ${outputPath}`);

      // Set outputs for GitHub Action
      core.setOutput('svg_path', outputPath);
      
      // Generate statistics
      const stats = {
        totalContributions: mockContributionData.totalContributions,
        maxContributions: mockContributionData.maxCount,
        activeWeeks: weeks,
        theme: theme,
        ghostCount: parseInt(ghostCount),
        mode: 'test'
      };

      console.log('📈 Generation Statistics:', JSON.stringify(stats, null, 2));
      return;
    }

    // Production mode with real GitHub API
    const githubAPI = new GitHubAPI(githubToken);

    // Fetch contribution data
    console.log('📊 Fetching contribution data...');
    const contributionData = await githubAPI.getContributions(githubUserName);
    const userInfo = await githubAPI.getUserInfo(githubUserName);

    console.log(`Found ${contributionData.totalContributions} contributions`);

    // Generate Pac-Man SVG
    console.log('🎨 Generating Pac-Man SVG...');
    const pacManGenerator = new PacManGenerator({
      theme,
      ghostCount: parseInt(ghostCount),
      animationSpeed,
      showScore,
      mazeComplexity
    });

    const svg = pacManGenerator.generateSVG(contributionData, userInfo);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write SVG file
    await fs.writeFile(outputPath, svg, 'utf8');
    console.log(`✅ Pac-Man animation saved to ${outputPath}`);

    // Set outputs for GitHub Action
    core.setOutput('svg_path', outputPath);

    // Generate statistics
    const stats = {
      totalContributions: contributionData.totalContributions,
      maxContributions: contributionData.maxCount,
      activeWeeks: contributionData.weeks,
      theme: theme,
      ghostCount: parseInt(ghostCount)
    };

    console.log('📈 Generation Statistics:', JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Error generating Pac-Man animation:', error);
    core.setFailed(error.message);
    process.exit(1);
  }
}

// Handle both GitHub Action and direct execution
if (require.main === module) {
  main();
}

module.exports = main;