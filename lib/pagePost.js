'use strict';
const db = require('./db.js')
const iconv = require('iconv-lite');
var fs = require('fs');
var title = [];
var ans = [];
var limit = 4;
var isClassify = false;
var data = {currentPage:0,totalPages:0};
var dataitem = {currentPage:0,totalPages:0};
var exec = require('child_process').exec;
module.exports.search = function(req, res, next) {
    res.render('index', { title: 'Search'});
};

exports.test = function(req, res, next) {
if (!isClassify) res.render('list', data);
else res.render('list', dataitem);
}


exports.query = function(req, res, next) {
  isClassify = false;
  let queryString = req.body.content;
  console.log(queryString)
  var arr = [];
  ans = [];
  exec('python query.py '+ queryString,{ encoding: 'buffer' },function(err,stdout,stderr){
    if(stdout.length >1){
    	fs.readFile('text_id.json',function(err,data_list){
        var str = iconv.decode(stdout, 'cp936');
        str = str.split(']')[1];
        console.log(str);
        var classify_list = str.split(',');
			//var arr = JSON.parse(data_str).data;//将字符串转换为json对象
		var classify_arr = [];
		console.log(classify_list);
		for (var i=0;i<classify_list.length;i++)
			if (typeof classify_list[i] === "string") {
				classify_list[i] = classify_list[i].replace("[", "");
				classify_list[i] = classify_list[i].replace("]", "");
				classify_list[i] = classify_list[i].replace(" ", "");
				classify_list[i] = classify_list[i].replace("\r", "");
				classify_list[i] = classify_list[i].replace("\n", "");
				classify_list[i] = classify_list[i].replace("\'", "");
				classify_list[i] = classify_list[i].replace("\'", "");
				classify_arr.push(classify_list[i]);
			}
		console.log(classify_arr);
        if(err){
            return console.error(err);
        }
        var data_str = data_list.toString();//将二进制的数据转换为字符串
        data_str = data_str.slice(1,data_str.length);
        var list = data_str.split(',');
        //var arr = JSON.parse(data_str).data;//将字符串转换为json对象
        var arr = [];
        console.log(list);
        for (var i=0;i<list.length;i++)
        	if (typeof list[i] === "string") {
        		list[i] = list[i].replace("[", "");
        		list[i] = list[i].replace("]", "");
        		list[i] = list[i].replace(" ", "");
        		list[i] = list[i].replace("\r", "");
        		list[i] = list[i].replace("\n", "");
        		list[i] = list[i].replace("\"", "");
        		list[i] = list[i].replace("\"", "");
        		arr.push(list[i]);
        	}
        console.log(arr);
        var isOK = false;
        for (var i=0; i<arr.length;i++){
  			console.log(arr[i]);
			db.find({"query":{"doc_id": arr[i]}}, function(err, result) {
				if (err) {
					return res.json({
					"code": 404,
					"message": "数据查询失败",
					"result": []
				  })
				}
				result[0].text = result[0].text.substr(0,170)+"...";
				ans.push(result[0]);
				console.log(ans.length);
				if (ans.length == arr.length) {
					fs.readFile('file.json',function(err,classify_list){
						if(err){
							return console.error(err);
						}
						console.log(1111);
						var classify_str = classify_list.toString();
						console.log(classify_arr);
						var myarr = JSON.parse(classify_str);
						for (var i=0; i<myarr.length; i++)
							console.log(myarr[i]);
						console.log(typeof myarr);
						data.classify_result = myarr;
						data.classify = classify_arr;
						data.totalPages = Math.ceil(arr.length/limit);
						data.items = ans;
						data.query = queryString;
						data.limit = 4;
						data.length = arr.length;
						data.type = "query";
						data.num = 0;
						return res.json({
							"code": 200,
							"message": "数据获取成功",
							"query": req.body.content,
						})
//						var classify_str = classify_list.toString();//将二进制的数据转换为字符串
//						classify_str = classify_str.slice(1,classify_str.length);
//						var classify_list = classify_str.split(',');
//						//var arr = JSON.parse(data_str).data;//将字符串转换为json对象
//						var classify_arr = [];
//						console.log(classify_list);
//						for (var i=0;i<classify_list.length;i++)
//							if (typeof classify_list[i] === "string") {
//								classify_list[i] = classify_list[i].replace("[", "");
//								classify_list[i] = classify_list[i].replace("]", "");
//								classify_list[i] = classify_list[i].replace(" ", "");
//								classify_list[i] = classify_list[i].replace("\r", "");
//								classify_list[i] = classify_list[i].replace("\n", "");
//								classify_list[i] = classify_list[i].replace("\"", "");
//								classify_list[i] = classify_list[i].replace("\"", "");
//								classify_arr.push(classify_list[i]);
//							}
//						console.log(classify_arr);
//
					})
				}
   			})
   		}
   	})
    } else {
        console.log('you don\'t offer args');
        return res.json({
			"code": 404,
			"message": "you don\'t offer args",
			"query": "",
		})
    }
    if(err) {
        console.info('stderr : '+stderr);
        return res.json({
			"code": 404,
			"message": stderr,
			"query": "",
		})
    }
  });
}

exports.postClassify = function(req, res, next) {
	isClassify = true;
	var num = req.body.num;
	var classify_json = data.classify_result[num];
	var item_list = [];
	for (var item in classify_json) {
		var article_list = classify_json[item];
		for (var i=0; i<article_list.length;i++ ) {
			for (var j=0;j<data.items.length;j++ ) {
				if (data.items[j].doc_id == article_list[i]) item_list.push(data.items[j]);
			}
		}
	}
	dataitem.classify_result = data.classify_result;
	dataitem.classify = data.classify;
	dataitem.totalPages = Math.ceil(item_list.length/limit);
	dataitem.items = item_list;
	dataitem.query = data.query;
	dataitem.limit = 4;
	dataitem.length = item_list.length;
	dataitem.num = num;
	dataitem.type = "classify";
	return res.json({
		"code": 200,
        "message": "换页成功",
        "query": data.query
	})
}

exports.changePage = function(req, res, next) {
	data.currentPage = req.body.currentPage;
    return res.json({
        "code": 200,
        "message": "换页成功"
    })
}

exports.searchText = function(req, res, next) {
  return res.json({
      "code": 200,
      "message": "查询成功",
      "result":req.body.content
    })
}
