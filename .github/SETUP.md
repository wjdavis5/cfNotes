# GitHub Actions Deployment Setup

This project uses GitHub Actions to automatically deploy the API (Cloudflare Worker) and the web frontend (Angular) to Cloudflare.

## Required Secrets

You need to set up the following secrets in your GitHub repository:

1. `CLOUDFLARE_API_TOKEN` - A Cloudflare API token with the following permissions:
   - Account > Worker Scripts > Edit
   - Account > Cloudflare Pages > Edit
   - Account > Account Settings > Read
   - Zone > Zone Settings > Read
   - Zone > Zone > Read

2. `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID (found in the Cloudflare dashboard URL)

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add each of the secrets listed above

## Creating Cloudflare Resources

Before the first deployment, you need to:

1. Create a Cloudflare Worker (for the API):
   - Name: `cfnote-api`
   - Create a KV namespace called `NOTES`

2. Create a Cloudflare Pages project:
   - Name: `cfnote`
   - Build command: (leave empty, as we're deploying from GitHub Actions)
   - Build output directory: (leave empty, as we're deploying from GitHub Actions)
   - Root directory: (leave empty)

## Deployment Process

- API (Worker): Deploys when changes are pushed to `src/api/` directories
- Web Frontend: Deploys when changes are pushed to `src/web/`, `src/common/`, or `src/crypto/` directories
- Both can be manually triggered from the "Actions" tab in GitHub

## Customizing Deployments

If you need to modify the deployment configuration:

### For the API:
Edit the `.github/workflows/deploy-api.yml` file.

### For the Web Frontend:
Edit the `.github/workflows/deploy-web.yml` file.

## Troubleshooting

- **API Deployment Issues**: Check the wrangler.toml file to ensure it has the correct configuration
- **Web Deployment Issues**: Check the output path in the deploy-web.yml workflow file matches the actual build output

For more detailed information, refer to:
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare Pages Action](https://github.com/cloudflare/pages-action) 