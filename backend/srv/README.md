# How to Run Locally

1. Install Docker CE (https://docs.docker.com/install/) and ensure the Docker Daemon is running.
2. Now build the container by running `docker build -t prism:latest .` while the working directory is `prism/backend/srv`.
```
SERAN-PC2:srv seranthirugnanam$ docker build -t primsm:latest .
Sending build context to Docker daemon  15.12MB
Step 1/7 : FROM centos:7
 ---> 1e1148e4cc2c
Step 2/7 : WORKDIR /root
 ---> Using cache
 ---> 6713ec0eabde

    ... build will continue ...

Step 7/7 : CMD node server.js
 ---> Using cache
 ---> 1b762edcaa61
Successfully built 1b762edcaa61
Successfully tagged primsm:latest
```
3. Now go into the backend directory and run `docker-compose up -d` to start the database and route handler which listens on port 3000.
```
SERAN-PC2:backend seranthirugnanam$ docker-compose up -d
Starting mongo ... done
Starting prism-srv ... done
SERAN-PC2:backend seranthirugnanam$ 
```

4. Point your browser to http://localhost:3000/api/ and you should see:
PrismPDF API 2019

# Starting a Conversion
To start a conversion, send an `HTTP POST` request to http://localhost:3000/api/conversions/ with the file attached in the body of 
the request. The file must be a PDF.

I will do an example using `cURL` to send the request containing a pdf called `my_document.pdf`.
```
SERAN-PC2:backend seranthirugnanam$ curl \
    -X POST http://localhost:3000/api/conversions/ \
    -F file=@/Users/seranthirugnanam/Documents/my_bw_document.pdf
```

The JSON response for this request:
```
{
    "id": 4,
    "fileName": "/srv/uploads/my_document.pdf",
    "colors": [
        [
            {
                "r": 48,
                "g": 6,
                "b": 12,
                "a": 80,
                "name": "srgba(48,6,12,0.314961)",
                "count": 1,
                "pageNumber": 1
            },
            .... A lot more colors ....
            {
                "r": 149,
                "g": 96,
                "b": 102,
                "a": 255,
                "name": "srgba(149,96,102,1)",
                "count": 1,
                "pageNumber": 1
            }
        ]
    ],
    "pageCount": 1
}
```
In the response we get a list of colors that were found. The term 'colors' refers to sRGBA values that are not various shades of 
gray, black or white. The key `pageNumber` refers to what page of the PDF that each respective color was found on.

Now let's try a black and white PDF.
```
SERAN-PC2:backend seranthirugnanam$ curl \
    -X POST http://localhost:3000/api/conversions/ \
    -F file=@/Users/seranthirugnanam/Documents/my_bw_document.pdf
```

The JSON response I receive for this request is:

```
{
    "id": 4,
    "fileName": "/srv/uploads/my_bw_document.pdf",
    "colors": [],
    "pageCount": 0,
    "pageNumber": 1
}
```
This response is expected. Because it's a purely black/white/gray document, there are no 'colors' that would require 
a color printer to print. Therefore, the `"colors"` field is empty. The `pageCount` is 0 because we found no sRGBA colors (that are 
not shades of gray or black/white). 
