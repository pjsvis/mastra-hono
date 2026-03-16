# misc

- Local LLMs are getting more capable as time goes by
- Develop in the cloud with test data. Then deploy locally with real data.
- FIS moat is the CC Sims
- Develop prototype UIs in open source then bring them in-house.
- This allows you to use cheap Chinese LLMs for prototyping
- Chinese LLMs are low cost and as good as SOTTA LLMs from three or six months ago.   
- Get the LLM to do the things it is trained to do.
- For example: LLMs prefer co-location of HTML and CSS classes and have decided that TailWind CSS is the way to go.


## scaling options

- Consider SQL Server FILESTREAM to store XML traces 
  - to reduce the database pressure on the server
  
- Consider switching to PostGres database:
  - SQL Server is good at OLTP and ACID transactions and PostGres is more suited to horizontal scaling
  - PostGres has a similar capability to SQL Server FILESTREAM
  - PostGres is also free so licensing saving could be made

- Consider removing complexity from the the SPA front end by replacing it with a server side rendered JSX served by a Bun server.
- Consider rendering the XML traces in the Bun server rather than the C# server to reduce the load on the C# server.