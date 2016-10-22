# logagent-filter-output-sql
Filter and aggregate parsed logs with SQL  and [@sematext/logagent](https://sematext/logagent)

This applies SQL queries on parsed log events. The result of the query is emitted as new event, while the original events are omitted. 

Using SQL it is very easy to aggregate values, e.g. group HTTP requests by status codes. The SQL WHERE statemtn helps to filter events, before they get shipped to Elasticsearch or [Logsene](https://sematext.com/logsene). 

# Installation 

Assuming @sematext/logagent is installed gloabally: 

```
npm i -g @sematext/logagent
npm i -g @sematext/logagent-filter-output-sql
```

# Configuration 

Add following section 'outputFilter' to @sematext/logagent configuration file. Please note you could use the plugin with multiple configurations for different event sources. 

```
input: 
  files:
    - './access.log'

outputFilter:
  - module: '@sematext/logagent-filter-output-sql'
    config:
      source: !!js/regexp /access.log|httpd/
      interval: 1 # every second
      queries:
        - SELECT 'apache_stats' as _type, AVG(size) as size_avg, count(method) as method_count, method from ? GROUP BY method
        - SELECT * FROM ? where status_code>399
output:
  elasticsearch:
    url: http://localhost:9200
    index: mylogs
```

Run logagent with your config: 
```
logagent --config logagent-example-config.yml 
```
