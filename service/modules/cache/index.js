const redis            = require("redis");
var {ExtendedLogger} = require('@logger');

/**
 * Cache client class to used everywhere
 * @author Swapnil Kumar(techgenies.com)
 */
class Client {

  /**
   * 
   * @param {String} redisUrl Redis url to connect
   * @author Swapnil Kumar(techgenies.com)
   */
  constructor(redisUrl){
    this.client = redis.createClient(`redis://${redisUrl}`);
    this.logger = new ExtendedLogger("redisCache", null);
    this.logger.debug('Redis url', redisUrl);
  }

  /**
   * A function to search among key in redis-cache based on pattern
   * @param {String} pattern Pattern string to search among keys
   * @returns {Array} Array of keys matching
   * @author Swapnil Kumar(techgenies.com)
   */
  searchKeys(pattern) {
    let self = this;
    return new Promise(function(resolve, reject) {
        try {
            self.logger.debug(`Searching keys for ${pattern} pattern in cache`);
            self.client.keys(`${pattern}`, function(err, reply) {
              if (err) {
                reject(err);
                if (typeof err == "object") {
                  err = JSON.stringify(err);
                }
                self.logger.error(err);
              } else {
                self.logger.debug(`Redis reply for searching keys with pattern \`${pattern}\` : ${reply}`);
                resolve(reply);
              }
            });
      
          } catch (e) {
            self.logger.error(e);
            reject(e)
          }  
    })
  }
  
  /**
   * Function to delete keys from redis-cache
   * @param {Array} keys Keys to delete from redis
   * @returns {String} Reply from redis
   * @author Swapnil Kumar(techgenies.com)
   */
  clearRedis (keys) {
    let self = this;
    return new Promise(function(resolve, reject) {
        try {
            self.logger.debug(`Deleting ${keys} in cache`);
            self.client.del(keys, function(err, reply) {
              if (err) {
                reject(err);
                if (typeof err == "object") {
                  err = JSON.stringify(err);
                }
                self.logger.error(err);
              } else {
                self.logger.debug(`Redis reply for deleting keys \`${keys}\` : ${reply}`);
                resolve(reply);
              }
            });
      
          } catch (e) {
            self.logger.error(e);
            reject(e)
          }  
    })
  }
  
  /**
   * Function to check whether the field is in redis-cache or not
   * @param {String} key Key to serach in redis-cache
   * @returns {Boolean} Status denoting whether key is present or not
   * @author Swapnil Kumar(techgenies.com)
   */
  hasKey(key) {
    let self = this;
    return new Promise(function(resolve, reject) {
        try {
            self.logger.debug(`Checking ${key} in cache`);
            self.client.exists(key, function(err, reply) {
              if (err) {
                reject(err);
                if (typeof err == "object") {
                  err = JSON.stringify(err);
                }
                self.logger.error(err);
              } else {
                self.logger.debug(`Redis reply for checking \`${key}\` : ${reply}`);
                resolve(reply);
              }
            });
      
          } catch (e) {
            self.logger.error(e);
            reject(e)
          }  
    })
  }
  
  /**
   * Function to set key value in redis-cache
   * @param {String} key Key to save
   * @param {*} val Value to store in redis
   * @author Swapnil Kumar(techgenies.com)
   */
  setVal(key, val) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        let dislayableVal = val;
        if (typeof val == "object") {
          dislayableVal = JSON.stringify(val)
        }
        self.logger.debug(`Setting ${key}=${dislayableVal} in cache`)
        self.client.set(key, val, function(err, reply) {
          if (err) {
            reject(err);
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
          } else {
            self.logger.debug(`Redis reply for setting \`${key}\` : ${reply}`);
            resolve(reply);
          }
        });
  
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
  
    })
  
  }
  
  /**
   * Function to get value against key in redis-cache
   * @param {String} key Key to search for inside redis-cache
   * @author Swapnil Kumar(techgenies.com)
   */
  getVal(key) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.logger.debug(`Retrieving \`${key}\` from cache`)
        self.client.get(key, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(err)
          } else {
            self.logger.debug(`Value for \`${key}\` retreived...`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

  /**
   * Function to set val in hashmap redis-cache
   * @param {String} key Key against which the field values are stored
   * @param  {...any} kvp Arguments array of field-value pairs
   * @author Swapnil Kumar(techgenies.com)
   */
  hmSetVal(key,...kvp) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {

        if(kvp.length == 0 || kvp.length % 2 == 1){
          resolve("invalid redis parameter");
          return;
        }

        kvp.map((val, index) => {
          if(typeof(val) == "object"){
            kvp[index] = JSON.stringify(val);
          }
        });

        self.logger.debug(`Saving \`${key}\` with kvp `,kvp,` to hm cache`)
        // self.client.hmset(key, kvp, function(err, reply) {  //HMSET is deprecated in redis 4 and above versions
        self.client.hset(key, kvp, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(err)
          } else {
            self.logger.debug(`Redis reply for setting \`${key}\` : ${reply}`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

  /**
   * Function to perform hmget function of redis-cache
   * @param {*} key Key to search in redis-cache
   * @param  {...any} fields Fields array to get values
   * @author Swapnil Kumar(techgenies.com)
   */
  hmGetVal(key,...fields) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.logger.debug(`Retrieving \`${key}\` with fields `,fields,` from hm cache`)
        // self.client.hmget(key, fields, function(err, reply) { //HMGET is deprecated in redis 4 and above versions
          self.client.hget(key, fields, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(err)
          } else {
            self.logger.debug(`Value for \`${key}\` for ${fields} retreived...`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

  /**
   * The function perform hdel function of redis-cache
   * @param {*} key Key to delete from redis cache
   * @param  {...any} fields Field array to delete in a given key
   */
  hmRemoveVal(key,...fields) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.logger.debug(`Deleting \`${key}\` with fields `,fields,` from hm cache`)
        // self.client.hmget(key, fields, function(err, reply) { //HMGET is deprecated in redis 4 and above versions
          self.client.hdel(key, fields, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(err)
          } else {
            self.logger.debug(`Delete \`${fields}\` for ${key} retreived...`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

  /**
   * Function to perform select function of redis-cache
   * @param {*} index The redis cache index to use for operations
   * @author Swapnil Kumar(techgenies.com)
   */
  selectIndex(index) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.logger.debug(`Changing redis database index to ${index}`)
          self.client.select(index, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(null)
          } else {
            self.logger.debug(`Changed redis database index to ${index}`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

  /**
   * Function to check whether the field exists in the has-key in redis
   * @param {string} key The key in redis HSET
   * @param {string} field The field in redis HSET for has-key
   * @author Swapnil Kumar(techgenies.com)
   */
  hSetFieldExists(key, field) {
    let self = this;
    return new Promise(function(resolve, reject) {
      try {
        self.logger.debug(`Checking in redis whether ${field} exists at ${key} hash`)
          self.client.hexists(key, field, function(err, reply) {
          if (err) {
            if (typeof err == "object") {
              err = JSON.stringify(err);
            }
            self.logger.error(err);
            reject(null)
          } else {
            self.logger.debug(`Fetched the result for field existence in redis, reply:${reply}`);
            resolve(reply)
          }
        });
      } catch (e) {
        self.logger.error(e);
        reject(e)
      }
    })
  }

}

module.exports =  Client;
