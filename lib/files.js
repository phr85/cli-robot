var fs = require("fs");
var async = require("async");
var log = require("./util").log;
var doing = require("./util").doing;

/*
 * Recursive Iterator over File System and Filter
 * @return array of files
 */
module.exports.list = function( source, filter )
{
  var base = source.length;
  var _files = [];

  var traverse = function( path )
  {
    fs.readdirSync( path ).forEach( function( file )
    {
      var abso = path + "/" + file;
      var rela = abso.slice( base );
      var stat = fs.statSync( abso );

      if( stat.isFile() ) _files.push( rela );
      if( stat.isDirectory() ) traverse( abso );
    });
  };
  traverse( source );

  return _files.filter( function(file) {
    return ( filter ) ? filter.test( file ) : true;
  });
}


/*
 * Copy files from source to destination
 *
 * Example
 * var copies = [];
 * copies.push( { from: './x.json, to:'../other/x.json' } );
 * copy( copies, callback );
*/
module.exports.copy = function( jobs, done, override )
{
  override = override || true;

  var progress = 1;
  var copy = async.queue(function (job, callback) 
  {  
    // BUILD FILESYSTEM
    var path;
    job.to.split("/").forEach( function(sub,index,arr) {
    
      if( path) path = path + "/" +sub;
      if(!path) path = sub;
      
      if( !fs.existsSync(path) && index < arr.length -1 ) fs.mkdirSync( path );    
    });

    if(!override && fs.existsSync(job.to)){
      callback();
    }
    else{
      var readStream = fs.createReadStream(job.from);
      var writeStream = fs.createWriteStream(job.to);

      readStream.on("data", function(data) {
        writeStream.write( data );
      });

      readStream.on("end", function(data) {
        doing("Writing #",progress,"of",jobs.length);
        progress++;
        writeStream.end();
      });

      writeStream.on("close", function() {
        callback();
      });
    }
  },3);

  copy.drain = function() { 
    done(); 
  };
  
  // add some items to the queue
  copy.push( jobs, function (err) {
      if( err ) console.log("COPY ERROR", err);
  });

};