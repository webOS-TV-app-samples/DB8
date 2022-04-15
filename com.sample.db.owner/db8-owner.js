var appId = "com.sample.db.owner";
var kindId = appId + ":1";
var callerId = "com.sample.db.*";

function printLog(content) {
    document.querySelector("#log").innerHTML += content + "<br>";
}
function clearLog() {
    document.querySelector("#log").innerHTML = "";
}
function printDB(content) {
    document.querySelector("#db").innerHTML = content;
}

function initPage() {
    refreshDB();

    document.querySelector("#putKind").addEventListener("click", function () {
        clearLog();
        putKind();
        refreshDB();
    });
    document.querySelector("#delKind").addEventListener("click", function () {
        clearLog();
        delKind();
        refreshDB();
    });
    document.querySelector("#putPermissions").addEventListener("click", function () {
        clearLog();
        putPermissions();
        refreshDB();
    });

    document.querySelector("#put").addEventListener("click", function () {
        clearLog();
        put(1, "A", true);
        put(2, "B", false);
        put(3, "C", true);
        put(4, "A", false);
        put(5, "B", true);
        put(6, "C", false);
        put("wrong", "A", true);
        refreshDB();
    });
    document.querySelector("#del").addEventListener("click", function () {
        var delQuery = [
            {"prop":"isUsed", "op":"=", "val":true}
        ];
        clearLog();
        del(delQuery);
        refreshDB();
    });
    document.querySelector("#merge").addEventListener("click", function () {
        var mergeQuery = [
            {"prop":"grade", "op":"=", "val":"C"}
        ];
        var updateProps = {
            "grade": "A",
            "isUsed": false
        };
        clearLog();
        merge(mergeQuery, updateProps);
        refreshDB();
    });
    
    var findQuery = [
        [
            {"prop":"number", "op":">", "val":3}
        ],
        [
            {"prop":"grade", "op":"=", "val":"A"},
            {"prop":"isUsed", "op":"=", "val":false}
        ],
        [
            {"prop":"isUsed", "op":"=", "val":true}
        ]
    ];
    document.querySelector("#find0").addEventListener("click", function () {
        clearLog();
        find(findQuery[0]);
    });
    document.querySelector("#find1").addEventListener("click", function () {
        clearLog();
        find(findQuery[1]);
    });
    document.querySelector("#find2").addEventListener("click", function () {
        clearLog();
        find(findQuery[2]);
    });
}

function putKind() {
	webOS.service.request("luna://com.palm.db", {
		method: "putKind",
		parameters: {
			id: kindId,
			owner: appId,
            schema: {
                id: kindId, 
                type: "object", 
                properties : {
                    "_kind" : {
                        "type": "string",
                        "value": kindId
                    }, 
                    "number": {
                        "type": "integer",
                        "description": "number"
                    }, 
                    "grade": {
                        "type": "string", 
                        "description": "grade string"
                    },
                    "isUsed": {
                        "type": "boolean", 
                        "description" : "flag"
                    }
                }
            },
			indexes: [
				{ 
					"name": "index0",
					"props": [
                        {"name": "number"}
                    ]
                },
                {
                    "name": "index1",
                    "props": [
                        {"name": "grade"},
                        {"name": "isUsed"}
                    ]
                },
                {
                    "name": "index2",
                    "props": [
                        {"name": "isUsed"}
                    ]
                }
			]
		},
		onSuccess: function (res) {
            printLog("[putKind] onSuccess");
		},
		onFailure: function (res) {
            printLog("[putKind] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
            console.log("[putKind] onFailure", res);
			return;
		}
	});
}

function delKind() {
	webOS.service.request("luna://com.palm.db", {
		method: "delKind",
		parameters: { 
			id: kindId
		},
		onSuccess: function (res) {
			printLog("[delKind] onSuccess");
		},
		onFailure: function (res) {
            printLog("[delKind] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
			return;
		}
	});
}

function putPermissions() {
	webOS.service.request("luna://com.palm.db", {
		method: "putPermissions",
		parameters: { 
			"permissions": [
				{
					"operations": {
						"read": "allow",
						"create": "allow",
						"update": "allow",
						"delete": "allow"
					},
					"object": kindId,
					"type": "db.kind",
					"caller": callerId
				}
			]
		},
		onSuccess: function (res) {
			printLog("[putPermissions] onSuccess");
		},
		onFailure: function (res) {
            printLog("[putPermissions] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
			return;
		}
	});
}

function put(number, grade, isUsed) {
    webOS.service.request("luna://com.palm.db", {
        method: "put",
        parameters: { 
            "objects":[
                {
                    "_kind": kindId,
                    "number": number,
                    "grade": grade,
                    "isUsed": isUsed
                }
            ]
        },
        onSuccess: function (res) {
            printLog("[put] onSuccess: " + number + ", " + grade + ", " + isUsed);
        },
        onFailure: function (res) {
            printLog("[put] onFailure: " + number + ", " + grade + ", " + isUsed);
            printLog("(" + res.errorCode + ") " + res.errorText);
            return;
        }
    });
}

function del(query) {
    webOS.service.request("luna://com.palm.db", {
        method: "del",
        parameters: {
            "query" : { 
                "from" : kindId,
                "where": query
            }
        },
        onSuccess: function (res) {
            printLog("[del] onSuccess: deleted " + res.count + " object(s).");
        },
        onFailure: function (res) {
            printLog("[del] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
            return;
        }
    });
}

function merge(query, props) {
    webOS.service.request("luna://com.palm.db", {
        method: "merge",
        parameters: { 
            "query":{
                "from": kindId,
                "where": query
            },
            "props": props
        },
        onSuccess: function (res) {
            printLog("[merge] onSuccess: updated " + res.count + " object(s).");
        },
        onFailure: function (res) {
            printLog("[merge] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
            return;
        }
    });
}

function find(query) {
    webOS.service.request("luna://com.palm.db", {
        method: "find",
        parameters: { 
            "query": {
                "from": kindId,
                "where": query,
                "limit": 10
            }
        },
        onSuccess: function (res) {
            var result = res.results;
            printLog("[find] onSuccess: found " + result.length + " object(s).");
            printLog("number / grade / isUsed / _id / _rev");
            for (var i in result) {
                printLog(result[i].number + " / " + result[i].grade + " / " + result[i].isUsed + " / " + result[i]._id + " / " + result[i]._rev);
            }
            console.log("[find] onSuccess:", result);
        },
        onFailure: function (res) {
            printLog("[find] onFailure");
            printLog("(" + res.errorCode + ") " + res.errorText);
            return;
        }
    });
}

function refreshDB() {
    webOS.service.request("luna://com.palm.db", {
        method: "find",
        parameters: { 
            "query": {
                "from": kindId,
                "where": [
                    {"prop":"number", "op":">", "val":0}
                ]
            }
        },
        onSuccess: function (res) {
            var result = res.results;
            var content = "[DB Total: " + result.length + "] number / grade / isUsed / _id / _rev<br>"
            for (var i in result) {
                content +=result[i].number + " / " + result[i].grade + " / " + result[i].isUsed + " / " + result[i]._id +  " / " + result[i]._rev + "<br>";
            }
            printDB(content);
            console.log("[refreshDB] onSuccess:", result);
        },
        onFailure: function (res) {
            printDB("[refreshDB] onFailure");
            printDB("(" + res.errorCode + ") " + res.errorText);
            return;
        }
    });
}