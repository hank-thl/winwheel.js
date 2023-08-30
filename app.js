const { MongoClient } = require("mongodb");

const uri = 'mongodb+srv://hankthl:NUrpWaLENQ0riK30@cluster0.81m6ftv.mongodb.net/?retryWrites=true&w=majority'; // 从 MongoDB Atlas 获取的连接字符串
const client = new MongoClient(uri);
const database = client.db("aisen");
const collection = database.collection("award");
function getCurrentDateTime() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return currentDateTime;
  }
async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas", error);
  }
}
async function insertDocument(phone,name,award,played) {
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
	} finally{
		closeConnection();
	}
  }
  async function updateDocument(phone,played) {
	await connect();

	const filter = phone?{phone:`${phone}`}:{ played: true }; // Specify the filter for the document you want to update
	const update = { $set: { played: played } }; // Specify the update operation
	
	try {
	  const result = await collection.updateMany(filter, update);
	  console.log("Document updated:", result.modifiedCount);
	} catch (error) {
	  console.error("Error updating document", error);
	} finally{
		closeConnection();
	}
  }
async function closeConnection() {
	try {
	  await client.close();
	  console.log("Connection closed");
	} catch (error) {
	  console.error("Error closing connection", error);
	}
  }
async function findDocuments(phone) {
try {
	await connect();
	const cursor = collection.find({ phone:`${phone}` });
	const documents = await cursor.toArray();
	console.log("Found documents:", documents);
	return await documents;
} catch (error) {
	console.error("Error finding documents", error);
}finally{
	closeConnection();
}
}

// setInterval(()=>{
// 	const now = new Date();
// 	const hour = now.getHours()
// 	if(hour == 0){
// 		updateDocument('',false);
// 	}
// },60000)
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
app.listen(3000);
console.log("Web伺服器就緒，開始接受用戶端連線.");
console.log("鍵盤「Ctrl + C」可結束伺服器程式.");

// ---------------


app.post("/phoneCheck", async function (request, response) {
	let phone =	request.body.phone

 
	
	let result = await findDocuments(phone);

	response.send(result);
});
app.post("/startWinwheel", async function (request, response) {
	let phone =	request.body.phone
	let name =	request.body.phone

	let randomNumber = Math.random();
	let stopAt;
	let award;
	if (randomNumber < 0.9) {
		// 90%
		stopAt = (1 + Math.floor((Math.random() * 58)));
		award = '100元當日折扣';
	} else if (randomNumber < 0.98) {
		// 8%
		stopAt = (181 + Math.floor((Math.random() * 58)));
		award = '再接再厲';
	} else if (randomNumber < 0.995) {
		// 1.5%
		stopAt = (241 + Math.floor((Math.random() * 58)));
		award = '200元當日折扣';
	} else {
		// 0.5%
		stopAt = (121 + Math.floor((Math.random() * 58)));
		award = '300元當日折扣';
	}
 
	
	let result = {
		stopAt : stopAt
	};

	await insertDocument(phone,name,award,true);
	await updateDocument(phone,true);
	response.send(result);

});

