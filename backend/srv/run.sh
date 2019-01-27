# !/bin/bash
docker kill prism_app ; docker run --name prism_app -p 3000:3000 --rm prism &