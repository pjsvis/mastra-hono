



## Links

- [Gemini Gem](https://gemini.google.com/gem/14zihcz6UmRpSBf1rh4BmVhZxeNwqWISI?usp=sharing) with Edinburgh protocol system-prompt
- [polyvis.net](https://polyvis.net/) is hybrid vector-graph database running client-side. It uses sqlite and a WASM package for handling SQL queries and provides vector search for the graph data.
- [Nate B Jones](https://www.youtube.com/watch?v=lbfoNxoHl2o&list=TLPQMTIwMzIwMjYZVqWBV7D-BQ&index=10) is always up to date and interesting.

- [Productivity is the New Data Breach](https://www.youtube.com/watch?v=e1ZM3dSfB70&list=TLPQMTMwMzIwMjYQLuRmHkDZwA&index=29)

- avoid data breach by avoiding the use of AI in the enterprise network
- carry out AI development using open-source and then bring the resultant code in-house
- use low cost models as they are as good as SOTA models from a few months ago
- use local AI for production tasks
-  

- consider a perf dashboard to flag when scaling limits are reached
- LLMs like to use data as contracts eg JSON
- even better is JSONL wwhere every line is a JSON object
- JSONL allows for sreamable, restartable and idempotent workflows
- Small Unix like components built with shell-script and/or Typescript with thier functionaliry exposed as a CLI
- The [NuShell](https://www.nushell.sh/book/) project aims to be a shell that works with type-safe, structured data rather than plain text. 

## credit card testing system scaling options

The following options are based on my memory of the system. IE

- we receive XML traces and store them in a database
- we abstract some summary data from the traces and stream it to the user
- the user can pause/resume the stream and inspect individual traces
- the user can page backwards and forwards throught the stream 

Given the above then the following seem like good options.

---

1. SQL Server + FILESTREAM  => scale further vertically without major rewrite

  The Win: Splits the currrent database load between the database and the file system. 

---

2. Postgres + FILESTREAM-EQUIV => scale horizontally with no licence costs

  The Win: PostGres is open source and scales horizontally easily.

---

3. SPA-UI => SSR-JSX-Bun => reduce complexity of UI layer

  The Win: Bun is a lightweight runtime that can handle SSR and provide a more stable and maintainable UI layer.

---

4. Move XML->HTML rendering to Bun server to reduce pressure on C# business layer

  The Win: removes the main work spike, the XML->JSON conversion, from the C# business layer.

---

5. Scale Bun servers horizontally to handle increased load

  The Win: Spin up as many Bun servers as you require. The database and the C# business layers should be able to handle it.

---

### conclusions

- I suspect you will have met your scaling requirements with options 1. or 2.

- At any rate you can easily test options 1. and 2. before committing to them.