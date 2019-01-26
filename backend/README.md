# How to Run Locally

1. Install Docker CE (https://docs.docker.com/install/) and ensure the Docker Daemon is running.
2. Now build the container by running `build.sh` while the working directory is `prism/backend`.
```
/Users/seranthirugnanam/Develop/prism/backend
SERAN-PC2:backend seranthirugnanam$ ./build.sh 
Sending build context to Docker daemon  54.63MB
Step 1/7 : FROM centos:7
 ... Build will continue ...
Step 7/7 : CMD node index.js
 ---> Running in e9773199e711
Removing intermediate container e9773199e711
 ---> d66775296e3a
Successfully built d66775296e3a
Successfully tagged prism:latest
```
3. Run the container by executing `run.sh` and the container will start running and listening on port 3000.
```
SERAN-PC2:backend seranthirugnanam$ ./run.sh 
Error response from daemon: Cannot kill container: prism_app: No such container: prism_app
SERAN-PC2:backend seranthirugnanam$ Listening on port 3000...
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
a color printer to print. Therefore, the the `"colors"` field is empty. The `pageCount` is 0 because we found no sRGBA colors (that are 
not shades of gray or black/white). 
