#!/bin/bash
cd "$(dirname "$0")"
echo "A iniciar Miguel Life em localhost:8080..."
open http://localhost:8080/dashboard.html
python3 -m http.server 8080
