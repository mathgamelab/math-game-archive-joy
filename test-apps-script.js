/**
 * Google Apps Script 테스트용 코드
 * 이 코드를 Apps Script 편집기에 붙여넣고 배포해보세요
 */

function doPost(e) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // 요청 데이터 파싱
    const requestBody = JSON.parse(e.postData.contents);
    console.log('받은 데이터:', requestBody);

    // 간단한 응답
    const response = {
      result: 'success',
      message: '테스트 성공!',
      receivedData: requestBody
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);

  } catch (error) {
    console.error('에러:', error);
    
    const errorResponse = {
      result: 'error',
      message: '서버 오류: ' + error.toString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const response = {
    result: 'success',
    message: 'Apps Script가 정상 작동 중입니다!'
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// OPTIONS 요청 처리 (CORS preflight)
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  return ContentService
    .createTextOutput('')
    .setHeaders(headers);
} 