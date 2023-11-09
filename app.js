const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI; // 从 MongoDB Atlas 获取的连接字符串
const client = new MongoClient(uri);
const database = client.db("aisen");
const collection = database.collection("award");
// 獲取現在時間
function getCurrentDateTime() {
	const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });

	return now;
}

// 連接資料庫
async function connect() {
	try {
		await client.connect();
		console.log("Connected to MongoDB Atlas");
	} catch (error) {
		console.error("Error connecting to MongoDB Atlas", error);
	}
}
// 插入資料
async function insertDocument(phone, name, award, played) {
	try {
		await connect();
		const result = await collection.insertOne(
			{
				phone: phone,
				name: name,
				award: award,
				played: played,
				create_at: getCurrentDateTime()
			});
		console.log("Document inserted:", result.insertedId);
	} catch (error) {
		console.error("Error inserting document", error);
	} finally {
		closeConnection();
	}
}
// 更新資料
async function updateDocument(phone, played) {
	await connect();

	const filter = phone ? { phone: `${phone}` } : { played: true }; // Specify the filter for the document you want to update
	const update = { $set: { played: played} }; // Specify the update operation

	try {
		const result = await collection.updateMany(filter, update);
		console.log("Document updated:", result.modifiedCount);
	} catch (error) {
		console.error("Error updating document", error);
	} finally {
		closeConnection();
	}
}
// 關閉資料庫連線
async function closeConnection() {
	try {
		await client.close();
		console.log("Connection closed");
	} catch (error) {
		console.error("Error closing connection", error);
	}
}
// 查詢資料
async function findDocuments(phone) {
	try {
		await connect();
		const cursor = collection.find(phone ? { phone: `${phone}` } : {});
		const documents = await cursor.toArray();
		console.log("Found documents:", documents);
		return await documents;
	} catch (error) {
		console.error("Error finding documents", error);
	} finally {
		closeConnection();
	}
}
// 聚合資料
async function aggregateDocuments() {
	try {
		await connect(); // 连接到数据库

		const pipeline = [
			{
				$group: {
					_id: "$phone",
					count: { $sum: 1 }
				}
			},
			{
				$sort: { count: -1 }
			}
		];

		const cursor = collection.aggregate(pipeline); // 执行聚合操作

		const result = await cursor.toArray(); // 将结果转换为数组

		console.log("Aggregated documents:", result);
		return result;
	} catch (error) {
		console.error("Error aggregating documents", error);
	} finally {
		closeConnection(); // 关闭数据库连接
	}
}





// setInterval(()=>{
// 	const now = new Date();
// 	const hour = now.getHours()
// 	if(hour == 0){
// 		updateDocument('',false);
// 	}
// },60000)
// updateDocument('',false);
// connect();
// insertDocument('0921005634','john','100元當日折扣',true);


// 以 Express 建立 Web 伺服器
var express = require("express");
var app = express();

// 允許跨域使用本服務
var cors = require("cors");
app.use(cors());

// Web 伺服器的靜態檔案置於 public 資料夾
app.use(express.static("public"));

// 以 body-parser 模組協助 Express 解析表單與JSON資料
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 一切就緒，開始接受用戶端連線
// app.listen(process.env.PORT);
// app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("鍵盤「Ctrl + C」可結束伺服器程式.");

// ---------------

app.get("/find", async function (request, response) {
	let result = await findDocuments();

	response.send(result);
});

app.get("/count", async function (request, response) {
	const aggregationResult = await aggregateDocuments();

	response.send(aggregationResult);
});

app.post("/phoneCheck", async function (request, response) {
	let phone = request.body.phone



	let result = await findDocuments(phone);

	response.send(result);
});

app.post("/startWinwheel", async function (request, response) {
	let phone = request.body.phone
	let name = request.body.name

	let randomNumber = Math.random();
	let stopAt;
	let award;
	if (randomNumber < 0.45) {
		// 45%
		stopAt = (1 + Math.floor((Math.random() * 58)));
		award = 1;
	} else if (randomNumber < 0.85) {
		// 40%
		stopAt = (61 + Math.floor((Math.random() * 58)));
		award = 2;
	} else if (randomNumber < 0.95) {
		// 10%
		stopAt = (121 + Math.floor((Math.random() * 58)));
		award = 3;
	} else if (randomNumber < 0.97) {
		// 2%
		stopAt = (181 + Math.floor((Math.random() * 58)));
		award = 4;
	}else if (randomNumber < 0.99) {
		// 2%
		stopAt = (241 + Math.floor((Math.random() * 58)));
		award = 5;
	}else {
		// 1%
		stopAt = (301 + Math.floor((Math.random() * 58)));
		award = 6;
	}
	// if (randomNumber < 0.9) {
	// 	// 90%
	// 	stopAt = (181 + Math.floor((Math.random() * 58)));
	// 	award = '銘謝惠顧';
	// } else {
	// 	// 10%
	// 	stopAt = (1 + Math.floor((Math.random() * 58)));
	// 	award = '100元折價券';
	// }

	let result = {
		stopAt: stopAt
	};
	// let isPlayed = await findDocuments(phone);	
	// if (isPlayed.length > 0) {
	// 	point = award + isPlayed[0].point;
	// } else {
	// }
	await updateDocument(phone, true);
	await insertDocument(phone, name,  false);
	
	response.send(result);

});

export default app;