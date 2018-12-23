const MongoClient = require('mongodb').MongoClient
const settings = require('./settings')
let url = settings.dbUrl

function _connectDB(callback) {
  let url = settings.dbUrl
  MongoClient.connect(url, function(err, db) {
    if (err) {
      callback(err, null)
      return
    }
    // 数据库链接成功执行回掉
    callback(err, db)
  })
}
//
////定义函数表达式，用于操作数据库并返回结果
//var findData = function(db, callback) {
//    //获得指定的集合
//    const mydb = db.db('test');
//  var collection = mydb.collection('indexes');
//    //要查询数据的条件，<=10岁的用户
//    var  where={Type:"insert"};
//    //要显示的字段
//    var set={Name:1,Type:1};
//    collection.find(where,set).toArray(function(err, result) {
//        //如果存在错误
//        if(err)
//        {
//            console.log('Error:'+ err);
//            return;
//        }
//        //调用传入的回调方法，将操作结果返回
//        callback(result);
//    });
//}


//
//MongoClient.connect(url, {useNewUrlParser:true}, function(err, db) {
//    console.log("连接成功！");
//    //执行插入数据操作，调用自定义方法
//    findData(db, function(result) {
//        //显示结果
//        console.log(result);
//        //关闭数据库
//        db.close();
//    });
//});

// 查找数据
exports.find = function(queryJson, callback) {
  _connectDB(function(err, db) {
    let json = queryJson.query || {},
      limit = Number(queryJson.limit) || 0,
      count = Number(queryJson.page) - 1,
      sort = queryJson.sort || {}
    // 页数为0或者1都显示前limit条数据
    if (count <= 0) {
      count = 0
    } else {
      count = count * limit
    }
    const mydb = db.db('infomation');
    var info = mydb.collection('inf');
    //var title = mydb.collection('title');
    console.log(json);
    let cursor_info = info.find(json).limit(limit).skip(count).sort(sort)
    //let cursor_title = title.find(json).limit(limit).skip(count).sort(sort)
    cursor_info.toArray(function(err, results) {
      if (err) {
        callback(err, null)
        db.close()
        return
      }
      callback(err, results)
      db.close()
    })
  })
}
