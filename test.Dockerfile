FROM golang:1.23.1-alpine

RUN apk update && apk upgrade && apk add --no-cache

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod tidy

COPY . .

RUN go test

EXPOSE 43430

ENTRYPOINT ["./main"]
