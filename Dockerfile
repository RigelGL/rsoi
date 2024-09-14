FROM golang:1.23.1-alpine

RUN apk update && apk upgrade && apk add --no-cache bash git openssh

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN #swag init
RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
