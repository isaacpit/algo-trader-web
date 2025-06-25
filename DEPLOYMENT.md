# Deployment Guide

This guide covers deploying both the frontend (GitHub Pages) and backend (EC2) components of the AlgoTraders application.

## Frontend Deployment (GitHub Pages)

### Prerequisites

- GitHub repository with the frontend code
- Custom domain: `algotraders.dev`

### Setup Steps

1. **Configure GitHub Secrets**

   ```bash
   # Add these secrets in your GitHub repository settings
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

2. **Update DNS Records in Cloudflare**

   ```
   Type: A
   Name: @ (root domain)
   Content: 185.199.108.153
   Proxy: Enabled (orange cloud)

   Type: A
   Name: @ (root domain)
   Content: 185.199.109.153
   Proxy: Enabled (orange cloud)

   Type: A
   Name: @ (root domain)
   Content: 185.199.110.153
   Proxy: Enabled (orange cloud)

   Type: A
   Name: @ (root domain)
   Content: 185.199.111.153
   Proxy: Enabled (orange cloud)

   Type: CNAME
   Name: www
   Content: algotraders.dev
   Proxy: Enabled (orange cloud)
   ```

3. **Deploy to GitHub Pages**
   - Push your code to the main branch
   - GitHub Actions will automatically build and deploy
   - Your site will be available at `https://algotraders.dev`

## Backend Deployment (EC2)

### Prerequisites

- EC2 instance running Amazon Linux 2 or Ubuntu
- Elastic IP allocated and associated
- Security group configured for ports 80, 443, and 3000
- Domain: `api.algotraders.dev` pointing to your EC2 Elastic IP
- AWS CLI configured with appropriate permissions

### Step 1: AWS Infrastructure Setup

1. **Deploy CloudFormation stacks**

   ```bash
   # On your local machine or EC2 instance with AWS CLI
   chmod +x setup_dynamodb.sh
   ./setup_dynamodb.sh
   ```

   This script will:

   - Deploy the DynamoDB table using `infra/templates/dynamodb.yaml`
   - Deploy the IAM role using `infra/templates/ec2-iam.yaml`
   - Verify all resources are created correctly
   - Test DynamoDB connectivity

2. **Verify infrastructure (optional)**

   ```bash
   # Check the status of all AWS resources
   chmod +x check_infra.sh
   ./check_infra.sh
   ```

3. **Attach IAM Role to EC2 Instance**
   - Go to EC2 Console → Instances → Select your instance
   - Actions → Security → Modify IAM role
   - Select: `AlgoTraderEC2InstanceProfile` (created by CloudFormation)

### Step 2: Initial Deployment

1. **Connect to your EC2 instance**

   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Clone and deploy the callback server**

   ```bash
   git clone https://github.com/your-username/algo-trader-modular.git
   cd algo-trader-modular/callback-server
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Configure environment variables**

   ```bash
   sudo cp env.example .env
   sudo nano .env
   # Add your Google OAuth credentials and AWS settings:
   # GOOGLE_CLIENT_ID=your_google_client_id
   # GOOGLE_CLIENT_SECRET=your_google_client_secret
   # AWS_REGION=us-east-1
   # DYNAMODB_TABLE_NAME=Algo-Trader-User-Token-Table
   ```

4. **Start the services**
   ```bash
   sudo systemctl start algotraders-callback
   sudo systemctl enable algotraders-callback
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### Step 3: HTTPS Setup (After Initial Deployment)

**Important**: Run this step only after the initial deployment is complete and your domain is pointing to the EC2 instance.

1. **Run the HTTPS setup script**

   ```bash
   chmod +x setup_https.sh
   ./setup_https.sh
   ```

2. **Verify HTTPS is working**
   ```bash
   curl https://api.algotraders.dev/health
   ```

### DNS Configuration for Backend

In Cloudflare, add this DNS record:

