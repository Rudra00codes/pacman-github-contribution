const core = require('@actions/core');
const fs = require('fs').promises;
const path = require('path');
const GitHubAPI = require('./github-api');
const PacManGenerator = require('./pacman-generator');

async function main() {
  try {
    // Get inputs from GitHub Action
    const username = core.getInput('username', { required: true });
    const token = core.getInput('token') || process.env.GITHUB_TOKEN;
    const outputPath = core.getInput('output_path') || 'pacman-contribution-graph.svg';
    const theme = core.getInput('theme') || 'classic';
    const showStats = core.getInput('show_stats') === 'true';

    console.log(`🎮 Generating Pac-Man contribution graph for ${username}...`);

    // Initialize GitHub API
    if (!token || token === 'dummy_for_test') {
      console.log('🧪 Running in test mode - generating sample visualization');
      
      // Create mock contribution data
      const weeks = Array(52).fill().map((_, weekIndex) => ({
        contributionDays: Array(7).fill().map((_, dayIndex) => ({
          contributionCount: Math.floor(Math.random() * 15),
          date: new Date(2024, 0, weekIndex * 7 + dayIndex + 1).toISOString().split('T')[0],
          weekday: dayIndex
        }))
      }));

      // Transform weeks into flat contributions array as expected by PacManGenerator
      const contributions = [];
      weeks.forEach((week, weekIndex) => {
        week.contributionDays.forEach((day, dayIndex) => {
          if (day.contributionCount > 0) {
            contributions.push({
              x: weekIndex,
              y: dayIndex,
              count: day.contributionCount,
              level: Math.min(Math.floor(day.contributionCount / 3), 4),
              date: day.date
            });
          }
        });
      });

      const mockContributionData = {
        totalContributions: contributions.reduce((sum, c) => sum + c.count, 0),
        contributions,
        weeks
      };

      const mockUserInfo = {
        login: username,
        name: `${username} (Test Mode)`,
        avatarUrl: 'https://github.com/identicons/test.png'
      };

      console.log(`Found ${mockContributionData.totalContributions} contributions (mock data)`);

      // Generate Pac-Man SVG with mock data
      console.log('🎨 Generating Pac-Man SVG...');
      const pacManGenerator = new PacManGenerator({
        theme,
        showScore: showStats
      });

      const svg = pacManGenerator.generateSVG(mockContributionData, mockUserInfo);

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Write SVG file
      await fs.writeFile(outputPath, svg, 'utf8');
      console.log(`✅ Pac-Man contribution graph saved to ${outputPath}`);

      // Set outputs for GitHub Action
      core.setOutput('svg_path', outputPath);
      console.log(`✅ Successfully generated test Pacman contribution graph for ${username}`);
      return;
    }

    if (!token) {
      throw new Error('GitHub token is required. Set GITHUB_TOKEN or provide token input.');
    }

    const githubAPI = new GitHubAPI(token);

    // Fetch contribution data
    console.log('📊 Fetching contribution data...');
    const contributionData = await githubAPI.getContributions(username);
    const userInfo = await githubAPI.getUserInfo(username);

    console.log(`Found ${contributionData.totalContributions} contributions`);

    // Generate Pac-Man SVG
    console.log('🎨 Generating Pac-Man SVG...');
    const pacManGenerator = new PacManGenerator({
      theme,
      showScore: showStats
    });

    const svg = pacManGenerator.generateSVG(contributionData, userInfo);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write SVG file
    await fs.writeFile(outputPath, svg, 'utf8');
    console.log(`✅ Pac-Man contribution graph saved to ${outputPath}`);

    // Set outputs for GitHub Action
    core.setOutput('svg_path', outputPath);

    console.log(`✅ Successfully generated Pacman contribution graph for ${username}`);

  } catch (error) {
    console.error('❌ Error generating Pac-Man contribution graph:', error);
    core.setFailed(error.message);
    process.exit(1);
  }
}

// Handle both GitHub Action and direct execution
if (require.main === module) {
  main();
}

module.exports = main;
