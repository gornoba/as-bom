var surid = "";
var saveid = "";
var productid = "";

function dataload() {
  // 1번째 -> 제일 느리다.
  // var ss = SpreadsheetApp.openById(saveid);
  // var sheet = ss.getSheetByName("data");
  // sheet.getRange(2,1,10,sheet.getLastColumn()).getValues();
  // 2번째 -> 조금 복잡하지만 빠르다
  // var data = Sheets.Spreadsheets.Values.get(saveid,"data!A2:ZZ10").values;
  // 3번쨰 -> 쿼리문을 사용하는데 필터가 빠른데 무지 복잡
  // SpreadsheetApp.openById(saveid);
  // var sql = "select * limit 10"
  // var url = "https://docs.google.com/spreadsheets/d/" + saveid + "/gviz/tq?gid=1616680398&tq=" + sql;
  // var res = UrlFetchApp.fetch(url, {headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}, muteHttpExceptions: true}).getContentText()
  // var parsedText = JSON.parse(res.slice(res.indexOf("{"), res.lastIndexOf("}")+1));
  // var value = parsedText.table ? parsedText.table.rows.map(a => {
  //   return a.c.map(b => {
  //     if (b) {
  //       if (b.f) {
  //         return b.f;
  //       } else {
  //         return b.v;
  //       }
  //     } else {
  //       return "";
  //     }
  //   })
  // }) : [];
  // 4번쨰
  // var url = "https://docs.google.com/spreadsheets/d/" + saveid + "/gviz/tq?gid=" + "1616680398" + "&tqx=out:csv&tq=" + sql;
  // var res = UrlFetchApp.fetch(url, {headers: {Authorization: "Bearer " + ScriptApp.getOAuthToken()}});
  // var newLine = res.getContentText().replace(/([^"])\n{1}/g,"$1§");
  // var values = Utilities.parseCsv(newLine);
  // values.splice(0,1);
  // var value = values.map(a => a.map(b => b.replace(/§/g,"\n")));
}

function docsurName() {
  var value = Sheets.Spreadsheets.Values.get(
    surid,
    "수술정보_unique!A2:ZZ"
  ).values;
  return value;
}

function docsurinfo() {
  var value = Sheets.Spreadsheets.Values.get(
    surid,
    "수술정보!A2:ZZ"
  ).values.filter((a) => a[9] === "O");
  return value;
}

function products() {
  var value = Sheets.Spreadsheets.Values.get(surid, "물품정보!A2:ZZ").values;
  var obj = {};
  bomResearchData().map((a) => (obj[a[2]] = a[7]));

  var provalue = value
    .filter((e) => e[6] === "YES" && e[7] === "O")
    .map((a) => [a[0], a[1], a[2], a[3], a[4], a[5], obj[a[1]]]);
  return provalue;
}

function transInput(sendArray) {
  var value = Sheets.Spreadsheets.Values.get(productid, "검증품목!A2:I").values;
  var provalue = value.filter((e) => e[0] !== "");
  var obj2 = {};
  provalue.map(
    (e) =>
      (obj2[e[1].toString().toLowerCase()] = [
        e[2],
        e[4],
        Number(e[8].toString().replace(",", "")),
      ])
  );

  var ss = SpreadsheetApp.openById(saveid);
  var sheet = ss.getSheetByName("data");
  var date = Utilities.formatDate(new Date(), "GMT+9", "yyyyMMddHHmmss");
  var map = sendArray.map((e) => {
    console.log(
      e,
      obj2[e[3].toString().toLowerCase().split("|")[0].toString().toLowerCase()]
    );
    return [
      date + e[0], // 등록번호
      e[6], // 환자이름
      e[7], // 전환번호
      Utilities.formatDate(new Date(e[8]), "GMT+9", "yyyy-MM-dd"), // 수술날짜
      e[9], // 의사이름
      e[1], // 수술이름
      e[3].toString().toLowerCase().split("|")[0], // 제품명
      "", // 약어
      e[5], // 사용량
      obj2[
        e[3].toString().toLowerCase().split("|")[0].toString().toLowerCase()
      ][0], // 제품코드
      obj2[
        e[3].toString().toLowerCase().split("|")[0].toString().toLowerCase()
      ][1], // 규격
      obj2[
        e[3].toString().toLowerCase().split("|")[0].toString().toLowerCase()
      ][2], // 원가
      obj2[
        e[3].toString().toLowerCase().split("|")[0].toString().toLowerCase()
      ][2] * Number(e[5]), // 원가산출
      e[10], // 층
      e[4], // 입력단위
      e[11], // 수술시작시간
      e[12], // 수술종료시간
    ];
  });
  var lock = LockService.getScriptLock();

  lock.tryLock(60000);
  if (lock.hasLock()) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, map.length, map[0].length)
      .setValues(map);
    lock.releaseLock();
  }
}

