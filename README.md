# adrians-typescript-api-standard
## The problem
Having any API seems in the usual case a heavy load for developers to maintain it, in worse cases it is so bad that developers are afraid to refactor it, or change it. Usually it has heavy testing on both sides of the communication, still not eliminating all bugs and temporal time-downs. Seeing the problems during years of professional experience, seeing lots of money burned because of it, brings to me many ideas how to fix it, this is implementation of one of those ideas. 

## Idea
The idea is to have a common code base for both sides of API communications. It is impossible to have it in any case, but for many cases it could be possible.

## What is should solve
- expensive API changes
- bugs related to path typos
- bugs related to DTO out-of-sync or typos in its keys
- bugs related to different validation of the DTO's
- clean-code contribution
- all exchanges should be easily visible in the browser 'Network' dev-tool
- HTTP errors code should be not confusing any more (there are many different and contrary opinions when to use what), and the service may return eather a valid response, or an error as string in every case
- HTTP methods should be not cnfusing any more (there are many different and contrary opinions when to use what), as all the exchanges should use always PUT method
- renaming/refactoring/moving a DTO entry key, should be automatically done by IDE on both sides of the communication, due to strong typing and common code base
- simple request validation errors could be immediately detected by the customer, without sending the request
- simple response validation errors could be immediately detected by the service, without sending the response


## Limitations
- it is only limited to TypeScript so practically it means any modern WEB browser frontend with some SPA, does not matter if it is Angular, React or Vue, and some Node backend, or serverless Node functions. It does not work directly with Java, Go, Ruby, Phyton, although with some Node middleware it should work, but then the whole idea is broken, as there would be next API that will be again very expensive. 
- both sides of the communications spruce code have to be in one file-system, to be able to reference the common code. Usually they are anyway in one repository, and this is perfect
- it can not solve problems with many things: badly qualified developers, or managers, or micromanagement, or if one of the side of the communication uses other language than typescript
- it should not be used directly with JS, although it is possible, because then the whole sense is broken, and the typing checks will be anyway useless
- echanges key names should not contain special characters, in worse case iti would contain '.' that is used to join nested objects


## Intendent use
- ```sh
npm i adrians-typescript-api-standard
```
- define common code with JsonExchanges, TDD all processing functions
- create the agent on the customer side, take care of the auth data and backend prefix. the same origin is advised due to possible CORS problems
- create the agent on the service side, and register a handle for each exchange - that is custom to your bussness needs


### Hints
- common code should define an object with JsonExchange's as values, or other objects containing JsonExchange's as values. Keys should briefly explain what the exchange is responsible for.
- Optionally some JsonExchange's may contain 'preProcessing' and 'postProcessing' code, that is intended for basic validations of the sended/received DTO's, and those functions are the only code that should be unit tested. Basic validation is strongly advised for any DTO types other than void.
- Use always strong typing and strict tsconfig setting for everything
- Backend can not trust the frontend.
- DTO should be just interfaces, although they should inherit if business relevant
