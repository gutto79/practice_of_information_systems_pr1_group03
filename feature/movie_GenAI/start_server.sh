#!/bin/bash

# 必要なパッケージをインストール
echo "必要なパッケージをインストールしています..."
pip install -r requirements.txt

# FastAPIサーバーを起動
echo "FastAPIサーバーを起動しています..."
PORT=8000 python3 api.py
