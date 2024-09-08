# adrians-typescript-api-standard
## The problem
Having any API seems in a usual case a heavy load for developers to maintain it, in worse cases it is so bad that developers are afraid to refactor it, or change it. Usually it has heavy testing on both side of the communication, still not eliminating all bugs and temporal time-downs. Seeing the problems during years of professional experiance, seeing lots of money burned because of it, bring to me many ideas how to fix it, this is implemenation of one of those ideas. 

## Idea
The idea is to have a common code base for both sides of API communications. It is impossible to have it in any case, but for many cases it could be possible.

## What is should solve
- expensive API changes
- bugs related to path typos
- bugs related to DTO out-of-sync or typos in its keys
- bugs related to different validation of the DTO's
- clean-code contribution
- all echanges should be easly visible in the browser 'Network' dev-tool
- HTTP errors code should be not confusing any more (there are many different and contrary opinions when to use what), and the service may return eather a valid response, or an error as string in every case
- HTTP methods should be not cnfusing any more (there are many different and contrary opinions when to use what), as all the exchanges should use always PUT method
- renaming/refactroing/moving a DTO entry key, should be automatically done by IDE on both sides of the comunication, due to strong typing and common code base
- simple request validation errors could be imediately detected by the customer, with out sending the request
- simple response validation errors could be imediately detected by the service, with out sending the response

## Limitations
- it is only limited to TypeScript so practically it means any modern WEB browser frontend, and some Node backend, or serverless node functions. It doesn ot work directly with Java, Go, Ruby, Phyton, although with some Node middleware it should work, but then the whole idea is broken, as there would be next API that will be again very expensive. 
- both sides of the communications spruce code have to be in one file-system, to be able to reference to the common code. Usually they are anyway in one repository, and this is perfect
- it can not solve problems with many things: badly qualified developers, or managers, or micromanagement, or if one of the side of the communication uses other language than typescript
- it should not be used directly with JS, although it is possible, because then the whole sense is broken, and the typing checks will be anyway useless
- echanges key names should not contain special characters, in worse case iti would contain '.' that is used to join nested objects

## Intendent use
```sh
npm i adrians-typescript-api-standard
```
- common code should define an object with JsonExchange's as values, or other objects containing JsonExchange's as values. Keys should briefly explain what the exchange is responsible for. Single responsibilites is strongly adviced.
- Optionally some JsonExchange's may contain 'preProcessing' and 'postProcessing' code, that is intended for basic validations of the sended/received DTO's, and those functions are the only code that should be unit tested. Basic validation is strongly adviced for any DTO types different then void.
- Use always strong typing and strict tsconfig setting for everything
- Backend can not trust the frontend.
- DTO should be just interfaces, although they should inherit if bussiness relevant
