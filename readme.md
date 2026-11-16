# Portfolio

Built with Three.js and designed to work on desktop and mobile.

## Run locally

Requires Node.js 20 and npm.

```sh
git clone https://github.com/TheRealSumpark/portfolio.git
cd portfolio
npm ci
npm start
```

Open <http://localhost:8080>.

## Build for production

```sh
npm run build
```

Webpack writes the static site to dist/. GitHub Pages deploys main through
GitHub Actions when the repository’s Pages source is set to GitHub Actions.
