# GitHub Pages Deployment Guide

This project is configured for automatic deployment to GitHub Pages.

## Automatic Deployment (Recommended)

The project will automatically deploy to GitHub Pages when you push to the `main` branch.

### Setup Steps:

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions"

2. **Push your changes**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment**:
   - Go to Actions tab in your repository
   - Watch the deployment workflow complete
   - Your site will be available at: `https://yourusername.github.io/repository-name/`

## Manual Deployment

If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Important Notes

- **Base URL**: Configured as relative path `./` for GitHub Pages
- **Build Output**: Located in `dist/` directory
- **Automatic**: Deploys on every push to `main` branch
- **Browser Support**: Requires WebGL support for 3D rendering

## Troubleshooting

### Common Issues:

1. **404 Error**: Check if GitHub Pages is enabled in repository settings
2. **Build Fails**: Ensure all dependencies are in package.json
3. **3D Scene Not Loading**: Browser must support WebGL

### Performance Tips:

- **Loading Time**: First load may take longer due to Three.js assets
- **WebGL Required**: Modern browsers with hardware acceleration recommended
- **Mobile Support**: Works on mobile devices with WebGL support

## Live Demo

Once deployed, your satellite visualization will be accessible at:
`https://yourusername.github.io/repository-name/`

Features available in live demo:
- Interactive 3D satellite tracking
- Real-time orbital visualization
- Ground station controls
- Responsive design 