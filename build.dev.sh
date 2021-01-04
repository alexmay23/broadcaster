#!/usr/bin/env bash
docker build --tag gcr.io/mosque-crowdfunding/broadcaster.dev:0.0.1 .
docker push gcr.io/mosque-crowdfunding/broadcaster.dev:0.0.1
