const core = require('@actions/core');
const fs = require('fs').promises;
const path = require('path');
const GitHubAPI = require('./github-api');
const PacManGenerator = require('./pacman-generator');

async function main() {
  try {
    // Get inputs from GitHub Action
    const githubUserName = core.getInput('github_user_name') || process.env.GITHUB_USER_NAME;
    const outputPath = core.getInput('outputs') || 'dist/pacman.svg';
    const theme = core.getInput('theme') || 'classic';
    const ghostCount = core.getInput('ghost_count') || '2';
    const animationSpeed = core.getInput('animation_speed') || 'normal';
    const showScore = core.getInput('show_score') || 'true';
    const mazeComplexity = core.getInput('maze_complexity') || 'normal';

    // Validate inputs
    if (!githubUserName) {
      throw new Error('github_user_name is required');
    }

    console.log(`🎮 Generating Pac-Man animation for ${githubUserName}`);
    console.log(`Theme: ${theme}, Ghosts: ${ghostCount}, Speed: ${animationSpeed}`);

    // Initialize GitHub API
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

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
      ghostCount,
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