function modiData() {
  var value = Sheets.Spreadsheets.Values.get(saveid, "data!A2:ZZ").values;
  var value_map = value.map((e) => [
    e[0],
    e[1],
    e[2],
    e[3],
    e[4],
    e[5],
    e[6],
    e[7],
    e[8],
    e[9],
    e[10],
    e[13],
    e[14] ? e[14] : null,
    e[15] ? e[15] : null,
    e[16] ? e[16] : null,
  ]);
  return value_map;
}

function modiUniqueData() {
  var aa = Sheets.Spreadsheets.Values.get(
    saveid,
    "data_unique3!A:G"
  ).values.filter((a) => a[0] != "");
  var value = aa.map((a) => a.map((b) => b.toString().toLowerCase()));
  return value;
}

function modiDelete(deleteRegiNum) {
  var data_col0 = Sheets.Spreadsheets.Values.get(
    saveid,
    "data!A2:a"
  ).values.flat();
  var delete_index = data_col0.indexOf(deleteRegiNum) + 2;
  var sheet = SpreadsheetApp.openById(saveid).getSheetByName("data");
  sheet.deleteRow(delete_index);
}

function allDelete(hwanname, phonnumber, surdate, docname, surstart, surend) {
  var lock = LockService.getScriptLock();

  var ss = SpreadsheetApp.openById(saveid);
  var sheet = ss.getSheetByName("data");
  var col_notion = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getA1Notation();
  var col = col_notion.replace(/\d/g, "").split(":");
  var range = `data!${col[0]}2:${col[1]}`;
  var csv = Sheets.Spreadsheets.Values.get(saveid, range).values;
  var value = csv.map((e, ei) => [
    e[1].toString().toLowerCase(), //환자이름
    e[2].toString().toLowerCase(), //전화번호
    e[3].toString().toLowerCase(), // 수술날짜
    e[4].toString().toLowerCase(), // 의사이름
    e[15] ? e[15].toString().toLowerCase() : "", // 수술시작시간
    e[16] ? e[16].toString().toLowerCase() : "", // 수술종료시간
    e[0].toString().toLowerCase(),
    ei + 2,
  ]);

  var valueFilter = value.filter(
    (a) =>
      a[0] === hwanname &&
      a[1] === phonnumber &&
      a[2] === surdate &&
      a[3] === docname &&
      a[4] === surstart &&
      a[5] === surend
  );
  var del = valueFilter.map((a) => a[7]);
  del.sort((a, b) => b - a);

  var ss = SpreadsheetApp.openById(saveid);
  var sheet = ss.getSheetByName("data");

  lock.tryLock(60000);
  if (lock.hasLock()) {
    del.map((a) => a >= 0 && sheet.deleteRow(a));
    lock.releaseLock();
  }
}

