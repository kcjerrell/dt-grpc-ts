# dt-grpc-ts
A simple gRPG client for Draw Things written in TypeScript for Node.js

This is barely a broof of concept at this point, but it can make basic requests

To use, clone the repo and cd into it, start a DT gRPC server with no TLS and response compression disabled, then:
```
npm i
npm run test -- '/some/outpout/dir'
```

This will run the script test.ts - this will create an image with txt2img, then send it back to img2img with a different prompt. The generated images can be found in the folder you specified
