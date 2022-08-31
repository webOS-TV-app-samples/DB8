var kindId = "com.sample.db.owner:1";
var ids = [];

window.addEventListener(
  "load",
  function () {
    initPage();
  },
  false
);

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

  document.querySelector("#put").addEventListener("click", function () {
    clearLog();
    put(7, "A", false);
    put(8, "B", true);
    put(9, "C", false);
    refreshDB();
  });
  document.querySelector("#del").addEventListener("click", function () {
    clearLog();
    var delQuery = [{ prop: "number", op: ">=", val: 7 }];
    del(delQuery);
    refreshDB();
  });
  document.querySelector("#merge").addEventListener("click", function () {
    var mergeQuery = [
      { prop: "number", op: ">=", val: 7 },
      { prop: "number", op: "<", val: 100 },
    ];
    var updateProps = {
      number: 10,
    };
    clearLog();
    merge(mergeQuery, updateProps);
    refreshDB();
  });

  var findQuery = [
    [{ prop: "number", op: ">", val: 3 }],
    [
      { prop: "grade", op: "=", val: "A" },
      { prop: "isUsed", op: "=", val: false },
    ],
    [{ prop: "isUsed", op: "=", val: true }],
  ];
  document.querySelector("#find0").addEventListener("click", function () {
    clearLog();
    find(findQuery[0]);
    refreshDB();
  });
  document.querySelector("#find1").addEventListener("click", function () {
    clearLog();
    find(findQuery[1]);
    refreshDB();
  });
  document.querySelector("#find2").addEventListener("click", function () {
    clearLog();
    find(findQuery[2]);
    refreshDB();
  });

  document.querySelector("#reserveIds").addEventListener("click", function () {
    clearLog();
    reserveIds(3);
  });
  document.querySelector("#putWithId").addEventListener("click", function () {
    clearLog();
    for (var i in ids) {
      putWithId(ids[i], 100, "D", true);
    }
    refreshDB();
  });
  document.querySelector("#delWithId").addEventListener("click", function () {
    clearLog();
    delWithId(ids);
    refreshDB();
  });
  document.querySelector("#get").addEventListener("click", function () {
    clearLog();
    get(ids);
  });
}

function put(number, grade, isUsed) {
  webOS.service.request("luna://com.palm.db", {
    method: "put",
    parameters: {
      objects: [
        {
          _kind: kindId,
          number: number,
          grade: grade,
          isUsed: isUsed,
        },
      ],
    },
    onSuccess: function (res) {
      printLog("[put] onSuccess: " + number + ", " + grade + ", " + isUsed);
    },
    onFailure: function (res) {
      printLog("[put] onFailure: " + number + ", " + grade + ", " + isUsed);
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function del(query) {
  webOS.service.request("luna://com.palm.db", {
    method: "del",
    parameters: {
      query: {
        from: kindId,
        where: query,
      },
    },
    onSuccess: function (res) {
      printLog("[del] onSuccess: deleted " + res.count + " object(s).");
    },
    onFailure: function (res) {
      printLog("[del] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function merge(query, props) {
  webOS.service.request("luna://com.palm.db", {
    method: "merge",
    parameters: {
      query: {
        from: kindId,
        where: query,
      },
      props: props,
    },
    onSuccess: function (res) {
      printLog("[merge] onSuccess: updated " + res.count + " object(s).");
    },
    onFailure: function (inError) {
      printLog("[merge] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function find(query) {
  webOS.service.request("luna://com.palm.db", {
    method: "find",
    parameters: {
      query: {
        from: kindId,
        where: query,
        limit: 10,
      },
    },
    onSuccess: function (res) {
      var result = res.results;
      printLog("[find] onSuccess: found " + res.results.length + " object(s).");
      printLog("number / grade / isUsed / _id / _rev");
      for (var i in result) {
        printLog(
          result[i].number +
            " / " +
            result[i].grade +
            " / " +
            result[i].isUsed +
            " / " +
            result[i]._id +
            " / " +
            result[i]._rev
        );
      }
      console.log("[find] onSuccess:", result);
    },
    onFailure: function (res) {
      printLog("[find] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function reserveIds(count) {
  webOS.service.request("luna://com.palm.db", {
    method: "reserveIds",
    parameters: {
      count: count,
    },
    onSuccess: function (res) {
      printLog("[reserveIds] onSuccess: reserved " + count + " id(s).");
      var result = res.ids;
      console.log("[reserveIds] onSuccess:", result);
      ids = result;
      for (var i in ids) {
        printLog("ids[" + i + "]: " + ids[i]);
      }
    },
    onFailure: function (res) {
      printLog("[reserveIds] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function putWithId(id, number, grade, isUsed) {
  webOS.service.request("luna://com.palm.db", {
    method: "put",
    parameters: {
      objects: [
        {
          _kind: kindId,
          _id: id,
          number: number,
          grade: grade,
          isUsed: isUsed,
        },
      ],
    },
    onSuccess: function (res) {
      console.log("[putWithId] onSuccess:", res.results);
      printLog(
        "[putWithId] onSuccess: " +
          number +
          ", " +
          grade +
          ", " +
          isUsed +
          ", " +
          res.results[0].id +
          ", " +
          res.results[0].rev
      );
    },
    onFailure: function (res) {
      printLog(
        "[putWithId] onFailure: " + number + ", " + grade + ", " + isUsed
      );
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function delWithId(ids) {
  webOS.service.request("luna://com.palm.db", {
    method: "del",
    parameters: {
      ids: ids,
    },
    onSuccess: function (res) {
      console.log("[delWithId] onSuccess:", res.results);
      printLog("[delWithId] onSuccess:");
      for (var i in res.results) {
        printLog("[delWithId] deleted " + res.results[i].id);
      }
    },
    onFailure: function (res) {
      printLog("[delWithId] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function get(ids) {
  webOS.service.request("luna://com.palm.db", {
    method: "get",
    parameters: {
      ids: ids,
    },
    onSuccess: function (res) {
      printLog(
        "[get] onSuccess: retrieved " + res.results.length + " object(s)."
      );
      for (var i in res.results) {
        printLog(
          "[get] retrieved " +
            +res.results[i].number +
            ", " +
            res.results[i].grade +
            ", " +
            res.results[i].isUsed +
            ", " +
            res.results[i]._id
        );
      }
    },
    onFailure: function (res) {
      printLog("[get] onFailure");
      printLog("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}

function refreshDB() {
  webOS.service.request("luna://com.palm.db", {
    method: "find",
    parameters: {
      query: {
        from: kindId,
        where: [{ prop: "number", op: ">", val: 0 }],
      },
    },
    onSuccess: function (res) {
      var result = res.results;
      var content =
        "[DB Total: " +
        result.length +
        "] number / grade / isUsed / _id / _rev<br>";
      for (var i in result) {
        content +=
          result[i].number +
          " / " +
          result[i].grade +
          " / " +
          result[i].isUsed +
          " / " +
          result[i]._id +
          " / " +
          result[i]._rev +
          "<br>";
      }
      printDB(content);
      console.log("[refreshDB] onSuccess:", result);
    },
    onFailure: function (res) {
      printDB("[refreshDB] onFailure");
      printDB("(" + res.errorCode + ") " + res.errorText);
      return;
    },
  });
}
