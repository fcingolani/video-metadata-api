FROM node:argon-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk update \
    && apk add  --update --no-cache ca-certificates openssl wget tar xz \
    && update-ca-certificates \
    && wget http://johnvansickle.com/ffmpeg/releases/ffmpeg-release-64bit-static.tar.xz \
    && mkdir -p /opt/ffmpeg/ \
    && tar -Jxvf "ffmpeg-release-64bit-static.tar.xz" -C /opt/ffmpeg/ --strip-components=1 \
    && ln -s /opt/ffmpeg/ffmpeg /usr/local/bin/ffmpeg \
    && ln -s /opt/ffmpeg/ffprobe /usr/local/bin/ffprobe \
    && rm "ffmpeg-release-64bit-static.tar.xz" \
    && apk del  ca-certificates openssl wget tar xz

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
