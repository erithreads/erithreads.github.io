const SHEET_NAME = "Responses";
const ADMIN_KEY = "eri-admin-2026";

function doPost(e) {
  const sheet = getResponsesSheet();
  const payload = JSON.parse(e.parameter.payload || "{}");

  sheet.appendRow([
    new Date(),
    joinValues(payload.englishBooks),
    joinValues(payload.bengaliBooks),
    payload.customBooks || "",
    joinValues(payload.fridgeMagnetColors),
    joinValues(payload.shelfTypes),
    payload.customerName || "",
    payload.instagramUsername || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const callback = e.parameter.callback || "handleErithreadsResponses";

  if (e.parameter.adminKey !== ADMIN_KEY) {
    return jsonp(callback, {
      success: false,
      message: "Invalid admin key."
    });
  }

  const sheet = getResponsesSheet();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).map(function (row) {
    return {
      timestamp: formatDate(row[0]),
      englishBooks: row[1],
      bengaliBooks: row[2],
      customBooks: row[3],
      fridgeMagnetColors: row[4],
      shelfTypes: row[5],
      customerName: row[6],
      instagramUsername: row[7]
    };
  });

  return jsonp(callback, {
    success: true,
    rows: rows
  });
}

function getResponsesSheet() {
  const spreadsheet = SpreadsheetApp.openById("1VK_9-MIv6Uz0ZBaMuV-h9vdt3v-jlLdkxPkGvkwcYkU");
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "English Books",
      "Bengali Books",
      "Custom Books",
      "Fridge Magnet Colors",
      "Shelf Types",
      "Customer Name",
      "Instagram Username"
    ]);
  }

  return sheet;
}

function joinValues(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
}

function jsonp(callback, data) {
  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}