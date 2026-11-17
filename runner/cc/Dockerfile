# Sandbox image for running student C / C++ / Java submissions.
# Build on the server (once):  docker build -t pylab-cc:1 runner/cc/
FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends gcc g++ libc6-dev openjdk-17-jdk-headless python3-minimal \
 && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man
COPY harness.py /opt/harness.py
USER 65534:65534
WORKDIR /tmp
