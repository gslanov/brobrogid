#!/bin/bash
# Deploy BROBROGID to Selectel server
# Usage: ./deploy.sh

set -e

SERVER="87.228.33.68"
SSH_KEY="/home/cosmo/.ssh/id_ed25519_selectel"
REMOTE_DIR="/var/www/brobrogid"
SSH="ssh -i $SSH_KEY root@$SERVER"

echo "=== 1. Building project (with SEO prerender) ==="
npm run build:seo

echo ""
echo "=== 2. Uploading to server ==="
rsync -avz --delete \
  -e "ssh -i $SSH_KEY" \
  dist/ root@$SERVER:$REMOTE_DIR/

echo ""
echo "=== 3. Setting permissions ==="
$SSH "chown -R www-data:www-data $REMOTE_DIR && chmod -R 755 $REMOTE_DIR"

echo ""
echo "=== 4. Reloading nginx ==="
$SSH "nginx -t && systemctl reload nginx"

echo ""
echo "=== Done! ==="
echo "Site: http://brobrogid.ru"
echo "IP:   http://$SERVER"
