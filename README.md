# Strapi Content Deployment Plugin

A Strapi v5 plugin that allows you to trigger Vercel deployments directly from the Strapi admin panel with real-time deployment status tracking.

## Features

- **Webhook Configuration**: Securely store and manage Vercel deployment webhook URLs
- **One-Click Deployment**: Trigger deployments with a single button click
- **Real-time Status**: Monitor deployment progress with live updates using WebSocket
- **Deployment Logs**: View real-time deployment logs as they happen
- **Smart State Management**: Prevents concurrent deployments with automatic button disabling
- **Admin-Only Access**: All deployment features are restricted to admin users

## Installation

1. Install the plugin in your Strapi project:

```bash
npm install strapi-content-deployment
```

2. Add the plugin to your Strapi configuration if needed.

3. Restart your Strapi server.

## Configuration

### 1. Get Your Vercel Webhook URL

1. Go to your Vercel project settings
2. Navigate to "Git" → "Deploy Hooks"
3. Create a new deploy hook with a descriptive name (e.g., "Strapi Deployment")
4. Copy the webhook URL

### 2. Configure the Plugin

1. In Strapi admin panel, go to "Settings" → "Deployment Plugin" → "Settings"
2. Paste your Vercel webhook URL
3. (Optional) Add your Vercel token and project ID for real-time status tracking:
   - Get your token from: Vercel Account Settings → Tokens
   - Find your project ID in: Vercel Project Settings → General
4. Save the settings

## Usage

### Triggering a Deployment

1. Navigate to the "Deployment" section in the Strapi admin menu
2. Click the "Deploy to Vercel" button
3. Monitor the deployment progress in real-time
4. View deployment logs as they stream in

### Deployment States

- **Pending**: Deployment is queued
- **Building**: Your project is being built
- **Ready**: Deployment completed successfully
- **Error**: Deployment failed
- **Canceled**: Deployment was canceled

## Development

### Building the Plugin

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Project Structure

```
strapi-content-deployment/
├── admin/          # Admin panel UI components
│   └── src/
│       ├── pages/
│       │   ├── Deployment.jsx    # Main deployment dashboard
│       │   └── Settings.jsx      # Settings configuration page
│       └── components/
├── server/         # Server-side logic
│   └── src/
│       ├── controllers/
│       │   ├── deployment.js     # Deployment trigger logic
│       │   └── settings.js       # Settings management
│       └── bootstrap.js          # Socket.io initialization
└── package.json
```

## API Endpoints

- `GET /strapi-content-deployment/settings` - Get current settings
- `PUT /strapi-content-deployment/settings` - Update settings
- `POST /strapi-content-deployment/deploy` - Trigger deployment
- `GET /strapi-content-deployment/deployment/status` - Get deployment status

## WebSocket Events

- `deployment:started` - Fired when deployment begins
- `deployment:status` - Status updates during deployment
- `deployment:completed` - Deployment finished successfully
- `deployment:failed` - Deployment failed

## Requirements

- Strapi v5.x
- Node.js 18+
- A Vercel account with a configured project

## License

MIT