```
Type: A
Name: api
Content: [Your EC2 Elastic IP]
Proxy: Enabled (orange cloud)
```

## Complete DNS Setup

Your final Cloudflare DNS configuration should look like this:

| Type  | Name | Content         | Proxy |
| ----- | ---- | --------------- | ----- |
| A     | @    | 185.199.108.153 | ✅    |
| A     | @    | 185.199.109.153 | ✅    |
| A     | @    | 185.199.110.153 | ✅    |
| A     | @    | 185.199.111.153 | ✅    |
| A     | api  | [Your EC2 IP]   | ✅    |
| CNAME | www  | algotraders.dev | ✅    |

## DynamoDB Schema

The callback server stores user tokens in DynamoDB with the following schema:

| Attribute         | Type               | Description                           |
| ----------------- | ------------------ | ------------------------------------- |
| USER_ID           | String (Hash Key)  | Google OAuth user ID                  |
| TIMESTAMP         | String (Range Key) | ISO timestamp when token was received |
| access_token      | String             | Google OAuth access token             |
| email             | String             | User's email address                  |
| name              | String             | User's display name                   |
| picture           | String             | User's profile picture URL            |
| token_received_at | String             | ISO timestamp                         |
| expires_at        | String             | ISO timestamp when token expires      |
| session_token     | String             | JWT session token                     |

## API Endpoints

### OAuth Callback

- **POST** `/api/auth/callback` - Handle Google OAuth callback
- **GET** `/api/auth/verify` - Verify JWT session token

### Token Management (Admin/Debug)

- **GET** `/api/auth/tokens/{user_id}` - Get all tokens for a user
- **DELETE** `/api/auth/tokens/{user_id}` - Delete all tokens for a user

### Health Check

- **GET** `/health` - Server health status

## Verification

1. **Frontend**: Visit `https://algotraders.dev`
2. **Backend**: Visit `https://api.algotraders.dev/health`
3. **OAuth Flow**: Test the Google sign-in flow
4. **DynamoDB**: Check that tokens are being stored:
   ```bash
   aws dynamodb scan --table-name Algo-Trader-User-Token-Table --region us-east-1
   ```

## Troubleshooting

### Common Issues

1. **Nginx SSL Error**: If you get SSL certificate errors during initial deployment, this is normal. Complete the initial deployment first, then run the HTTPS setup script.

2. **DynamoDB Connection Error**: Ensure your EC2 instance has the correct IAM role attached and the DynamoDB table exists. The CloudFormation stacks must be deployed first.

3. **CloudFormation Stack Errors**: If CloudFormation deployment fails, check:

   - AWS CLI permissions
   - Stack name conflicts
   - Resource limits in your AWS account

4. **DNS Propagation**: DNS changes can take up to 48 hours to propagate globally.

5. **Security Groups**: Ensure your EC2 security group allows:
   - Port 80 (HTTP) from 0.0.0.0/0
   - Port 443 (HTTPS) from 0.0.0.0/0
   - Port 3000 (API) from 0.0.0.0/0 (optional)

### Useful Commands

