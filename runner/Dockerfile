# Sandbox image for running student Python submissions. Build: docker build -t pylab-python:3.12 runner/
# Includes only the Python standard library; no extra packages, pip, or compilers installed.
FROM python:3.12-slim
RUN rm -rf /usr/local/lib/python3.12/ensurepip /usr/local/lib/python3.12/idlelib /usr/local/lib/python3.12/turtledemo \
    && rm -f /usr/local/bin/pip* \
    && python3 -c "import sqlite3, json, math, random, datetime"
USER 65534:65534
WORKDIR /tmp
