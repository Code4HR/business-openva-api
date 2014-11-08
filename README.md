An API for [VABusinesses.org] (https://vabusinesses.org/)
===================

Built on [Hapi.js] (http://hapijs.com/) using [Elasticsearch] (http://www.elasticsearch.org).

To reproduce the data set:

1. Download and install [Elasticsearch] (http://www.elasticsearch.org)
2. Start your Elasticsearch server
3. Clone [Crump] (https://github.com/openva/crump)
4. Download the [current data file] (https://s3.amazonaws.com/virginia-business/current.zip) and [the current address file] (https://s3.amazonaws.com/virginia-business/current.zip)
or alternatively use Crump to download it
5. Run `./Crump -tem`. If you want Crump to download the data for you add the -d option (i.e. `-tedm`)
6. Run [the indexing script] (https://github.com/openva/vabusinesses.org/blob/master/index.sh), changing the directory to the location where you ran Crump.

To install the API:

1. Install Node
2. Clone this repo
3. `cd` to the directory where you installed the repo and run `npm install`.
4. Alter the config.json file for your setup
5. Run `node api.js`


