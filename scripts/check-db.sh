#!/bin/bash

echo "=== Kiểm tra Database Schema ==="
echo ""

docker exec oracle19c bash -c "echo '
SET PAGESIZE 100
SET LINESIZE 200
SET FEEDBACK OFF
SET HEADING ON

SELECT table_name FROM user_tables ORDER BY table_name;

EXIT;' | sqlplus -s LuckyBoiz/4@//localhost:1521/qlgvpdb"
