#!/bin/bash
# Fix uploads directory permissions for PHP/Apache

UPLOADS_DIR="/home/anoack/claude-code-projekte/Software-Hub/software-hub-php/uploads"

echo "Fixing permissions for uploads directory..."
echo "Directory: $UPLOADS_DIR"

# Change group to www-data so Apache can write
sudo chgrp www-data "$UPLOADS_DIR"

# Set permissions to 775 (owner: rwx, group: rwx, others: r-x)
sudo chmod 775 "$UPLOADS_DIR"

# Verify
echo ""
echo "New permissions:"
ls -ld "$UPLOADS_DIR"

echo ""
echo "Done! PHP should now be able to write files to the uploads directory."
