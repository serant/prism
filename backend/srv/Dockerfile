FROM centos:7

WORKDIR /root
RUN curl -sL https://rpm.nodesource.com/setup_10.x | /bin/bash - && \
    yum install -y ImageMagick nodejs && \
    mkdir /opt/uploads
    
WORKDIR /srv
COPY src .
RUN npm install

CMD node server.js
