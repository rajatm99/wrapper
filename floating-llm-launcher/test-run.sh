#!/bin/bash

echo "Testing Floating LLM Launcher..."
echo "Current directory: $(pwd)"
echo "Files in project:"
ls -la

echo -e "\nTo run the application:"
echo "1. Fix npm permissions: sudo chown -R \$(whoami) ~/.npm"
echo "2. Install dependencies: npm install"
echo "3. Run the app: npm start"
echo -e "\nOr install electron globally and run directly:"
echo "npm install -g electron"
echo "electron ."