function modiInput(modiArray) {
  var datee = Utilities.formatDate(new Date(), "GMT+9", "yyyyMMddHHmmss");
  var lock = LockService.getScriptLock();

  var value = Sheets.Spreadsheets.Values.get(productid, "검증품목!A2:I").values;
  var provalue = value.filter((e) => e[0] !== "");
  var obj2 = {};
  provalue.map(
    (e) =>
      (obj2[e[1].toString().toLowerCase()] = [
        e[2],
        e[4],
        Number(e[8].toString().replace(",", "")),
      ])
  );
  var ss = SpreadsheetApp.openById(saveid);
  var sheet = ss.getSheetByName("data");

  var csv_index = Sheets.Spreadsheets.Values.get(
    saveid,
    "data!a2:a"
  ).values.flat();
  var map = modiArray.map((e) => [
    e[0], // 등록번호
    e[6], // 환자명
    e[7], // 전화번호
    e[8], // 시수술날짜
    e[9], // 의사이름
    e[1], // 수수술이름
    e[3], // 제품이름
    "", // 약어
    e[5], // 사용량
    obj2[e[3].toString().toLowerCase()][0], //규격
    obj2[e[3].toString().toLowerCase()][1], //카테고리
    obj2[e[3].toString().toLowerCase()][2], //원가
    Number(obj2[e[3].toString().toLowerCase()][2]) * Number(e[5]), //원가산출
    e[10], //층
    e[4],
    e[11],
    e[12],
  ]);

  lock.tryLock(60000);
  if (lock.hasLock()) {
    var tmp = [];
    map.map((a) => {
      if (Number(a[0]) <= 1000) {
        var reginum = a[0];
        a.splice(0, 1, datee + reginum);
        tmp.push(a);
      } else {
        var modi_index = csv_index.indexOf(a[0].toString()) + 2;
        sheet.getRange(modi_index, 1, 1, a.length).setValues([a]);
      }
    });
    sheet
      .getRange(sheet.getLastRow() + 1, 1, tmp.length, tmp[0].length)
      .setValues(tmp);
    lock.releaseLock();
  }
}

function bomResearchData() {
  var apivalue = Sheets.Spreadsheets.Values.get(
    productid,
    "검증품목!A2:ZZ"
  ).values;
  var apivalueFilter = apivalue.filter((e) => e[0] != "");
  return apivalueFilter;
}

function surmodiDelete(deleteRegiNum) {
  var lock = LockService.getScriptLock();
  var ss = SpreadsheetApp.openById(surid);
  var sheet = ss.getSheetByName("수술정보");

  var registNumber = Sheets.Spreadsheets.Values.get(surid, "수술정보!H2:h")
    .values.flat()
    .filter((a) => a != "");
  var registIndex = registNumber.indexOf(deleteRegiNum.toString());
  var rowNumber = registIndex == -1 ? 0 : registIndex + 2;

  lock.tryLock(60000);
  if (lock.hasLock()) {
    rowNumber > 0 && sheet.deleteRow(rowNumber.toString());
    lock.releaseLock();
  }
}

function surmodiInput(modiArray) {
  var lock = LockService.getScriptLock();
  var ss = SpreadsheetApp.openById(surid);
  var sheet = ss.getSheetByName("수술정보");
  var value_index = Sheets.Spreadsheets.Values.get(surid, "수술정보!H2:h")
    .values.flat()
    .filter((a) => a != "");

  lock.tryLock(60000);
  if (lock.hasLock()) {
    var tmp = [];
    modiArray.map((e) => {
      console.log(e);
      if (e[6]) {
        var ii = value_index.indexOf(e[6]);
        sheet
          .getRange(ii + 2, 1, 1, 7)
          .setValues([[e[0], e[1], "", "", e[3], e[5], e[4]]]);
      } else {
        tmp.push([e[0], e[1], "", "", e[3], e[5], e[4]]);
      }
    });
    tmp.length > 0 &&
      sheet
        .getRange(sheet.getLastRow() + 1, 1, tmp.length, tmp[0].length)
        .setValues(tmp);
    lock.releaseLock();
  }
}
