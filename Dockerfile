FROM golang:1.23.1-alpine as build

RUN apk update && apk upgrade && apk add --no-cache

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod tidy

COPY . .

RUN #swag init
RUN go build -o main .

EXPOSE 43430

ENTRYPOINT ["./main"]

# scratch

FROM golang:1.23.1-alpine

# COPY --from=build /app/docs/swagger.* /app/docs
COPY --from=build /app/main /app/main

# EXPOSE 43430

ENTRYPOINT ["/app/main"]
