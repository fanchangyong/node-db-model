var MongoClient = require('mongodb').MongoClient
, assert = require('assert');
var util = require('util');

var mongodb;

var url = 'mongodb://localhost:27017/myproject';

function User(id,name,age,hobbies){
	this.id=id;
	this.name=name;
	this.age=age;
	this.hobbies=hobbies;
}

function setup_db_layer(cb){
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		mongodb = db;
		User.coll = db.collection('user',function(err1,coll){
			User.coll = coll;
			return cb();
		});
	});
}

User.create = function(id,name,age,hobbies){
	var user = new User(id,name,age,hobbies);
	user.coll = User.coll;
}

User.find = function(id,cb){
	User.coll.find({id:id}).toArray(function(err,results){
		if(err){
			return cb(err);
		}
		var user_list = [];
		for(var i=0;i<results.length;i++){
			var user = new User;
			user.id=results[i].id;
			user.name=results[i].name;
			user.age=results[i].age;
			user.hobbies=results[i].hobbies;
			user_list.push(user);
		}
		return cb(null,user_list);
	});
}

User.prototype.save = function(cb){
	User.coll.insert({
		id:this.id
		,name:this.name
		,age:this.name},
		{forceServerObjectId:true},
		function(err,results){
			return cb(err,results);
		});
}

setup_db_layer(function(){
	var user = new User(999,'user_111',18,'game');
	user.save(function(){
		User.find(999,function(err,users){
			for(var i=0;i<users.length;i++){
				var str = util.format('user[%d].name:%s,age:%d',
					i,users[i].name,users[i].age);
				console.log(str);
			}
			process.exit(0);
		})

	});

});