```bash
# Check service status
sudo systemctl status algotraders-callback
sudo systemctl status nginx

# View logs
sudo journalctl -u algotraders-callback -f
sudo journalctl -u nginx -f

# Test configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates

# Check DynamoDB table
aws dynamodb describe-table --table-name Algo-Trader-User-Token-Table --region us-east-1

# Test DynamoDB operations
aws dynamodb scan --table-name Algo-Trader-User-Token-Table --region us-east-1 --limit 5

# Check infrastructure status
./check_infra.sh

# Deploy/redeploy infrastructure
./setup_dynamodb.sh
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **Firewall**: Use security groups to restrict access
3. **SSL**: Always use HTTPS in production
4. **IAM**: Use least privilege principle for IAM roles
5. **Updates**: Keep your system and dependencies updated
6. **Monitoring**: Set up monitoring for your services

## Cost Optimization

1. **EC2**: Use t3.micro for development, scale up as needed
2. **Elastic IP**: Free when attached to running instances
3. **Let's Encrypt**: Free SSL certificates
4. **Cloudflare**: Free tier provides excellent performance and security
5. **DynamoDB**: Pay-per-request billing for low traffic

# Deployment Troubleshooting Guide

## **🚨 Common GitHub Pages Deployment Issues**

### **Issue: "Permission to isaacpit/algo-trader-web.git denied to github-actions[bot]"**

**Error Message:**

```
remote: Permission to isaacpit/algo-trader-web.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/isaacpit/algo-trader-web.git/': The requested URL returned error: 403
```

**Root Cause:** The `GITHUB_TOKEN` doesn't have sufficient permissions to push to the repository.

---

## **🛠️ Solutions**

### **Solution 1: Add Explicit Permissions (Recommended)**

The workflow now includes explicit permissions:

```yaml
permissions:
  contents: write
  pages: write
  id-token: write
```

This should resolve the permission issue.

---

### **Solution 2: Use Personal Access Token**

If the above doesn't work, create a Personal Access Token:

1. **Create a Personal Access Token:**

   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes:
     - `repo` (for private repos)
     - `public_repo` (for public repos)
   - Copy the token

2. **Add Token to Repository Secrets:**

   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PERSONAL_ACCESS_TOKEN`
   - Value: Your token

3. **Update Workflow:**
   ```yaml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       personal_token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
       publish_dir: ./dist
       cname: algotraders.dev
   ```

---

### **Solution 3: Check Repository Settings**

1. **Verify GitHub Pages is enabled:**

   - Go to repository → Settings → Pages
   - Ensure "GitHub Actions" is selected as source

2. **Check branch protection rules:**

   - Go to repository → Settings → Branches
   - Ensure `gh-pages` branch doesn't have restrictive rules

3. **Verify repository permissions:**
   - Go to repository → Settings → Actions → General
   - Ensure "Allow GitHub Actions to create and approve pull requests" is enabled

---

### **Solution 4: Manual gh-pages Branch Creation**

If the `gh-pages` branch doesn't exist:

```bash
# Create gh-pages branch locally
git checkout --orphan gh-pages
git rm -rf .
echo "GitHub Pages placeholder" > index.html
git add index.html
git commit -m "Initial gh-pages branch"
git push origin gh-pages

# Return to main branch
git checkout main
```

---

## **🔍 Debugging Steps**

### **1. Check Workflow Logs**

- Go to repository → Actions
- Click on the failed workflow run
- Check the "Deploy to GitHub Pages" step logs

### **2. Verify Token Permissions**

```bash
# Test token locally (replace with your token)
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

### **3. Check Repository Access**

```bash
# Test repository access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/isaacpit/algo-trader-web
```

---

## **📋 Checklist**

Before deploying, ensure:

- [ ] Repository is public OR you have a PAT with `repo` scope
- [ ] GitHub Pages is enabled in repository settings
- [ ] Workflow has explicit permissions set
- [ ] `gh-pages` branch exists (or will be created)
- [ ] No branch protection rules blocking the workflow
- [ ] Personal Access Token is added to secrets (if using PAT)

---

## **🚀 Quick Fix Commands**

```bash
# If you need to create gh-pages branch manually
git checkout --orphan gh-pages
git rm -rf .
echo "Placeholder" > index.html
git add index.html
git commit -m "Initial gh-pages"
git push origin gh-pages
git checkout main
```

---

## **📞 Still Having Issues?**

1. **Check the exact error in GitHub Actions logs**
2. **Verify your repository is public or you have proper PAT permissions**
3. **Ensure GitHub Pages is enabled for your repository**
4. **Try the Personal Access Token approach if GITHUB_TOKEN fails**

The most common fix is adding the explicit permissions to the workflow, which should resolve the 403 error.
